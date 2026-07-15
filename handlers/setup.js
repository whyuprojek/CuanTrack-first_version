/**
 * Setup Handler — Flow setup income, accounts, spending, bills
 * MoneyFlowID Bot
 */

const userStore = require('../services/userStore');
const sheets = require('../services/sheets');
const { createLogger } = require('../services/logger');
const session = require('../middleware/session');

const log = createLogger('Setup');
const { STATES } = require('../middleware/session');
const DEFAULTS = require('../config/defaults');
const {
  incomeSourcesKeyboard,
  accountsKeyboard,
  spendingKeyboard,
  billsMenuKeyboard,
  accountSelectKeyboard,
  mainMenuKeyboard,
} = require('./menu');
const L = require('../locales');

// =============================================
// INCOME SOURCES SETUP
// =============================================

/**
 * Handle toggle income source (checklist)
 */
async function handleIncomeToggle(bot, callbackQuery, sourceName, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const msgId = callbackQuery.message.message_id;
  const user = userStore.getUser(userId);
  if (!user) return;

  const t = L(user.lang);
  const selected = user.incomeSources || [];
  const defaultSrc = DEFAULTS.incomeSources.find(
    (s) => s.name.toLowerCase() === sourceName.toLowerCase()
  );

  const existingIdx = selected.findIndex((s) => s.name.toLowerCase() === sourceName.toLowerCase());

  if (existingIdx >= 0) {
    // Hapus jika sudah ada
    userStore.removeIncomeSource(userId, sourceName);
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupIncomeRemoved(sourceName) });
  } else {
    // Tambah jika belum ada
    userStore.addIncomeSource(userId, {
      name: sourceName,
      emoji: defaultSrc ? defaultSrc.emoji : '💰',
    });
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupIncomeAdded(sourceName) });
  }

  const updatedUser = userStore.getUser(userId);
  const statePrefix = isSettings ? 'settings_income' : 'setup_income';

  await bot.editMessageReplyMarkup(
    incomeSourcesKeyboard(updatedUser.incomeSources, DEFAULTS.incomeSources, user.lang),
    { chat_id: chatId, message_id: msgId }
  );
}

/**
 * Handle: mulai menambah income source custom
 */
async function handleIncomeAddPrompt(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  session.setState(userId, STATES.SETUP_INCOME_ADDING);
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(callbackQuery.message.chat.id, t.setupIncomeAdding, { parse_mode: 'Markdown' });
}

/**
 * Handle: input nama income source baru
 */
async function handleIncomeAddText(bot, msg, isSettings = false) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const name = msg.text.trim();

  userStore.addIncomeSource(userId, { name, emoji: '💰' });

  const updatedUser = userStore.getUser(userId);
  const stateKey = isSettings ? STATES.SETTINGS_INCOME_MENU : STATES.SETUP_INCOME_MENU;
  session.setState(userId, stateKey);

  await bot.sendMessage(msg.chat.id, t.setupIncomeAdded(name), {
    parse_mode: 'Markdown',
    reply_markup: incomeSourcesKeyboard(updatedUser.incomeSources, DEFAULTS.incomeSources, user.lang),
  });
}

/**
 * Handle: selesai setup income, lanjut ke accounts
 */
async function handleIncomeDone(bot, callbackQuery, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  if (!user.incomeSources || user.incomeSources.length === 0) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupIncomeEmpty, show_alert: true });
    return;
  }

  await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupIncomeDone(user.incomeSources.length) });

  if (isSettings) {
    // Kembali ke settings
    session.clearSession(userId);
    await showSettingsMenu(bot, chatId, userId, user.lang);
    return;
  }

  // Lanjut ke setup accounts
  session.setState(userId, STATES.SETUP_ACCT_MENU);
  await showAccountsSetup(bot, chatId, userId, user.lang);
}

// =============================================
// ACCOUNTS SETUP
// =============================================

async function showAccountsSetup(bot, chatId, userId, lang) {
  const user = userStore.getUser(userId);
  const t = L(lang);

  await bot.sendMessage(chatId, `${t.setupProgress(2, 4)}\n\n${t.setupAccountTitle}`, {
    parse_mode: 'Markdown',
    reply_markup: accountsKeyboard(user.accounts || [], DEFAULTS.accounts, lang),
  });
}

/**
 * Handle toggle account selection
 */
async function handleAccountToggle(bot, callbackQuery, accountName, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const msgId = callbackQuery.message.message_id;
  const user = userStore.getUser(userId);
  if (!user) return;

  const t = L(user.lang);
  const selected = user.accounts || [];
  const defaultAcc = DEFAULTS.accounts.find(
    (a) => a.name.toLowerCase() === accountName.toLowerCase()
  );

  const existingIdx = selected.findIndex((a) => a.name.toLowerCase() === accountName.toLowerCase());

  if (existingIdx >= 0) {
    // Hapus akun
    userStore.removeAccount(userId, accountName);
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupAccountRemoved(accountName) });

    const updatedUser = userStore.getUser(userId);
    await bot.editMessageReplyMarkup(
      accountsKeyboard(updatedUser.accounts, DEFAULTS.accounts, user.lang),
      { chat_id: chatId, message_id: msgId }
    );
  } else {
    // Tambah akun — minta saldo dulu
    session.setState(userId, STATES.SETUP_ACCT_BALANCE, {
      pendingAccount: accountName,
      accountEmoji: defaultAcc ? defaultAcc.emoji : '🏦',
      accountType: defaultAcc ? defaultAcc.type : 'bank',
      isSettings,
    });
    await bot.answerCallbackQuery(callbackQuery.id);
    await bot.sendMessage(chatId, t.setupAccountSelectBalance(accountName), { parse_mode: 'Markdown' });
  }
}

/**
 * Handle input saldo akun
 */
async function handleAccountBalance(bot, msg, isSettings = false) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);

  const input = msg.text.trim().replace(/[.,]/g, '');
  const balance = parseFloat(input);

  if (isNaN(balance) || balance < 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }

  const accountName = data.pendingAccount;
  userStore.addAccount(userId, {
    name: accountName,
    emoji: data.accountEmoji || '🏦',
    type: data.accountType || 'bank',
    balance,
  });

  const updatedUser = userStore.getUser(userId);
  const stateKey = isSettings ? STATES.SETTINGS_ACCT_MENU : STATES.SETUP_ACCT_MENU;
  session.setState(userId, stateKey, { pendingAccount: null });

  await bot.sendMessage(msg.chat.id, t.setupAccountAdded(accountName, balance), {
    parse_mode: 'Markdown',
    reply_markup: accountsKeyboard(updatedUser.accounts, DEFAULTS.accounts, user.lang),
  });
}

/**
 * Handle: tambah akun custom
 */
async function handleAccountCustomPrompt(bot, callbackQuery, isSettings = false) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  session.setState(userId, STATES.SETUP_ACCT_CUSTOM_NAME, { isSettings });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(callbackQuery.message.chat.id, t.setupAccountCustomName, { parse_mode: 'Markdown' });
}

/**
 * Handle: input nama akun custom
 */
async function handleAccountCustomName(bot, msg, isSettings = false) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const name = msg.text.trim();

  // Minta saldo
  session.setState(userId, STATES.SETUP_ACCT_BALANCE, {
    pendingAccount: name,
    accountEmoji: '🏦',
    accountType: 'other',
    isSettings,
  });
  await bot.sendMessage(msg.chat.id, t.setupAccountSelectBalance(name), { parse_mode: 'Markdown' });
}

/**
 * Handle: selesai setup accounts, lanjut ke spending categories
 */
async function handleAccountsDone(bot, callbackQuery, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  if (!user.accounts || user.accounts.length === 0) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupAccountEmpty, show_alert: true });
    return;
  }

  await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupAccountDone(user.accounts.length) });

  if (isSettings) {
    session.clearSession(userId);
    await showSettingsMenu(bot, chatId, userId, user.lang);
    return;
  }

  // Lanjut ke spending categories
  session.setState(userId, STATES.SETUP_SPENDING_MENU);
  await showSpendingSetup(bot, chatId, userId, user.lang);
}

// =============================================
// SPENDING CATEGORIES SETUP
// =============================================

async function showSpendingSetup(bot, chatId, userId, lang) {
  const user = userStore.getUser(userId);
  const t = L(lang);

  await bot.sendMessage(chatId, `${t.setupProgress(3, 4)}\n\n${t.setupSpendingTitle}`, {
    parse_mode: 'Markdown',
    reply_markup: spendingKeyboard(user.spendingCategories || [], DEFAULTS.spendingCategories, lang),
  });
}

/**
 * Handle toggle spending category
 */
async function handleSpendingToggle(bot, callbackQuery, categoryName, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const msgId = callbackQuery.message.message_id;
  const user = userStore.getUser(userId);
  if (!user) return;

  const t = L(user.lang);
  const defaultCat = DEFAULTS.spendingCategories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  const existingIdx = (user.spendingCategories || []).findIndex(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (existingIdx >= 0) {
    userStore.removeSpendingCategory(userId, categoryName);
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupSpendingRemoved(categoryName) });
  } else {
    userStore.addSpendingCategory(userId, {
      name: categoryName,
      emoji: defaultCat ? defaultCat.emoji : '📦',
    });
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupSpendingAdded(categoryName) });
  }

  const updatedUser = userStore.getUser(userId);
  await bot.editMessageReplyMarkup(
    spendingKeyboard(updatedUser.spendingCategories, DEFAULTS.spendingCategories, user.lang),
    { chat_id: chatId, message_id: msgId }
  );
}

/**
 * Handle: prompt tambah kategori baru
 */
async function handleSpendingAddPrompt(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  session.setState(userId, STATES.SETUP_SPENDING_ADDING);
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(callbackQuery.message.chat.id, t.setupSpendingAdding, { parse_mode: 'Markdown' });
}

/**
 * Handle: input nama kategori baru
 */
async function handleSpendingAddText(bot, msg, isSettings = false) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const name = msg.text.trim();

  userStore.addSpendingCategory(userId, { name, emoji: '📦' });

  const updatedUser = userStore.getUser(userId);
  const stateKey = isSettings ? STATES.SETTINGS_SPENDING_MENU : STATES.SETUP_SPENDING_MENU;
  session.setState(userId, stateKey);

  await bot.sendMessage(msg.chat.id, t.setupSpendingAdded(name), {
    parse_mode: 'Markdown',
    reply_markup: spendingKeyboard(updatedUser.spendingCategories, DEFAULTS.spendingCategories, user.lang),
  });
}

/**
 * Handle: selesai setup spending, lanjut ke bills
 */
async function handleSpendingDone(bot, callbackQuery, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  if (!user.spendingCategories || user.spendingCategories.length === 0) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupSpendingEmpty, show_alert: true });
    return;
  }

  await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupSpendingDone(user.spendingCategories.length) });

  if (isSettings) {
    session.clearSession(userId);
    await showSettingsMenu(bot, chatId, userId, user.lang);
    return;
  }

  // Lanjut ke bills
  session.setState(userId, STATES.SETUP_BILLS_MENU);
  await showBillsSetup(bot, chatId, userId, user.lang);
}

// =============================================
// BILLS SETUP
// =============================================

async function showBillsSetup(bot, chatId, userId, lang) {
  const user = userStore.getUser(userId);
  const t = L(lang);

  await bot.sendMessage(chatId, `${t.setupProgress(4, 4)}\n\n${t.setupBillsTitle}`, {
    parse_mode: 'Markdown',
    reply_markup: billsMenuKeyboard(user.bills || [], lang),
  });
}

/**
 * Handle: mulai tambah tagihan baru
 */
async function handleBillAddPrompt(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  session.setState(userId, STATES.SETUP_BILL_NAME);
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(callbackQuery.message.chat.id, t.setupBillName, { parse_mode: 'Markdown' });
}

/**
 * Handle: input nama tagihan
 */
async function handleBillName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const name = msg.text.trim();

  session.setState(userId, STATES.SETUP_BILL_AMOUNT, { pendingBill: { name } });
  await bot.sendMessage(msg.chat.id, t.setupBillAmount(name), { parse_mode: 'Markdown' });
}

/**
 * Handle: input nominal tagihan
 */
async function handleBillAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);

  const input = msg.text.trim().replace(/[.,]/g, '');
  const amount = parseFloat(input);

  if (isNaN(amount) || amount < 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }

  session.setState(userId, STATES.SETUP_BILL_DUE, {
    pendingBill: { ...data.pendingBill, amount },
  });
  await bot.sendMessage(msg.chat.id, t.setupBillDue(data.pendingBill.name), { parse_mode: 'Markdown' });
}

/**
 * Handle: input tanggal jatuh tempo
 */
async function handleBillDue(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);

  const dueDay = parseInt(msg.text.trim());

  if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
    await bot.sendMessage(msg.chat.id, t.invalidDate, { parse_mode: 'Markdown' });
    return;
  }

  session.setState(userId, STATES.SETUP_BILL_ACCOUNT, {
    pendingBill: { ...data.pendingBill, dueDay },
  });

  // Minta pilih akun pembayaran
  const updatedUser = userStore.getUser(userId);
  await bot.sendMessage(msg.chat.id, t.setupBillAccount(data.pendingBill.name), {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(updatedUser.accounts, 'bill_acct', user.lang),
  });
}

/**
 * Handle: pilih akun untuk tagihan
 */
async function handleBillAccount(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);

  const bill = { ...data.pendingBill, account: accountName };
  userStore.addBill(userId, bill);

  await bot.answerCallbackQuery(callbackQuery.id, {
    text: t.setupBillAdded(bill.name, bill.amount, bill.dueDay),
  });

  const updatedUser = userStore.getUser(userId);
  session.setState(userId, STATES.SETUP_BILLS_MENU, { pendingBill: null });

  await bot.editMessageText(
    `${t.setupBillAdded(bill.name, bill.amount, bill.dueDay)}\n\n${t.setupBillsTitle}`,
    {
      chat_id: chatId,
      message_id: callbackQuery.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: billsMenuKeyboard(updatedUser.bills || [], user.lang),
    }
  );
}

/**
 * Handle: hapus tagihan dari list
 */
async function handleBillRemove(bot, callbackQuery, billName) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const msgId = callbackQuery.message.message_id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  userStore.removeBill(userId, billName);
  await bot.answerCallbackQuery(callbackQuery.id, { text: t.setupBillRemoved(billName) });

  const updatedUser = userStore.getUser(userId);
  await bot.editMessageReplyMarkup(
    billsMenuKeyboard(updatedUser.bills || [], user.lang),
    { chat_id: chatId, message_id: msgId }
  );
}

/**
 * Handle: selesai setup bills — finish setup!
 */
async function handleBillsDone(bot, callbackQuery, isSettings = false) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  await bot.answerCallbackQuery(callbackQuery.id, {
    text: user.bills && user.bills.length > 0
      ? t.setupBillDone(user.bills.length)
      : t.setupBillsSkip,
  });

  if (isSettings) {
    session.clearSession(userId);
    await showSettingsMenu(bot, chatId, userId, user.lang);
    return;
  }

  // Setup complete! Inisialisasi Google Sheets
  await completeSetup(bot, chatId, userId, user);
}

/**
 * Selesaikan setup dan inisialisasi Google Sheets
 */
async function completeSetup(bot, chatId, userId, user) {
  const t = L(user.lang);

  const loadMsg = await bot.sendMessage(chatId, '⏳ Mempersiapkan Google Spreadsheet...', {
    parse_mode: 'Markdown',
  });

  try {
    // Buat sheet bulan pertama dengan data user
    await sheets.initializeFirstSheet(user.spreadsheetId, user);

    userStore.updateUser(userId, { setupComplete: true, setupStep: 'done' });
    session.clearSession(userId);

    const sheetName = sheets.getMonthlySheetName(new Date());
    await bot.editMessageText(`\n✅ *Setup Selesai!*\n\n📊 Sheet *${sheetName}* sudah dibuat di spreadsheet kamu!\n🎉 Siap mencatat keuangan!\n`, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
    });

    // Tampilkan menu utama
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(user.lang),
    });

  } catch (err) {
    log.error('Setup complete error:', err.message);
    await bot.editMessageText(
      `❌ Terjadi error saat membuat sheet:\n\`${err.message}\`\n\nSetup tetap tersimpan. Ketik /menu untuk lanjut.`,
      { chat_id: chatId, message_id: loadMsg.message_id, parse_mode: 'Markdown' }
    );
    userStore.updateUser(userId, { setupComplete: true, setupStep: 'done' });
    session.clearSession(userId);
  }
}

// =============================================
// SETTINGS MENU
// =============================================

async function showSettingsMenu(bot, chatId, userId, lang) {
  const { settingsKeyboard } = require('./menu');
  const { isAdmin } = require('./broadcast');
  const t = L(lang);
  await bot.sendMessage(chatId, t.settingsTitle, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard(lang, isAdmin(userId)),
  });
}

module.exports = {
  // Income
  handleIncomeToggle,
  handleIncomeAddPrompt,
  handleIncomeAddText,
  handleIncomeDone,
  // Accounts
  showAccountsSetup,
  handleAccountToggle,
  handleAccountBalance,
  handleAccountCustomPrompt,
  handleAccountCustomName,
  handleAccountsDone,
  // Spending
  showSpendingSetup,
  handleSpendingToggle,
  handleSpendingAddPrompt,
  handleSpendingAddText,
  handleSpendingDone,
  // Bills
  showBillsSetup,
  handleBillAddPrompt,
  handleBillName,
  handleBillAmount,
  handleBillDue,
  handleBillAccount,
  handleBillRemove,
  handleBillsDone,
  // Utils
  completeSetup,
  showSettingsMenu,
};
