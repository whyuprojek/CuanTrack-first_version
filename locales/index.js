/**
 * Locales Index — export locale berdasarkan kode bahasa
 * MoneyFlowID Bot
 */

const id = require('./id');
const en = require('./en');

const locales = { id, en };

/**
 * Dapatkan objek locale berdasarkan kode bahasa
 * @param {string} lang - 'id' | 'en'
 * @returns {Object} locale object
 */
function L(lang = 'id') {
  return locales[lang] || locales.id;
}

module.exports = L;
