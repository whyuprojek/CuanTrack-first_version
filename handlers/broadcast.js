/**
 * Broadcast Handler — Fitur Admin Kirim Pesan ke Semua Pengguna
 * CuanTrack Bot
 *
 * Penggunaan:
 *   /broadcast           → Buka menu broadcast
 *   /broadcast <pesan>   → Kirim pesan langsung (shortcut)
 *
 * Admin ditentukan dari BOT_ADMIN_ID di .env
 */

const userStore = require('../services/userStore');
const session = require('../middleware/session');
const { STATES } = require('../middleware/session');
const { createLogger } = require('../services/logger');

const log = createLogger('Broadcast');

// =============================================
// HELPER: Cek apakah user adalah admin
// =============================================
function isAdmin(userId) {
  const adminId = process.env.BOT_ADMIN_ID;
  if (!adminId) return false;
  return String(userId) === String(adminId);
}

// =============================================
// HELPER: Kirim pesan ke semua user (dengan delay anti-flood)
// =============================================
async function sendToAllUsers(bot, message, options = {}) {
  const userIds = userStore.getAllUserIds();
  let successCount = 0;
  let failCount = 0;
  const failedIds = [];

  for (const userId of userIds) {
    try {
      await bot._originalSendMessage(userId, message, options);
      successCount++;
      // Delay 50ms antar pesan agar tidak kena rate-limit Telegram
      await new Promise((r) => setTimeout(r, 50));
    } catch (err) {
      failCount++;
      failedIds.push(userId);
      log.warn(`Broadcast gagal ke user ${userId}: ${err.message}`);
    }
  }

  return { total: userIds.length, successCount, failCount, failedIds };
}

// =============================================
// STEP 1: Tampilkan menu broadcast
// =============================================
async function showBroadcastMenu(bot, msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  if (!isAdmin(userId)) {
    await bot.sendMessage(chatId,
      '🚫 *Akses Ditolak*\n\nFitur ini hanya tersedia untuk admin bot.',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const userCount = userStore.getAllUserIds().length;

  const text = `📢 *Panel Broadcast Admin*\n\n` +
    `👥 Total pengguna terdaftar: *${userCount} user*\n\n` +
    `Pilih jenis pesan yang ingin dikirim:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔧 Maintenance', callback_data: 'broadcast:template:maintenance' },
        { text: '🎉 Update Fitur', callback_data: 'broadcast:template:update' },
      ],
      [
        { text: '⚠️ Peringatan', callback_data: 'broadcast:template:warning' },
        { text: '📣 Pengumuman', callback_data: 'broadcast:template:announcement' },
      ],
      [
        { text: '✍️ Pesan Kustom', callback_data: 'broadcast:custom' },
      ],
      [
        { text: '📊 Info Pengguna', callback_data: 'broadcast:stats' },
      ],
    ],
  };

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
}

// =============================================
// STEP 2: Handle pilihan template
// =============================================
async function handleTemplateSelect(bot, callbackQuery, templateKey) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;

  if (!isAdmin(userId)) return;

  const templates = {
    maintenance: {
      label: '🔧 Maintenance',
      text: `🔧 *Bot Maintenance*\n\nHai semua!\n\nBot sedang dalam proses *maintenance* untuk peningkatan performa.\n\n⏳ Diperkirakan selesai dalam beberapa menit.\n\nMohon maaf atas ketidaknyamanannya. 🙏\n\n— Tim CuanTrack`,
    },
    update: {
      label: '🎉 Update Fitur',
      text: `🎉 *Update Baru Telah Hadir!*\n\nHai semua!\n\nKami baru saja merilis pembaruan terbaru untuk CuanTrack Bot.\n\n✨ *Fitur & Perbaikan Terbaru:*\n• [Isi daftar perubahan di sini]\n\nNikmati pengalaman mencatat keuangan yang lebih baik! 🚀\n\n— Tim CuanTrack`,
    },
    warning: {
      label: '⚠️ Peringatan',
      text: `⚠️ *Pemberitahuan Penting*\n\nHai semua!\n\n[Isi peringatan/informasi penting di sini]\n\nMohon perhatian dan kerjasamanya. 🙏\n\n— Tim CuanTrack`,
    },
    announcement: {
      label: '📣 Pengumuman',
      text: `📣 *Pengumuman*\n\nHai semua!\n\n[Isi pengumuman di sini]\n\nTerima kasih atas perhatiannya! 🙏\n\n— Tim CuanTrack`,
    },
  };

  const template = templates[templateKey];
  if (!template) return;

  // Simpan template yang dipilih ke session
  session.setState(userId, STATES.ADMIN_BROADCAST_CONFIRM, {
    broadcastText: template.text,
    broadcastTemplate: templateKey,
  });

  const previewText =
    `👁️ *Preview Pesan (${template.label}):*\n\n` +
    `─────────────────────────\n` +
    template.text +
    `\n─────────────────────────\n\n` +
    `👥 Akan dikirim ke *${userStore.getAllUserIds().length} pengguna*.\n\n` +
    `Kirim sekarang?`;

  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(chatId, previewText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Kirim Sekarang', callback_data: 'broadcast:send' },
          { text: '✏️ Edit Dulu', callback_data: 'broadcast:edit' },
        ],
        [{ text: '❌ Batal', callback_data: 'broadcast:cancel' }],
      ],
    },
  });
}

// =============================================
// STEP 3: Admin pilih "Pesan Kustom"
// =============================================
async function handleCustomBroadcast(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;

  if (!isAdmin(userId)) return;

  session.setState(userId, STATES.ADMIN_BROADCAST_INPUT);

  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(chatId,
    `✍️ *Broadcast Pesan Kustom*\n\n` +
    `Ketik pesan yang ingin kamu broadcast.\n` +
    `Kamu bisa menggunakan format Markdown:\n` +
    `• \`*teks tebal*\`\n` +
    `• \`_teks miring_\`\n` +
    `• \`\`\`blok kode\`\`\`\n\n` +
    `Ketik pesanmu sekarang:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Batal', callback_data: 'broadcast:cancel' }]],
      },
    }
  );
}

// =============================================
// STEP 4: Terima teks pesan kustom dari admin
// =============================================
async function handleBroadcastTextInput(bot, msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  if (!isAdmin(userId)) return;
  if (!msg.text) return;

  const broadcastText = msg.text;

  // Simpan teks ke session, pindah ke state konfirmasi
  session.setState(userId, STATES.ADMIN_BROADCAST_CONFIRM, {
    broadcastText,
  });

  const userCount = userStore.getAllUserIds().length;

  const previewText =
    `👁️ *Preview Pesan Broadcast:*\n\n` +
    `─────────────────────────\n` +
    broadcastText +
    `\n─────────────────────────\n\n` +
    `👥 Akan dikirim ke *${userCount} pengguna*.\n\n` +
    `Kirim sekarang?`;

  await bot.sendMessage(chatId, previewText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Kirim Sekarang', callback_data: 'broadcast:send' },
          { text: '✏️ Edit Dulu', callback_data: 'broadcast:edit' },
        ],
        [{ text: '❌ Batal', callback_data: 'broadcast:cancel' }],
      ],
    },
  });
}

// =============================================
// STEP 5: Konfirmasi & kirim broadcast
// =============================================
async function handleSendBroadcast(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;

  if (!isAdmin(userId)) return;

  const data = session.getData(userId);
  const broadcastText = data.broadcastText;

  if (!broadcastText) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: '⚠️ Tidak ada pesan untuk dikirim.' });
    return;
  }

  await bot.answerCallbackQuery(callbackQuery.id, { text: '📤 Mengirim broadcast...' });

  // Tampilkan status "sedang mengirim"
  const progressMsg = await bot.sendMessage(chatId,
    `📤 *Mengirim broadcast...*\n\nMohon tunggu, sedang mengirim ke semua pengguna.`,
    { parse_mode: 'Markdown' }
  );

  log.info(`[Admin Broadcast] Memulai broadcast oleh admin (${userId})`);

  // Kirim ke semua user
  const result = await sendToAllUsers(bot, broadcastText, { parse_mode: 'Markdown' });

  // Bersihkan session
  session.clearSession(userId);

  // Laporan hasil broadcast
  const reportText =
    `✅ *Broadcast Selesai!*\n\n` +
    `📊 *Hasil Pengiriman:*\n` +
    `• Total pengguna: *${result.total}*\n` +
    `• ✅ Berhasil: *${result.successCount}*\n` +
    `• ❌ Gagal: *${result.failCount}*\n` +
    (result.failedIds.length > 0
      ? `\n⚠️ ID yang gagal:\n\`${result.failedIds.slice(0, 10).join(', ')}\`` +
        (result.failedIds.length > 10 ? `\n_...dan ${result.failedIds.length - 10} lainnya_` : '')
      : '') +
    `\n\n📢 Pesan berhasil terkirim!`;

  log.info(`[Admin Broadcast] Selesai — ${result.successCount}/${result.total} berhasil`);

  // Edit pesan progress
  try {
    await bot.editMessageText(reportText, {
      chat_id: chatId,
      message_id: progressMsg.message_id,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '📢 Broadcast Lagi', callback_data: 'broadcast:menu' }]],
      },
    });
  } catch {
    await bot.sendMessage(chatId, reportText, { parse_mode: 'Markdown' });
  }
}

// =============================================
// STEP 6: Edit pesan (kembali ke input)
// =============================================
async function handleEditBroadcast(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;

  if (!isAdmin(userId)) return;

  session.setState(userId, STATES.ADMIN_BROADCAST_INPUT);

  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(chatId,
    `✏️ *Edit Pesan Broadcast*\n\nKetik ulang pesan yang ingin kamu broadcast:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Batal', callback_data: 'broadcast:cancel' }]],
      },
    }
  );
}

// =============================================
// STEP 7: Batal broadcast
// =============================================
async function handleCancelBroadcast(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;

  session.clearSession(userId);

  await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Broadcast dibatalkan.' });
  await bot.sendMessage(chatId,
    '❌ *Broadcast dibatalkan.*\n\nGunakan /broadcast untuk memulai lagi.',
    { parse_mode: 'Markdown' }
  );
}

// =============================================
// INFO: Tampilkan statistik pengguna
// =============================================
async function handleBroadcastStats(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;

  if (!isAdmin(userId)) return;

  const allIds = userStore.getAllUserIds();
  let setupCount = 0;
  let langId = 0;
  let langEn = 0;

  for (const id of allIds) {
    const user = userStore.getUser(id);
    if (user && user.setupComplete) setupCount++;
    if (user && user.lang === 'id') langId++;
    if (user && user.lang === 'en') langEn++;
  }

  const statsText =
    `📊 *Statistik Pengguna Bot*\n\n` +
    `👥 Total terdaftar: *${allIds.length} user*\n` +
    `✅ Setup lengkap: *${setupCount} user*\n` +
    `⏳ Belum setup: *${allIds.length - setupCount} user*\n\n` +
    `🌐 *Bahasa:*\n` +
    `• 🇮🇩 Indonesia: *${langId} user*\n` +
    `• 🇬🇧 English: *${langEn} user*\n\n` +
    `🕐 Update: ${new Date().toLocaleString('id-ID', { timeZone: process.env.TIMEZONE || 'Asia/Jakarta' })}`;

  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(chatId, statsText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📢 Kirim Broadcast', callback_data: 'broadcast:menu' }],
      ],
    },
  });
}

module.exports = {
  isAdmin,
  showBroadcastMenu,
  handleTemplateSelect,
  handleCustomBroadcast,
  handleBroadcastTextInput,
  handleSendBroadcast,
  handleEditBroadcast,
  handleCancelBroadcast,
  handleBroadcastStats,
};