/**
 * Start Handler — Onboarding & Language Selection
 * CuanTrack Bot
 */

const userStore = require('../services/userStore');
const sheets = require('../services/sheets');
const { createLogger } = require('../services/logger');
const session = require('../middleware/session');

const log = createLogger('Start');
const { STATES } = require('../middleware/session');
const { mainMenuKeyboard, languageKeyboard } = require('./menu');
const L = require('../locales');

/**
 * Handle /start command
 */
async function handleStart(bot, msg) {
  const userId = msg.from.id;
  const name = msg.from.first_name || 'Pengguna';

  let user = userStore.getUser(userId);

  if (user && user.setupComplete) {
    // User sudah setup — tampilkan info + menu utama
    const t = L(user.lang);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${user.spreadsheetId}`;
    const totalBalance = (user.accounts || []).reduce((s, a) => s + (a.balance || 0), 0);
    const fmtBal = `Rp ${Math.round(totalBalance).toLocaleString('id-ID')}`;

    // Hitung pengeluaran bulan ini dari transaksi di sheets (approx dari local data)
    const now = new Date();
    let transactions = [];
    try { transactions = await sheets.getTransactions(user.spreadsheetId, now.getMonth() + 1, now.getFullYear()); } catch {}
    const monthlySpending = (transactions || []).filter(tx => tx.type === 'expense').reduce((s, tx) => s + (tx.amount || 0), 0);
    const fmtSpend = `Rp ${Math.round(monthlySpending).toLocaleString('id-ID')}`;

    const info = user.lang === 'id'
      ? `🏠 *Menu Utama CuanTrack*\n\n👤 *${user.name}*\n💰 Saldo: *${fmtBal}*\n💸 Pengeluaran bulan ini: *${fmtSpend}*\n📊 Spreadsheet: [Buka Spreadsheet](${sheetUrl})\n\nKetik /fitur untuk melihat fitur yang ada\n\nPilih menu:`
      : `🏠 *CuanTrack Main Menu*\n\n👤 *${user.name}*\n💰 Balance: *${fmtBal}*\n💸 Spending this month: *${fmtSpend}*\n📊 Spreadsheet: [Open Spreadsheet](${sheetUrl})\n\nType /fitur to see available features\n\nChoose menu:`;
    await bot.sendMessage(msg.chat.id, info, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(user.lang),
    });
    session.clearSession(userId);
    return;
  }

  if (!user) {
    // User baru — buat data, minta pilih bahasa
    user = userStore.createUser(userId, {
      name,
      username: msg.from.username || '',
      lang: process.env.DEFAULT_LANGUAGE || 'id',
    });
  }

  // Tampilkan pilihan bahasa
  session.setState(userId, STATES.ONBOARD_LANG);

  const t = L('id'); // default tampilkan dalam ID
  await bot.sendMessage(msg.chat.id, t.welcome(name) + '\n' + t.selectLanguage, {
    parse_mode: 'Markdown',
    reply_markup: languageKeyboard(),
  });
}

/**
 * Handle pemilihan bahasa
 */
async function handleLanguageSelect(bot, callbackQuery, lang) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const msgId = callbackQuery.message.message_id;

  userStore.updateUser(userId, { lang });
  session.setState(userId, STATES.ONBOARD_SHEET, { lang });

  const t = L(lang);

  await bot.answerCallbackQuery(callbackQuery.id, { text: t.langSelected });

  // Dapatkan email service account
  const email = sheets.getServiceAccountEmail();
  const sheetMsg = t.askSpreadsheetId.replace('{email}', email);

  await bot.editMessageText(sheetMsg, {
    chat_id: chatId,
    message_id: msgId,
    parse_mode: 'Markdown',
  });
}

/**
 * Handle input Spreadsheet ID
 */
async function handleSpreadsheetId(bot, msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const spreadsheetId = msg.text.trim();

  const user = userStore.getUser(userId);
  if (!user) return;

  const t = L(user.lang);

  // Kirim pesan loading
  const loadMsg = await bot.sendMessage(chatId, '🔄 Mengecek akses spreadsheet...', { parse_mode: 'Markdown' });

  try {
    const validation = await sheets.validateSpreadsheet(spreadsheetId);

    if (!validation.valid) {
      const email = sheets.getServiceAccountEmail();
      await bot.editMessageText(t.invalidSpreadsheetId.replace('{email}', email), {
        chat_id: chatId,
        message_id: loadMsg.message_id,
        parse_mode: 'Markdown',
      });
      return;
    }

    // Simpan spreadsheet ID
    userStore.updateUser(userId, { spreadsheetId });

    await bot.editMessageText(
      `✅ *Spreadsheet berhasil terhubung!*\n📊 *${validation.title}*\n\n🔄 Membuat sheet bulan ini...`, {
        chat_id: chatId,
        message_id: loadMsg.message_id,
        parse_mode: 'Markdown',
      });

    // Lanjut ke setup income (sheet bulan akan dibuat saat setup selesai)
    session.setState(userId, STATES.SETUP_INCOME_MENU);
    await startSetupIncome(bot, chatId, userId, user.lang);

  } catch (err) {
    log.error('Spreadsheet validation error:', err.message);
    await bot.editMessageText(
      `❌ *Error:* ${err.message}\n\nCoba lagi dengan ID yang benar:`,
      { chat_id: chatId, message_id: loadMsg.message_id, parse_mode: 'Markdown' }
    );
  }
}

/**
 * Mulai setup sumber income (dipanggil setelah spreadsheet terhubung)
 */
async function startSetupIncome(bot, chatId, userId, lang) {
  const DEFAULTS = require('../config/defaults');
  const { incomeSourcesKeyboard } = require('./menu');
  const t = L(lang);

  const user = userStore.getUser(userId);
  const selected = user.incomeSources || [];

  await bot.sendMessage(chatId, `${t.setupProgress(1, 4)}\n\n${t.setupIncomeTitle}`, {
    parse_mode: 'Markdown',
    reply_markup: incomeSourcesKeyboard(selected, DEFAULTS.incomeSources, lang),
  });
}

/**
 * Handle /menu command
 */
async function handleMenu(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);

  if (!user || !user.setupComplete) {
    const t = L(user ? user.lang : 'id');
    await bot.sendMessage(msg.chat.id, t.notSetup, { parse_mode: 'Markdown' });
    return;
  }

  const t = L(user.lang);
  session.clearSession(userId);

  await bot.sendMessage(msg.chat.id, t.mainMenu, {
    parse_mode: 'Markdown',
    reply_markup: mainMenuKeyboard(user.lang),
  });
}

/**
 * Handle /help command
 */
async function handleHelp(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const lang = user ? user.lang : 'id';
  const isId = lang === 'id';

  const helpText = isId
    ? `
📖 *Panduan CuanTrack Bot*

*Perintah:*
/start - Mulai atau tampilkan menu
/menu - Tampilkan menu utama
/income - Catat pemasukan
/expense - Catat pengeluaran
/balance - Cek saldo akun
/report - Laporan keuangan
/bills - Kelola tagihan
/ai - Chat dengan AI
/settings - Pengaturan
/help - Bantuan

*Fitur AI:*
Kirim pesan langsung seperti:
• _"beli makan siang 25rb dari gopay"_
• _"terima gaji 5jt ke bca"_
• _"gimana keuangan saya bulan ini?"_

AI akan otomatis mendeteksi dan mencatat transaksi! 🤖
`
    : `
📖 *CuanTrack Bot Guide*

*Commands:*
/start - Start or show menu
/menu - Show main menu
/income - Record income
/expense - Record expense
/balance - Check account balance
/report - Financial reports
/bills - Manage bills
/ai - Chat with AI
/settings - Settings
/help - Help

*AI Feature:*
Send natural messages like:
• _"lunch 25k from gopay"_
• _"received salary 5mil to bca"_
• _"how are my finances this month?"_

AI will automatically detect and record transactions! 🤖
`;

  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
}

module.exports = {
  handleStart,
  handleLanguageSelect,
  handleSpreadsheetId,
  startSetupIncome,
  handleMenu,
  handleHelp,
};