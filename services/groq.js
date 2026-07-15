/**
 * Groq AI Service
 * MoneyFlowID Bot
 * Groq uses OpenAI-compatible API format
 */

require('dotenv').config();
const { buildParseTransactionPrompt, buildInsightPrompt, buildChatSystemPrompt, buildBillReminderPrompt } = require('../handlers/phrasing');
const { createLogger } = require('./logger');

const log = createLogger('Groq');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

async function callGroq(messages, maxTokens = 500, temperature = 0.7) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  let lastError = null;
  for (const model of MODELS) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status}: ${err}`);
      }
      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      lastError = err;
      log.warn(`[Groq Fallback] Model ${model} failed: ${(err.message || '').split('\n')[0]}`);
    }
  }
  throw lastError || new Error('All Groq models failed.');
}

async function parseTransaction(message, userCtx, lang = 'id') {
  const prompt = buildParseTransactionPrompt(message, userCtx, lang);
  try {
    const text = await callGroq([{ role: 'user', content: prompt }]);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isTransaction: false, response: text };
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    if ((err.message || '').includes('429')) {
      return { isTransaction: false, response: lang === 'id' ? '⚠️ AI sedang overload, coba lagi dalam beberapa menit ya!' : '⚠️ AI is currently overloaded, please try again in a few minutes!' };
    }
    log.error('Groq parseTransaction error:', (err.message || '').split('\n')[0]);
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
    return await callGroq([{ role: 'user', content: prompt }]);
  } catch (err) {
    log.error('Groq generateInsight error:', (err.message || '').split('\n')[0]);
    return lang === 'id' ? '❌ Tidak dapat menghasilkan insight saat ini.' : '❌ Could not generate insight right now.';
  }
}

async function chat(message, history = [], userCtx = {}, lang = 'id') {
  const systemMsg = buildChatSystemPrompt(userCtx, lang);
  const messages = [{ role: 'system', content: systemMsg }];
  for (const h of history) {
    messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts?.[0]?.text || '' });
  }
  messages.push({ role: 'user', content: message });

  try {
    return await callGroq(messages, 500, 0.7);
  } catch (err) {
    log.error('Groq chat error:', err.message);
    return lang === 'id' ? '❌ AI sedang tidak tersedia. Coba lagi dalam beberapa saat.' : '❌ AI is currently unavailable.';
  }
}

async function getBillReminder(billName, amount, dueDay, lang = 'id') {
  const prompt = buildBillReminderPrompt(billName, amount, dueDay, lang);
  try {
    return await callGroq([{ role: 'user', content: prompt }], 100);
  } catch {
    return lang === 'id'
      ? `📅 Jangan lupa bayar tagihan ${billName} sebesar Rp ${Math.round(amount).toLocaleString('id-ID')}!`
      : `📅 Don't forget to pay your ${billName} bill of Rp ${Math.round(amount).toLocaleString('id-ID')}!`;
  }
}

module.exports = { parseTransaction, generateInsight, chat, getBillReminder };
