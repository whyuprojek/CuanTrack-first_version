/**
 * CuanTrack Web Dashboard Server
 * API Backend serving the dashboard and synchronization status
 */

const express = require('express');
const path = require('path');
const userStore = require('./userStore');
const sheets = require('./sheets');
const gemini = require('./gemini');
const { createLogger } = require('./logger');

const log = createLogger('DashboardServer');
const router = express.Router();

// =============================================
// API ROUTES
// =============================================

/**
 * GET /api/status - Get integration status
 */
router.get('/status', (req, res) => {
  res.json({
    telegramBotOnline: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token_here'),
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
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const reportEngine = require('./reportEngine');

/**
 * GET /api/summary/:userId - Fetch summary
 */
router.get('/summary/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = userStore.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const date = new Date();
    const defaultPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const period = req.query.period || defaultPeriod;

    const overview = reportEngine.getDashboardOverview(userId, period);
    res.json(overview);

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
    const user = userStore.getUser(userId);

    if (!user) {
      return res.json([]);
    }

    // Attempt to pull from Google Sheets if configured
    if (user.spreadsheetId && process.env.GOOGLE_CREDENTIALS_PATH) {
      try {
        log.info(`Fetching transactions from Google Sheet for user ${userId}...`);
        const sheetTxs = await sheets.getTransactions(user.spreadsheetId);
        if (sheetTxs && sheetTxs.length > 0) {
          return res.json(sheetTxs);
        }
      } catch (err) {
        log.warn(`Google Sheet fetch failed: ${err.message}.`);
      }
    }

    // Otherwise, return empty as dashboard shouldn't use fallback storage
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve public static dashboard folder
router.use('/', express.static(path.join(__dirname, '..', 'public')));

module.exports = {
  router
};
