/**
 * CuanTrack Web Dashboard Server
 * API Backend serving the dashboard and synchronization status
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const userStore = require('./userStore');
const sheets = require('./sheets');
const gemini = require('./gemini');
const { createLogger } = require('./logger');

const log = createLogger('DashboardServer');
const router = express.Router();

const TRANSACTIONS_FILE_PREFIX = 'txs_';

// Ensure data folder exists
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Helper to get local transaction fallback file path
 */
function getLocalTxsPath(userId) {
  return path.join(DATA_DIR, `${TRANSACTIONS_FILE_PREFIX}${userId}.json`);
}

/**
 * Helper to read local transactions
 */
function readLocalTxs(userId) {
  const filePath = getLocalTxsPath(userId);
  if (!fs.existsSync(filePath)) {
    // Return sample transactions if empty to populate the UI beautifully on startup
    return getSampleTransactions();
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Helper to write local transactions
 */
function writeLocalTxs(userId, txs) {
  const filePath = getLocalTxsPath(userId);
  fs.writeFileSync(filePath, JSON.stringify(txs, null, 2), 'utf8');
}

/**
 * Generate default highly-polished sample transactions
 */
function getSampleTransactions() {
  const now = new Date();
  const formatOffsetDate = (daysAgo) => {
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    const dd = String(d.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const yyyy = d.getFullYear();
    return `${dd} ${months[d.getMonth()]} ${String(yyyy).slice(-2)}`;
  };

  return [
    {
      date: formatOffsetDate(0),
      name: "Makan Siang Nasi Padang",
      amount: 25000,
      cashflow: "Spending",
      category: "Makan & Minum",
      dari: "Cash",
      ke: "",
      type: "expense"
    },
    {
      date: formatOffsetDate(1),
      name: "Kopi Susu Senja",
      amount: 35000,
      cashflow: "Spending",
      category: "Makan & Minum",
      dari: "GoPay",
      ke: "",
      type: "expense"
    },
    {
      date: formatOffsetDate(2),
      name: "Gojek ke Kantor",
      amount: 18000,
      cashflow: "Spending",
      category: "Transportasi",
      dari: "GoPay",
      ke: "",
      type: "expense"
    },
    {
      date: formatOffsetDate(3),
      name: "Isi GoPay dari BCA",
      amount: 500000,
      cashflow: "Transfer",
      category: "Transfer",
      dari: "Bank BCA",
      ke: "GoPay",
      type: "transfer"
    },
    {
      date: formatOffsetDate(5),
      name: "Netflix Premium",
      amount: 186000,
      cashflow: "Bills",
      category: "Tagihan",
      dari: "Bank BCA",
      ke: "",
      type: "bills"
    },
    {
      date: formatOffsetDate(10),
      name: "Freelance Landing Page",
      amount: 2500000,
      cashflow: "Income",
      category: "Freelance",
      dari: "",
      ke: "Bank BCA",
      type: "income"
    },
    {
      date: formatOffsetDate(14),
      name: "Gaji Bulanan",
      amount: 15000000,
      cashflow: "Income",
      category: "Gaji",
      dari: "",
      ke: "Bank BCA",
      type: "income"
    }
  ];
}

/**
 * Ensure a default user exists for immediate, out-of-the-box demoing
 */
function getOrCreateDefaultDemoUser() {
  const defaultId = '12345';
  let user = userStore.getUser(defaultId);
  if (!user) {
    user = userStore.createUser(defaultId, {
      name: 'CuanTrack Demo User',
      username: 'cuantrack_demo',
      lang: 'id'
    });
    // Add default accounts
    user.accounts = [
      { name: 'Bank BCA', emoji: '🏦', type: 'bank', initialBalance: 12500000, balance: 12500000 },
      { name: 'GoPay', emoji: '📱', type: 'wallet', initialBalance: 850000, balance: 850000 },
      { name: 'Cash', emoji: '💵', type: 'cash', initialBalance: 350000, balance: 350000 }
    ];
    // Add default spending categories
    user.spendingCategories = [
      { name: 'Makan & Minum', emoji: '🍔' },
      { name: 'Transportasi', emoji: '🚗' },
      { name: 'Belanja', emoji: '🛍️' },
      { name: 'Hiburan', emoji: '🎬' },
      { name: 'Tagihan', emoji: '📄' }
    ];
    // Add default income sources
    user.incomeSources = [
      { name: 'Gaji', emoji: '💰', active: true },
      { name: 'Freelance', emoji: '💻', active: true },
      { name: 'Investasi', emoji: '📈', active: true }
    ];
    // Add default bills
    user.bills = [
      { name: 'Netflix', emoji: '🎬', amount: 186000, dueDay: 10, account: 'Bank BCA', active: true, paidThisMonth: true, lastPaidDate: new Date().toISOString() },
      { name: 'Spotify', emoji: '🎵', amount: 55000, dueDay: 15, account: 'GoPay', active: true, paidThisMonth: false, lastPaidDate: null },
      { name: 'Listrik', emoji: '⚡', amount: 250000, dueDay: 20, account: 'Bank BCA', active: true, paidThisMonth: false, lastPaidDate: null }
    ];
    // Add default saving goals and metadata
    user.savingGoals = [
      { name: 'Beli Laptop', target: 15000000, saved: 8000000, deadline: '2026-12-31' },
      { name: 'Dana Darurat', target: 20000000, saved: 12000000, deadline: '2026-09-30' }
    ];
    user.debts = [
      { name: 'Hutang Toko Kelontong', amount: 150000, remaining: 50000, dueDate: '2026-08-01' }
    ];
    user.receivables = [
      { name: 'Pinjaman Budi', amount: 300000, remaining: 200000, dueDate: '2026-07-25' }
    ];
    user.setupComplete = true;
    userStore.saveUser(defaultId, user);

    // Save initial sample transactions
    const txs = getSampleTransactions();
    writeLocalTxs(defaultId, txs);
  }
  return user;
}

// Ensure demo user is seeded on file load
getOrCreateDefaultDemoUser();

// =============================================
// API ROUTES
// =============================================

/**
 * GET /api/status - Get integration status
 */
router.get('/status', (req, res) => {
  res.json({
    telegramBotOnline: !!process.env.TELEGRAM_BOT_TOKEN,
    googleSheetsConnected: !!process.env.GOOGLE_CREDENTIALS_PATH,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    availableUserIds: userStore.getAllUserIds()
  });
});

/**
 * GET /api/users - Get all users list
 */
router.get('/users', (req, res) => {
  try {
    const ids = userStore.getAllUserIds();
    const list = ids.map(id => {
      const u = userStore.getUser(id);
      return {
        userId: id,
        name: u ? u.name : `User ${id}`,
        username: u ? u.username : '',
        lang: u ? u.lang : 'id'
      };
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/user/:userId - Retrieve user profile
 */
router.get('/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    let user = userStore.getUser(userId);
    if (!user) {
      // Return default seeded user if not found
      user = userStore.getUser('12345');
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/user/:userId - Update/Create user profile
 */
router.post('/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;
    let user = userStore.getUser(userId);

    if (!user) {
      user = userStore.createUser(userId, {
        name: updates.name || `User ${userId}`,
        username: updates.username || '',
        lang: updates.lang || 'id'
      });
    }

    const updated = userStore.updateUser(userId, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/transactions/:userId - Fetch all transactions
 */
router.get('/transactions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = userStore.getUser(userId) || userStore.getUser('12345');

    // Attempt to pull from Google Sheets if configured
    if (user && user.spreadsheetId && process.env.GOOGLE_CREDENTIALS_PATH) {
      try {
        log.info(`Fetching transactions from Google Sheet for user ${userId}...`);
        const sheetTxs = await sheets.getTransactions(user.spreadsheetId);
        if (sheetTxs && sheetTxs.length > 0) {
          // Sync to local fallback cache
          writeLocalTxs(userId, sheetTxs);
          return res.json(sheetTxs);
        }
      } catch (err) {
        log.warn(`Google Sheet fetch failed: ${err.message}. Falling back to local cache.`);
      }
    }

    // Otherwise, pull from local fallback storage
    const localTxs = readLocalTxs(userId);
    res.json(localTxs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/transactions/:userId - Create a new transaction
 */
router.post('/transactions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = userStore.getUser(userId) || userStore.getUser('12345');
    const tx = req.body; // { name, amount, cashflow, category, dari, ke, date }

    if (!tx.name || !tx.amount || !tx.cashflow) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    // Normalize amount
    const amt = parseFloat(tx.amount) || 0;
    const type = tx.type || (tx.cashflow.toLowerCase() === 'income' ? 'income' : 'expense');

    // Build standard record date format "DD Mon YY"
    const now = tx.date ? new Date(tx.date) : new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const yyyy = now.getFullYear();
    const dateStr = `${dd} ${months[now.getMonth()]} ${String(yyyy).slice(-2)}`;

    const newTx = {
      date: dateStr,
      name: tx.name,
      amount: amt,
      cashflow: tx.cashflow,
      category: tx.category || '',
      dari: tx.dari || '',
      ke: tx.ke || '',
      type: type
    };

    // 1. Save to local fallback transactions
    const localTxs = readLocalTxs(userId);
    localTxs.unshift(newTx); // Add to the top
    writeLocalTxs(userId, localTxs);

    // 2. Adjust local account balances in userStore
    if (type === 'income' && tx.ke) {
      userStore.updateAccountBalance(userId, tx.ke, amt);
    } else if (type === 'expense' && tx.dari) {
      userStore.updateAccountBalance(userId, tx.dari, -amt);
    } else if (type === 'transfer' && tx.dari && tx.ke) {
      userStore.updateAccountBalance(userId, tx.dari, -amt);
      userStore.updateAccountBalance(userId, tx.ke, amt);
    } else if (type === 'bills' && tx.dari) {
      userStore.updateAccountBalance(userId, tx.dari, -amt);
    }

    // 3. Sync to Google Sheets if configured
    if (user && user.spreadsheetId && process.env.GOOGLE_CREDENTIALS_PATH) {
      try {
        log.info(`Syncing transaction to Google Sheet...`);
        await sheets.addTransaction(user.spreadsheetId, {
          ...newTx,
          _userData: user
        });
      } catch (err) {
        log.warn(`Google Sheet sync failed: ${err.message}. Saved locally only.`);
      }
    }

    res.json({ success: true, transaction: newTx, updatedUser: userStore.getUser(userId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/transactions/:userId/:index - Delete transaction by array index
 */
router.delete('/transactions/:userId/:index', (req, res) => {
  try {
    const userId = req.params.userId;
    const index = parseInt(req.params.index);
    const localTxs = readLocalTxs(userId);

    if (isNaN(index) || index < 0 || index >= localTxs.length) {
      return res.status(400).json({ error: 'Invalid transaction index' });
    }

    const removed = localTxs.splice(index, 1)[0];
    writeLocalTxs(userId, localTxs);

    // Reverse balances update locally
    const amt = removed.amount;
    if (removed.type === 'income' && removed.ke) {
      userStore.updateAccountBalance(userId, removed.ke, -amt);
    } else if (removed.type === 'expense' && removed.dari) {
      userStore.updateAccountBalance(userId, removed.dari, amt);
    } else if (removed.type === 'transfer' && removed.dari && removed.ke) {
      userStore.updateAccountBalance(userId, removed.dari, amt);
      userStore.updateAccountBalance(userId, removed.ke, -amt);
    } else if (removed.type === 'bills' && removed.dari) {
      userStore.updateAccountBalance(userId, removed.dari, amt);
    }

    res.json({ success: true, removed, updatedUser: userStore.getUser(userId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ai-insight/:userId - Generate AI Insight using Gemini or smart fallback
 */
router.post('/ai-insight/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = userStore.getUser(userId) || userStore.getUser('12345');
    const txs = readLocalTxs(userId);

    if (!process.env.GEMINI_API_KEY) {
      // Smart offline rules fallback
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const remaining = totalIncome - totalExpense;
      const pct = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 100;

      const tips = user.lang === 'id' 
        ? [
            `Pengeluaran kamu bulan ini Rp ${Math.round(totalExpense).toLocaleString('id-ID')} (${pct}% dari total pemasukan).`,
            remaining < 0 
              ? "⚠️ Waduh! Kamu mengalami defisit keuangan bulan ini. Coba kurangi pengeluaran hiburan dan belanja barang sekunder." 
              : "✅ Bagus! Aliran kas kamu positif. Kamu menyisihkan sisa uang sebesar Rp " + Math.round(remaining).toLocaleString('id-ID') + " untuk tabungan.",
            "💡 Tips Hemat: Batasi pengeluaran kategori Makan & Minum di akhir pekan untuk menjaga anggaran tetap stabil."
          ].join('\n\n')
        : [
            `Your spending this month is Rp ${Math.round(totalExpense).toLocaleString('id-ID')} (${pct}% of total income).`,
            remaining < 0 
              ? "⚠️ Warning! You are running a financial deficit this month. Try reducing leisure and discretionary shopping expenses." 
              : "✅ Great! You have a positive cash flow. You saved Rp " + Math.round(remaining).toLocaleString('id-ID') + " for your savings goals.",
            "💡 Saving Tip: Cap your Food & Beverage spending on weekends to stay within budget."
          ].join('\n\n');

      return res.json({ insight: tips });
    }

    // Call Gemini
    const insight = await gemini.generateInsight(txs, user.accounts || [], user.bills || [], user.lang || 'id');
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/chat/:userId - Chat with Gemini AI Financial Assistant
 */
router.post('/chat/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = userStore.getUser(userId) || userStore.getUser('12345');
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const resp = user.lang === 'id'
        ? `Halo! Saya asisten CuanTrack AI. Silakan tambahkan GEMINI_API_KEY di pengaturan / file .env untuk mengaktifkan obrolan asisten keuangan cerdas yang didukung AI secara penuh.`
        : `Hello! I am your CuanTrack AI assistant. Please configure your GEMINI_API_KEY in settings or the .env file to enable fully intelligent financial assistant features.`;
      return res.json({ reply: resp });
    }

    // Call Gemini API parsing or chat fallback
    const result = await gemini.parseTransaction(message, user, user.lang || 'id');
    if (result && result.isTransaction) {
      // Store transaction parsed by AI automatically!
      const tx = result.transaction;
      const amt = parseFloat(tx.amount) || 0;
      const type = tx.type || (tx.cashflow.toLowerCase() === 'income' ? 'income' : 'expense');
      
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const dateStr = `${dd} ${months[now.getMonth()]} ${String(now.getFullYear()).slice(-2)}`;

      const newTx = {
        date: dateStr,
        name: tx.name,
        amount: amt,
        cashflow: tx.cashflow,
        category: tx.category || '',
        dari: tx.dari || '',
        ke: tx.ke || '',
        type: type
      };

      const localTxs = readLocalTxs(userId);
      localTxs.unshift(newTx);
      writeLocalTxs(userId, localTxs);

      // Adjust balances
      if (type === 'income' && tx.ke) {
        userStore.updateAccountBalance(userId, tx.ke, amt);
      } else if (type === 'expense' && tx.dari) {
        userStore.updateAccountBalance(userId, tx.dari, -amt);
      }

      const successMsg = user.lang === 'id'
        ? `✅ Berhasil mencatat via AI!\n\n📝 *${newTx.name}*\n💰 Jumlah: Rp ${Math.round(amt).toLocaleString('id-ID')}\n🏷️ Kategori: ${newTx.category}\n👛 Akun: ${newTx.dari || newTx.ke}`
        : `✅ AI successfully recorded your transaction!\n\n📝 *${newTx.name}*\n💰 Amount: Rp ${Math.round(amt).toLocaleString('id-ID')}\n🏷️ Category: ${newTx.category}\n👛 Account: ${newTx.dari || newTx.ke}`;

      return res.json({ reply: successMsg, transactionAdded: newTx });
    } else {
      const reply = result ? result.response : (user.lang === 'id' ? 'Maaf, saya tidak mengerti maksud Anda.' : 'Sorry, I did not understand that.');
      return res.json({ reply });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve public static dashboard folder
router.use('/', express.static(path.join(__dirname, '..', 'public')));

module.exports = {
  router,
  getOrCreateDefaultDemoUser
};
