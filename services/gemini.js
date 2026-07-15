/**
 * Gemini AI Service
 * MoneyFlowID Bot
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildParseTransactionPrompt, buildInsightPrompt, buildChatSystemPrompt, buildBillReminderPrompt } = require('../handlers/phrasing');
const { createLogger } = require('./logger');

const log = createLogger('Gemini');

let genAI = null;

function getClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

function getModel(modelName = 'gemini-3.5-flash') {
  return getClient().getGenerativeModel({ model: modelName });
}

const MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-pro',
  'gemini-pro-latest',
  'gemini-2.0-flash',
];

async function executeWithFallback(actionFn) {
  let lastError = null;
  const uniqueModels = MODELS;
  for (const modelName of uniqueModels) {
    try {
      const model = getModel(modelName);
      return await actionFn(model);
    } catch (err) {
      lastError = err;
      const errMsg = err.message || err;
      log.warn(`[Gemini Fallback] Model ${modelName} failed: ${errMsg.split('\n')[0]}. Trying next...`);
    }
  }
  throw lastError || new Error('All fallback Gemini models failed.');
}

async function parseTransaction(message, userCtx, lang = 'id') {
  const prompt = buildParseTransactionPrompt(message, userCtx, lang);

  try {
    const result = await executeWithFallback(async (model) => {
      return await model.generateContent(prompt);
    });
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isTransaction: false, response: text };
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return { isTransaction: false, response: lang === 'id' ? '⚠️ AI sedang overload, coba lagi dalam beberapa menit ya!' : '⚠️ AI is currently overloaded, please try again in a few minutes!' };
    }
    log.error('Gemini parseTransaction error:', msg.split('\n')[0]);
    return null;
  }
}

async function generateInsight(transactions, accounts, bills, lang = 'id') {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  const expenseByCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });
  const topCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([cat, amt]) => `${cat}: Rp ${Math.round(amt).toLocaleString('id-ID')}`).join('\n');

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const unpaidBills = bills.filter(b => !b.paidThisMonth && b.active);

  const prompt = buildInsightPrompt({
    totalIncome, totalExpense, savings, savingsRate,
    topCategories,
    totalBalance,
    unpaidBills: unpaidBills.map(b => b.name).join(', '),
    transactionCount: transactions.length,
  }, lang);

  try {
    const result = await executeWithFallback(async (model) => {
      return await model.generateContent(prompt);
    });
    return result.response.text().trim();
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return lang === 'id' ? '⚠️ AI sedang overload saat ini. Coba lagi dalam beberapa menit ya!' : '⚠️ AI is currently overloaded. Please try again in a few minutes!';
    }
    log.error('Gemini generateInsight error:', msg.split('\n')[0]);
    return lang === 'id' ? '❌ Tidak dapat menghasilkan insight saat ini. Coba lagi nanti.' : '❌ Could not generate insight right now. Please try again later.';
  }
}

async function chat(message, history = [], userCtx = {}, lang = 'id') {
  const systemContext = buildChatSystemPrompt(userCtx, lang);

  try {
    const result = await executeWithFallback(async (model) => {
      const chatObj = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemContext }] },
          { role: 'model', parts: [{ text: 'Siap! Saya MoneyFlow AI, siap membantu keuangan Anda.' }] },
          ...history,
        ],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      });
      return await chatObj.sendMessage(message);
    });
    return result.response.text().trim();
  } catch (err) {
    log.error('Gemini chat error:', err.message);
    return lang === 'id' ? '❌ AI sedang tidak tersedia. Coba lagi dalam beberapa saat.' : '❌ AI is currently unavailable. Please try again in a moment.';
  }
}

async function getBillReminder(billName, amount, dueDay, lang = 'id') {
  const prompt = buildBillReminderPrompt(billName, amount, dueDay, lang);
  try {
    const result = await executeWithFallback(async (model) => {
      return await model.generateContent(prompt);
    });
    return result.response.text().trim();
  } catch {
    return lang === 'id'
      ? `📅 Jangan lupa bayar tagihan ${billName} sebesar Rp ${Math.round(amount).toLocaleString('id-ID')}!`
      : `📅 Don't forget to pay your ${billName} bill of Rp ${Math.round(amount).toLocaleString('id-ID')}!`;
  }
}

module.exports = { parseTransaction, generateInsight, chat, getBillReminder };
