const fs = require('fs');
const path = require('path');
const reportEngine = require('../services/reportEngine');
const transactionStore = require('../services/transactionStore');
const budgetStore = require('../services/budgetStore');

const userId = 'user_report_test_01';
const period = '2026-07';

// Clean up data before test
const txDir = path.join(__dirname, '..', 'data', 'transactions', userId);
const bgtFile = path.join(__dirname, '..', 'data', 'budgets', `${userId}.json`);

if (fs.existsSync(bgtFile)) fs.unlinkSync(bgtFile);
if (fs.existsSync(txDir)) {
    fs.readdirSync(txDir).forEach(f => fs.unlinkSync(path.join(txDir, f)));
}

let passCount = 0;
let failCount = 0;

function assert(name, condition) {
    if (condition) {
        console.log(`✓ ${name}`);
        passCount++;
    } else {
        console.error(`✗ ${name}`);
        failCount++;
    }
}

try {
    console.log('--- Setup Data for ReportEngine Tests ---');
    
    // Seed Transactions
    transactionStore.addTransaction(userId, { cashflow: 'income', category: 'Salary', wallet: 'Bank', amount: 10000000, description: 'Gaji', transactionDate: '2026-07-01T10:00:00.000Z' });
    transactionStore.addTransaction(userId, { cashflow: 'expense', category: 'Food', wallet: 'Cash', amount: 1500000, description: 'Makan', transactionDate: '2026-07-05T10:00:00.000Z' });
    transactionStore.addTransaction(userId, { cashflow: 'expense', category: 'Transport', wallet: 'Bank', amount: 500000, description: 'Bensin', transactionDate: '2026-07-10T10:00:00.000Z' });
    
    // Seed Budgets
    budgetStore.setBudget(userId, { period: '2026-07', category: 'Food', amount: 2000000 });
    budgetStore.setBudget(userId, { period: '2026-07', category: 'Transport', amount: 400000 });

    console.log('--- Running ReportEngine Tests ---\n');

    // 1. getMonthlySummary
    const monthly = reportEngine.getMonthlySummary(userId, period);
    assert('getMonthlySummary', monthly.totalIncome === 10000000 && monthly.totalExpense === 2000000 && monthly.netIncome === 8000000);
    
    // 2. getCashflowSummary
    const cashflow = reportEngine.getCashflowSummary(userId, period);
    assert('getCashflowSummary', cashflow.totalIncome === 10000000);
    
    // 3. getCategorySummary
    const categoryExpense = reportEngine.getCategorySummary(userId, period, 'expense');
    assert('getCategorySummary', categoryExpense.length === 2 && categoryExpense[0].category === 'Food' && categoryExpense[0].amount === 1500000);
    
    // 4. getBudgetSummary
    const budgetSummary = reportEngine.getBudgetSummary(userId, period);
    const transportBgt = budgetSummary.find(b => b.category === 'Transport');
    assert('getBudgetSummary', budgetSummary.length === 2 && transportBgt.status === 'overbudget' && transportBgt.remainingAmount === -100000);
    
    // 5. getWalletSummary
    const walletSummary = reportEngine.getWalletSummary(userId);
    const bankWallet = walletSummary.find(w => w.wallet === 'Bank');
    assert('getWalletSummary', bankWallet.balance === 9500000);
    
    // 6. getTopSpending
    const topSpending = reportEngine.getTopSpending(userId, period, 1);
    assert('getTopSpending', topSpending.length === 1 && topSpending[0].category === 'Food');
    
    // 7. getTopIncome
    const topIncome = reportEngine.getTopIncome(userId, period, 1);
    assert('getTopIncome', topIncome.length === 1 && topIncome[0].category === 'Salary');
    
    // 8. getSavingRate
    const savingRate = reportEngine.getSavingRate(userId, period);
    assert('getSavingRate', savingRate.savings === 8000000 && savingRate.savingRate === 80);
    
    // 9. getBalance
    const balance = reportEngine.getBalance(userId);
    assert('getBalance', balance === 8000000);
    
    // 10. getDashboardOverview
    const dashboard = reportEngine.getDashboardOverview(userId, period);
    assert('getDashboardOverview', dashboard.overallBalance === 8000000 && dashboard.monthlySummary.netIncome === 8000000);

    console.log(`\nTests completed: ${passCount} passed, ${failCount} failed.`);
} catch (e) {
    console.error('Test Failed:', e);
}
