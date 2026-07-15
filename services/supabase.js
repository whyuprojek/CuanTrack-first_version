/**
 * Supabase Service — JSONB Migration Strategy
 * CuanTrack Bot
 * 
 * Melakukan Background Sync data JSON ke tabel users (kolom JSONB).
 * Menggunakan Sync Queue (in-memory Map) untuk Retry Mechanism & Debouncing.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createLogger } = require('./logger');

const log = createLogger('Supabase');

const supabaseUrl = process.env.SUPABASE_URL;
// Disarankan menggunakan SERVICE_ROLE_KEY agar bot dapat melakukan Bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Antrean in-memory (Map). 
// Key: userId, Value: userData (state terbaru).
// Jika user di-update berkali-kali dengan cepat, Map hanya menampung versi finalnya.
const syncQueue = new Map();

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  log.info('✅ Supabase client initialized (JSONB Sync Mode)');
  
  // Jalankan worker background setiap 5 detik
  setInterval(processQueue, 5000);
} else {
  log.warn('⚠️ Supabase credentials not found in .env. Background sync disabled.');
}

/**
 * Memasukkan data user terbaru ke dalam antrean sinkronisasi
 * @param {Object} userData Data user lengkap dari JSON
 */
async function syncUser(userData) {
  if (!supabase || !userData || !userData.userId) return;
  
  // Masukkan/Timpa antrean dengan data paling baru
  syncQueue.set(String(userData.userId), userData);
}

/**
 * Worker Function: Memproses seluruh antrean dan mengirimnya ke Supabase.
 * Jika gagal, data tetap berada di antrean untuk di-retry pada siklus berikutnya.
 */
async function processQueue() {
  if (syncQueue.size === 0 || !supabase) return;

  // Ekstrak semua entri dari queue
  for (const [userId, userData] of syncQueue.entries()) {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          telegram_id: userId,
          data: userData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'telegram_id' });

      if (error) throw error;

      // Jika sukses, hapus dari antrean
      syncQueue.delete(userId);
      log.debug(`Sync to Supabase successful for user: ${userId}`);
    } catch (error) {
      // Jika gagal, biarkan di antrean untuk di-retry 5 detik lagi
      log.warn(`Sync failed for user ${userId}. Will retry. Error: ${error.message}`);
    }
  }
}

module.exports = {
  supabase,
  syncUser,
  processQueue // Diekspos untuk keperluan testing/graceful shutdown
};