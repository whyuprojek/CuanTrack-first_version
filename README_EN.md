# 💰 MoneyFlowID Bot

![MoneyFlow Banner](https://images.unsplash.com/photo-1579621970563-430f63602e8e?w=1200&h=300&fit=crop)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-green?logo=node.js)](https://nodejs.org)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot%20API-blue?logo=telegram)](https://core.telegram.org/bots/api)
[![Google Sheets](https://img.shields.io/badge/Google-Sheets%20API-4285F4?logo=google)](https://developers.google.com/sheets)
[![Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-9c27b0)](https://aistudio.google.com)
[![ChatGPT](https://img.shields.io/badge/Supports-ChatGPT-74aa9c)](https://platform.openai.com)
[![Groq](https://img.shields.io/badge/Supports-Groq-f55036)](https://console.groq.com)

> 🌐 **Baca dalam bahasa lain**: **[Versi Bahasa Indonesia (README.md)](README.md)**

---

> **A smart personal finance management Telegram bot, powered by AI & Google Sheets**

An all-in-one bot to track income, expenses, and provide real-time financial insights. It integrates with **Multi-AI** (Gemini, ChatGPT, Groq) to parse natural language transactions and uses **Google Sheets** for clean data visualization.

---

## ✨ Key Features

### 📊 **Comprehensive Transaction Recording**
- 💰 **Income** — From various sources (Salary, Freelance, Business Profit, Investment, etc.)
- 💸 **Expenses** — By detailed categories (Food & Drinks, Transport, Shopping, Phone/Internet, Service, Health, Entertainment, Education, etc.)
- ↔️ **Account Transfer** — Easily move balances between accounts/e-wallets without affecting your net total
- 📅 **Bills Payment** — Track recurring monthly bills (Netflix, YouTube Premium, Spotify, Internet, etc.)
- 💳 **Debts (Payables)** — Record borrowed money and track repayments
- 💼 **Receivables** — Record loaned money and track collections
- 🎯 **Sinking Fund** — Set aside money for emergency funds & specific savings goals

### 🤖 **AI-Powered Features**
- **Natural Language Transaction Parser** — Simply text "Paid 15k for lunch at diner" → the bot automatically parses and records it!
- **Multi-AI Support** — Choose between Gemini, ChatGPT, or Groq with automatic model fallback
- **AI Financial Insights** — The AI provides analysis & recommendations based on your spending patterns
- **Smart Category Matching** — AI automatically identifies the most relevant category for your transaction
- **Smart Phrasing** — Understands abbreviations and finance terms: "tf" (transfer), "withdraw cash", "spaylater" (debt), "pay spaylater" (debt repayment)

### 📊 **Reports & Analytics**
- 📈 **Monthly Report** — Summary of income, expenses, net balance, savings rate, debts, and receivables
- 📋 **Category Breakdown** — View monthly expenses broken down by category
- 💳 **Account Balance** — Check real-time balances for all accounts/wallets
- 📊 **Monthly Financial Summary** — Summary sheets complete with pie charts & bar charts
- 📉 **Spending Trends** — Visualized charts automatically generated in your spreadsheet
- 💰 **Financial Health Check** — Monthly financial health status evaluated by AI

### 💾 **Google Sheets Integration**
- **Auto-generated Monthly Sheets** — A new sheet is automatically created each month (e.g., "May 2026")
- **Professional Layout** — Equipped with structured sections for Dashboard, Transactions, Bills, Debts, Receivables, and Summaries
- **Real-time Sync** — All data is instantly synchronized to Google Sheets
- **Easy Sharing** — Export reports and share them with ease

### ⚙️ **Account Management & Settings**
- 🏦 **Multiple Accounts** — Supports various banks, e-wallet platforms, and cash (BCA, BRI, Gopay, OVO, ShopeePay, etc.)
- 🎯 **Budget Setting** — Set monthly budgets per category and track your spending vs budget progress
- 🌐 **Bilingual Support** — Toggle between Indonesian & English at any time
- 👥 **Multi-user Support** — Multiple users can run the bot with completely isolated data, accounts, and budgets
- 🔄 **Flexible Setup** — Customize income sources, spending categories, accounts, and bills to suit your needs
- 🗑️ **Data Reset** — Easily wipe your spreadsheet and user data to start fresh

### 👑 **Admin Features**
- 📢 **Broadcast Messages** — Send announcements or updates to all registered users at once (via Settings menu or `/broadcast`)
- 🔧 **Broadcast Templates** — Ready-to-use templates: Maintenance, Feature Update, Warning, Announcement
- ✍️ **Custom Messages** — Write free-form broadcast messages with full Markdown formatting support
- 👑 **Admin Panel** — Admin dashboard: user statistics, broadcast controls, bot info
- 📊 **User Statistics** — View total users, active users, and language breakdown
- 🔒 **Protected Access** — Admin menu only appears when `BOT_ADMIN_ID` is set and matches the requesting user

---

## 📋 Monthly Sheet Structure

Each month, the bot automatically creates a new sheet named after the month (e.g., "May 2026") using a professional layout:

### **Left Side (Dashboard & Setup)**
| Section | Description |
|---------|-------------|
| **Monthly Statement** | Summary of total income, expenses, net, and savings rate |
| **Transaction Methods** | Real-time balance for each account/wallet |
| **Bills** | List of monthly recurring bills to pay |
| **Sinking Fund** | Emergency fund & target savings goals |
| **Spendings** | Total spending per category + budget progress |
| **Installments/Debts** | List of debts alongside repayment progress |
| **Receivables** | List of money loaned out alongside collection progress |

### **Right Side (Transaction Log - Columns H-N)**
A complete log table of all transactions featuring the following columns:
- **Date** — Date of transaction
- **Transaction** — Transaction description
- **Amount** — Nominal amount (in Rupiah or local currency)
- **Cashflow** — Type of flow (Income/Expense/Bills/Debt/Receivable/etc.)
- **Category** — Spending or income category
- **Dari Account (From Account)** — Source account
- **Ke Account (To Account)** — Destination account

---

## 🎯 How the Bot Works

### **Main Menu (Interactive Keyboards)**
```
💰 Income        →  Record earnings from various sources
💸 Expense       →  Record spendings per category
↔️ Transfer      →  Transfer money between accounts
📋 Others        →  Bills, Debts, Receivables, Sinking Funds
📊 Reports       →  Monthly Report, Category Analysis, AI Insights
💳 Balance       →  View balances across all accounts
📈 Budget Setup  →  Set category budgets & view progress
🤖 AI Chat       →  Chat in natural language to record transactions
⚙️ Settings      →  Customize accounts, categories, income sources, language
```

### **Admin Settings Menu (only visible to the admin)**
```
📢 Broadcast     →  Open the broadcast panel directly
👑 Admin Panel   →  Admin dashboard (stats, broadcast, bot info)
```

### **Admin Commands**
```
/broadcast           →  Open the broadcast menu
/broadcast <message> →  Send a broadcast message directly (shortcut)
```

### **Usage Examples (AI Chat Feature)**
Users can message the bot directly using natural language:
- *"Paid 15k for lunch at warteg from BCA"* → Bot parses & records the expense
- *"Transfer 100k from Gopay to BCA"* → Bot handles the transfer
- *"Salary of 5 million received in BRI today"* → Bot logs the income

---

## 📱 How to Use

### Main Menu
- **💰 Income** — Log your income
- **💸 Expense** — Log your spendings
- **↔️ Transfer** — Move funds between accounts
- **📋 Others** — Manage bills, debts, and receivables
- **📊 Reports** — Access various financial reports and insights
- **💳 Balance** — Check real-time balances for all accounts
- **🤖 AI Chat** — Direct natural chat with AI (Gemini/ChatGPT/Groq)
- **⚙️ Settings** — Configure your preferences and options

### AI Chat
Type transactions using everyday language:
- `"bought lunch for 25k using Gopay"`
- `"salary of 5m entered BCA"`
- `"transfer 100k from SeaBank to Gopay"`
- `"how is my budget looking this month?"`

---

## 📂 Folder Structure

```
MoneyFlowIDBot/
├── index.js                 # Entry point + routing
├── .env                     # Sensitive environment variables (ignored by git)
├── .env.example             # Template for .env configuration
├── config/
│   └── defaults.js          # Default config templates (accounts, categories, etc.)
├── handlers/
│   ├── menu.js              # Keyboard menu builders
│   ├── phrasing.js          # Shared AI prompts & phrasing guidelines
│   ├── start.js             # Onboarding flow & /start command
│   ├── setup.js             # Financial initialization wizard
│   ├── transaction.js       # Manual transaction recording flows
│   ├── report.js            # Reports, analytics & AI insights handler
│   └── broadcast.js         # Admin broadcast & admin panel handler
├── locales/
│   ├── id.js                # Indonesian translations
│   ├── en.js                # English translations
│   └── index.js             # Localization helper & loader
├── middleware/
│   └── session.js           # Lightweight state management session middleware
├── services/
│   ├── aiRouter.js          # Unified AI router (handles Gemini/ChatGPT/Groq)
│   ├── gemini.js            # Google Gemini AI API integration
│   ├── chatgpt.js           # OpenAI ChatGPT API integration
│   ├── groq.js              # Groq Llama API integration
│   ├── logger.js            # Logger utility (writes to file + console output)
│   ├── sheets.js            # Google Sheets API wrapper & spreadsheet initialization
│   └── userStore.js         # User profile persistent data layer (JSON-based)
├── logs/                    # Daily operational logs (auto-generated, ignored by git)
├── credentials/
│   └── google-credentials.json  # Google Service Account Credentials (NEVER commit this!)
└── data/
    └── {userId}.json        # User profile JSON stores
```

---

## ⚙️ Cashflow Types & Transaction Flows

| Type | Description | Source → Destination | Example |
|------|-------------|----------------------|---------|
| **Income** | Earning funds from a source | Source → Account | Salary received in BCA |
| **Expense** | Spending funds on a category | Account → Category | Bought food with Gopay |
| **Transfer** | Transferring between accounts | Account → Account | Move funds from BCA to Gopay |
| **Bills** | Paying monthly recurring bills | Account → Bill | Pay Netflix using BCA |
| **New Receivable** | Loaning money to someone | Account → Person | Loaned 500k to a friend |
| **Receivable Repayment** | Receiving loaned money back | Person → Account | Friend paid back 500k |
| **New Debt** | Borrowing money from someone | Person → Account | Borrowed 2m from parents |
| **Debt Repayment** | Repaying borrowed money | Account → Person | Paid back 500k to parents |
| **Sinking Fund** | Allocating specific savings | Account → Goal | Saved for vacation |
| **Financial Goals** | Financial target allocation | Account → Target | Allocated for investment |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Bot Framework** | `node-telegram-bot-api` |
| **AI / NLP engine** | Gemini, ChatGPT (OpenAI), Groq (Llama) — with auto-fallback |
| **Database** | Google Sheets API (via `googleapis`) |
| **Runtime Environment** | Node.js 18+ |
| **Local Storage** | Flat JSON files |
| **Scheduler** | `node-cron` |
| **Environment Variable Management** | `dotenv` |

---

## 📖 API & Data Reference

### User Data Structure
```javascript
{
  userId: "string",
  name: "string",
  username: "string",
  lang: "id" | "en",
  spreadsheetId: "string",
  setupComplete: boolean,
  setupStep: "string",
  incomeSources: [{ name, emoji, active }],
  accounts: [{ name, emoji, type, initialBalance, balance }],
  spendingCategories: [{ name, emoji }],
  bills: [{ name, emoji, amount, dueDay }]
}
```

### Transaction Types
```
- income              (Earnings)
- expense             (Spendings)
- bills               (Recurring Bills)
- savings             (Savings / Investments)
- transfer            (Inter-account Transfer)
- utang               (New Debt / Borrowing)
- pelunasan_utang     (Debt Repayment)
- piutang             (New Receivable / Loan Out)
- pelunasan_piutang   (Receivable Collection)
```

---

## 🐛 Troubleshooting

### Bot is not responding
- ✅ Check if `TELEGRAM_BOT_TOKEN` is correctly configured in `.env`
- ✅ Check your internet connection or server network status
- ✅ Open the logs or console output to check for runtime errors

### Error: "Spreadsheet not found"
- ✅ Ensure that your `SPREADSHEET_ID` is set correctly
- ✅ Make sure that you have shared your Google Spreadsheet with the Service Account email address as an **Editor**
- ✅ Open the spreadsheet in a browser to manually verify permissions

### Error: "Invalid API key"
- ✅ Validate the `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY` values in `.env`
- ✅ Make sure the API key is active and has not expired
- ✅ Check API quota and usage limits on the provider's console

### Transactions not logging
- ✅ Verify if the initial setup is fully completed (`/settings` → Setup Check)
- ✅ Inspect console or log files for direct API or formatting errors
- ✅ Make sure the current month's sheet has been successfully created
- ✅ Re-attempt to log using clear and explicit phrasing

---

## 💡 Tips & Best Practices

### 1. **Log Transactions Immediately**
Log your expenses immediately after making them so your spreadsheet stays precise and your memory is fresh.

### 2. **Leverage the AI Chat**
Natural language entry is much faster and more streamlined than navigating menus, dropdowns, and manual prompt flows.

### 3. **Perform Regular Reviews**
Check category budgets and spending breakdowns weekly for early detection of overspending.

### 4. **Set Realistic Budgets**
Excessively tight budgets usually lead to tracking fatigue. Leverage your historical data to set realistic spending ceilings.

### 5. **Backup Your Spreadsheet**
Export your spreadsheet as an Excel or PDF file monthly to keep offline archival backups.

---

## 🚀 Installation & Setup Guide

> This guide is applicable for **VPS (Linux)**, **Windows Server**, and **Home Mini Servers** (Raspberry Pi, mini PCs, etc.).

---

### 1. Prerequisites

Make sure you have:
- A **Telegram** account
- A **Google** account (for Google Sheets API access)
- **Gemini API Key** — available for free at [Google AI Studio](https://aistudio.google.com)
- **ChatGPT API Key** *(optional)* — from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Groq API Key** *(optional)* — available for free at [Groq Console](https://console.groq.com/keys)
- Terminal / command prompt access to your host machine or server

---

### 2. Install Node.js

#### 🐧 Linux (Ubuntu/Debian VPS or Home Server)
```bash
# Install Node.js v18 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify the installation
node -v   # must be v18.0.0 or higher
npm -v
```

#### 🪟 Windows (Server / Desktop)
1. Download the installer from [nodejs.org](https://nodejs.org) — choose the **LTS (v18+)** version.
2. Run the executable and complete the setup wizard.
3. Open your **Command Prompt** or **PowerShell** and verify:
   ```powershell
   node -v
   npm -v
   ```

---

### 3. Install Git & Clone Repository

#### 🐧 Linux
```bash
# Install Git if not already available
sudo apt-get install -y git

# Clone the repository and change directory
git clone https://github.com/ikhsanh/MoneyFlowIDBot.git
cd MoneyFlowIDBot
```

#### 🪟 Windows
1. Download and install **Git** from [git-scm.com](https://git-scm.com).
2. Open **Command Prompt** or **PowerShell**:
   ```powershell
   git clone https://github.com/ikhsanh/MoneyFlowIDBot.git
   cd MoneyFlowIDBot
   ```

---

### 4. Install Dependencies

```bash
npm install
```

---

### 5. Create a Telegram Bot

1. Initiate a conversation with [@BotFather](https://t.me/BotFather) on Telegram.
2. Send the `/newbot` command.
3. Follow the instructions to choose a name and username, then save your secure **Bot Token**.

---

### 6. Configure a Google Service Account

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (or select an existing one).
3. Enable the **Google Sheets API**:
   - Go to **APIs & Services** → **Library** → search for "Google Sheets API" → click **Enable**.
4. Create a Service Account:
   - Go to **APIs & Services** → **Credentials** → click **Create Credentials** → **Service Account**.
   - Input your service account name, then click **Create & Continue**.
5. Download the JSON key file:
   - Click on your newly created Service Account.
   - Go to the **Keys** tab → click **Add Key** → select **Create new key** → choose **JSON**.
   - A `.json` file containing your credentials will automatically download.
6. **Move the JSON file** into your project directory:
   ```bash
   # Linux
   cp ~/Downloads/your-key.json credentials/google-credentials.json

   # Windows (PowerShell)
   copy C:\Users\YourName\Downloads\your-key.json credentials\google-credentials.json
   ```
7. **Copy the Service Account email address** (looks like: `bot-name@project-id.iam.gserviceaccount.com`).

---

### 7. Initialize Google Spreadsheet

1. Create a brand-new spreadsheet at [Google Sheets](https://sheets.google.com).
2. **Share your spreadsheet** with the Service Account email address, granting it **Editor** permissions:
   - Click the **Share** button → paste the Service Account email → choose **Editor** role → click **Send**.
3. **Copy the Spreadsheet ID** located in your browser's address bar URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID_IS_HERE]/edit
   ```

---

### 8. Set Up Environment Variables (.env)

```bash
# Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Open `.env` in a text editor (such as nano, vim, or Notepad) and configure your secrets:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Google AI (Gemini) — Required
GEMINI_API_KEY=your_gemini_api_key_here

# ChatGPT / OpenAI — Optional
OPENAI_API_KEY=your_openai_api_key_here

# Groq / Llama — Optional
GROQ_API_KEY=your_groq_api_key_here

# Google Credentials Path
GOOGLE_CREDENTIALS_PATH=./credentials/google-credentials.json

# Bot Admin ID (optional — enables Broadcast & Admin Panel features)
# Find your Telegram User ID by messaging @userinfobot on Telegram
BOT_ADMIN_ID=your_telegram_user_id_here

# Timezone (for automated daily/monthly scheduler)
TIMEZONE=Asia/Jakarta

# Log Level (debug / info / warn / error)
LOG_LEVEL=info
```

> 💡 **Admin Note**: Set `BOT_ADMIN_ID` to your numeric Telegram User ID (not your username). Once configured, the **📢 Broadcast** and **👑 Admin Panel** buttons will automatically appear inside the Settings menu.

---

### 9. Launch & Test the Bot

```bash
node index.js
```

Expected startup logs:
```
🚀 MoneyFlowID Bot starting...
✅ Bot @YourBotName is running!
```

Once running successfully, press `Ctrl+C` to terminate the process and proceed to daemonizing the bot in the production guide below.

---

### 10. Direct Telegram Registration Setup

1. Open Telegram and search for your bot's username.
2. Send the `/start` command to initialize the greeting flow.
3. Select your preferred system language (**EN** or **ID**).
4. Enter your copied **Spreadsheet ID** when prompted.
5. Walk through the brief configuration steps for income sources, accounts, spending categories, and recurring bills.
6. Voila! Your dashboard and logs sheet for the current month will be created automatically! 🎉

---

## 🖥️ Deploying & Keeping the Bot Running

Select your preferred deployment method matching your operating system:

### 🔵 Using PM2 (Recommended — Linux & Windows)

PM2 is the leading process manager for Node.js. It ensures your bot **automatically restarts** in the event of a crash or server reboot.

```bash
# Install PM2 globally
npm install -g pm2

# Start your bot process
pm2 start index.js --name "moneyflow-bot"

# Save the process list to revive on boot
pm2 save
pm2 startup
```

Useful PM2 utility commands:
```bash
pm2 status                    # Check active bot status
pm2 logs moneyflow-bot        # Monitor log output
pm2 restart moneyflow-bot     # Restart the bot
pm2 stop moneyflow-bot        # Stop the bot
```

---

### 🐧 Linux — Systemd Service (Alternative to PM2)

Create a systemd unit service file:
```bash
sudo nano /etc/systemd/system/moneyflowid-bot.service
```

Add the following configuration:
```ini
[Unit]
Description=MoneyFlowID Telegram Bot Service
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/MoneyFlowIDBot
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
EnvironmentFile=/home/your-username/MoneyFlowIDBot/.env

[Install]
WantedBy=multi-user.target
```

> Remember to replace `your-username` with your actual Linux user account name (find this by typing `whoami`).

Enable and start the service daemon:
```bash
sudo systemctl daemon-reload
sudo systemctl enable moneyflowid-bot
sudo systemctl start moneyflowid-bot

# Monitor status and sanity checks
sudo systemctl status moneyflowid-bot
```

---

### 🪟 Windows — Task Scheduler Setup

1. Search and open **Task Scheduler** from the Start Menu.
2. Click on **Create Basic Task** in the right panel → Name: `MoneyFlowID Bot`.
3. **Trigger**: Select `When the computer starts`.
4. **Action**: Choose `Start a program`.
   - Program/script: `node`
   - Add arguments (optional): `index.js`
   - Start in (optional): `C:\path\to\MoneyFlowIDBot` *(provide the absolute path to your cloned project folder)*
5. Click **Finish** to complete.

> 💡 **Tip**: PM2 runs exceptionally well on Windows servers, too! We highly recommend using PM2 over Task Scheduler as it supports seamless process monitoring and auto-recovery.

---

## 📞 Support & Feedback

- 🐛 **Found a bug?** Open an issue on our repository.
- 💡 **Have a feature idea?** Start a thread in GitHub Discussions.
- 💬 **Need quick help?** Reach out using the bot's `/help` command.

---

## 📄 License

MIT License — Free to use, customize, and distribute as long as original attribution is maintained.

---

## 👨‍💻 Author & Contributors

**MoneyFlowID Bot** — Personal Finance Tracking Bot made with ❤️

Developed by: [@ikhsanh](https://github.com/ikhsanh)  
Powered by: Node.js • Google Sheets • Gemini AI • Telegram

---

**Happy Budgeting! 💰✨**
