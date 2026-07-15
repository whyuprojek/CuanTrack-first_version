/**
 * AI Service Router
 * Memilih service AI berdasarkan preferensi user
 * MoneyFlowID Bot
 */

const gemini = require('./gemini');
const chatgpt = require('./chatgpt');
const groq = require('./groq');

const services = { gemini, chatgpt, groq };
const DEFAULT_SERVICE = 'gemini';
const AVAILABLE_SERVICES = ['gemini', 'chatgpt', 'groq'];

function getService(serviceName) {
  return services[serviceName] || services[DEFAULT_SERVICE];
}

function getServiceForUser(user) {
  return getService(user?.aiService || DEFAULT_SERVICE);
}

module.exports = {
  getService,
  getServiceForUser,
  AVAILABLE_SERVICES,
  DEFAULT_SERVICE,
};
