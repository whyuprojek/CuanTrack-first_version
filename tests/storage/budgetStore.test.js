const fs = require('fs');
const path = require('path');
const store = require('../../services/budgetStore');

const userId = 'user_test_budget_99';
const fp = path.join(__dirname, '..', '..', 'data', 'budgets', `${userId}.json`);

// Clean up before test
if (fs.existsSync(fp)) {
  fs.unlinkSync(fp);
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
    console.log('--- Running BudgetStore V1 Tests ---\n');

    // 1. import module
    assert('import module', typeof store.setBudget === 'function' && typeof store.searchBudgets === 'function');

    // 2. create budget
    const bgt1 = store.setBudget(userId, { period: '2026-07', category: 'Food', amount: 1500000 });
    assert('create budget', bgt1.id.startsWith('bgt_') && bgt1.amount === 1500000 && bgt1.source === 'telegram');

    // 3. upsert budget
    const bgt1_upsert = store.setBudget(userId, { period: '2026-07', category: 'Food', amount: 2000000 });
    assert('upsert budget', bgt1_upsert.id === bgt1.id && bgt1_upsert.version === 2 && bgt1_upsert.amount === 2000000);

    // 4. update budget
    const bgt1_updated = store.updateBudget(userId, bgt1.id, { note: 'Groceries' });
    assert('update budget', bgt1_updated.note === 'Groceries' && bgt1_updated.version === 3);

    // 5. check file creation and metadata
    assert('file otomatis dibuat', fs.existsSync(fp));
    const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
    assert('metadata berubah', raw._meta.totalBudgets === 1 && raw._meta.activeBudgets === 1 && raw._meta.deletedBudgets === 0);

    // 6. delete budget
    const bgt1_deleted = store.deleteBudget(userId, bgt1.id);
    assert('delete budget', bgt1_deleted.status === 'deleted' && bgt1_deleted.deletedAt !== null && bgt1_deleted.version === 4);

    // 7. reject update deleted
    try {
        store.updateBudget(userId, bgt1.id, { amount: 3000000 });
        assert('reject update deleted', false); // should not reach
    } catch (e) {
        assert('reject update deleted', e.message.includes('Cannot update a deleted budget'));
    }

    // 8. count active & count deleted
    // Add new active budget to test counts properly
    store.setBudget(userId, { period: '2026-08', category: 'Transport', amount: 500000, source: 'api' });
    
    assert('count active', store.countBudgets(userId, { status: 'active' }) === 1);
    assert('count deleted', store.countBudgets(userId, { status: 'deleted' }) === 1);

    // 9. search category
    const searchResult = store.searchBudgets(userId, { category: 'Transport' });
    assert('search category', searchResult.length === 1 && searchResult[0].category === 'Transport' && searchResult[0].source === 'api');

    // 10. validasi period
    try {
        store.setBudget(userId, { period: '26-08', category: 'Test', amount: 100 });
        assert('validasi period', false);
    } catch (e) {
        assert('validasi period', e.message.includes('Invalid period format'));
    }

    // 11. validasi amount
    try {
        store.setBudget(userId, { period: '2026-08', category: 'Test', amount: -100 });
        assert('validasi amount', false);
    } catch (e) {
        assert('validasi amount', e.message.includes('Amount must be >= 0'));
    }
    
    // 12. Check full JSON metadata sync after all ops
    const finalRaw = JSON.parse(fs.readFileSync(fp, 'utf8'));
    assert('final metadata check', finalRaw._meta.totalBudgets === 2 && finalRaw._meta.activeBudgets === 1 && finalRaw._meta.deletedBudgets === 1);

    console.log(`\nTests completed: ${passCount} passed, ${failCount} failed.`);
} catch (err) {
    console.error('Test Execution Failed:', err);
}
