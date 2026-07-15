/**
 * Storage Provider — Abstraction Layer
 * CuanTrack Bot
 * 
 * Mengatur komunikasi antara Primary Storage (JSON lokal) dan Secondary Storage.
 */

const syncQueue = require('./syncQueue');

/**
 * Menerima data dari Primary Storage untuk diteruskan ke Background Sync
 * @param {Object} userData Data user lengkap
 */
function sync(userData) {
  if (!userData) return;
  syncQueue.enqueue(userData);
}

/**
 * Mendapatkan status kesehatan (Health Monitor) dari antrean sinkronisasi
 * @returns {Object} Status metrik worker
 */
function getStatus() {
  return syncQueue.getStatus();
}

module.exports = {
  sync,
  getStatus
};