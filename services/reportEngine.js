const transactionStore = require('./transactionStore');
const budgetStore = require('./budgetStore');

/**
 * ReportEngine
 * Mesin kalkulasi bisnis CuanTrack
 * Hanya bertugas membaca dan mengagregasi data dari Storage Layer.
 */

/**
 * Mendapatkan transaksi pada bulan tertentu.
 * @param {string} userId
 * @param {string} period - YYYY-MM
 * @private
 */
function getTransactionsForPeriod(userId, period) {
    const [year, month] = period.split('-');
    return transactionStore.getTransactionsByMonth(userId, parseInt(year, 10), parseInt(month, 10));
}

/**
 * Mendapatkan ringkasan bulanan (Income, Expense, Net Income).
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @returns {object}
 */
function getMonthlySummary(userId, period) {
    const txs = getTransactionsForPeriod(userId, period);
    let totalIncome = 0;
    let totalExpense = 0;
    
    txs.forEach(tx => {
        if (tx.cashflow === 'income') totalIncome += tx.amount;
        if (tx.cashflow === 'expense') totalExpense += tx.amount;
    });
    
    return {
        period,
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense
    };
}

/**
 * Mendapatkan ringkasan arus kas (sama dengan bulanan).
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @returns {object}
 */
function getCashflowSummary(userId, period) {
    return getMonthlySummary(userId, period);
}

/**
 * Mendapatkan ringkasan pengeluaran/pemasukan per kategori.
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @param {string|null} cashflow - 'income' atau 'expense'
 * @returns {Array<object>}
 */
function getCategorySummary(userId, period, cashflow = null) {
    const txs = getTransactionsForPeriod(userId, period);
    const summary = {};
    
    txs.forEach(tx => {
        if (cashflow && tx.cashflow !== cashflow) return;
        
        if (!summary[tx.category]) {
            summary[tx.category] = { amount: 0, count: 0, cashflow: tx.cashflow };
        }
        summary[tx.category].amount += tx.amount;
        summary[tx.category].count += 1;
    });
    
    return Object.entries(summary)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Mendapatkan ringkasan budget vs actual spending.
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @returns {Array<object>}
 */
function getBudgetSummary(userId, period) {
    const budgets = budgetStore.getBudgetsByPeriod(userId, period);
    const expensesByCategory = getCategorySummary(userId, period, 'expense');
    
    const expenseMap = {};
    expensesByCategory.forEach(e => {
        expenseMap[e.category] = e.amount;
    });
    
    return budgets.map(b => {
        const spent = expenseMap[b.category] || 0;
        const remaining = b.amount - spent;
        const usagePercentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
        
        return {
            category: b.category,
            budgetAmount: b.amount,
            spentAmount: spent,
            remainingAmount: remaining,
            usagePercentage: parseFloat(usagePercentage.toFixed(2)),
            status: remaining >= 0 ? 'safe' : 'overbudget'
        };
    }).sort((a, b) => b.usagePercentage - a.usagePercentage);
}

/**
 * Mendapatkan saldo setiap dompet (seluruh periode).
 * @param {string} userId 
 * @returns {Array<object>}
 */
function getWalletSummary(userId) {
    const allTxs = transactionStore.searchTransactions(userId, {});
    const summary = {};
    
    allTxs.forEach(tx => {
        if (!summary[tx.wallet]) {
            summary[tx.wallet] = 0;
        }
        if (tx.cashflow === 'income') summary[tx.wallet] += tx.amount;
        if (tx.cashflow === 'expense') summary[tx.wallet] -= tx.amount;
    });
    
    return Object.entries(summary)
        .map(([wallet, balance]) => ({ wallet, balance }))
        .sort((a, b) => b.balance - a.balance);
}

/**
 * Mendapatkan pengeluaran terbesar di bulan tertentu.
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @param {number} limit 
 * @returns {Array<object>}
 */
function getTopSpending(userId, period, limit = 5) {
    const txs = getTransactionsForPeriod(userId, period).filter(tx => tx.cashflow === 'expense');
    return txs.sort((a, b) => b.amount - a.amount).slice(0, limit);
}

/**
 * Mendapatkan pemasukan terbesar di bulan tertentu.
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @param {number} limit 
 * @returns {Array<object>}
 */
function getTopIncome(userId, period, limit = 5) {
    const txs = getTransactionsForPeriod(userId, period).filter(tx => tx.cashflow === 'income');
    return txs.sort((a, b) => b.amount - a.amount).slice(0, limit);
}

/**
 * Menghitung persentase tabungan dari pemasukan.
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @returns {object}
 */
function getSavingRate(userId, period) {
    const summary = getMonthlySummary(userId, period);
    if (summary.totalIncome === 0) return { savings: 0, savingRate: 0 };
    
    const savings = summary.totalIncome - summary.totalExpense;
    const rate = (savings / summary.totalIncome) * 100;
    
    return {
        savings,
        savingRate: parseFloat(rate.toFixed(2))
    };
}

/**
 * Mendapatkan saldo keseluruhan user.
 * @param {string} userId 
 * @returns {number}
 */
function getBalance(userId) {
    const allTxs = transactionStore.searchTransactions(userId, {});
    let balance = 0;
    
    allTxs.forEach(tx => {
        if (tx.cashflow === 'income') balance += tx.amount;
        if (tx.cashflow === 'expense') balance -= tx.amount;
    });
    
    return balance;
}

/**
 * Mendapatkan data overview untuk dirender di dashboard.
 * @param {string} userId 
 * @param {string} period - YYYY-MM
 * @returns {object}
 */
function getDashboardOverview(userId, period) {
    return {
        overallBalance: getBalance(userId),
        monthlySummary: getMonthlySummary(userId, period),
        savingRate: getSavingRate(userId, period),
        budgetSummary: getBudgetSummary(userId, period),
        topSpending: getTopSpending(userId, period, 5),
        categorySummary: getCategorySummary(userId, period, 'expense'),
        walletSummary: getWalletSummary(userId),
        recentTransactions: getTransactionsForPeriod(userId, period)
    };
}

module.exports = {
    getMonthlySummary,
    getCashflowSummary,
    getCategorySummary,
    getBudgetSummary,
    getWalletSummary,
    getTopSpending,
    getTopIncome,
    getSavingRate,
    getBalance,
    getDashboardOverview
};
