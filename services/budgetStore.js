const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data', 'budgets');

/**
 * @description Ensures the base data directory exists.
 * @private
 */
function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Auto-initialize directory
ensureDirectory();

/**
 * @description Generates a unique budget ID.
 * @returns {string} Unique ID starting with bgt_
 * @private
 */
function generateBudgetId() {
  return `bgt_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * @description Gets the file path for a user's budget data.
 * @param {string} userId - User identifier
 * @returns {string} Absolute path to the JSON file
 * @private
 */
function getBudgetFilePath(userId) {
  return path.join(DATA_DIR, `${userId}.json`);
}

/**
 * @description Updates the metadata statistics.
 * @param {object} data - The entire budget data object
 * @private
 */
function updateMeta(data) {
  data._meta.updatedAt = new Date().toISOString();
  data._meta.totalBudgets = data.budgets.length;
  data._meta.activeBudgets = data.budgets.filter(b => b.status === 'active').length;
  data._meta.deletedBudgets = data.budgets.filter(b => b.status === 'deleted').length;
}

/**
 * @description Loads budget data for a user.
 * @param {string} userId - User identifier
 * @returns {object} Parsed budget data object
 * @private
 */
function loadBudget(userId) {
  const filePath = getBudgetFilePath(userId);
  if (!fs.existsSync(filePath)) {
    return {
      _meta: {
        schemaVersion: 1,
        storageVersion: 1,
        userId: String(userId),
        totalBudgets: 0,
        activeBudgets: 0,
        deletedBudgets: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      budgets: []
    };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // Fallback if file is corrupted
    return {
      _meta: {
        schemaVersion: 1,
        storageVersion: 1,
        userId: String(userId),
        totalBudgets: 0,
        activeBudgets: 0,
        deletedBudgets: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      budgets: []
    };
  }
}

/**
 * @description Saves budget data to file.
 * @param {string} userId - User identifier
 * @param {object} data - Data to save
 * @private
 */
function saveBudget(userId, data) {
  ensureDirectory();
  const filePath = getBudgetFilePath(userId);
  updateMeta(data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * @description Validates budget input fields.
 * @param {string} userId - User identifier
 * @param {object} data - Input data
 * @param {boolean} isUpdate - True if performing partial update, false otherwise
 * @private
 */
function validateBudgetInput(userId, data, isUpdate = false) {
  if (!userId) {
    throw new Error('userId is required');
  }
  if (!isUpdate || data.period !== undefined) {
    if (!data.period || !/^\d{4}-\d{2}$/.test(data.period)) {
      throw new Error('Invalid period format. Use YYYY-MM');
    }
  }
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string') {
      throw new Error('Category is required and must be a string');
    }
  }
  if (!isUpdate || data.amount !== undefined) {
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      throw new Error('Amount must be a number');
    }
    if (data.amount < 0) {
      throw new Error('Amount must be >= 0');
    }
  }
  if (data.source && !['telegram', 'dashboard', 'api', 'migration'].includes(data.source)) {
    throw new Error('Invalid source. Allowed values: telegram, dashboard, api, migration');
  }
  if (data.status && !['active', 'deleted'].includes(data.status)) {
    throw new Error('Invalid status. Allowed values: active, deleted');
  }
}

/**
 * @description Creates or updates a budget. Upserts based on active period and category.
 * @param {string} userId - The user's ID
 * @param {object} budgetData - The budget parameters (period, category, amount, etc.)
 * @returns {object} The created or updated budget record
 * @example
 * const budget = setBudget('user123', { period: '2026-07', category: 'Food', amount: 1500000 });
 */
function setBudget(userId, budgetData) {
    validateBudgetInput(userId, budgetData, false);
    
    const now = new Date().toISOString();
    const data = loadBudget(userId);
    
    const existingIndex = data.budgets.findIndex(
      b => b.period === budgetData.period && b.category === budgetData.category && b.status !== 'deleted'
    );
    
    if (existingIndex !== -1) {
        // Update existing (Upsert)
        const existing = data.budgets[existingIndex];
        const updated = {
            ...existing,
            amount: budgetData.amount,
            currency: budgetData.currency || existing.currency,
            note: budgetData.note !== undefined ? budgetData.note : existing.note,
            source: budgetData.source || existing.source,
            version: existing.version + 1,
            updatedAt: now,
            updatedBy: userId,
            sync: {
                status: 'pending',
                lastSyncAt: existing.sync ? existing.sync.lastSyncAt : null
            }
        };
        data.budgets[existingIndex] = updated;
        saveBudget(userId, data);
        return updated;
    } else {
        // Create new
        const newBudget = {
            id: generateBudgetId(),
            version: 1,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            deletedAt: null,
            deletedBy: null,
            status: 'active',
            period: budgetData.period,
            category: budgetData.category,
            amount: budgetData.amount,
            currency: budgetData.currency || 'IDR',
            note: budgetData.note || '',
            source: budgetData.source || 'telegram',
            sync: {
                status: 'pending',
                lastSyncAt: null
            }
        };
        data.budgets.push(newBudget);
        saveBudget(userId, data);
        return newBudget;
    }
}

/**
 * @description Updates an existing budget by ID.
 * @param {string} userId - The user's ID
 * @param {string} budgetId - The unique budget ID
 * @param {object} updates - Key-value pairs to update
 * @returns {object|null} The updated budget record or null if not found
 * @example
 * const updated = updateBudget('user123', 'bgt_abc123', { amount: 2000000, note: 'Bonus month' });
 */
function updateBudget(userId, budgetId, updates) {
    validateBudgetInput(userId, updates, true);
    
    const data = loadBudget(userId);
    const index = data.budgets.findIndex(b => b.id === budgetId);
    
    if (index === -1) return null;
    
    const bgt = data.budgets[index];
    
    if (bgt.status === 'deleted') {
        throw new Error('Cannot update a deleted budget');
    }
    
    const updatedBgt = {
        ...bgt,
        ...updates,
        version: bgt.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        id: bgt.id, // Immutable
        period: bgt.period, // Immutable
        category: bgt.category, // Immutable
        createdAt: bgt.createdAt, // Immutable
        createdBy: bgt.createdBy, // Immutable
        sync: {
            status: 'pending',
            lastSyncAt: bgt.sync ? bgt.sync.lastSyncAt : null
        }
    };
    
    data.budgets[index] = updatedBgt;
    saveBudget(userId, data);
    
    return updatedBgt;
}

/**
 * @description Soft deletes a budget by changing its status to 'deleted'.
 * @param {string} userId - The user's ID
 * @param {string} budgetId - The unique budget ID
 * @returns {object|null} The deleted budget record or null if not found
 * @example
 * const deleted = deleteBudget('user123', 'bgt_abc123');
 */
function deleteBudget(userId, budgetId) {
    const data = loadBudget(userId);
    const index = data.budgets.findIndex(b => b.id === budgetId);
    
    if (index === -1) return null;
    
    const bgt = data.budgets[index];
    
    if (bgt.status === 'deleted') {
        return bgt; // Already deleted
    }
    
    const now = new Date().toISOString();
    bgt.status = 'deleted';
    bgt.deletedAt = now;
    bgt.deletedBy = userId;
    bgt.version += 1;
    bgt.updatedAt = now;
    bgt.updatedBy = userId;
    bgt.sync = {
        status: 'pending',
        lastSyncAt: bgt.sync ? bgt.sync.lastSyncAt : null
    };
    
    data.budgets[index] = bgt;
    saveBudget(userId, data);
    
    return bgt;
}

/**
 * @description Retrieves a single budget by ID.
 * @param {string} userId - The user's ID
 * @param {string} budgetId - The unique budget ID
 * @returns {object|null} The budget record if found and active, otherwise null
 * @example
 * const budget = getBudget('user123', 'bgt_abc123');
 */
function getBudget(userId, budgetId) {
    const data = loadBudget(userId);
    const bgt = data.budgets.find(b => b.id === budgetId) || null;
    
    if (bgt && bgt.status !== 'deleted') {
        return bgt;
    }
    return null;
}

/**
 * @description Gets all active budgets for a specific period.
 * @param {string} userId - The user's ID
 * @param {string} period - The period in YYYY-MM format
 * @returns {Array<object>} List of active budgets in the period
 * @example
 * const budgets = getBudgetsByPeriod('user123', '2026-07');
 */
function getBudgetsByPeriod(userId, period) {
    const data = loadBudget(userId);
    return data.budgets.filter(b => b.status === 'active' && b.period === period);
}

/**
 * @description Gets an active budget by category and period.
 * @param {string} userId - The user's ID
 * @param {string} period - The period in YYYY-MM format
 * @param {string} category - The budget category
 * @returns {object|null} The matching budget or null
 * @example
 * const budget = getBudgetByCategory('user123', '2026-07', 'Food');
 */
function getBudgetByCategory(userId, period, category) {
    const data = loadBudget(userId);
    return data.budgets.find(b => b.status === 'active' && b.period === period && b.category === category) || null;
}

/**
 * @description Searches budgets based on multiple filter criteria.
 * @param {string} userId - The user's ID
 * @param {object} filters - Filter options: { period, category, status, source, limit, offset, sort }
 * @returns {Array<object>} Array of budgets matching the criteria
 * @example
 * const results = searchBudgets('user123', { status: 'active', category: 'Transport', sort: 'desc' });
 */
function searchBudgets(userId, filters = {}) {
    const data = loadBudget(userId);
    let results = data.budgets;
    
    if (filters.status !== undefined) {
        results = results.filter(b => b.status === filters.status);
    } else {
        // Default to active only if status not explicitly asked
        results = results.filter(b => b.status === 'active');
    }
    
    if (filters.period) {
        results = results.filter(b => b.period === filters.period);
    }
    
    if (filters.category) {
        results = results.filter(b => b.category === filters.category);
    }
    
    if (filters.source) {
        results = results.filter(b => b.source === filters.source);
    }
    
    // Sort
    if (filters.sort === 'asc') {
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
        // default desc
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Pagination
    const offset = filters.offset || 0;
    if (filters.limit) {
        results = results.slice(offset, offset + filters.limit);
    } else if (offset > 0) {
        results = results.slice(offset);
    }
    
    return results;
}

/**
 * @description Counts budgets based on multiple filter criteria.
 * @param {string} userId - The user's ID
 * @param {object} filters - Filter options: { period, category, status, source }
 * @returns {number} The number of budgets matching the criteria
 * @example
 * const count = countBudgets('user123', { status: 'deleted' });
 */
function countBudgets(userId, filters = {}) {
    // Avoid applying limit/offset/sort for counting, just filter
    const countFilters = { ...filters };
    delete countFilters.limit;
    delete countFilters.offset;
    delete countFilters.sort;
    
    return searchBudgets(userId, countFilters).length;
}

module.exports = {
    setBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    getBudgetsByPeriod,
    getBudgetByCategory,
    searchBudgets,
    countBudgets
};
