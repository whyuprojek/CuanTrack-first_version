const fs = require('fs');
let code = fs.readFileSync('handlers/transaction.js', 'utf8');

const helper = `const transactionStore = require('../services/transactionStore');
const storageProvider = require('../services/storage/storageProvider');

function mapTelegramTransaction(userId, tgData) {
  let cashflow = 'expense';
  if (tgData.cashflow === 'Income') cashflow = 'income';
  else if (tgData.cashflow === 'Spending' || tgData.cashflow === 'Bills' || tgData.cashflow === 'Pelunasan Utang' || tgData.cashflow === 'Pelunasan Piutang') cashflow = 'expense';
  else if (tgData.cashflow === 'Transfer') cashflow = 'transfer';
  else if (tgData.cashflow === 'Utang Baru') cashflow = 'debt';
  else if (tgData.cashflow === 'Piutang Baru') cashflow = 'receivable';

  let wallet = tgData.dari || tgData.ke || '';
  if (tgData.cashflow === 'Transfer') {
     wallet = tgData.dari + ' -> ' + tgData.ke;
  }

  return {
    source: 'telegram',
    cashflow: cashflow,
    category: tgData.category || '',
    wallet: wallet,
    amount: parseFloat(tgData.amount),
    description: tgData.name || '',
    transactionDate: tgData.date || new Date().toISOString()
  };
}

async function saveToStoreAndSheets(userId, tgData) {
  const user = userStore.getUser(userId);
  const internalTx = mapTelegramTransaction(userId, tgData);
  
  try {
     transactionStore.addTransaction(userId, internalTx);
     storageProvider.sync(user);
  } catch (err) {
     log.error('TransactionStore save error: ' + err.message);
     throw new Error('TransactionStore Error');
  }

  if (user.spreadsheetId && process.env.GOOGLE_CREDENTIALS_PATH) {
     try {
       await sheets.addTransaction(user.spreadsheetId, { ...tgData, _userData: user });
     } catch (err) {
       log.warn('Google Sheets save failed, but local store succeeded: ' + err.message);
     }
  }
}

`;

code = code.replace("const L = require('../locales');", "const L = require('../locales');\n\n" + helper);

// Replace sheets.addTransaction with saveToStoreAndSheets
code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Income',\s*category: ([^,]+),\s*dari: '',\s*ke: ([^,]+),\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Income', category: $3, dari: '', ke: $4 });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Spending',\s*category: ([^,]+),\s*dari: ([^,]+),\s*ke: '',\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Spending', category: $3, dari: $4, ke: '' });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Transfer',\s*category: 'Antar Account',\s*dari: ([^,]+),\s*ke: ([^,]+),\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Transfer', category: 'Antar Account', dari: $3, ke: $4 });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Bills',\s*category: ([^,]+),\s*dari: ([^,]+),\s*ke: '',\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Bills', category: $3, dari: $4, ke: '' });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Piutang Baru',\s*category: ([^,]+),\s*dari: ([^,]+),\s*ke: '',\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Piutang Baru', category: $3, dari: $4, ke: '' });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Pelunasan Piutang',\s*category: ([^,]+),\s*dari: '',\s*ke: ([^,]+),\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Pelunasan Piutang', category: $3, dari: '', ke: $4 });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Utang Baru',\s*category: ([^,]+),\s*dari: '',\s*ke: ([^,]+),\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Utang Baru', category: $3, dari: '', ke: $4 });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{\s*name: ([^,]+),\s*amount: ([^,]+),\s*cashflow: 'Pelunasan Utang',\s*category: ([^,]+),\s*dari: ([^,]+),\s*ke: '',\s*_userData: user,\s*\}\);/g,
  `await saveToStoreAndSheets(userId, { name: $1, amount: $2, cashflow: 'Pelunasan Utang', category: $3, dari: $4, ke: '' });`
);

code = code.replace(
  /await sheets\.addTransaction\(user\.spreadsheetId, \{ \.\.\.tx, _userData: user \}\);/g,
  `await saveToStoreAndSheets(userId, tx);`
);

fs.writeFileSync('handlers/transaction.js', code);
