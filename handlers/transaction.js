/**
 * Transaction Handler — Semua alur pencatatan transaksi
 * Mendukung: Spending, Income, Transfer, Bills, Piutang, Utang
 * MoneyFlowID Bot
 */

const userStore = require('../services/userStore');
const sheets = require('../services/sheets');
const { createLogger } = require('../services/logger');
const session = require('../middleware/session');
const { STATES } = require('../middleware/session');

const log = createLogger('Transaction');
const {
  cashflowKeyboard,
  incomeSourceSelectKeyboard,
  spendingCategorySelectKeyboard,
  accountSelectKeyboard,
  confirmKeyboard,
  mainMenuKeyboard,
  billSelectKeyboard,
  textInputKeyboard,
} = require('./menu');
const L = require('../locales');

const transactionStore = require('../services/transactionStore');
const storageProvider = require('../services/storage/storageProvider');

function mapTelegramTransaction(userId, tgData) {
  let cashflow = 'expense';
  if (tgData.cashflow === 'Income') cashflow = 'income';
  else if (tgData.cashflow === 'Spending' || tgData.cashflow === 'Bills' || tgData.cashflow === 'Pelunasan Utang' || tgData.cashflow === 'Pelunasan Piutang') cashflow = 'expense';
  else if (tgData.cashflow === 'Transfer') cashflow = 'transfer';
  else if (tgData.cashflow === 'Utang Baru') cashflow = 'debt';
  else if (tgData.cashflow === 'Piutang Baru') cashflow = 'receivable';

  let wallet = tgData.dari || tgData.ke || '';
  if (tgData.cashflow === 'Transfer') {
     wallet = tgData.dari + ' -> ' + tgData.ke;
  }

  return {
    source: 'telegram',
    cashflow: cashflow,
    category: tgData.category || '',
    wallet: wallet,
    amount: parseFloat(tgData.amount),
    description: tgData.name || '',
    transactionDate: tgData.date || new Date().toISOString()
  };
}

async function saveToStoreAndSheets(userId, tgData) {
  const user = userStore.getUser(userId);
  const internalTx = mapTelegramTransaction(userId, tgData);
  
  try {
     transactionStore.addTransaction(userId, internalTx);
     storageProvider.sync(user);
  } catch (err) {
     log.error('TransactionStore save error: ' + err.message);
     throw new Error('TransactionStore Error');
  }

  if (user.spreadsheetId && process.env.GOOGLE_CREDENTIALS_PATH) {
     try {
       await sheets.addTransaction(user.spreadsheetId, { ...tgData, _userData: user });
     } catch (err) {
       log.warn('Google Sheets save failed, but local store succeeded: ' + err.message);
     }
  }
}



// =============================================
// CASHFLOW TYPE SELECTION (Main Entry Point)
// =============================================

async function showCashflowMenu(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  if (!user) return;
  const t = L(user.lang);
  await bot.sendMessage(chatId, t.cashflowTitle, {
    parse_mode: 'Markdown',
    reply_markup: cashflowKeyboard(user.lang),
  });
}

// =============================================
// INCOME FLOW
// =============================================

async function startIncome(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  if (!user || !user.incomeSources?.length) return;
  const t = L(user.lang);
  session.setState(userId, STATES.INCOME_SOURCE);
  await bot.sendMessage(chatId, t.incomeTitle, {
    parse_mode: 'Markdown',
    reply_markup: incomeSourceSelectKeyboard(user.incomeSources, user.lang),
  });
}

async function handleIncomeSource(bot, callbackQuery, sourceName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.INCOME_AMOUNT, { incomeSource: sourceName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.incomeEnterAmount(sourceName), {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handleIncomeAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.INCOME_ACCOUNT, { incomeAmount: amount });
  await bot.sendMessage(msg.chat.id, t.incomeSelectAccount(data.incomeSource, amount), {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'income_acct', user.lang),
  });
}

async function handleIncomeAccount(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.INCOME_NAME, { incomeAccount: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.enterTxName, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handleIncomeName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const name = msg.text.trim() === '-' ? data.incomeSource : msg.text.trim();
  session.setState(userId, STATES.INCOME_CONFIRM, { incomeName: name });
  const txt = t.incomeConfirm(data.incomeSource, data.incomeAmount, data.incomeAccount, name);
  await bot.sendMessage(msg.chat.id, txt, {
    parse_mode: 'Markdown',
    reply_markup: confirmKeyboard('income:confirm', user.lang),
  });
}

async function handleIncomeConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: data.incomeName, amount: data.incomeAmount, cashflow: 'Income', category: data.incomeSource, dari: '', ke: data.incomeAccount });
    userStore.updateAccountBalance(userId, data.incomeAccount, data.incomeAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.incomeSaved(data.incomeAmount, data.incomeAccount), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Income confirm error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// SPENDING / EXPENSE FLOW
// =============================================

async function startExpense(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  if (!user || !user.spendingCategories?.length) return;
  const t = L(user.lang);
  session.setState(userId, STATES.EXPENSE_CATEGORY);
  await bot.sendMessage(chatId, t.expenseTitle, {
    parse_mode: 'Markdown',
    reply_markup: spendingCategorySelectKeyboard(user.spendingCategories, user.lang),
  });
}

async function handleExpenseCategory(bot, callbackQuery, categoryName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.EXPENSE_AMOUNT, { expenseCategory: categoryName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.expenseEnterAmount(categoryName), {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handleExpenseAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.EXPENSE_ACCOUNT, { expenseAmount: amount });
  await bot.sendMessage(msg.chat.id, t.expenseSelectAccount(data.expenseCategory, amount), {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'expense_acct', user.lang),
  });
}

async function handleExpenseAccount(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const bal = userStore.getAccountBalance(userId, accountName);
  if (bal < data.expenseAmount) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: t.insufficientBalance(accountName, bal), show_alert: true,
    });
  } else {
    await bot.answerCallbackQuery(callbackQuery.id);
  }
  session.setState(userId, STATES.EXPENSE_NAME, { expenseAccount: accountName });
  await bot.editMessageText(t.enterTxName, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handleExpenseName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const name = msg.text.trim() === '-' ? data.expenseCategory : msg.text.trim();
  session.setState(userId, STATES.EXPENSE_CONFIRM, { expenseName: name });
  await bot.sendMessage(msg.chat.id, t.expenseConfirm(data.expenseCategory, data.expenseAmount, data.expenseAccount, name), {
    parse_mode: 'Markdown',
    reply_markup: confirmKeyboard('expense:confirm', user.lang),
  });
}

async function handleExpenseConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: data.expenseName, amount: data.expenseAmount, cashflow: 'Spending', category: data.expenseCategory, dari: data.expenseAccount, ke: '' });
    userStore.updateAccountBalance(userId, data.expenseAccount, -data.expenseAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.expenseSaved(data.expenseAmount, data.expenseAccount), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Expense confirm error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// TRANSFER FLOW
// =============================================

async function startTransfer(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.TRANSFER_AMOUNT);
  await bot.sendMessage(chatId, t.transferEnterAmount, { parse_mode: 'Markdown' });
}

async function handleTransferAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.TRANSFER_FROM, { transferAmount: amount });
  await bot.sendMessage(msg.chat.id, t.transferFromAccount, {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'transfer_from', user.lang),
  });
}

async function handleTransferFrom(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const bal = userStore.getAccountBalance(userId, accountName);
  if (bal < data.transferAmount) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: t.insufficientBalance(accountName, bal), show_alert: true,
    });
  } else {
    await bot.answerCallbackQuery(callbackQuery.id);
  }
  session.setState(userId, STATES.TRANSFER_TO, { transferFrom: accountName });
  // Filter out the "from" account from "to" list
  const toAccounts = user.accounts.filter((a) => a.name !== accountName);
  await bot.editMessageText(t.transferToAccount, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(toAccounts, 'transfer_to', user.lang),
  });
}

async function handleTransferTo(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  session.setState(userId, STATES.TRANSFER_NAME, { transferTo: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.enterTxName, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handleTransferName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const name = msg.text.trim() === '-'
    ? `Transfer ${data.transferFrom} → ${data.transferTo}`
    : msg.text.trim();
  session.setState(userId, STATES.TRANSFER_CONFIRM, { transferName: name });
  await bot.sendMessage(msg.chat.id,
    t.transferConfirm(data.transferAmount, data.transferFrom, data.transferTo, name), {
      parse_mode: 'Markdown',
      reply_markup: confirmKeyboard('transfer:confirm', user.lang),
    });
}

async function handleTransferConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: data.transferName, amount: data.transferAmount, cashflow: 'Transfer', category: 'Antar Account', dari: data.transferFrom, ke: data.transferTo });
    userStore.updateAccountBalance(userId, data.transferFrom, -data.transferAmount);
    userStore.updateAccountBalance(userId, data.transferTo, data.transferAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.transferSaved(data.transferAmount, data.transferFrom, data.transferTo), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Transfer confirm error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// BILLS PAYMENT FLOW
// =============================================

async function startBillPayment(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const unpaidBills = (user.bills || []).filter((b) => b.active && !b.paidThisMonth);
  if (!unpaidBills.length) {
    await bot.sendMessage(chatId,
      user.lang === 'id' ? '✅ Semua tagihan sudah dibayar bulan ini!' : '✅ All bills paid this month!',
      { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.BILL_SELECT);
  await bot.sendMessage(chatId, t.billSelectTitle, {
    parse_mode: 'Markdown',
    reply_markup: billSelectKeyboard(unpaidBills, user.lang),
  });
}

async function handleBillSelect(bot, callbackQuery, billName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const bill = (user.bills || []).find((b) => b.name === billName);
  if (!bill) return;
  session.setState(userId, STATES.BILL_ACCOUNT, { selectedBill: bill });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.billSelectAccount(bill.name, bill.amount), {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'bill_pay_acct', user.lang),
  });
}

async function handleBillPayAccount(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const bill = data.selectedBill;
  session.setState(userId, STATES.BILL_CONFIRM, { billPayAccount: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.billConfirm(bill.name, bill.amount, accountName), {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
    reply_markup: confirmKeyboard('bill:confirm', user.lang),
  });
}

async function handleBillConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const bill = data.selectedBill;
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    const { sheetName } = await sheets.getOrCreateMonthlySheet(user.spreadsheetId, user);
    await saveToStoreAndSheets(userId, { name: `Bayar ${bill.name}`, amount: bill.amount, cashflow: 'Bills', category: bill.name, dari: data.billPayAccount, ke: '' });
    // Update bill status di sheet
    await sheets.updateBillStatus(user.spreadsheetId, sheetName, bill.name, 'Paid');
    // Update saldo user
    userStore.updateAccountBalance(userId, data.billPayAccount, -bill.amount);
    // Mark bill sebagai paid di local store
    userStore.markBillPaid(userId, bill.name);
    session.clearSession(userId);
    await bot.editMessageText(t.billPaid(bill.name), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Bill payment error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// PIUTANG BARU FLOW (Beri Pinjaman ke Orang)
// =============================================

async function startPiutangBaru(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.PIUTANG_NAME);
  await bot.sendMessage(chatId, t.piutangEnterName, { parse_mode: 'Markdown' });
}

async function handlePiutangName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const name = msg.text.trim();
  session.setState(userId, STATES.PIUTANG_AMOUNT, { piutangName: name });
  await bot.sendMessage(msg.chat.id, t.piutangEnterAmount(name), { parse_mode: 'Markdown' });
}

async function handlePiutangAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.PIUTANG_DARI, { piutangAmount: amount });
  await bot.sendMessage(msg.chat.id, t.piutangSelectDari, {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'piutang_dari', user.lang),
  });
}

async function handlePiutangDari(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  session.setState(userId, STATES.PIUTANG_TX_NAME, { piutangDari: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.enterTxName, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handlePiutangTxName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const txName = msg.text.trim() === '-' ? `Piutang ${data.piutangName}` : msg.text.trim();
  session.setState(userId, STATES.PIUTANG_CONFIRM, { piutangTxName: txName });
  await bot.sendMessage(msg.chat.id,
    t.piutangConfirm(data.piutangName, data.piutangAmount, data.piutangDari, txName), {
      parse_mode: 'Markdown',
      reply_markup: confirmKeyboard('piutang:confirm', user.lang),
    });
}

async function handlePiutangConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: data.piutangTxName, amount: data.piutangAmount, cashflow: 'Piutang Baru', category: data.piutangName, dari: data.piutangDari, ke: '' });
    userStore.updateAccountBalance(userId, data.piutangDari, -data.piutangAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.piutangSaved(data.piutangName, data.piutangAmount), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Piutang error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// PELUNASAN PIUTANG FLOW (Terima Balik)
// =============================================

async function startLunasPiutang(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.LUNASPIU_NAME);
  await bot.sendMessage(chatId, t.lunasPiutangEnterName, { parse_mode: 'Markdown' });
}

async function handleLunasPiutangName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.LUNASPIU_AMOUNT, { lunasPiuName: msg.text.trim() });
  await bot.sendMessage(msg.chat.id, t.lunasPiutangEnterAmount, { parse_mode: 'Markdown' });
}

async function handleLunasPiutangAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.LUNASPIU_KE, { lunasPiuAmount: amount });
  await bot.sendMessage(msg.chat.id, t.lunasPiutangSelectKe, {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'lunaspiu_ke', user.lang),
  });
}

async function handleLunasPiutangKe(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  session.setState(userId, STATES.LUNASPIU_CONFIRM, { lunasPiuKe: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(
    t.lunasPiutangConfirm(data.lunasPiuName, data.lunasPiuAmount, accountName), {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: confirmKeyboard('lunaspiu:confirm', user.lang),
    });
}

async function handleLunasPiutangConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: `Bayar ${data.lunasPiuName}`, amount: data.lunasPiuAmount, cashflow: 'Pelunasan Piutang', category: data.lunasPiuName, dari: '', ke: data.lunasPiuKe });
    userStore.updateAccountBalance(userId, data.lunasPiuKe, data.lunasPiuAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.lunasPiutangSaved(data.lunasPiuName, data.lunasPiuAmount), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Lunas piutang error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// UTANG BARU FLOW (Pinjam dari Orang)
// =============================================

async function startUtangBaru(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.UTANG_NAME);
  await bot.sendMessage(chatId, t.utangEnterName, { parse_mode: 'Markdown' });
}

async function handleUtangName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.UTANG_AMOUNT, { utangName: msg.text.trim() });
  await bot.sendMessage(msg.chat.id, t.utangEnterAmount(msg.text.trim()), { parse_mode: 'Markdown' });
}

async function handleUtangAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.UTANG_KE, { utangAmount: amount });
  await bot.sendMessage(msg.chat.id, t.utangSelectKe, {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'utang_ke', user.lang),
  });
}

async function handleUtangKe(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.UTANG_TX_NAME, { utangKe: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(t.enterTxName, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
  });
}

async function handleUtangTxName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  const txName = msg.text.trim() === '-' ? `Utang dari ${data.utangName}` : msg.text.trim();
  session.setState(userId, STATES.UTANG_CONFIRM, { utangTxName: txName });
  await bot.sendMessage(msg.chat.id,
    t.utangConfirm(data.utangName, data.utangAmount, data.utangKe, txName), {
      parse_mode: 'Markdown',
      reply_markup: confirmKeyboard('utang:confirm', user.lang),
    });
}

async function handleUtangConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: data.utangTxName, amount: data.utangAmount, cashflow: 'Utang Baru', category: data.utangName, dari: '', ke: data.utangKe });
    userStore.updateAccountBalance(userId, data.utangKe, data.utangAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.utangSaved(data.utangName, data.utangAmount), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Utang error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// PELUNASAN UTANG FLOW (Bayar Utang ke Orang)
// =============================================

async function startLunasUtang(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.LUNASUTANG_NAME);
  await bot.sendMessage(chatId, t.lunasUtangEnterName, { parse_mode: 'Markdown' });
}

async function handleLunasUtangName(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  session.setState(userId, STATES.LUNASUTANG_AMOUNT, { lunasUtangName: msg.text.trim() });
  await bot.sendMessage(msg.chat.id, t.lunasUtangEnterAmount, { parse_mode: 'Markdown' });
}

async function handleLunasUtangAmount(bot, msg) {
  const userId = msg.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const amount = parseAmount(msg.text.trim());
  if (isNaN(amount) || amount <= 0) {
    await bot.sendMessage(msg.chat.id, t.invalidAmount, { parse_mode: 'Markdown' });
    return;
  }
  session.setState(userId, STATES.LUNASUTANG_DARI, { lunasUtangAmount: amount });
  await bot.sendMessage(msg.chat.id, t.lunasUtangSelectDari, {
    parse_mode: 'Markdown',
    reply_markup: accountSelectKeyboard(user.accounts, 'lunasutang_dari', user.lang),
  });
}

async function handleLunasUtangDari(bot, callbackQuery, accountName) {
  const userId = callbackQuery.from.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  session.setState(userId, STATES.LUNASUTANG_CONFIRM, { lunasUtangDari: accountName });
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(
    t.lunasUtangConfirm(data.lunasUtangName, data.lunasUtangAmount, accountName), {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: confirmKeyboard('lunasutang:confirm', user.lang),
    });
}

async function handleLunasUtangConfirm(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  try {
    await saveToStoreAndSheets(userId, { name: `Bayar utang ${data.lunasUtangName}`, amount: data.lunasUtangAmount, cashflow: 'Pelunasan Utang', category: data.lunasUtangName, dari: data.lunasUtangDari, ke: '' });
    userStore.updateAccountBalance(userId, data.lunasUtangDari, -data.lunasUtangAmount);
    session.clearSession(userId);
    await bot.editMessageText(t.lunasUtangSaved(data.lunasUtangName, data.lunasUtangAmount), {
      chat_id: chatId, message_id: callbackQuery.message.message_id, parse_mode: 'Markdown',
    });
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown', reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Lunas utang error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// AI TRANSACTION SAVE
// =============================================

async function saveAiTransaction(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const data = session.getData(userId);

  if (!data.aiTransaction) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: '❌' });
    return;
  }
  await bot.answerCallbackQuery(callbackQuery.id, { text: '⏳' });

  const ai = data.aiTransaction;

  // ── Map field AI → field transaksi ─────────────────────────────────
  const type = (ai.type || '').toLowerCase();
  let cashflow, dari, ke, category;
  const accountName = ai.account || (user.accounts[0]?.name || 'Cash');

  if (type === 'income') {
    cashflow = 'Income';
    dari = '';
    ke = accountName;
    category = ai.category || (user.incomeSources[0]?.name || 'Income');
  } else if (type === 'transfer') {
    cashflow = 'Transfer';
    dari = accountName;
    ke = ai.toAccount || (user.accounts[1]?.name || 'Cash');
    category = 'Transfer';
  } else if (type === 'utang') {
    cashflow = 'Utang Baru';
    dari = '';
    ke = '';
    category = ai.account || ai.category || 'Paylater';
  } else if (type === 'pelunasan_utang') {
    cashflow = 'Pelunasan Utang';
    dari = accountName;
    ke = '';
    category = ai.category || ai.toAccount || 'Paylater';
  } else {
    // expense / default
    cashflow = 'Spending';
    dari = accountName;
    ke = '';
    category = ai.category || (user.spendingCategories[0]?.name || 'Pengeluaran');
  }

  const tx = {
    name:     ai.name || ai.note || ai.category || cashflow,
    amount:   ai.amount || 0,
    cashflow,
    category,
    dari,
    ke,
    date:     ai.date || null,
  };

  log.debug(`AI Transaction mapped:`, { type, cashflow: tx.cashflow, category: tx.category, amount: tx.amount, dari: tx.dari, ke: tx.ke, name: tx.name });

  try {
    await saveToStoreAndSheets(userId, tx);

    // Update saldo akun lokal
    if (tx.cashflow === 'Income') {
      userStore.updateAccountBalance(userId, tx.ke, tx.amount);
    } else if (tx.cashflow === 'Spending') {
      userStore.updateAccountBalance(userId, tx.dari, -tx.amount);
    } else if (tx.cashflow === 'Transfer') {
      userStore.updateAccountBalance(userId, tx.dari, -tx.amount);
      userStore.updateAccountBalance(userId, tx.ke, tx.amount);
    } else if (tx.cashflow === 'Pelunasan Utang') {
      userStore.updateAccountBalance(userId, tx.dari, -tx.amount);
    }

    session.clearSession(userId);
    // Kembali ke IDLE, bukan AI_CHAT — agar user bisa langsung kirim transaksi berikutnya
    session.setState(userId, STATES.IDLE);

    let savedMsg;
    if (tx.cashflow === 'Income') {
      savedMsg = t.incomeSaved(tx.amount, tx.ke);
    } else if (tx.cashflow === 'Transfer') {
      savedMsg = t.transferSaved ? t.transferSaved(tx.amount, tx.dari, tx.ke) : t.expenseSaved(tx.amount, tx.dari);
    } else if (tx.cashflow === 'Utang Baru') {
      savedMsg = t.utangSaved(tx.category, tx.amount);
    } else if (tx.cashflow === 'Pelunasan Utang') {
      savedMsg = t.lunasUtangSaved(tx.category, tx.amount);
    } else {
      savedMsg = t.expenseSaved(tx.amount, tx.dari);
    }

    await bot.editMessageText(savedMsg, {
      chat_id: chatId,
      message_id: callbackQuery.message.message_id,
      parse_mode: 'Markdown',
    });
    // Kirim main menu setelah sukses
    await bot.sendMessage(chatId, t.mainMenu, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('AI tx save error:', err.message);
    await bot.sendMessage(chatId, t.processingError, { parse_mode: 'Markdown' });
    session.clearSession(userId);
  }
}

// =============================================
// AMOUNT PARSER
// =============================================

function parseAmount(text) {
  if (!text) return NaN;
  const clean = text.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
  let mult = 1, numStr = clean;
  if (/juta?$/.test(clean)) { mult = 1000000; numStr = clean.replace(/juta?$/, ''); }
  else if (/ribu?$/.test(clean)) { mult = 1000; numStr = clean.replace(/ribu?$/, ''); }
  else if (/rb$/.test(clean)) { mult = 1000; numStr = clean.replace(/rb$/, ''); }
  else if (/k$/.test(clean)) { mult = 1000; numStr = clean.replace(/k$/, ''); }
  else if (/jt$/.test(clean)) { mult = 1000000; numStr = clean.replace(/jt$/, ''); }
  else if (/m$/.test(clean)) { mult = 1000000; numStr = clean.replace(/m$/, ''); }
  return parseFloat(numStr) * mult;
}

module.exports = {
  showCashflowMenu,
  // Income
  startIncome, handleIncomeSource, handleIncomeAmount,
  handleIncomeAccount, handleIncomeName, handleIncomeConfirm,
  // Expense
  startExpense, handleExpenseCategory, handleExpenseAmount,
  handleExpenseAccount, handleExpenseName, handleExpenseConfirm,
  // Transfer
  startTransfer, handleTransferAmount, handleTransferFrom,
  handleTransferTo, handleTransferName, handleTransferConfirm,
  // Bills
  startBillPayment, handleBillSelect, handleBillPayAccount, handleBillConfirm,
  // Piutang
  startPiutangBaru, handlePiutangName, handlePiutangAmount,
  handlePiutangDari, handlePiutangTxName, handlePiutangConfirm,
  // Lunas Piutang
  startLunasPiutang, handleLunasPiutangName, handleLunasPiutangAmount,
  handleLunasPiutangKe, handleLunasPiutangConfirm,
  // Utang
  startUtangBaru, handleUtangName, handleUtangAmount,
  handleUtangKe, handleUtangTxName, handleUtangConfirm,
  // Lunas Utang
  startLunasUtang, handleLunasUtangName, handleLunasUtangAmount,
  handleLunasUtangDari, handleLunasUtangConfirm,
  // AI
  saveAiTransaction,
  // Utils
  parseAmount,
};
