/**
 * Background Sync Queue & Single Worker
 * CuanTrack Bot
 */

const supabaseAdapter = require('./supabaseAdapter');
const { createLogger } = require('../logger');

const log = createLogger('SyncQueue');

const queue = new Map();

// Konfigurasi via Environment Variable
const MAX_QUEUE_SIZE = parseInt(process.env.SYNC_QUEUE_MAX_SIZE || '1000', 10);

// Status Worker
let isRunning = false;
let isShuttingDown = false;
let isProcessingQueue = false; // Mencegah race condition (Concurrency Lock)

// Track versi sinkronisasi per user (Memory Cache)
const syncVersions = new Map();

// Global Health Metrics
let globalFailedCount = 0;
let globalTotalRetry = 0;
let globalLastSuccess = null;

/**
 * Format payload sesuai standar struktur CuanTrack V2
 */
function formatPayload(userData, status, lastSyncAt, currentSyncVersion) {
  return {
    meta: {
      schemaVersion: 1,
      syncVersion: currentSyncVersion,
      // createdAt dijamin stabil karena hanya diambil dari sumber data (JSON)
      createdAt: userData.createdAt, 
      updatedAt: userData.updatedAt,
      sync: {
        status: status,
        lastSyncAt: lastSyncAt || null,
        source: 'telegram',
        storage: 'json'
      }
    },
    data: userData
  };
}

/**
 * Mendaftarkan data ke antrean (Debouncing & Batasan Size)
 */
function enqueue(userData) {
  if (!userData || !userData.userId) return;
  const userId = String(userData.userId);

  if (queue.size >= MAX_QUEUE_SIZE && !queue.has(userId)) {
    log.warn(`⚠️ Sync queue is full (MAX ${MAX_QUEUE_SIZE}). Dropping background sync for user ${userId}.`);
    return;
  }

  // Jika userId sudah ada, ditimpa dengan state terbaru (Debounce)
  queue.set(userId, {
    data: userData,
    status: 'READY',
    retryCount: 0,
    lastAttempt: null,
    lastSuccess: null,
    nextAttemptAt: 0 // Segera dieksekusi
  });
}

/**
 * Utility sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Memulai Single Background Worker
 */
async function startWorker() {
  if (isRunning) return;
  isRunning = true;
  log.info('🔄 Background Sync Worker started');

  while (isRunning) {
    await processQueue();
    if (isRunning) await sleep(5000); // Base loop interval
  }
}

/**
 * Memproses isi antrean secara berurutan dan terproteksi
 */
async function processQueue(force = false) {
  if (queue.size === 0) return;
  
  // Proteksi Worker: Mencegah eksekusi ganda jika proses sebelumnya belum selesai
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    const now = Date.now();

    for (const [userId, item] of queue.entries()) {
      // Jika belum waktunya retry (Exponential Backoff) dan tidak di-force
      if (!force && item.nextAttemptAt && now < item.nextAttemptAt) {
        continue;
      }

      try {
        item.status = 'SYNCING';
        item.lastAttempt = new Date().toISOString();

        // Increment versi sync saat ini
        const currentVersion = (syncVersions.get(userId) || 0) + 1;

        const payload = formatPayload(item.data, item.status, item.lastSuccess, currentVersion);
        
        // Upsert via Adapter
        await supabaseAdapter.upsert(userId, payload);

        // Jika berhasil: update metrik, versi, dan hapus dari antrean
        syncVersions.set(userId, currentVersion);
        item.lastSuccess = new Date().toISOString();
        globalLastSuccess = item.lastSuccess;
        
        queue.delete(userId);
        log.debug(`✅ Sync successful for user: ${userId} (v${currentVersion})`);

      } catch (error) {
        // Jika gagal: Status FAILED, catat metrik, terapkan Exponential Backoff
        item.status = 'FAILED';
        item.retryCount += 1;
        
        globalFailedCount += 1;
        globalTotalRetry += 1;
        
        // Exponential Backoff: 5s, 10s, 20s, 40s... max 5 menit (300000ms)
        const delayMs = Math.min(5000 * Math.pow(2, item.retryCount - 1), 300000);
        item.nextAttemptAt = Date.now() + delayMs;
        
        if (item.retryCount > 3) {
          log.warn(`⚠️ Sync failed for user ${userId} (Attempt ${item.retryCount}). Retrying in ${delayMs/1000}s. Error: ${error.message}`);
        }
      }
    }
  } finally {
    // Selalu buka kunci worker di akhir iterasi
    isProcessingQueue = false;
  }
}

/**
 * Graceful Shutdown dengan Timeout 30 detik
 */
async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  isRunning = false;
  
  if (queue.size === 0) return;

  log.info(`🛑 Graceful shutdown initiated. Flushing ${queue.size} items in sync queue...`);
  
  // Membungkus force process dengan race timeout 30 detik
  const flushPromise = processQueue(true);
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('TIMEOUT'), 30000));
  
  const result = await Promise.race([flushPromise, timeoutPromise]);
  
  if (result === 'TIMEOUT') {
    log.warn('⚠️ Shutdown timeout reached (30s). Some sync items were dropped safely (Local JSON intact).');
  } else {
    log.info('✅ Sync queue flushed completely. Safe to exit.');
  }
}

/**
 * Mengembalikan Health Status Worker untuk Dashboard Admin
 */
function getStatus() {
  return {
    queueSize: queue.size,
    running: isRunning,
    processing: isProcessingQueue,
    failedCount: globalFailedCount,
    totalRetry: globalTotalRetry,
    lastSuccess: globalLastSuccess
  };
}

module.exports = {
  enqueue,
  startWorker,
  shutdown,
  getStatus
};