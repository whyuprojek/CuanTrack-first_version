const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data', 'transactions');

// Ensure base directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Generate a unique transaction ID starting with txn_
 */
function generateTxnId() {
  return `txn_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Get the path for the monthly partition file
 */
function getPartitionPath(userId, dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const userDir = path.join(DATA_DIR, String(userId));
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  return path.join(userDir, `${year}-${month}.json`);
}

/**
 * Read data from a partition file
 */
function readPartition(filePath, period) {
  if (!fs.existsSync(filePath)) {
    return {
      _meta: {
        schemaVersion: 1,
        storageVersion: 1,
        period: period,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      transactions: []
    };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return {
      _meta: {
        schemaVersion: 1,
        storageVersion: 1,
        period: period,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      transactions: []
    };
  }
}

/**
 * Write data to a partition file
 */
function writePartition(filePath, data) {
  data._meta.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Extract period (YYYY-MM) from date string
 */
function getPeriodFromDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Add a new transaction
 */
function addTransaction(userId, txData) {
    const now = new Date().toISOString();
    const transactionDate = txData.transactionDate || now;
    const period = getPeriodFromDate(transactionDate);
    
    const tx = {
        id: generateTxnId(),
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        deletedAt: null,
        deletedBy: null,
        source: txData.source || 'api',
        status: 'active',
        cashflow: txData.cashflow,
        category: txData.category,
        wallet: txData.wallet,
        amount: parseFloat(txData.amount) || 0,
        description: txData.description || '',
        transactionDate: transactionDate
    };

    const filePath = getPartitionPath(userId, transactionDate);
    const partitionData = readPartition(filePath, period);
    partitionData.transactions.push(tx);
    writePartition(filePath, partitionData);
    
    return tx;
}

/**
 * Update an existing transaction
 */
function updateTransaction(userId, txId, transactionDate, updates) {
    const period = getPeriodFromDate(transactionDate);
    const filePath = getPartitionPath(userId, transactionDate);
    const partitionData = readPartition(filePath, period);
    
    const index = partitionData.transactions.findIndex(t => t.id === txId);
    if (index === -1) return null;
    
    const tx = partitionData.transactions[index];
    
    if (tx.status === 'deleted') {
        throw new Error('Cannot update a deleted transaction');
    }
    
    const updatedTx = {
        ...tx,
        ...updates,
        version: tx.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        id: tx.id, // Immutable
        createdAt: tx.createdAt, // Immutable
        createdBy: tx.createdBy // Immutable
    };
    
    partitionData.transactions[index] = updatedTx;
    writePartition(filePath, partitionData);
    
    return updatedTx;
}

/**
 * Soft delete a transaction
 */
function deleteTransaction(userId, txId, transactionDate) {
    const period = getPeriodFromDate(transactionDate);
    const filePath = getPartitionPath(userId, transactionDate);
    const partitionData = readPartition(filePath, period);
    
    const index = partitionData.transactions.findIndex(t => t.id === txId);
    if (index === -1) return null;
    
    const tx = partitionData.transactions[index];
    
    if (tx.status === 'deleted') {
        return tx; // Already deleted
    }
    
    tx.status = 'deleted';
    tx.deletedAt = new Date().toISOString();
    tx.deletedBy = userId;
    tx.version += 1;
    tx.updatedAt = new Date().toISOString();
    tx.updatedBy = userId;
    
    partitionData.transactions[index] = tx;
    writePartition(filePath, partitionData);
    
    return tx;
}

/**
 * Get a single transaction by ID
 */
function getTransaction(userId, txId, transactionDate) {
    const period = getPeriodFromDate(transactionDate);
    const filePath = getPartitionPath(userId, transactionDate);
    const partitionData = readPartition(filePath, period);
    const tx = partitionData.transactions.find(t => t.id === txId) || null;
    
    if (tx && tx.status !== 'deleted') {
        return tx;
    }
    return null;
}

/**
 * Get all active transactions for a specific month
 */
function getTransactionsByMonth(userId, year, month) {
    const mm = String(month).padStart(2, '0');
    const period = `${year}-${mm}`;
    const filePath = path.join(DATA_DIR, String(userId), `${period}.json`);
    const partitionData = readPartition(filePath, period);
    return partitionData.transactions.filter(t => t.status === 'active');
}

/**
 * Get active transactions within a date range
 */
function getTransactionsByRange(userId, startDateStr, endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    
    let results = [];
    
    while (current <= endMonth) {
        const txs = getTransactionsByMonth(userId, current.getFullYear(), current.getMonth() + 1);
        results = results.concat(txs);
        current.setMonth(current.getMonth() + 1);
    }
    
    // Filter exact range
    return results.filter(t => {
        const tDate = new Date(t.transactionDate);
        return tDate >= start && tDate <= end;
    });
}

/**
 * Search active transactions based on criteria
 */
function searchTransactions(userId, queryOptions = {}) {
    const userDir = path.join(DATA_DIR, String(userId));
    if (!fs.existsSync(userDir)) return [];
    
    const files = fs.readdirSync(userDir).filter(f => f.endsWith('.json'));
    let results = [];
    
    for (const file of files) {
        const period = file.replace('.json', '');
        const filePath = path.join(userDir, file);
        const data = readPartition(filePath, period).transactions.filter(t => t.status === 'active');
        results = results.concat(data);
    }
    
    if (queryOptions.cashflow) {
        results = results.filter(t => t.cashflow === queryOptions.cashflow);
    }
    if (queryOptions.category) {
        results = results.filter(t => t.category === queryOptions.category);
    }
    if (queryOptions.wallet) {
        results = results.filter(t => t.wallet === queryOptions.wallet);
    }
    if (queryOptions.keyword) {
        const kw = queryOptions.keyword.toLowerCase();
        results = results.filter(t => t.description.toLowerCase().includes(kw));
    }
    
    return results;
}

/**
 * Count total active transactions
 */
function countTransactions(userId) {
    const userDir = path.join(DATA_DIR, String(userId));
    if (!fs.existsSync(userDir)) return 0;
    
    const files = fs.readdirSync(userDir).filter(f => f.endsWith('.json'));
    let count = 0;
    
    for (const file of files) {
        const period = file.replace('.json', '');
        const filePath = path.join(userDir, file);
        const data = readPartition(filePath, period).transactions.filter(t => t.status === 'active');
        count += data.length;
    }
    
    return count;
}

/**
 * DEPRECATED
 * Hanya untuk Export / Maintenance.
 * Tidak boleh digunakan Handler.
 */
function getTransactions(userId) {
    const userDir = path.join(DATA_DIR, String(userId));
    if (!fs.existsSync(userDir)) return [];
    
    const files = fs.readdirSync(userDir).filter(f => f.endsWith('.json'));
    let results = [];
    
    for (const file of files) {
        const period = file.replace('.json', '');
        const filePath = path.join(userDir, file);
        const data = readPartition(filePath, period);
        results = results.concat(data.transactions);
    }
    return results;
}

module.exports = {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    getTransactionsByMonth,
    getTransactionsByRange,
    searchTransactions,
    countTransactions,
    getTransactions
};
