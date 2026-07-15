/**
 * Report Handler — Laporan keuangan, saldo, tagihan, AI insight
 * MoneyFlowID Bot
 */

const userStore = require('../services/userStore');
const sheets = require('../services/sheets');
const { getServiceForUser } = require('../services/aiRouter');
const { createLogger } = require('../services/logger');
const session = require('../middleware/session');
const { STATES } = require('../middleware/session');

const log = createLogger('Report');
const {
  reportKeyboard,
  billsActionKeyboard,
  mainMenuKeyboard,
  backToMenuKeyboard,
  aiConfirmKeyboard,
} = require('./menu');
const L = require('../locales');

// =============================================
// REPORT MENU
// =============================================

async function showReportMenu(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  if (!user) return;
  const t = L(user.lang);

  session.setState(userId, STATES.REPORT_MENU);
  await bot.sendMessage(chatId, t.reportTitle, {
    parse_mode: 'Markdown',
    reply_markup: reportKeyboard(user.lang),
  });
}

// =============================================
// MONTHLY REPORT
// =============================================

async function showMonthlyReport(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  const loadMsg = await bot.sendMessage(chatId, '📊 Memuat laporan...', { parse_mode: 'Markdown' });

  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const transactions = await sheets.getTransactions(user.spreadsheetId, month, year);

    if (!transactions || transactions.length === 0) {
      await bot.editMessageText(t.noTransactions, {
        chat_id: chatId,
        message_id: loadMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard(user.lang),
      });
      return;
    }

    const totalIncome          = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const totalExpense         = transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const totalBills           = transactions.filter(tx => tx.type === 'bills').reduce((s, tx) => s + tx.amount, 0);
    const totalSavings         = transactions.filter(tx => tx.type === 'savings').reduce((s, tx) => s + tx.amount, 0);
    const totalUtangBaru       = transactions.filter(tx => tx.type === 'utang').reduce((s, tx) => s + tx.amount, 0);
    const totalBayarUtang      = transactions.filter(tx => tx.type === 'pelunasan_utang').reduce((s, tx) => s + tx.amount, 0);
    const totalPiutangBaru     = transactions.filter(tx => tx.type === 'piutang').reduce((s, tx) => s + tx.amount, 0);
    const totalTerimapiutang   = transactions.filter(tx => tx.type === 'pelunasan_piutang').reduce((s, tx) => s + tx.amount, 0);

    // Sisa uang = Income - Spending - Bills - Savings - BayarUtang - PiutangKeluar + PiutangMasuk
    const totalOut = totalExpense + totalBills + totalSavings + totalBayarUtang + totalPiutangBaru;
    const totalIn  = totalIncome + totalUtangBaru + totalTerimapiutang;
    const leftover = totalIn - totalOut;
    const savingsRate = totalIncome > 0 ? Math.round(((totalSavings) / totalIncome) * 100) : 0;

    const monthNames = {
      id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    };
    const monthName = monthNames[user.lang][month - 1];

    const fmt = (n) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
    const isId = user.lang === 'id';

    // ── Bangun teks laporan ──
    let reportText = t.monthlyReport(monthName, year, totalIncome, totalExpense, leftover, savingsRate);

    // Baris tambahan di bawah utama
    if (totalBills > 0)
      reportText += `\n💳 ${isId ? 'Tagihan (Bills)' : 'Bills paid'}: *${fmt(totalBills)}*`;
    if (totalSavings > 0)
      reportText += `\n🏦 ${isId ? 'Tabungan/Investasi' : 'Savings/Investment'}: *${fmt(totalSavings)}*`;

    // ── Seksi Utang ──
    const hasUtang = totalUtangBaru > 0 || totalBayarUtang > 0;
    if (hasUtang) {
      reportText += `\n\n*📋 ${isId ? 'Cicilan / Utang' : 'Debt'}*`;
      if (totalUtangBaru > 0)
        reportText += `\n↩️ ${isId ? 'Utang Baru' : 'New Debt'}: *${fmt(totalUtangBaru)}*`;
      if (totalBayarUtang > 0)
        reportText += `\n✅ ${isId ? 'Dibayar Bulan Ini' : 'Paid this month'}: *${fmt(totalBayarUtang)}*`;
      const sisaUtang = totalUtangBaru - totalBayarUtang;
      if (sisaUtang !== 0)
        reportText += `\n📌 ${isId ? 'Sisa Utang (bulan ini)' : 'Remaining debt'}: *${fmt(Math.abs(sisaUtang))}*`;
    }

    // ── Seksi Piutang ──
    const hasPiutang = totalPiutangBaru > 0 || totalTerimapiutang > 0;
    if (hasPiutang) {
      reportText += `\n\n*📋 ${isId ? 'Piutang' : 'Receivables'}*`;
      if (totalPiutangBaru > 0)
        reportText += `\n💸 ${isId ? 'Dipinjamkan' : 'Lent out'}: *${fmt(totalPiutangBaru)}*`;
      if (totalTerimapiutang > 0)
        reportText += `\n💰 ${isId ? 'Diterima Kembali' : 'Received back'}: *${fmt(totalTerimapiutang)}*`;
      const sisaPiutang = totalPiutangBaru - totalTerimapiutang;
      if (sisaPiutang > 0)
        reportText += `\n📌 ${isId ? 'Belum kembali' : 'Outstanding'}: *${fmt(sisaPiutang)}*`;
    }

    // ── 5 Transaksi Terakhir ──
    const recent = transactions.filter(tx => tx.type !== 'transfer').slice(-5).reverse();
    let recentText = isId ? '\n\n*5 Transaksi Terakhir:*\n' : '\n\n*Last 5 Transactions:*\n';
    const txIcon = {
      income: '💰', expense: '💸', bills: '💳', savings: '🏦',
      utang: '↩️', pelunasan_utang: '✅', piutang: '💸', pelunasan_piutang: '💰', other: '📝',
    };
    recent.forEach((tx) => {
      const icon = txIcon[tx.type] || '📝';
      const label = tx.name || tx.category || tx.cashflow;
      recentText += `${icon} ${tx.date} — ${label}: ${fmt(tx.amount)}\n`;
    });

    await bot.editMessageText(reportText + recentText, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
      reply_markup: reportKeyboard(user.lang),
    });

  } catch (err) {
    log.error('Monthly report error:', err.message);
    await bot.editMessageText(t.processingError, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
    });
  }
}

// =============================================
// CATEGORY REPORT
// =============================================

async function showCategoryReport(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  const loadMsg = await bot.sendMessage(chatId, '📊 Memuat laporan kategori...', { parse_mode: 'Markdown' });

  try {
    const now = new Date();
    const transactions = await sheets.getTransactions(user.spreadsheetId, now.getMonth() + 1, now.getFullYear());

    if (!transactions || transactions.length === 0) {
      await bot.editMessageText(t.noTransactions, {
        chat_id: chatId,
        message_id: loadMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard(user.lang),
      });
      return;
    }

    // Group by category
    const byCategory = {};
    transactions.filter((tx) => tx.type === 'expense').forEach((tx) => {
      if (!byCategory[tx.category]) byCategory[tx.category] = 0;
      byCategory[tx.category] += tx.amount;
    });

    const sorted = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => {
        const catData = (user.spendingCategories || []).find(
          (c) => c.name.toLowerCase() === cat.toLowerCase()
        );
        return { category: cat, total, emoji: catData ? catData.emoji : '📦' };
      });

    if (sorted.length === 0) {
      const noExpenseText = user.lang === 'id' ? '📭 Belum ada pengeluaran bulan ini.' : '📭 No expenses this month.';
      await bot.editMessageText(noExpenseText, {
        chat_id: chatId,
        message_id: loadMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: reportKeyboard(user.lang),
      });
      return;
    }

    const reportText = t.categoryReport(sorted);

    await bot.editMessageText(reportText, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
      reply_markup: reportKeyboard(user.lang),
    });

  } catch (err) {
    log.error('Category report error:', err.message);
    await bot.editMessageText(t.processingError, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
    });
  }
}

// =============================================
// BALANCE
// =============================================

async function showBalance(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  if (!user.accounts || user.accounts.length === 0) {
    await bot.sendMessage(chatId, t.noAccounts, {
      parse_mode: 'Markdown',
      reply_markup: backToMenuKeyboard(user.lang),
    });
    return;
  }

  const reportText = t.balanceReport(user.accounts);
  await bot.sendMessage(chatId, reportText, {
    parse_mode: 'Markdown',
    reply_markup: backToMenuKeyboard(user.lang),
  });
}

// =============================================
// BILLS STATUS
// =============================================

async function showBillsStatus(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  if (!user.bills || user.bills.length === 0) {
    const noBillsText = user.lang === 'id'
      ? '📭 Belum ada tagihan yang ditambahkan.'
      : '📭 No bills added yet.';
    await bot.sendMessage(chatId, noBillsText, {
      parse_mode: 'Markdown',
      reply_markup: backToMenuKeyboard(user.lang),
    });
    return;
  }

  const now = new Date();
  const billsWithStatus = user.bills.map((bill) => ({
    ...bill,
    overdue: !bill.paidThisMonth && now.getDate() > bill.dueDay,
  }));

  const reportText = t.billsReport(billsWithStatus);
  await bot.sendMessage(chatId, reportText, {
    parse_mode: 'Markdown',
    reply_markup: billsActionKeyboard(billsWithStatus, user.lang),
  });
}

/**
 * Handle: tandai tagihan sudah dibayar / belum
 */
async function handleBillPayToggle(bot, callbackQuery, billName, isPay) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const msgId = callbackQuery.message.message_id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  if (isPay) {
    userStore.markBillPaid(userId, billName);
    await bot.answerCallbackQuery(callbackQuery.id, { text: t.billPaid(billName) });
  } else {
    // Unmark
    const updUser = userStore.getUser(userId);
    const bill = (updUser.bills || []).find((b) => b.name.toLowerCase() === billName.toLowerCase());
    if (bill) {
      bill.paidThisMonth = false;
      bill.lastPaidDate = null;
      userStore.saveUser(userId, updUser);
    }
    await bot.answerCallbackQuery(callbackQuery.id, { text: user.lang === 'id' ? '🔄 Status diperbarui' : '🔄 Status updated' });
  }

  const updatedUser = userStore.getUser(userId);
  const now = new Date();
  const billsWithStatus = updatedUser.bills.map((bill) => ({
    ...bill,
    overdue: !bill.paidThisMonth && now.getDate() > bill.dueDay,
  }));

  // Sync ke sheets (non-blocking)
  sheets.syncBillsToSheet(user.spreadsheetId, updatedUser.bills).catch(log.error);

  await bot.editMessageReplyMarkup(
    billsActionKeyboard(billsWithStatus, user.lang),
    { chat_id: chatId, message_id: msgId }
  );
}

// =============================================
// AI INSIGHT
// =============================================

async function showAiInsight(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  const loadMsg = await bot.sendMessage(chatId, t.aiProcessing, { parse_mode: 'Markdown' });

  try {
    const now = new Date();
    const transactions = await sheets.getTransactions(user.spreadsheetId, now.getMonth() + 1, now.getFullYear());

    const ai = getServiceForUser(user);
    const insight = await ai.generateInsight(
      transactions || [],
      user.accounts || [],
      user.bills || [],
      user.lang
    );

    await bot.editMessageText(`🤖 *AI Financial Insight*\n\n${insight}`, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
      reply_markup: backToMenuKeyboard(user.lang),
    });

  } catch (err) {
    log.error('AI insight error:', err.message);
    await bot.editMessageText(t.aiError, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
    });
  }
}

// =============================================
// AI CHAT
// =============================================

async function startAiChat(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  session.setState(userId, STATES.AI_CHAT);
  await bot.sendMessage(chatId, t.aiChatTitle, {
    parse_mode: 'Markdown',
    reply_markup: backToMenuKeyboard(user.lang),
  });
}

/**
 * Handle pesan AI chat (natural language, parsing + chat)
 */
async function handleAiMessage(bot, msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const user = userStore.getUser(userId);
  const t = L(user.lang);
  const text = msg.text.trim();

  // Tampilkan "sedang mengetik..."
  await bot.sendChatAction(chatId, 'typing');

  const userCtx = {
    accounts: user.accounts || [],
    spendingCategories: user.spendingCategories || [],
    incomeSources: user.incomeSources || [],
    bills: user.bills || [],
  };

  try {
    // Coba parse sebagai transaksi dulu
    const ai = getServiceForUser(user);
    const parsed = await ai.parseTransaction(text, userCtx, user.lang);

    if (parsed && parsed.isTransaction && parsed.confidence >= 0.6) {
      // Deteksi transaksi — minta konfirmasi
      session.setState(userId, STATES.AI_CONFIRM_TRANSACTION, { aiTransaction: parsed });

      const confirmText = t.aiTransactionDetected(parsed);
      await bot.sendMessage(chatId, confirmText, {
        parse_mode: 'Markdown',
        reply_markup: aiConfirmKeyboard(user.lang),
      });
    } else if (parsed && !parsed.isTransaction && parsed.response) {
      // Bukan transaksi — tampilkan respons AI langsung
      session.addToAiHistory(userId, 'user', text);
      session.addToAiHistory(userId, 'model', parsed.response);
      await bot.sendMessage(chatId, parsed.response, { parse_mode: 'Markdown' });
    } else {
      // Fallback ke chat biasa
      const sessionData = session.getSession(userId);
      const response = await ai.chat(text, sessionData.aiHistory || [], userCtx, user.lang);
      session.addToAiHistory(userId, 'user', text);
      session.addToAiHistory(userId, 'model', response);
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    }

  } catch (err) {
    log.error('AI chat error:', err.message);
    await bot.sendMessage(chatId, t.aiError, { parse_mode: 'Markdown' });
  }
}

// =============================================
// MONTHLY FINANCIAL SUMMARY
// =============================================

async function showMonthlySummary(bot, chatId, userId) {
  const user = userStore.getUser(userId);
  const t = L(user.lang);

  const loadMsg = await bot.sendMessage(chatId, user.lang === 'id' ? '📊 Membuat Monthly Financial Summary...' : '📊 Creating Monthly Financial Summary...', { parse_mode: 'Markdown' });

  try {
    await sheets.createMonthlySummarySheet(user.spreadsheetId, user);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${user.spreadsheetId}/edit#gid=`;
    const msg = user.lang === 'id'
      ? `✅ *Monthly Financial Summary* berhasil dibuat/diupdate!\n\n📊 [Buka Spreadsheet](${sheetUrl})\n\nSheet berisi:\n• Ringkasan bulanan (income, spending, bills, utang)\n• Breakdown spending per kategori\n• Saldo semua akun\n• Pie chart & bar chart`
      : `✅ *Monthly Financial Summary* created/updated!\n\n📊 [Open Spreadsheet](${sheetUrl})\n\nSheet contains:\n• Monthly statement (income, spending, bills, debt)\n• Spending breakdown by category\n• All account balances\n• Pie chart & bar chart`;

    await bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: loadMsg.message_id,
      parse_mode: 'Markdown',
      reply_markup: backToMenuKeyboard(user.lang),
    });
  } catch (err) {
    log.error('Monthly Summary error:', err.message);
    await bot.editMessageText(user.lang === 'id' ? '❌ Gagal membuat summary. Coba lagi.' : '❌ Failed to create summary. Try again.', {
      chat_id: chatId,
      message_id: loadMsg.message_id,
    });
  }
}

module.exports = {
  showReportMenu,
  showMonthlyReport,
  showCategoryReport,
  showBalance,
  showBillsStatus,
  handleBillPayToggle,
  showAiInsight,
  showMonthlySummary,
  startAiChat,
  handleAiMessage,
};
