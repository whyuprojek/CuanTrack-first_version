/**
 * English Localization
 * MoneyFlowID Bot
 */

module.exports = {
  lang: 'en',

  // ================================
  // WELCOME & ONBOARDING
  // ================================
  welcome: (name) => `
🌟 *Welcome to CuanTrack, ${name}!*

Your smart personal finance tracker, integrated with:
• 🤖 *Gemini AI* — for analysis & natural transactions
• 📊 *Google Spreadsheet* — for clean reports & charts
• 💳 Multi-account & multi-category

Let's set up your account! 🚀

👨‍💻 *Author:* @ikhsanh
🐙 *GitHub:* github.com/ikhsanh
`,

  selectLanguage: `
🌐 *Pilih Bahasa / Select Language*

Choose your preferred language:
`,

  langSelected: '✅ English selected!',

  // ================================
  // SPREADSHEET SETUP
  // ================================
  askSpreadsheetId: `
📊 *Step 1: Google Spreadsheet*

Please enter your Google Sheets *Spreadsheet ID*.

📌 How to find your Spreadsheet ID:
1. Open your Google Spreadsheet
2. Look at the URL: \`https://docs.google.com/spreadsheets/d/\`*\`[THIS IS THE ID]\`*\`/edit\`
3. Copy the highlighted part

✉️ Send your Spreadsheet ID now:
`,

  invalidSpreadsheetId: `
❌ *Invalid Spreadsheet ID or cannot access.*

Make sure:
• The ID is correct
• The spreadsheet is shared with: \`{email}\`
• Access level: *Editor*

Try again with the correct ID:
`,

  spreadsheetConnected: (title) => `
✅ *Spreadsheet connected successfully!*
📊 Spreadsheet: *${title}*

Preparing sheets & format... please wait 🔄
`,

  sheetInitialized: `
✅ *Sheets created successfully!*

Sheets created:
• 📋 Transactions
• 💳 Accounts
• 💰 Income Sources
• 🛍️ Spending Categories
• 📅 Bills
• 📊 Monthly Summary
• 🎯 Dashboard + Chart

Now let's set up your finances! 👇
`,

  // ================================
  // SETUP - INCOME SOURCES
  // ================================
  setupIncomeTitle: `
💼 *Setup Income Sources*

Here are the default income sources.
Toggle to select, or add a new one:
`,

  setupIncomeAdding: '✍️ Type the name of your new income source:',
  setupIncomeAdded: (name) => `✅ *${name}* added!`,
  setupIncomeRemoved: (name) => `🗑️ *${name}* removed.`,
  setupIncomeDone: (count) => `✅ *${count} income sources* saved!`,
  setupIncomeEmpty: '⚠️ Please add at least 1 income source.',
  currentIncomeSources: (list) => `📋 *Your Income Sources:*\n${list}`,

  // ================================
  // SETUP - ACCOUNTS
  // ================================
  setupAccountTitle: `
💳 *Setup Accounts & Wallets*

Select the accounts you have.
Tap to add or remove:
`,

  setupAccountSelectBalance: (name) => `
💰 What is your current balance in *${name}*?
Type the amount (example: 1500000):
`,

  setupAccountAdded: (name, balance) => `✅ *${name}* added with balance Rp ${formatNumber(balance)}`,
  setupAccountRemoved: (name) => `🗑️ Account *${name}* removed.`,
  setupAccountDone: (count) => `✅ *${count} accounts* saved!`,
  setupAccountEmpty: '⚠️ Please add at least 1 account.',
  setupAccountCustomName: '✍️ Type the name of your new account:',

  // ================================
  // SETUP - SPENDING CATEGORIES
  // ================================
  setupSpendingTitle: `
🛍️ *Setup Spending Categories*

Select categories that match your spending habits:
`,

  setupSpendingAdding: '✍️ Type the name of your new spending category:',
  setupSpendingAdded: (name) => `✅ *${name}* added!`,
  setupSpendingRemoved: (name) => `🗑️ *${name}* removed.`,
  setupSpendingDone: (count) => `✅ *${count} spending categories* saved!`,
  setupSpendingEmpty: '⚠️ Please add at least 1 category.',

  // ================================
  // SETUP - BILLS
  // ================================
  setupBillsTitle: `
📅 *Setup Monthly Bills*

Add your recurring monthly bills like Netflix, WiFi, etc.
`,

  setupBillName: '✍️ Bill name? (example: Netflix, WiFi, Electricity):',
  setupBillAmount: (name) => `💰 Monthly amount for *${name}*?\nType the amount (example: 54000):`,
  setupBillDue: (name) => `📅 Due date for *${name}* each month?\nType the date (1-31):`,
  setupBillAccount: (name) => `💳 Which account pays for *${name}*?`,
  setupBillAdded: (name, amount, due) => `✅ Bill *${name}* (Rp ${formatNumber(amount)}, due ${due}) added!`,
  setupBillRemoved: (name) => `🗑️ Bill *${name}* removed.`,
  setupBillDone: (count) => `✅ *${count} bills* saved!`,
  setupBillsSkip: '➡️ Bill setup skipped.',

  // ================================
  // SETUP COMPLETE
  // ================================
  setupComplete: `
🎉 *Setup Complete! Welcome to CuanTrack!*

All settings have been saved.
You're ready to track your finances! 💪

Use the menu below to get started:
`,

  // ================================
  // MAIN MENU
  // ================================
  mainMenu: '🏠 *CuanTrack Main Menu*\n\nChoose an option:',
  menuIncome: '💰 Income',
  menuExpense: '💸 Spending',
  menuTransfer: '↔️ Transfer',
  menuOther: '📋 Other',
  menuReport: '📊 Reports',
  menuBalance: '💳 Balance',
  menuAI: '🤖 AI Chat',
  menuSettings: '⚙️ Settings',
  menuBills: '📅 Bills',

  cashflowTitle: '📋 *Other Transactions*\n\nChoose transaction type:',

  // ================================
  // RECORD INCOME
  // ================================
  incomeTitle: '💰 *Record Income*\n\nSelect income source:',
  incomeSelectSource: '📌 Select income source:',
  incomeEnterAmount: (source) => `💰 From *${source}*\n\nHow much did you receive?\n_(example: 5000000 or 5jt)_`,
  incomeSelectAccount: (source, amount) => `💰 *${source}* — Rp ${formatNumber(amount)}\n\nWhich account?`,
  enterTxName: '📝 *Transaction Name*\n\nEnter transaction name/description:\n_(type "-" to use default name)_',
  incomeConfirm: (source, amount, account, name) => `
📋 *Confirm Income*

💼 Source: *${source}*
📝 Name: *${name}*
💰 Amount: *Rp ${formatNumber(amount)}*
🏦 To account: *${account}*

Save?`,
  incomeSaved: (amount, account) => `✅ *Income Rp ${formatNumber(amount)} saved!*\n*${account}* balance updated 📊`,

  // ================================
  // RECORD EXPENSE
  // ================================
  expenseTitle: '💸 *Record Expense*\n\nSelect category:',
  expenseSelectCategory: '📌 Select spending category:',
  expenseEnterAmount: (category) => `💸 Category: *${category}*\n\nHow much did you spend?\n_(example: 25000 or 25rb)_`,
  expenseSelectAccount: (category, amount) => `💸 *${category}* — Rp ${formatNumber(amount)}\n\nPaid from which account?`,
  expenseConfirm: (category, amount, account, name) => `
📋 *Confirm Expense*

🛒 Category: *${category}*
📝 Name: *${name}*
💸 Amount: *Rp ${formatNumber(amount)}*
🏦 From account: *${account}*

Save?`,
  expenseSaved: (amount, account) => `✅ *Expense Rp ${formatNumber(amount)} saved!*\n*${account}* balance updated 📊`,

  // ================================
  // TRANSFER
  // ================================
  transferEnterAmount: '↔️ *Transfer Between Accounts*\n\nHow much do you want to transfer?\n_(example: 100000 or 100rb)_',
  transferFromAccount: '💳 Transfer *from* which account?',
  transferToAccount: '🏦 Transfer *to* which account?',
  transferConfirm: (amount, from, to, name) => `
📋 *Confirm Transfer*

📝 Name: *${name}*
💸 Amount: *Rp ${formatNumber(amount)}*
💳 From: *${from}*
🏦 To: *${to}*

Save?`,
  transferSaved: (amount, from, to) => `✅ *Transfer Rp ${formatNumber(amount)} done!*\n${from} → ${to}`,

  // ================================
  // BILLS PAYMENT
  // ================================
  billSelectTitle: '📅 *Pay Bills*\n\nWhich bill do you want to pay?',
  billSelectAccount: (name, amount) => `📅 Pay *${name}* (Rp ${formatNumber(amount)})\n\nPaid from which account?`,
  billConfirm: (name, amount, account) => `
📋 *Confirm Bill Payment*

📅 Bill: *${name}*
💸 Amount: *Rp ${formatNumber(amount)}*
🏦 From account: *${account}*

Save?`,
  billPaid: (name) => `✅ Bill *${name}* paid! Status updated in spreadsheet.`,

  // ================================
  // PIUTANG BARU (RECEIVABLE)
  // ================================
  piutangEnterName: '💼 *New Receivable (Lending Money)*\n\nName of person/party you are lending to:',
  piutangEnterAmount: (name) => `💼 Receivable from *${name}*\n\nHow much?`,
  piutangSelectDari: '💳 Paid from which account?',
  piutangConfirm: (name, amount, dari, txName) => `
📋 *Confirm New Receivable*

💼 Lent to: *${name}*
📝 Description: *${txName}*
💸 Amount: *Rp ${formatNumber(amount)}*
🏦 From account: *${dari}*

Save?`,
  piutangSaved: (name, amount) => `✅ *Receivable Rp ${formatNumber(amount)} to ${name} recorded!*`,

  // ================================
  // PELUNASAN PIUTANG (SETTLE RECEIVABLE)
  // ================================
  lunasPiutangEnterName: '✅ *Settle Receivable*\n\nName of person/party paying back:',
  lunasPiutangEnterAmount: '💰 How much were you paid back?',
  lunasPiutangSelectKe: '🏦 Received into which account?',
  lunasPiutangConfirm: (name, amount, ke) => `
📋 *Confirm Receivable Settlement*

✅ Payment from: *${name}*
💰 Amount: *Rp ${formatNumber(amount)}*
🏦 To account: *${ke}*

Save?`,
  lunasPiutangSaved: (name, amount) => `✅ *Receivable settlement Rp ${formatNumber(amount)} from ${name} recorded!*`,

  // ================================
  // UTANG BARU (NEW DEBT)
  // ================================
  utangEnterName: '💳 *New Debt (Borrowing Money)*\n\nName of person/party you borrowed from:',
  utangEnterAmount: (name) => `💳 Debt from *${name}*\n\nHow much?`,
  utangSelectKe: '🏦 Received into which account?',
  utangConfirm: (name, amount, ke, txName) => `
📋 *Confirm New Debt*

💳 Borrowed from: *${name}*
📝 Description: *${txName}*
💰 Amount: *Rp ${formatNumber(amount)}*
🏦 To account: *${ke}*

Save?`,
  utangSaved: (name, amount) => `✅ *Debt Rp ${formatNumber(amount)} from ${name} recorded!*`,

  // ================================
  // PELUNASAN UTANG (PAY DEBT)
  // ================================
  lunasUtangEnterName: '✅ *Pay Debt*\n\nName of person/party you are paying back:',
  lunasUtangEnterAmount: '💸 How much are you paying?',
  lunasUtangSelectDari: '💳 Paid from which account?',
  lunasUtangConfirm: (name, amount, dari) => `
📋 *Confirm Debt Payment*

✅ Paying back: *${name}*
💸 Amount: *Rp ${formatNumber(amount)}*
🏦 From account: *${dari}*

Save?`,
  lunasUtangSaved: (name, amount) => `✅ *Debt payment Rp ${formatNumber(amount)} to ${name} recorded!*`,

  // ================================
  // REPORT
  // ================================
  reportTitle: '📊 *Financial Reports*\n\nChoose report type:',
  reportMonthly: '📅 Monthly Report',
  reportByCategory: '🗂️ By Category',
  reportBalance: '💳 Account Balances',
  reportBills: '📋 Bills Status',
  reportInsight: '🤖 AI Insight',

  monthlyReport: (month, year, income, expense, savings, savingsRate) => `
📊 *Report for ${month} ${year}*
${'─'.repeat(30)}
💰 Total Income: *Rp ${formatNumber(income)}*
💸 Total Expense: *Rp ${formatNumber(expense)}*
💾 Savings: *Rp ${formatNumber(savings)}*
📈 Savings Rate: *${savingsRate}%*
${'─'.repeat(30)}
`,

  categoryReport: (data) => {
    let text = `🗂️ *Expenses by Category (This Month)*\n${'─'.repeat(30)}\n`;
    data.forEach((item) => {
      text += `${item.emoji || '📦'} ${item.category}: *Rp ${formatNumber(item.total)}*\n`;
    });
    return text;
  },

  balanceReport: (accounts) => {
    let text = `💳 *Account Balances*\n${'─'.repeat(30)}\n`;
    let total = 0;
    accounts.forEach((acc) => {
      text += `${acc.emoji || '🏦'} ${acc.name}: *Rp ${formatNumber(acc.balance)}*\n`;
      total += acc.balance;
    });
    text += `${'─'.repeat(30)}\n💰 *Total: Rp ${formatNumber(total)}*`;
    return text;
  },

  billsReport: (bills) => {
    let text = `📅 *Monthly Bills Status*\n${'─'.repeat(30)}\n`;
    bills.forEach((bill) => {
      const icon = bill.paid ? '✅' : bill.overdue ? '🔴' : '⏰';
      text += `${icon} ${bill.name}: *Rp ${formatNumber(bill.amount)}* (due ${bill.dueDay})\n`;
    });
    return text;
  },

  // ================================
  // AI CHAT
  // ================================
  aiChatTitle: `
🤖 *CuanTrack AI Assistant*

You can:
• Type a natural transaction: _"lunch 25k from Gopay"_
• Ask for insights: _"how are my finances this month?"_
• Get advice: _"how can I save more?"_

Type /menu to return to the menu.
`,

  aiProcessing: '🤔 *AI is processing...*',
  aiTransactionDetected: (data) => `
🤖 *AI detected a transaction:*

${data.type === 'income' ? '💰' : data.type === 'transfer' ? '↔️' : data.type === 'utang' ? '💳' : data.type === 'pelunasan_utang' ? '✅' : '💸'} *${data.type === 'income' ? 'Income' : data.type === 'transfer' ? 'Transfer' : data.type === 'utang' ? 'Debt (Paylater)' : data.type === 'pelunasan_utang' ? 'Debt Payment' : 'Expense'}*
📌 ${data.type === 'income' ? 'Source' : 'Category'}: *${data.category}*
💵 Amount: *Rp ${formatNumber(data.amount)}*
🏦 ${data.type === 'transfer' ? `From: *${data.account}* → To: *${data.toAccount}*` : `Account: *${data.account}*`}
📅 Date: *${data.date ? new Date(data.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}* at *${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}*
📝 Note: ${data.note || '-'}

Is this correct?`,

  aiError: '❌ AI could not process this message. Please try again!',

  // ================================
  // SETTINGS
  // ================================
  settingsTitle: '⚙️ *Settings*\n\nChoose what to change:',
  settingsLanguage: '🌐 Change Language',
  settingsIncome: '💼 Manage Income Sources',
  settingsAccounts: '💳 Manage Accounts',
  settingsSpending: '🛍️ Manage Spending Categories',
  settingsBills: '📅 Manage Bills',
  settingsSpreadsheet: '📊 Change Spreadsheet',
  settingsBack: '◀️ Back to Menu',

  // ================================
  // ERRORS & MISC
  // ================================
  notSetup: `
⚠️ *You haven't completed setup yet!*

Type /start to begin your financial setup.
`,

  invalidAmount: '❌ Invalid amount. Enter numbers only without dots/commas (example: 25000):',
  invalidDate: '❌ Invalid date. Enter a number from 1-31:',
  btnConfirm: '✅ Save',
  btnCancel: '❌ Cancel',
  btnDone: '✅ Done',
  btnAdd: '➕ Add New',
  btnSkip: '⏭️ Skip',
  btnBack: '◀️ Back',
  btnNext: '▶️ Next',
  btnYes: '✅ Yes',
  btnNo: '❌ No',
  cancelled: '❌ Cancelled.',
  processingError: '❌ An error occurred. Please try again or type /menu.',
  noTransactions: '📭 No transactions this month.',
  noAccounts: '⚠️ No accounts added yet.',
  insufficientBalance: (account, balance) => `⚠️ Insufficient balance in *${account}*! Balance: Rp ${formatNumber(balance)}`,

  reminderBill: (name, amount, dueDay) => `
🔔 *Bill Reminder!*

📅 Bill *${name}* is due on the *${dueDay}th*
💰 Amount: *Rp ${formatNumber(amount)}*

Don't forget to pay! ✅
`,

  billPaidConfirm: (name, amount) => `
📋 *Confirm Bill Payment*

📅 Bill: *${name}*
💸 Amount: *Rp ${formatNumber(amount)}*

Mark as paid?`,
  billPaid: (name) => `✅ Bill *${name}* marked as paid!`,

  setupProgress: (step, total) => `📍 Step ${step} of ${total}`,

  // ================================
  // DAILY REMINDERS
  // ================================
  reminderDaily: (name) => `
☀️ *Good morning, ${name}!*

📝 Don't forget to record your transactions today!
Tap the button below to start recording:
`,

  dailySummaryEmpty: (name, dateStr) => `
🌙 *Daily Summary — ${dateStr}*

Hey *${name}*! No transactions recorded today.

Record now before you forget! 📝
`,

  dailySummary: (name, dateStr, income, expense, net, txList) => `
🌙 *Daily Summary — ${dateStr}*

Hey *${name}*! Here's your financial summary for today:

💰 *Income:* Rp ${formatNumber(income)}
💸 *Spending:* Rp ${formatNumber(expense)}
${net >= 0 ? '✅' : '⚠️'} *Net:* ${net >= 0 ? '+' : ''}Rp ${formatNumber(net)}

📋 *Today's Transactions:*
${txList}

Keep up the great financial habits! 💪
`,

  // ================================
  // ADMIN BROADCAST
  // ================================
  adminOnly: '🚫 *Access Denied*\n\nThis feature is only available for the bot admin.',
  broadcastMenuTitle: (count) => `📢 *Admin Broadcast Panel*\n\n👥 Total registered users: *${count} users*\n\nChoose the type of message to send:`,
  broadcastTemplateMaintenance: `🔧 *Bot Maintenance*\n\nHello everyone!\n\nThe bot is currently undergoing *maintenance* for performance improvements.\n\n⏳ Estimated completion time: a few minutes.\n\nWe apologize for the inconvenience. 🙏\n\n— MoneyFlowID Team`,
  broadcastTemplateUpdate: `🎉 *New Update Available!*\n\nHello everyone!\n\nWe've just released the latest update for MoneyFlowID Bot.\n\n✨ *New Features & Fixes:*\n• [Fill in the changes here]\n\nEnjoy a better financial tracking experience! 🚀\n\n— MoneyFlowID Team`,
  broadcastTemplateWarning: `⚠️ *Important Notice*\n\nHello everyone!\n\n[Fill in the warning/important info here]\n\nThank you for your attention and cooperation. 🙏\n\n— MoneyFlowID Team`,
  broadcastTemplateAnnouncement: `📣 *Announcement*\n\nHello everyone!\n\n[Fill in the announcement here]\n\nThank you for your attention! 🙏\n\n— MoneyFlowID Team`,
  broadcastCustomPrompt: '✍️ *Custom Broadcast Message*\n\nType the message you want to broadcast.\nYou can use Markdown formatting:\n• `*bold text*`\n• `_italic text_`\n\nType your message now:',
  broadcastPreview: (text, count) => `👁️ *Broadcast Message Preview:*\n\n─────────────────────────\n${text}\n─────────────────────────\n\n👥 Will be sent to *${count} users*.\n\nSend now?`,
  broadcastSending: '📤 *Sending broadcast...*\n\nPlease wait while we send to all users.',
  broadcastDone: (total, success, fail) => `✅ *Broadcast Complete!*\n\n📊 *Delivery Report:*\n• Total users: *${total}*\n• ✅ Success: *${success}*\n• ❌ Failed: *${fail}*`,
  broadcastCancelled: '❌ *Broadcast cancelled.*\n\nUse /broadcast to start again.',
  broadcastNoMessage: '⚠️ No message to send.',
  broadcastStats: (total, setup, notSetup, langId, langEn, time) =>
    `📊 *Bot User Statistics*\n\n` +
    `👥 Total registered: *${total} users*\n` +
    `✅ Setup complete: *${setup} users*\n` +
    `⏳ Not setup: *${notSetup} users*\n\n` +
    `🌐 *Language:*\n` +
    `• 🇮🇩 Indonesian: *${langId} users*\n` +
    `• 🇬🇧 English: *${langEn} users*\n\n` +
    `🕐 Updated: ${time}`,
};


function formatNumber(num) {
  if (!num && num !== 0) return '0';
  return Math.round(num).toLocaleString('id-ID');
}
