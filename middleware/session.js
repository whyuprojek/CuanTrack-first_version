/**
 * Session Middleware — mengelola state percakapan per user
 * MoneyFlowID Bot — Updated with Transfer, Piutang, Utang, Bills flows
 */

const sessions = new Map();

const STATES = {
  IDLE: 'IDLE',

  // Onboarding
  ONBOARD_LANG: 'ONBOARD_LANG',
  ONBOARD_SHEET: 'ONBOARD_SHEET',

  // Setup - Income Sources
  SETUP_INCOME_MENU: 'SETUP_INCOME_MENU',
  SETUP_INCOME_ADDING: 'SETUP_INCOME_ADDING',

  // Setup - Accounts
  SETUP_ACCT_MENU: 'SETUP_ACCT_MENU',
  SETUP_ACCT_BALANCE: 'SETUP_ACCT_BALANCE',
  SETUP_ACCT_CUSTOM_NAME: 'SETUP_ACCT_CUSTOM_NAME',

  // Setup - Spending Categories
  SETUP_SPENDING_MENU: 'SETUP_SPENDING_MENU',
  SETUP_SPENDING_ADDING: 'SETUP_SPENDING_ADDING',

  // Setup - Bills
  SETUP_BILLS_MENU: 'SETUP_BILLS_MENU',
  SETUP_BILL_NAME: 'SETUP_BILL_NAME',
  SETUP_BILL_AMOUNT: 'SETUP_BILL_AMOUNT',
  SETUP_BILL_DUE: 'SETUP_BILL_DUE',
  SETUP_BILL_ACCOUNT: 'SETUP_BILL_ACCOUNT',

  // Record Income
  INCOME_SOURCE: 'INCOME_SOURCE',
  INCOME_AMOUNT: 'INCOME_AMOUNT',
  INCOME_ACCOUNT: 'INCOME_ACCOUNT',
  INCOME_NAME: 'INCOME_NAME',
  INCOME_CONFIRM: 'INCOME_CONFIRM',

  // Record Expense (Spending)
  EXPENSE_CATEGORY: 'EXPENSE_CATEGORY',
  EXPENSE_AMOUNT: 'EXPENSE_AMOUNT',
  EXPENSE_ACCOUNT: 'EXPENSE_ACCOUNT',
  EXPENSE_NAME: 'EXPENSE_NAME',
  EXPENSE_CONFIRM: 'EXPENSE_CONFIRM',

  // Transfer Antar Akun
  TRANSFER_AMOUNT: 'TRANSFER_AMOUNT',
  TRANSFER_FROM: 'TRANSFER_FROM',
  TRANSFER_TO: 'TRANSFER_TO',
  TRANSFER_NAME: 'TRANSFER_NAME',
  TRANSFER_CONFIRM: 'TRANSFER_CONFIRM',

  // Bayar Bills
  BILL_SELECT: 'BILL_SELECT',
  BILL_ACCOUNT: 'BILL_ACCOUNT',
  BILL_CONFIRM: 'BILL_CONFIRM',

  // Piutang Baru (beri pinjaman)
  PIUTANG_NAME: 'PIUTANG_NAME',
  PIUTANG_AMOUNT: 'PIUTANG_AMOUNT',
  PIUTANG_DARI: 'PIUTANG_DARI',
  PIUTANG_TX_NAME: 'PIUTANG_TX_NAME',
  PIUTANG_CONFIRM: 'PIUTANG_CONFIRM',

  // Pelunasan Piutang (terima balik)
  LUNASPIU_NAME: 'LUNASPIU_NAME',
  LUNASPIU_AMOUNT: 'LUNASPIU_AMOUNT',
  LUNASPIU_KE: 'LUNASPIU_KE',
  LUNASPIU_CONFIRM: 'LUNASPIU_CONFIRM',

  // Utang Baru (pinjam dari orang)
  UTANG_NAME: 'UTANG_NAME',
  UTANG_AMOUNT: 'UTANG_AMOUNT',
  UTANG_KE: 'UTANG_KE',
  UTANG_TX_NAME: 'UTANG_TX_NAME',
  UTANG_CONFIRM: 'UTANG_CONFIRM',

  // Pelunasan Utang (bayar balik)
  LUNASUTANG_NAME: 'LUNASUTANG_NAME',
  LUNASUTANG_AMOUNT: 'LUNASUTANG_AMOUNT',
  LUNASUTANG_DARI: 'LUNASUTANG_DARI',
  LUNASUTANG_CONFIRM: 'LUNASUTANG_CONFIRM',

  // AI
  AI_CHAT: 'AI_CHAT',
  AI_CONFIRM_TRANSACTION: 'AI_CONFIRM_TRANSACTION',

  // Reports
  REPORT_MENU: 'REPORT_MENU',

  // Settings
  SETTINGS_MENU: 'SETTINGS_MENU',
  SETTINGS_INCOME_MENU: 'SETTINGS_INCOME_MENU',
  SETTINGS_INCOME_ADDING: 'SETTINGS_INCOME_ADDING',
  SETTINGS_ACCT_MENU: 'SETTINGS_ACCT_MENU',
  SETTINGS_ACCT_BALANCE: 'SETTINGS_ACCT_BALANCE',
  SETTINGS_SPENDING_MENU: 'SETTINGS_SPENDING_MENU',
  SETTINGS_SPENDING_ADDING: 'SETTINGS_SPENDING_ADDING',
  SETTINGS_BILLS_MENU: 'SETTINGS_BILLS_MENU',
  SETTINGS_BILL_NAME: 'SETTINGS_BILL_NAME',
  SETTINGS_BILL_AMOUNT: 'SETTINGS_BILL_AMOUNT',
  SETTINGS_BILL_DUE: 'SETTINGS_BILL_DUE',
  SETTINGS_BILL_ACCOUNT: 'SETTINGS_BILL_ACCOUNT',

  // Budget
  BUDGET_MENU: 'BUDGET_MENU',
  BUDGET_AMOUNT: 'BUDGET_AMOUNT',

  // Admin Broadcast
  ADMIN_BROADCAST_INPUT: 'ADMIN_BROADCAST_INPUT',
  ADMIN_BROADCAST_CONFIRM: 'ADMIN_BROADCAST_CONFIRM',
};

function getSession(userId) {
  if (!sessions.has(String(userId))) {
    sessions.set(String(userId), { state: STATES.IDLE, data: {}, aiHistory: [] });
  }
  return sessions.get(String(userId));
}

function getState(userId) {
  return getSession(userId).state;
}

function getData(userId) {
  return getSession(userId).data;
}

function setState(userId, state, data = {}) {
  const s = getSession(userId);
  s.state = state;
  s.data = { ...s.data, ...data };
  sessions.set(String(userId), s);
}

function setData(userId, data) {
  const s = getSession(userId);
  s.data = { ...s.data, ...data };
  sessions.set(String(userId), s);
}

function clearSession(userId) {
  const aiHistory = getSession(userId).aiHistory || [];
  sessions.set(String(userId), { state: STATES.IDLE, data: {}, aiHistory });
}

function addToAiHistory(userId, role, content) {
  const s = getSession(userId);
  if (!s.aiHistory) s.aiHistory = [];
  s.aiHistory.push({ role, parts: [{ text: content }] });
  if (s.aiHistory.length > 20) s.aiHistory = s.aiHistory.slice(-20);
  sessions.set(String(userId), s);
}

function clearAiHistory(userId) {
  const s = getSession(userId);
  s.aiHistory = [];
  sessions.set(String(userId), s);
}

module.exports = {
  STATES,
  getSession,
  getState,
  getData,
  setState,
  setData,
  clearSession,
  addToAiHistory,
  clearAiHistory,
};
