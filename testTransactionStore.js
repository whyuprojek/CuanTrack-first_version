const store = require('./services/transactionStore');
const userId = 'user_test_01';

console.log('1. Adding transaction on July 31 23:59...');
const tx1 = store.addTransaction(userId, {
  cashflow: 'expense',
  category: 'Food',
  wallet: 'Cash',
  amount: 50000,
  description: 'Makan Malam',
  transactionDate: '2026-07-31T23:59:00.000Z',
  source: 'telegram'
});
console.log('Created ID:', tx1.id);

console.log('\n2. Adding transaction on Aug 01 00:01...');
const tx2 = store.addTransaction(userId, {
  cashflow: 'income',
  category: 'Salary',
  wallet: 'Bank BCA',
  amount: 10000000,
  description: 'Gaji',
  transactionDate: '2026-08-01T00:01:00.000Z',
  source: 'telegram'
});
console.log('Created ID:', tx2.id);

console.log('\n3. Update transaction (version up)...');
const updatedTx1 = store.updateTransaction(userId, tx1.id, tx1.transactionDate, { amount: 60000 });
console.log('New Version:', updatedTx1.version, 'New Amount:', updatedTx1.amount);

console.log('\n4. Soft Delete transaction...');
const deletedTx1 = store.deleteTransaction(userId, tx1.id, tx1.transactionDate);
console.log('Status:', deletedTx1.status, 'DeletedAt:', deletedTx1.deletedAt);

console.log('\n5. Reject Update on deleted transaction...');
try {
  store.updateTransaction(userId, tx1.id, tx1.transactionDate, { amount: 70000 });
} catch (e) {
  console.log('Rejected with error:', e.message);
}

console.log('\n6. Count active transactions...');
console.log('Total active:', store.countTransactions(userId));

console.log('\n7. Search active transactions...');
console.log('Result:', store.searchTransactions(userId, {}).length, 'item(s)');

console.log('\n✅ Testing selesai.');
