/**
 * Budget Handler — atur budget spending per kategori via Telegram
 * MoneyFlowID Bot
 */

const userStore = require('../services/userStore');
const sheets = require('../services/sheets');
const { createLogger } = require('../services/logger');
const session = require('../middleware/session');
const { STATES } = require('../middleware/session');
const L = require('../locales');

// NEW
const budgetStore = require('../services/budgetStore');
const storageProvider = require('../services/storage/storageProvider');

async function saveToBudgetStoreAndSheets(userId, categoryName, amount) {
  const user = userStore.getUser(userId);

  // Timezone Asia/Jakarta YYYY-MM
  const dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const period = `${year}-${month}`;

  try {
     if (amount === '' || amount === 0) {
        const b = budgetStore.getBudgetByCategory(userId, period, categoryName);
        if (b) {
           budgetStore.deleteBudget(userId, b.id);
        }
     } else {
        budgetStore.setBudget(userId, { period: period, category: categoryName, amount: amount, source: 'telegram' });
     }
     storageProvider.sync(user);
  } catch (err) {
     log.error('BudgetStore error: ' + err.message);
     throw new Error('BudgetStore Error');
  }

  if (user.spreadsheetId && process.env.GOOGLE_CREDENTIALS_PATH) {
     try {
       await sheets.setSpendingBudget(user.spreadsheetId, categoryName, amount);
     } catch (err) {
       log.warn('Google Sheets budget sync failed, but local store succeeded: ' + err.message);
     }
  }
}

const log = createLogger('Budget');

/**
 * Parse nominal dari input user
 * Mendukung: 500000, 500rb, 500ribu, 1.5jt, 1.5juta, 500k
 */
function parseAmount(text) {
  const raw = text.trim().toLowerCase()
    .replace(/[rp.\s]/g, '')
    .replace(',', '.')
    .replace('rb', '000')
    .replace('ribu', '000')
    .replace('jt', '000000')
    .replace('juta', '000000')
    .replace('k', '000');
  const num = parseFloat(raw);
  return isNaN(num) ? null : Math.round(num);
}

/**
 * Tampilkan menu pilih kategori budget
 */
async function showBudgetMenu(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  if (!user || !user.setupComplete) return;

  const cats = (user.spendingCategories || []).filter(c => c.name);
  if (cats.length === 0) {
    const msg = user.lang === 'id'
      ? '⚠️ Belum ada kategori spending. Setup dulu via /settings.'
      : '⚠️ No spending categories found. Set them up via /settings.';
    await bot.sendMessage(chatId, msg);
    return;
  }

  // Baca budget saat ini dari sheet
  let currentBudgets = {};
  try {
    currentBudgets = await sheets.getSpendingBudgets(user.spreadsheetId);
  } catch (e) {
    log.error('getSpendingBudgets error:', e.message);
  }

  const keyboard = cats.map(cat => {
    const budget = currentBudgets[cat.name];
    const budgetStr = budget && budget > 0
      ? ` — Rp ${Number(budget).toLocaleString('id-ID')}`
      : ' — (belum diset)';
    return [{ text: `${cat.emoji || '📂'} ${cat.name}${budgetStr}`, callback_data: `budget:set:${cat.name}` }];
  });
  keyboard.push([{ text: user.lang === 'id' ? '❌ Tutup' : '❌ Close', callback_data: 'cancel' }]);

  const totalBudget = Object.values(currentBudgets).reduce((s, v) => s + (v || 0), 0);
  const totalStr = totalBudget > 0 ? `\n\n💰 *Total budget: Rp ${totalBudget.toLocaleString('id-ID')}*` : '';

  const text = user.lang === 'id'
    ? `📊 *Budget Pengeluaran Bulanan*\n\nKetuk kategori untuk mengatur budget:${totalStr}`
    : `📊 *Monthly Spending Budget*\n\nTap a category to set budget:${totalStr}`;

  session.setState(userId, STATES.BUDGET_MENU);
  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard },
  });
}

/**
 * Handle saat user pilih kategori — minta input nominal
 */
async function handleBudgetCategorySelect(bot, callbackQuery, categoryName) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);

  // Simpan kategori yang dipilih ke session
  session.setState(userId, STATES.BUDGET_AMOUNT, { budgetCategory: categoryName });

  // Baca budget saat ini
  let currentBudget = 0;
  try {
    const budgets = await sheets.getSpendingBudgets(user.spreadsheetId);
    currentBudget = budgets[categoryName] || 0;
  } catch (e) {}

  const currentStr = currentBudget > 0
    ? (user.lang === 'id'
        ? `\n_Budget saat ini: *Rp ${Number(currentBudget).toLocaleString('id-ID')}*_`
        : `\n_Current budget: *Rp ${Number(currentBudget).toLocaleString('id-ID')}*_`)
    : '';

  const text = user.lang === 'id'
    ? `💰 *Set Budget: ${categoryName}*${currentStr}\n\nMasukkan nominal budget per bulan:\n_(contoh: 500000 atau 500rb atau 1.5jt)_`
    : `💰 *Set Budget: ${categoryName}*${currentStr}\n\nEnter monthly budget amount:\n_(e.g. 500000 or 500k or 1.5m)_`;

  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.editMessageText(text, {
    chat_id: chatId,
    message_id: callbackQuery.message.message_id,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        ...(currentBudget > 0 ? [[{ text: user.lang === 'id' ? '🗑 Hapus budget' : '🗑 Clear budget', callback_data: `budget:clear:${categoryName}` }]] : []),
        [{ text: user.lang === 'id' ? '⬅️ Kembali' : '⬅️ Back', callback_data: 'budget:menu' }],
      ],
    },
  });
}

/**
 * Handle input nominal budget dari user
 */
async function handleBudgetAmount(bot, msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const user = userStore.getUser(userId);
  const data = session.getData(userId);
  const categoryName = data.budgetCategory;

  if (!categoryName) {
    session.setState(userId, STATES.IDLE);
    return;
  }

  const amount = parseAmount(msg.text);

  if (amount === null || amount < 0) {
    const errText = user.lang === 'id'
      ? '❌ Nominal tidak valid. Coba lagi:\n_(contoh: 500000 atau 500rb atau 1.5jt)_'
      : '❌ Invalid amount. Try again:\n_(e.g. 500000 or 500k)_';
    await bot.sendMessage(chatId, errText, { parse_mode: 'Markdown' });
    return;
  }

  try {
    await saveToBudgetStoreAndSheets(userId, categoryName, amount);
    session.setState(userId, STATES.IDLE);

    const successText = user.lang === 'id'
      ? `✅ *Budget ${categoryName} disimpan!*\n\n💰 Budget: *Rp ${amount.toLocaleString('id-ID')}*/bulan\n\nKetik /budget untuk atur kategori lain.`
      : `✅ *Budget for ${categoryName} saved!*\n\n💰 Budget: *Rp ${amount.toLocaleString('id-ID')}*/month\n\nType /budget to set other categories.`;

    await bot.sendMessage(chatId, successText, { parse_mode: 'Markdown' });
  } catch (err) {
    log.error('Budget save error:', err.message);
    const errText = user.lang === 'id'
      ? '❌ Gagal menyimpan budget. Pastikan spreadsheet bisa diakses dan kategori sudah diinisialisasi.'
      : '❌ Failed to save budget. Make sure the spreadsheet is accessible.';
    await bot.sendMessage(chatId, errText);
    session.setState(userId, STATES.IDLE);
  }
}

/**
 * Handle hapus budget satu kategori
 */
async function handleBudgetClear(bot, callbackQuery, categoryName) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const user = userStore.getUser(userId);

  try {
    await saveToBudgetStoreAndSheets(userId, categoryName, '');
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: user.lang === 'id' ? `✅ Budget ${categoryName} dihapus` : `✅ Budget for ${categoryName} cleared`,
    });
    session.setState(userId, STATES.IDLE);
    // Kembali ke menu budget
    await showBudgetMenu(bot, chatId, userId);
  } catch (err) {
    log.error('Budget clear error:', err.message);
    await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Gagal hapus budget' });
  }
}

module.exports = {
  showBudgetMenu,
  handleBudgetCategorySelect,
  handleBudgetAmount,
  handleBudgetClear,
};
