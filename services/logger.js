/**
 * Logger Utility
 * MoneyFlowID Bot
 *
 * - Output ke console + file (logs/ folder)
 * - Rotasi harian (1 file per hari)
 * - Level: debug, info, warn, error
 * - Format: [TIMESTAMP] [LEVEL] [context] message
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

// Pastikan folder logs ada
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function getLogFile() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOGS_DIR, `${date}.log`);
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function shouldLog(level) {
  return (LEVELS[level] ?? 1) >= (LEVELS[LOG_LEVEL] ?? 1);
}

function formatArgs(args) {
  return args.map(a => {
    if (a instanceof Error) return `${a.message}\n${a.stack}`;
    if (typeof a === 'object') {
      try { return JSON.stringify(a); } catch { return String(a); }
    }
    return String(a);
  }).join(' ');
}

function write(level, context, args) {
  if (!shouldLog(level)) return;

  const msg = formatArgs(args);
  const line = `[${timestamp()}] [${level.toUpperCase()}] [${context}] ${msg}`;

  // Console output (with color)
  const colors = { debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' };
  const reset = '\x1b[0m';
  console[level === 'debug' ? 'log' : level](`${colors[level] || ''}${line}${reset}`);

  // File output
  try {
    fs.appendFileSync(getLogFile(), line + '\n');
  } catch (e) {
    console.error('Logger file write error:', e.message);
  }
}

/**
 * Buat logger instance dengan context tertentu
 * @param {string} context - Nama modul/handler (e.g. 'AI', 'Sheets', 'Transaction')
 */
function createLogger(context = 'App') {
  return {
    debug: (...args) => write('debug', context, args),
    info: (...args) => write('info', context, args),
    warn: (...args) => write('warn', context, args),
    error: (...args) => write('error', context, args),
  };
}

// Default logger
const logger = createLogger('App');

module.exports = { createLogger, logger };
