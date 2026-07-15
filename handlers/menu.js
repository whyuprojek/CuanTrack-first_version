/**
 * Menu Keyboard Builder
 * MoneyFlowID Bot
 */

const { getUser } = require('../services/userStore');

/**
 * Keyboard pilihan bahasa
 */
function languageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🇮🇩 Bahasa Indonesia', callback_data: 'lang:id' },
        { text: '🇬🇧 English', callback_data: 'lang:en' },
      ],
    ],
  };
}

/**
 * Keyboard menu utama
 */
function mainMenuKeyboard(lang = 'id') {
  const isId = lang === 'id';
  return {
    inline_keyboard: [
      [
        { text: isId ? '💰 Pemasukan' : '💰 Income', callback_data: 'menu:income' },
        { text: isId ? '💸 Pengeluaran' : '💸 Spending', callback_data: 'menu:expense' },
      ],
      [
        { text: isId ? '↔️ Transfer' : '↔️ Transfer', callback_data: 'menu:transfer' },
        { text: isId ? '📋 Lainnya' : '📋 Other', callback_data: 'menu:other' },
      ],
      [
        { text: isId ? '📊 Laporan' : '📊 Reports', callback_data: 'menu:report' },
        { text: isId ? '💳 Saldo' : '💳 Balance', callback_data: 'menu:balance' },
      ],
      [
        { text: isId ? '📈 Atur Budget' : '📈 Set Budget', callback_data: 'menu:budget' },
        { text: isId ? '🤖 AI Chat' : '🤖 AI Chat', callback_data: 'menu:ai' },
      ],
      [
        { text: isId ? '⚙️ Pengaturan' : '⚙️ Settings', callback_data: 'menu:settings' },
      ],
    ],
  };
}

/**
 * Keyboard setup income sources
 * @param {Array} selected - nama sumber yang sudah dipilih
 * @param {Array} defaults - list default
 * @param {string} lang
 */
function incomeSourcesKeyboard(selected, defaults, lang = 'id') {
  const isId = lang === 'id';
  const buttons = defaults.map((src) => {
    const isSelected = selected.some((s) => s.name.toLowerCase() === src.name.toLowerCase());
    return [{ text: `${isSelected ? '✅' : '⬜'} ${src.emoji} ${src.name}`, callback_data: `setup_income:toggle:${src.name}` }];
  });

  // Tambah custom yang sudah ada tapi bukan dari defaults
  const customSelected = selected.filter(
    (s) => !defaults.some((d) => d.name.toLowerCase() === s.name.toLowerCase())
  );
  customSelected.forEach((s) => {
    buttons.push([{ text: `✅ ${s.emoji || '💰'} ${s.name} ❌`, callback_data: `setup_income:remove:${s.name}` }]);
  });

  buttons.push([{ text: isId ? '➕ Tambah Baru' : '➕ Add New', callback_data: 'setup_income:add' }]);
  buttons.push([{ text: isId ? '✅ Selesai' : '✅ Done', callback_data: 'setup_income:done' }]);

  return { inline_keyboard: buttons };
}

/**
 * Keyboard setup accounts
 * @param {Array} selected - akun yang sudah dipilih (array of {name, balance})
 * @param {Array} defaults - list default accounts
 * @param {string} lang
 */
function accountsKeyboard(selected, defaults, lang = 'id') {
  const isId = lang === 'id';
  const buttons = defaults.map((acc) => {
    const isSelected = selected.some((s) => s.name.toLowerCase() === acc.name.toLowerCase());
    return [{
      text: `${isSelected ? '✅' : '⬜'} ${acc.emoji} ${acc.name}`,
      callback_data: `setup_acct:toggle:${acc.name}`,
    }];
  });

  // Custom accounts
  const customAccounts = selected.filter(
    (s) => !defaults.some((d) => d.name.toLowerCase() === s.name.toLowerCase())
  );
  customAccounts.forEach((a) => {
    buttons.push([{ text: `✅ 🏦 ${a.name} ❌`, callback_data: `setup_acct:remove:${a.name}` }]);
  });

  buttons.push([{ text: isId ? '➕ Tambah Akun Baru' : '➕ Add New Account', callback_data: 'setup_acct:add_custom' }]);
  buttons.push([{ text: isId ? '✅ Selesai' : '✅ Done', callback_data: 'setup_acct:done' }]);

  return { inline_keyboard: buttons };
}

/**
 * Keyboard setup spending categories
 */
function spendingKeyboard(selected, defaults, lang = 'id') {
  const isId = lang === 'id';
  const buttons = defaults.map((cat) => {
    const isSelected = selected.some((s) => s.name.toLowerCase() === cat.name.toLowerCase());
    return [{
      text: `${isSelected ? '✅' : '⬜'} ${cat.emoji} ${cat.name}`,
      callback_data: `setup_spending:toggle:${cat.name}`,
    }];
  });

  const customSelected = selected.filter(
    (s) => !defaults.some((d) => d.name.toLowerCase() === s.name.toLowerCase())
  );
  customSelected.forEach((s) => {
    buttons.push([{ text: `✅ ${s.emoji || '📦'} ${s.name} ❌`, callback_data: `setup_spending:remove:${s.name}` }]);
  });

  buttons.push([{ text: isId ? '➕ Tambah Baru' : '➕ Add New', callback_data: 'setup_spending:add' }]);
  buttons.push([{ text: isId ? '✅ Selesai' : '✅ Done', callback_data: 'setup_spending:done' }]);

  return { inline_keyboard: buttons };
}

/**
 * Keyboard menu setup bills
 */
function billsMenuKeyboard(bills, lang = 'id') {
  const isId = lang === 'id';
  const buttons = bills.map((bill) => [
    { text: `📅 ${bill.name} — Rp ${Math.round(bill.amount).toLocaleString('id-ID')} (tgl ${bill.dueDay})`, callback_data: `setup_bill:view:${bill.name}` },
    { text: '❌', callback_data: `setup_bill:remove:${bill.name}` },
  ]);

  buttons.push([{ text: isId ? '➕ Tambah Tagihan' : '➕ Add Bill', callback_data: 'setup_bill:add' }]);
  buttons.push([{ text: isId ? '✅ Selesai' : '✅ Done', callback_data: 'setup_bill:done' }]);

  return { inline_keyboard: buttons };
}

/**
 * Keyboard pemilihan akun (untuk transaksi)
 */
function accountSelectKeyboard(accounts, callbackPrefix, lang = 'id') {
  const buttons = accounts.map((acc) => [
    {
      text: `${acc.emoji || '🏦'} ${acc.name} — Rp ${Math.round(acc.balance || 0).toLocaleString('id-ID')}`,
      callback_data: `${callbackPrefix}:${acc.name}`,
    },
  ]);
  buttons.push([{ text: lang === 'id' ? '❌ Batalkan' : '❌ Cancel', callback_data: 'cancel' }]);
  return { inline_keyboard: buttons };
}

/**
 * Keyboard pemilihan income source
 */
function incomeSourceSelectKeyboard(sources, lang = 'id') {
  const buttons = sources.map((src) => [
    { text: `${src.emoji || '💰'} ${src.name}`, callback_data: `income_src:${src.name}` },
  ]);
  buttons.push([{ text: lang === 'id' ? '❌ Batalkan' : '❌ Cancel', callback_data: 'cancel' }]);
  return { inline_keyboard: buttons };
}

/**
 * Keyboard pemilihan kategori pengeluaran
 */
function spendingCategorySelectKeyboard(categories, lang = 'id') {
  // 2 columns
  const buttons = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = [
      { text: `${categories[i].emoji || '📦'} ${categories[i].name}`, callback_data: `expense_cat:${categories[i].name}` },
    ];
    if (categories[i + 1]) {
      row.push({ text: `${categories[i + 1].emoji || '📦'} ${categories[i + 1].name}`, callback_data: `expense_cat:${categories[i + 1].name}` });
    }
    buttons.push(row);
  }
  buttons.push([{ text: lang === 'id' ? '❌ Batalkan' : '❌ Cancel', callback_data: 'cancel' }]);
  return { inline_keyboard: buttons };
}

/**
 * Keyboard konfirmasi transaksi (simpan/batalkan)
 */
function confirmKeyboard(confirmCb, lang = 'id') {
  const isId = lang === 'id';
  return {
    inline_keyboard: [
      [
        { text: isId ? '✅ Simpan' : '✅ Save', callback_data: confirmCb },
        { text: isId ? '❌ Batalkan' : '❌ Cancel', callback_data: 'cancel' },
      ],
    ],
  };
}

/**
 * Keyboard laporan
 */
function reportKeyboard(lang = 'id') {
  const isId = lang === 'id';
  return {
    inline_keyboard: [
      [
        { text: isId ? '📅 Bulanan' : '📅 Monthly', callback_data: 'report:monthly' },
        { text: isId ? '🗂️ Per Kategori' : '🗂️ By Category', callback_data: 'report:category' },
      ],
      [
        { text: isId ? '💳 Saldo Akun' : '💳 Balances', callback_data: 'report:balance' },
        { text: isId ? '📋 Tagihan' : '📋 Bills', callback_data: 'report:bills' },
      ],
      [
        { text: isId ? '🤖 Insight AI' : '🤖 AI Insight', callback_data: 'report:insight' },
        { text: isId ? '📊 Summary' : '📊 Summary', callback_data: 'report:summary' },
      ],
      [
        { text: isId ? '◀️ Menu Utama' : '◀️ Main Menu', callback_data: 'menu:main' },
      ],
    ],
  };
}

/**
 * Keyboard pengaturan
 */
function settingsKeyboard(lang = 'id', isAdmin = false) {
  const isId = lang === 'id';
  const rows = [
    [{ text: isId ? '🌐 Ubah Bahasa' : '🌐 Change Language', callback_data: 'settings:language' }],
    [{ text: isId ? '🤖 Pilih AI Service' : '🤖 Choose AI Service', callback_data: 'settings:ai' }],
    [{ text: isId ? '💼 Kelola Sumber Income' : '💼 Manage Income Sources', callback_data: 'settings:income' }],
    [{ text: isId ? '💳 Kelola Akun' : '💳 Manage Accounts', callback_data: 'settings:accounts' }],
    [{ text: isId ? '🛍️ Kelola Kategori' : '🛍️ Manage Categories', callback_data: 'settings:spending' }],
    [{ text: isId ? '📅 Kelola Tagihan' : '📅 Manage Bills', callback_data: 'settings:bills' }],
    [{ text: isId ? '📊 Ganti Spreadsheet' : '📊 Change Spreadsheet', callback_data: 'settings:spreadsheet' }],
    [{ text: isId ? '🗑️ Reset Data Saya' : '🗑️ Reset My Data', callback_data: 'settings:reset' }],
  ];

  // Tampilkan menu admin hanya untuk admin bot
  if (isAdmin) {
    rows.push([
      { text: '📢 Broadcast', callback_data: 'settings:broadcast' },
      { text: '👑 Panel Admin', callback_data: 'settings:admin' },
    ]);
  }

  rows.push([{ text: isId ? '◀️ Kembali' : '◀️ Back', callback_data: 'menu:main' }]);
  return { inline_keyboard: rows };
}

/**
 * Keyboard tagihan (untuk mark paid)
 */
function billsActionKeyboard(bills, lang = 'id') {
  const isId = lang === 'id';
  const buttons = bills
    .filter((b) => b.active)
    .map((bill) => {
      const icon = bill.paidThisMonth ? '✅' : '⏰';
      const text = `${icon} ${bill.name} — Rp ${Math.round(bill.amount).toLocaleString('id-ID')} (tgl ${bill.dueDay})`;
      return [{ text, callback_data: bill.paidThisMonth ? `bill:unpay:${bill.name}` : `bill:pay:${bill.name}` }];
    });

  buttons.push([{ text: isId ? '◀️ Kembali' : '◀️ Back', callback_data: 'menu:main' }]);
  return { inline_keyboard: buttons };
}

/**
 * Keyboard konfirmasi AI transaction
 */
function aiConfirmKeyboard(lang = 'id') {
  const isId = lang === 'id';
  return {
    inline_keyboard: [
      [
        { text: isId ? '✅ Ya, Simpan' : '✅ Yes, Save', callback_data: 'ai:confirm' },
        { text: isId ? '✏️ Edit' : '✏️ Edit', callback_data: 'ai:edit' },
        { text: isId ? '❌ Batal' : '❌ Cancel', callback_data: 'ai:cancel' },
      ],
    ],
  };
}

/**
 * Tombol kembali ke menu
 */
function backToMenuKeyboard(lang = 'id') {
  return {
    inline_keyboard: [
      [{ text: lang === 'id' ? '◀️ Menu Utama' : '◀️ Main Menu', callback_data: 'menu:main' }],
    ],
  };
}

/**
 * Keyboard menu "Lainnya" (transaksi khusus)
 */
function otherTransactionKeyboard(lang = 'id') {
  const isId = lang === 'id';
  return {
    inline_keyboard: [
      [
        { text: isId ? '📅 Bayar Tagihan' : '📅 Pay Bills', callback_data: 'menu:pay_bills' },
      ],
      [
        { text: isId ? '💼 Piutang Baru' : '💼 New Receivable', callback_data: 'menu:piutang_baru' },
        { text: isId ? '✅ Lunas Piutang' : '✅ Settle Receivable', callback_data: 'menu:lunas_piutang' },
      ],
      [
        { text: isId ? '💳 Utang Baru' : '💳 New Debt', callback_data: 'menu:utang_baru' },
        { text: isId ? '✅ Bayar Utang' : '✅ Pay Debt', callback_data: 'menu:lunas_utang' },
      ],
      [
        { text: isId ? '◀️ Kembali' : '◀️ Back', callback_data: 'menu:main' },
      ],
    ],
  };
}

/**
 * Keyboard pilihan tagihan untuk dibayar
 */
function billSelectKeyboard(bills, lang = 'id') {
  const buttons = bills.map((bill) => [{
    text: `📅 ${bill.name} — Rp ${Math.round(bill.amount || 0).toLocaleString('id-ID')} (tgl ${bill.dueDay})`,
    callback_data: `bill_pay_select:${bill.name}`,
  }]);
  buttons.push([{ text: lang === 'id' ? '❌ Batalkan' : '❌ Cancel', callback_data: 'cancel' }]);
  return { inline_keyboard: buttons };
}

/**
 * Placeholder — untuk input teks bebas
 */
function textInputKeyboard(lang = 'id') {
  return {
    inline_keyboard: [
      [{ text: lang === 'id' ? '❌ Batalkan' : '❌ Cancel', callback_data: 'cancel' }],
    ],
  };
}

/**
 * Keyboard pilih AI service
 */
function aiServiceKeyboard(currentService = 'gemini', lang = 'id') {
  const isId = lang === 'id';
  const options = [
    { key: 'gemini', label: '🟣 Gemini (Google)' },
    { key: 'chatgpt', label: '🟢 ChatGPT (OpenAI)' },
    { key: 'groq', label: '🟠 Groq (Llama)' },
  ];
  const buttons = options.map(o => [{
    text: `${o.key === currentService ? '✅ ' : ''}${o.label}`,
    callback_data: `settings:ai:${o.key}`,
  }]);
  buttons.push([{ text: isId ? '◀️ Kembali' : '◀️ Back', callback_data: 'menu:settings' }]);
  return { inline_keyboard: buttons };
}

module.exports = {
  languageKeyboard,
  mainMenuKeyboard,
  otherTransactionKeyboard,
  cashflowKeyboard: otherTransactionKeyboard, // alias
  incomeSourcesKeyboard,
  accountsKeyboard,
  spendingKeyboard,
  billsMenuKeyboard,
  billSelectKeyboard,
  accountSelectKeyboard,
  incomeSourceSelectKeyboard,
  spendingCategorySelectKeyboard,
  confirmKeyboard,
  reportKeyboard,
  settingsKeyboard,
  billsActionKeyboard,
  aiConfirmKeyboard,
  aiServiceKeyboard,
  backToMenuKeyboard,
  textInputKeyboard,
};
