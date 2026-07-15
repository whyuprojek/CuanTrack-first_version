/**
 * Default data untuk pengguna baru / Default data for new users
 * MoneyFlowID Bot
 */

const DEFAULTS = {
  /**
   * Sumber pendapatan default / Default income sources
   */
  incomeSources: [
    { name: 'Gaji', nameEn: 'Salary', emoji: '💼' },
    { name: 'Freelance', nameEn: 'Freelance', emoji: '💻' },
    { name: 'Laba Dagang', nameEn: 'Business Profit', emoji: '🏪' },
    { name: 'Investasi', nameEn: 'Investment', emoji: '📈' },
    { name: 'Lainnya', nameEn: 'Others', emoji: '💰' },
  ],

  /**
   * Akun / Dompet default / Default bank accounts & e-wallets
   */
  accounts: [
    { name: 'BCA', type: 'bank', emoji: '🏦' },
    { name: 'BRI', type: 'bank', emoji: '🏦' },
    { name: 'SeaBank', type: 'bank', emoji: '🏦' },
    { name: 'Gopay', type: 'ewallet', emoji: '💚' },
    { name: 'ShopeePay', type: 'ewallet', emoji: '🧡' },
    { name: 'OVO', type: 'ewallet', emoji: '💜' },
    { name: 'Jago', type: 'bank', emoji: '🏦' },
    { name: 'BluBCA', type: 'bank', emoji: '🔵' },
    { name: 'Livin Mandiri', type: 'bank', emoji: '🏦' },
    { name: 'Cash', type: 'cash', emoji: '💵' },
    { name: 'Dana', type: 'ewallet', emoji: '🔷' },
    { name: 'Flip', type: 'ewallet', emoji: '🟢' },
  ],

  /**
   * Kategori pengeluaran default / Default spending categories
   */
  spendingCategories: [
    { name: 'Makan/Minum', nameEn: 'Food & Drinks', emoji: '🍔' },
    { name: 'Transport', nameEn: 'Transport', emoji: '🚗' },
    { name: 'Belanja', nameEn: 'Shopping', emoji: '🛍️' },
    { name: 'Pulsa/Paket Data', nameEn: 'Mobile Credit', emoji: '📱' },
    { name: 'Service Motor', nameEn: 'Motorcycle Service', emoji: '🔧' },
    { name: 'Ortu', nameEn: 'Parents', emoji: '👨‍👩‍👧' },
    { name: 'Modal', nameEn: 'Capital', emoji: '💰' },
    { name: 'Hiburan', nameEn: 'Entertainment', emoji: '🎮' },
    { name: 'Kesehatan', nameEn: 'Healthcare', emoji: '🏥' },
    { name: 'Pendidikan', nameEn: 'Education', emoji: '📚' },
    { name: 'Lainnya', nameEn: 'Others', emoji: '📦' },
  ],

  /**
   * Contoh tagihan bulanan / Example monthly bills
   */
  billExamples: [
    { name: 'Netflix', emoji: '🎬', category: 'hiburan' },
    { name: 'YouTube Premium', emoji: '▶️', category: 'hiburan' },
    { name: 'Spotify', emoji: '🎵', category: 'hiburan' },
    { name: 'Internet/WiFi', emoji: '📡', category: 'utilitas' },
    { name: 'Listrik', emoji: '⚡', category: 'utilitas' },
    { name: 'Air', emoji: '💧', category: 'utilitas' },
  ],

  /**
   * Nama sheet di Google Spreadsheet
   */
  sheetNames: {
    transactions: 'Transaksi',
    accounts: 'Akun',
    incomeSources: 'Sumber Income',
    spendingCategories: 'Kategori Pengeluaran',
    bills: 'Tagihan',
    monthlySummary: 'Ringkasan Bulanan',
    dashboard: 'Dashboard',
  },
};

module.exports = DEFAULTS;
