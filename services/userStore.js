/**
 * User Data Store — menyimpan data pengguna ke JSON file per user
 * CuanTrack Bot
 */

const fs = require('fs');
const path = require('path');
// [TAMBAHAN: Storage Abstraction Layer]
const storageProvider = require('./storage/storageProvider');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Pastikan direktori data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Baca data user dari file JSON
 */
function getUser(userId) {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Simpan data user ke file JSON
 */
function saveUser(userId, data) {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  // [TAMBAHAN: Trigger Dual-Write via Background Queue]
  storageProvider.sync(data);
}

/**
 * Buat user baru
 */
function createUser(userId, { name, username, lang = 'id' }) {
  const user = {
    userId: String(userId),
    name,
    username,
    lang,
    spreadsheetId: null,
    setupComplete: false,
    setupStep: 'spreadsheet', // spreadsheet | income | accounts | spending | bills | done
    incomeSources: [],
    accounts: [],
    spendingCategories: [],
    bills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveUser(userId, user);
  return user;
}

/**
 * Update data user
 */
function updateUser(userId, updates) {
  const user = getUser(userId);
  if (!user) return null;
  const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
  saveUser(userId, updated);
  return updated;
}

// ============================
// INCOME SOURCES
// ============================

function addIncomeSource(userId, source) {
  const user = getUser(userId);
  if (!user) return null;
  if (!user.incomeSources) user.incomeSources = [];
  // Cek duplikat
  if (user.incomeSources.some((s) => s.name.toLowerCase() === source.name.toLowerCase())) {
    return user;
  }
  user.incomeSources.push({ name: source.name, emoji: source.emoji || '💰', active: true });
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function removeIncomeSource(userId, sourceName) {
  const user = getUser(userId);
  if (!user) return null;
  user.incomeSources = (user.incomeSources || []).filter(
    (s) => s.name.toLowerCase() !== sourceName.toLowerCase()
  );
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function setIncomeSources(userId, sources) {
  const user = getUser(userId);
  if (!user) return null;
  user.incomeSources = sources;
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

// ============================
// ACCOUNTS
// ============================

function addAccount(userId, account) {
  const user = getUser(userId);
  if (!user) return null;
  if (!user.accounts) user.accounts = [];
  // Cek duplikat
  if (user.accounts.some((a) => a.name.toLowerCase() === account.name.toLowerCase())) {
    return user;
  }
  user.accounts.push({
    name: account.name,
    emoji: account.emoji || '🏦',
    type: account.type || 'bank',
    initialBalance: account.balance || 0,
    balance: account.balance || 0,
  });
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function removeAccount(userId, accountName) {
  const user = getUser(userId);
  if (!user) return null;
  user.accounts = (user.accounts || []).filter(
    (a) => a.name.toLowerCase() !== accountName.toLowerCase()
  );
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function updateAccountBalance(userId, accountName, delta) {
  const user = getUser(userId);
  if (!user) return null;
  const account = (user.accounts || []).find(
    (a) => a.name.toLowerCase() === accountName.toLowerCase()
  );
  if (!account) return null;
  account.balance = (account.balance || 0) + delta;
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return account;
}

function setAccountBalance(userId, accountName, newBalance) {
  const user = getUser(userId);
  if (!user) return null;
  const account = (user.accounts || []).find(
    (a) => a.name.toLowerCase() === accountName.toLowerCase()
  );
  if (!account) return null;
  account.balance = newBalance;
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return account;
}

function getAccountBalance(userId, accountName) {
  const user = getUser(userId);
  if (!user) return 0;
  const account = (user.accounts || []).find(
    (a) => a.name.toLowerCase() === accountName.toLowerCase()
  );
  return account ? account.balance : 0;
}

// ============================
// SPENDING CATEGORIES
// ============================

function addSpendingCategory(userId, category) {
  const user = getUser(userId);
  if (!user) return null;
  if (!user.spendingCategories) user.spendingCategories = [];
  if (user.spendingCategories.some((c) => c.name.toLowerCase() === category.name.toLowerCase())) {
    return user;
  }
  user.spendingCategories.push({ name: category.name, emoji: category.emoji || '📦' });
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function removeSpendingCategory(userId, categoryName) {
  const user = getUser(userId);
  if (!user) return null;
  user.spendingCategories = (user.spendingCategories || []).filter(
    (c) => c.name.toLowerCase() !== categoryName.toLowerCase()
  );
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function setSpendingCategories(userId, categories) {
  const user = getUser(userId);
  if (!user) return null;
  user.spendingCategories = categories;
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

// ============================
// BILLS
// ============================

function addBill(userId, bill) {
  const user = getUser(userId);
  if (!user) return null;
  if (!user.bills) user.bills = [];
  if (user.bills.some((b) => b.name.toLowerCase() === bill.name.toLowerCase())) {
    return user;
  }
  user.bills.push({
    name: bill.name,
    emoji: bill.emoji || '📅',
    amount: bill.amount || 0,
    dueDay: bill.dueDay || 1,
    account: bill.account || '',
    active: true,
    paidThisMonth: false,
    lastPaidDate: null,
  });
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function removeBill(userId, billName) {
  const user = getUser(userId);
  if (!user) return null;
  user.bills = (user.bills || []).filter(
    (b) => b.name.toLowerCase() !== billName.toLowerCase()
  );
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

function markBillPaid(userId, billName) {
  const user = getUser(userId);
  if (!user) return null;
  const bill = (user.bills || []).find(
    (b) => b.name.toLowerCase() === billName.toLowerCase()
  );
  if (!bill) return null;
  bill.paidThisMonth = true;
  bill.lastPaidDate = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return bill;
}

/**
 * Reset status pembayaran tagihan di awal bulan
 */
function resetBillsForNewMonth(userId) {
  const user = getUser(userId);
  if (!user) return null;
  (user.bills || []).forEach((bill) => {
    bill.paidThisMonth = false;
  });
  user.updatedAt = new Date().toISOString();
  saveUser(userId, user);
  return user;
}

/**
 * Dapatkan semua user IDs
 */
function getAllUserIds() {
  try {
    const files = fs.readdirSync(DATA_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}

/**
 * Helper untuk mendapatkan locale user
 */
function getUserLang(userId) {
  const user = getUser(userId);
  return user ? user.lang || 'id' : 'id';
}

/**
 * Hapus data user (reset)
 */
function deleteUser(userId) {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  try { fs.unlinkSync(filePath); } catch {}
}

module.exports = {
  getUser,
  saveUser,
  createUser,
  updateUser,
  addIncomeSource,
  removeIncomeSource,
  setIncomeSources,
  addAccount,
  removeAccount,
  updateAccountBalance,
  setAccountBalance,
  getAccountBalance,
  addSpendingCategory,
  removeSpendingCategory,
  setSpendingCategories,
  addBill,
  removeBill,
  markBillPaid,
  resetBillsForNewMonth,
  getAllUserIds,
  getUserLang,
  deleteUser,
};