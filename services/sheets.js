/**
 * Google Sheets Service — Monthly Template Layout
 * MoneyFlowID Bot
 *
 * Setiap bulan punya 1 sheet tersendiri (format: "January 2026")
 * dengan layout persis seperti template keuangan.
 */

require('dotenv').config();
const { google } = require('googleapis');
const { createLogger } = require('./logger');

const log = createLogger('Sheets');
const path = require('path');

// =============================================
// CONSTANTS
// =============================================

const MONTH_NAMES_EN = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Row positions (1-indexed) — fixed layout positions
const R = {
  TITLE: 1,
  SALDO_AWAL: 3,
  MONTHLY_STMT: 5,
  INCOME: 6,
  DARI_ASSET: 7,
  INVEST: 8,
  BILLS_PAID: 9,
  SINKING: 10,
  FIN_GOALS: 11,
  CICILAN: 12,
  PIUTANG_STMT: 13,
  TOTAL_SPENDING: 14,
  SISA_UANG: 15,

  TX_METHODS: 17,
  TX_METHODS_HDR: 18,
  ACCT_START: 19,
  ACCT_MAX: 15,            // max 15 account rows

  BILLS_SECTION: 35,
  BILLS_HDR: 36,
  BILLS_START: 37,
  BILLS_MAX: 15,

  SINKING_SECTION: 53,
  SINKING_HDR: 54,
  SINKING_START: 55,
  SINKING_MAX: 10,

  SPENDING_SECTION: 66,
  SPENDING_HDR: 67,
  SPENDING_START: 68,
  SPENDING_MAX: 30,
  SPENDING_TOTAL: 98,

  UTANG_SECTION: 100,
  UTANG_NOTE: 101,
  UTANG_HDR: 102,
  UTANG_START: 103,
  UTANG_MAX: 15,
  UTANG_TOTAL: 118,

  PIUTANG_SECTION: 120,
  PIUTANG_NOTE: 121,
  PIUTANG_HDR: 122,
  PIUTANG_START: 123,
  PIUTANG_MAX: 15,
  PIUTANG_KELUAR: 139,
  PIUTANG_MASUK: 140,
};

// Transaction table column letters (right side of sheet)
const TX = {
  DATE: 'H',      // col 8
  NAME: 'I',      // col 9
  AMOUNT: 'J',    // col 10
  CASHFLOW: 'K',  // col 11
  CATEGORY: 'L',  // col 12
  DARI: 'M',      // col 13
  KE: 'N',        // col 14
};

// SUMIF range helpers — pakai whole-column reference agar tidak terbatas jumlah baris
// Locale in_ID (Indonesia) menggunakan titik koma (;) sebagai separator formula
// Bukan koma (,) seperti locale en_US
const TXR = {
  CASHFLOW: `$K:$K`,
  AMOUNT:   `$J:$J`,
  CATEGORY: `$L:$L`,
  DARI:     `$M:$M`,
  KE:       `$N:$N`,
};

// Separator formula: titik koma untuk locale in_ID
const SEP = ';';

function sumif(type) {
  return `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"${type}"${SEP}${TXR.AMOUNT})${SEP}0)`;
}

function sumifAccount(rowRef, colRange) {
  return `=IFERROR(SUMIF(${colRange}${SEP}${rowRef}${SEP}${TXR.AMOUNT})${SEP}0)`;
}

function sumifSpending(catRef) {
  return `=IFERROR(SUMIFS(${TXR.AMOUNT}${SEP}${TXR.CASHFLOW}${SEP}"Spending"${SEP}${TXR.CATEGORY}${SEP}${catRef})${SEP}0)`;
}

function sumifPiutang(nameRef, type) {
  return `=IFERROR(SUMIFS(${TXR.AMOUNT}${SEP}${TXR.CASHFLOW}${SEP}"${type}"${SEP}${TXR.CATEGORY}${SEP}${nameRef})${SEP}0)`;
}

// =============================================
// AUTH & CLIENT
// =============================================

let _auth = null;
let _sheetsClient = null;

function getAuth() {
  if (_auth) return _auth;
  const credPath = path.resolve(
    process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-credentials.json'
  );
  const credentials = require(credPath);
  _auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return _auth;
}

async function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;
  const authClient = await getAuth().getClient();
  _sheetsClient = google.sheets({ version: 'v4', auth: authClient });
  return _sheetsClient;
}

function getServiceAccountEmail() {
  try {
    const credPath = path.resolve(
      process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-credentials.json'
    );
    return require(credPath).client_email || '';
  } catch {
    return '';
  }
}

// =============================================
// BASIC SHEET HELPERS
// =============================================

async function validateSpreadsheet(spreadsheetId) {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    return { valid: true, title: res.data.properties.title };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('404') || msg.includes('not found')) return { valid: false, reason: 'not_found' };
    if (msg.includes('403') || msg.includes('permission')) return { valid: false, reason: 'permission' };
    return { valid: false, reason: 'unknown', error: msg };
  }
}

async function getSheetsMeta(spreadsheetId) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const info = {};
  res.data.sheets.forEach((s) => {
    info[s.properties.title] = s.properties.sheetId;
  });
  return info;
}

async function ensureSheet(spreadsheetId, sheetName, existingMeta = null) {
  const meta = existingMeta || (await getSheetsMeta(spreadsheetId));
  if (meta[sheetName] !== undefined) return meta[sheetName];

  const sheets = await getSheetsClient();
  // Buat sheet baru dengan 2000 baris agar formula tidak out-of-range
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [{
        addSheet: {
          properties: {
            title: sheetName,
            gridProperties: { rowCount: 2000, columnCount: 20 },
          },
        },
      }],
    },
  });
  return res.data.replies[0].addSheet.properties.sheetId;
}

async function readRange(spreadsheetId, range) {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return res.data.values || [];
  } catch {
    return [];
  }
}

async function writeMultipleRanges(spreadsheetId, valueRanges) {
  if (!valueRanges || valueRanges.length === 0) return;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: valueRanges,
    },
  });
}

// =============================================
// MONTHLY SHEET NAMING
// =============================================

function getMonthlySheetName(date) {
  return `${MONTH_NAMES_EN[date.getMonth()]} ${date.getFullYear()}`;
}

function getPreviousMonthDate(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d;
}

// =============================================
// BUILD MONTHLY SHEET DATA
// =============================================

/**
 * Build semua range data untuk monthly sheet
 * Returns: array of { range, values } untuk batchUpdate
 */
function buildMonthlySheetData(sheetName, userData, saldoAwal) {
  const { accounts = [], bills = [], spendingCategories = [] } = userData;
  const ranges = [];
  const q = (r) => `'${sheetName}'!${r}`; // quoted range helper

  // ── ROW 1: Title ──────────────────────────────
  ranges.push({ range: q('A1'), values: [[sheetName]] });

  // ── ROW 3: Saldo Awal ─────────────────────────
  ranges.push({
    range: q('A3:D3'),
    values: [['Saldo awal\n(Saldo yang bisa digunakan, selain Asset & Savings)', '', '', saldoAwal || 0]],
  });

  // ── ROW 5-15: Monthly Statement ───────────────
  ranges.push({
    range: q(`A${R.MONTHLY_STMT}:D${R.SISA_UANG}`),
    values: [
      ['Monthly Statement', '', '', ''],
      // Income: semua cashflow type yang menambah saldo
      ['Income', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Income"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Dari Asset: ambil dari tabungan/asset
      ['Dari Asset / Saving', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Dari Asset"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Invest / Savings: uang yang masuk ke tabungan (keluar dari cashflow biasa)
      ['Invest / Savings', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Sinking Fund"${SEP}${TXR.AMOUNT})+SUMIF(${TXR.CASHFLOW}${SEP}"Financial Goals"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Bills: tagihan yang sudah dibayar
      ['Bills (paid)', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Bills"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Sinking Fund: tabungan tujuan
      ['Sinking Fund (saved)', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Sinking Fund"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Financial Goals
      ['Financial Goals', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Financial Goals"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Cicilan / Utang yang dibayar bulan ini
      ['Cicilan/Utang (paid)', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Pelunasan Utang"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Piutang bersih bulan ini (keluar - masuk)
      ['Piutang (di bulan ini)', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Piutang Baru"${SEP}${TXR.AMOUNT})-SUMIF(${TXR.CASHFLOW}${SEP}"Pelunasan Piutang"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Total Spending biasa
      ['Total Spending', '', '',
        `=IFERROR(SUMIF(${TXR.CASHFLOW}${SEP}"Spending"${SEP}${TXR.AMOUNT})${SEP}0)`],
      // Sisa uang = Saldo Awal + Income + Dari Asset - (semua pengeluaran)
      // Catatan: Invest/Savings sudah termasuk Sinking Fund + Financial Goals
      // Sisa = Saldo_Awal + Income + Dari_Asset - Invest - Bills - Cicilan - Piutang - Spending
      ['Sisa uang', '', '',
        `=D${R.SALDO_AWAL}+D${R.INCOME}+D${R.DARI_ASSET}-D${R.INVEST}-D${R.BILLS_PAID}-D${R.CICILAN}-D${R.PIUTANG_STMT}-D${R.TOTAL_SPENDING}`],
    ],
  });

  // ── ROW 17-18: Transaction Methods Header ─────
  ranges.push({ range: q(`A${R.TX_METHODS}`), values: [['Transaction Methods']] });
  ranges.push({
    range: q(`A${R.TX_METHODS_HDR}:E${R.TX_METHODS_HDR}`),
    values: [['Account', 'Initial', '📥 Credit (In)', '📤 Debit (Out)', 'Current']],
  });

  // ── ROW 19-33: Account Rows ───────────────────
  const acctRows = [];
  for (let i = 0; i < R.ACCT_MAX; i++) {
    const acc = accounts[i];
    const rn = R.ACCT_START + i;
    if (acc) {
      acctRows.push([
        acc.name,
        acc.balance || 0,
        sumifAccount(`A${rn}`, TXR.KE),
        sumifAccount(`A${rn}`, TXR.DARI),
        `=IFERROR(B${rn}${SEP}0)+C${rn}-D${rn}`,
      ]);
    } else {
      acctRows.push([
        '', '',
        `=IFERROR(SUMIF(${TXR.KE}${SEP}A${rn}${SEP}${TXR.AMOUNT})${SEP}0)`,
        `=IFERROR(SUMIF(${TXR.DARI}${SEP}A${rn}${SEP}${TXR.AMOUNT})${SEP}0)`,
        `=IF(A${rn}=""${SEP}""${SEP}IFERROR(B${rn}${SEP}0)+C${rn}-D${rn})`,
      ]);
    }
  }
  ranges.push({
    range: q(`A${R.ACCT_START}:E${R.ACCT_START + R.ACCT_MAX - 1}`),
    values: acctRows,
  });

  // ── BILLS SECTION ─────────────────────────────
  ranges.push({ range: q(`A${R.BILLS_SECTION}`), values: [['Bills']] });
  ranges.push({
    range: q(`A${R.BILLS_HDR}:D${R.BILLS_HDR}`),
    values: [['Item', 'Amount', 'Status', 'Dari Account']],
  });
  const billRows = [];
  for (let i = 0; i < R.BILLS_MAX; i++) {
    const b = (bills || []).filter((x) => x.active)[i];
    billRows.push(b
      ? [b.name, b.amount, b.paidThisMonth ? 'Paid' : 'Unpaid', b.account]
      : ['', '', 'Unpaid', '']
    );
  }
  ranges.push({
    range: q(`A${R.BILLS_START}:D${R.BILLS_START + R.BILLS_MAX - 1}`),
    values: billRows,
  });

  // ── SINKING FUND SECTION ──────────────────────
  ranges.push({ range: q(`A${R.SINKING_SECTION}`), values: [['Sinking Fund']] });
  ranges.push({
    range: q(`A${R.SINKING_HDR}:E${R.SINKING_HDR}`),
    values: [['Item', 'Amount', 'Status', 'Dari Account', 'Ke Account']],
  });
  const sinkingRows = Array(R.SINKING_MAX).fill(null).map(() => ['', '', 'Planned', '', '']);
  ranges.push({
    range: q(`A${R.SINKING_START}:E${R.SINKING_START + R.SINKING_MAX - 1}`),
    values: sinkingRows,
  });

  // ── SPENDINGS SECTION ─────────────────────────
  ranges.push({ range: q(`A${R.SPENDING_SECTION}`), values: [['Spendings']] });
  ranges.push({
    range: q(`A${R.SPENDING_HDR}:E${R.SPENDING_HDR}`),
    values: [['', 'Category', 'Budget', 'Amount Spent', 'Amount Left']],
  });
  const spendRows = [];
  for (let i = 0; i < R.SPENDING_MAX; i++) {
    const cat = (spendingCategories || [])[i];
    const rn = R.SPENDING_START + i;
    if (cat) {
      spendRows.push([
        i + 1, cat.name, '', // budget = manual
        sumifSpending(`B${rn}`),
        `=IF(C${rn}=""${SEP}IF(D${rn}=0${SEP}""${SEP}D${rn}*-1)${SEP}C${rn}-D${rn})`,
      ]);
    } else {
      spendRows.push([
        '', '', '',
        `=IFERROR(SUMIFS(${TXR.AMOUNT}${SEP}${TXR.CASHFLOW}${SEP}"Spending"${SEP}${TXR.CATEGORY}${SEP}B${rn})${SEP}0)`,
        `=IF(C${rn}=""${SEP}IF(D${rn}=0${SEP}""${SEP}D${rn}*-1)${SEP}C${rn}-D${rn})`,
      ]);
    }
  }
  ranges.push({
    range: q(`A${R.SPENDING_START}:E${R.SPENDING_START + R.SPENDING_MAX - 1}`),
    values: spendRows,
  });
  // Total row
  ranges.push({
    range: q(`A${R.SPENDING_TOTAL}:E${R.SPENDING_TOTAL}`),
    values: [[
      'Total', '',
      `=IFERROR(SUM(C${R.SPENDING_START}:C${R.SPENDING_TOTAL - 1})${SEP}0)`,
      `=IFERROR(SUM(D${R.SPENDING_START}:D${R.SPENDING_TOTAL - 1})${SEP}0)`,
      '',
    ]],
  });

  // ── CICILAN / UTANG SECTION ───────────────────
  ranges.push({ range: q(`A${R.UTANG_SECTION}`), values: [['Cicilan / Utang']] });
  ranges.push({
    range: q(`A${R.UTANG_NOTE}`),
    values: [['(Tambahkan melalui Transactions -> Cashflow "Utang Baru")']],
  });
  ranges.push({
    range: q(`A${R.UTANG_HDR}:E${R.UTANG_HDR}`),
    values: [['Name', '', 'Total', 'Paid', 'Sisa Utang']],
  });
  const utangRows = [];
  for (let i = 0; i < R.UTANG_MAX; i++) {
    const rn = R.UTANG_START + i;
    utangRows.push([
      '', '',
      sumifPiutang(`A${rn}`, 'Utang Baru'),
      sumifPiutang(`A${rn}`, 'Pelunasan Utang'),
      `=IF(A${rn}=""${SEP}""${SEP}C${rn}-D${rn})`,
    ]);
  }
  ranges.push({
    range: q(`A${R.UTANG_START}:E${R.UTANG_START + R.UTANG_MAX - 1}`),
    values: utangRows,
  });
  ranges.push({
    range: q(`A${R.UTANG_TOTAL}:E${R.UTANG_TOTAL}`),
    values: [[
      'Total', '',
      `=IFERROR(SUM(C${R.UTANG_START}:C${R.UTANG_TOTAL - 1})${SEP}0)`,
      `=IFERROR(SUM(D${R.UTANG_START}:D${R.UTANG_TOTAL - 1})${SEP}0)`,
      `=IFERROR(SUM(E${R.UTANG_START}:E${R.UTANG_TOTAL - 1})${SEP}0)`,
    ]],
  });

  // ── PIUTANG SECTION ───────────────────────────
  ranges.push({ range: q(`A${R.PIUTANG_SECTION}`), values: [['Piutang']] });
  ranges.push({
    range: q(`A${R.PIUTANG_NOTE}`),
    values: [['(Tambahkan melalui Transactions -> Cashflow "Piutang Baru")']],
  });
  ranges.push({
    range: q(`A${R.PIUTANG_HDR}:F${R.PIUTANG_HDR}`),
    values: [['Name', '', 'Total', 'Pelunasan', 'Sisa Piutang', '']],
  });
  const piutangRows = [];
  for (let i = 0; i < R.PIUTANG_MAX; i++) {
    const rn = R.PIUTANG_START + i;
    piutangRows.push([
      '', '',
      sumifPiutang(`A${rn}`, 'Piutang Baru'),
      sumifPiutang(`A${rn}`, 'Pelunasan Piutang'),
      `=IF(A${rn}=""${SEP}""${SEP}C${rn}-D${rn})`,
      `=IF(AND(A${rn}<>""${SEP}E${rn}=0)${SEP}"Lunas"${SEP}"")`,
    ]);
  }
  ranges.push({
    range: q(`A${R.PIUTANG_START}:F${R.PIUTANG_START + R.PIUTANG_MAX - 1}`),
    values: piutangRows,
  });
  ranges.push({
    range: q(`A${R.PIUTANG_KELUAR}:B${R.PIUTANG_KELUAR}`),
    values: [['Piutang Keluar Bulan Ini', sumif('Piutang Baru')]],
  });
  ranges.push({
    range: q(`A${R.PIUTANG_MASUK}:B${R.PIUTANG_MASUK}`),
    values: [['Piutang Masuk Bulan Ini', sumif('Pelunasan Piutang')]],
  });

  // ── TRANSACTION TABLE HEADERS (H1:N1) ─────────
  ranges.push({
    range: q('H1:N1'),
    values: [[
      'Date',
      'Transactions\n(Pastikan nama transaksi diisi juga)',
      'Amount',
      'Cashflow',
      'Category',
      'Dari Account\n(pilih account di sini jika saldo keluar)',
      'Ke Account\n(pilih account di sini jika saldo masuk)',
    ]],
  });

  return ranges;
}

// =============================================
// FORMAT MONTHLY SHEET
// =============================================

async function formatMonthlySheet(spreadsheetId, sheetId) {
  const sheets = await getSheetsClient();

  const BLUE = { red: 0.13, green: 0.37, blue: 0.73 };
  const DARK_BLUE = { red: 0.06, green: 0.22, blue: 0.45 };
  const LIGHT_BLUE = { red: 0.78, green: 0.87, blue: 0.96 };
  const GREEN = { red: 0.20, green: 0.66, blue: 0.33 };
  const AMBER = { red: 1.0, green: 0.76, blue: 0.03 };
  const WHITE = { red: 1, green: 1, blue: 1 };
  const LIGHT_GRAY = { red: 0.95, green: 0.95, blue: 0.95 };

  function boldWhiteOnColor(color, rowStart, rowEnd, colStart, colEnd) {
    return {
      repeatCell: {
        range: { sheetId, startRowIndex: rowStart - 1, endRowIndex: rowEnd, startColumnIndex: colStart, endColumnIndex: colEnd },
        cell: {
          userEnteredFormat: {
            backgroundColor: color,
            textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10 },
            horizontalAlignment: 'LEFT',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
      },
    };
  }

  function currencyFormat(rowStart, rowEnd, colStart, colEnd) {
    return {
      repeatCell: {
        range: { sheetId, startRowIndex: rowStart - 1, endRowIndex: rowEnd, startColumnIndex: colStart, endColumnIndex: colEnd },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'CURRENCY', pattern: '"Rp"#,##0' },
          },
        },
        fields: 'userEnteredFormat.numberFormat',
      },
    };
  }

  const requests = [
    // Freeze row 1 and column G (so transaction table scrolls independently of summary)
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1, frozenColumnCount: 0 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    // Column widths
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 180 }, fields: 'pixelSize' } }, // A
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 90 }, fields: 'pixelSize' } },  // B
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 90 }, fields: 'pixelSize' } },  // C
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 110 }, fields: 'pixelSize' } }, // D
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 110 }, fields: 'pixelSize' } }, // E
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 20 }, fields: 'pixelSize' } },  // F (gap)
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 20 }, fields: 'pixelSize' } },  // G (gap)
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 7, endIndex: 8 }, properties: { pixelSize: 80 }, fields: 'pixelSize' } },  // H Date
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 8, endIndex: 9 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } }, // I Tx name
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 9, endIndex: 10 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } },// J Amount
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 10, endIndex: 11 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } },// K Cashflow
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 11, endIndex: 12 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } },// L Category
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 12, endIndex: 13 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } },// M Dari
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 13, endIndex: 14 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } },// N Ke

    // Row 1: Title (A1 — left)
    boldWhiteOnColor(DARK_BLUE, 1, 1, 0, 5),
    // Row 1: TX Headers (H1:N1)
    boldWhiteOnColor(DARK_BLUE, 1, 1, 7, 14),

    // Monthly Statement header (row 5)
    boldWhiteOnColor(BLUE, R.MONTHLY_STMT, R.MONTHLY_STMT, 0, 5),
    // Saldo Awal (row 3) — highlight D
    { repeatCell: {
      range: { sheetId, startRowIndex: R.SALDO_AWAL - 1, endRowIndex: R.SALDO_AWAL, startColumnIndex: 3, endColumnIndex: 4 },
      cell: { userEnteredFormat: { backgroundColor: AMBER, textFormat: { bold: true } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    }},
    // Sisa uang (row 15) — highlight D
    { repeatCell: {
      range: { sheetId, startRowIndex: R.SISA_UANG - 1, endRowIndex: R.SISA_UANG, startColumnIndex: 3, endColumnIndex: 4 },
      cell: { userEnteredFormat: { backgroundColor: GREEN, textFormat: { bold: true, foregroundColor: WHITE } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    }},
    // Total Spending highlight
    { repeatCell: {
      range: { sheetId, startRowIndex: R.TOTAL_SPENDING - 1, endRowIndex: R.TOTAL_SPENDING, startColumnIndex: 0, endColumnIndex: 5 },
      cell: { userEnteredFormat: { backgroundColor: LIGHT_GRAY, textFormat: { bold: true } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    }},

    // Transaction Methods header (row 17)
    boldWhiteOnColor(BLUE, R.TX_METHODS, R.TX_METHODS, 0, 5),
    // Account column headers (row 18)
    boldWhiteOnColor(LIGHT_BLUE, R.TX_METHODS_HDR, R.TX_METHODS_HDR, 0, 5),

    // Section headers
    boldWhiteOnColor(BLUE, R.BILLS_SECTION, R.BILLS_SECTION, 0, 5),
    boldWhiteOnColor(LIGHT_BLUE, R.BILLS_HDR, R.BILLS_HDR, 0, 4),
    boldWhiteOnColor(BLUE, R.SINKING_SECTION, R.SINKING_SECTION, 0, 5),
    boldWhiteOnColor(LIGHT_BLUE, R.SINKING_HDR, R.SINKING_HDR, 0, 5),
    boldWhiteOnColor(BLUE, R.SPENDING_SECTION, R.SPENDING_SECTION, 0, 5),
    boldWhiteOnColor(LIGHT_BLUE, R.SPENDING_HDR, R.SPENDING_HDR, 0, 5),
    boldWhiteOnColor(BLUE, R.UTANG_SECTION, R.UTANG_SECTION, 0, 5),
    boldWhiteOnColor(LIGHT_BLUE, R.UTANG_HDR, R.UTANG_HDR, 0, 5),
    boldWhiteOnColor(BLUE, R.PIUTANG_SECTION, R.PIUTANG_SECTION, 0, 6),
    boldWhiteOnColor(LIGHT_BLUE, R.PIUTANG_HDR, R.PIUTANG_HDR, 0, 6),

    // Currency format: D column in summary (D6:D15)
    currencyFormat(R.INCOME, R.SISA_UANG, 3, 4),
    // Currency: saldo awal D3
    currencyFormat(R.SALDO_AWAL, R.SALDO_AWAL, 3, 4),
    // Currency: Account B-E columns
    currencyFormat(R.ACCT_START, R.ACCT_START + R.ACCT_MAX, 1, 5),
    // Currency: Bills amount (B column)
    currencyFormat(R.BILLS_START, R.BILLS_START + R.BILLS_MAX, 1, 2),
    // Currency: Spending amount columns (C-D)
    currencyFormat(R.SPENDING_START, R.SPENDING_TOTAL, 2, 5),
    // Currency: Utang columns (C-E)
    currencyFormat(R.UTANG_START, R.UTANG_TOTAL, 2, 5),
    // Currency: Piutang columns (C-E)
    currencyFormat(R.PIUTANG_START, R.PIUTANG_START + R.PIUTANG_MAX, 2, 5),
    // Currency: transaction Amount column (J)
    currencyFormat(2, 10000, 9, 10),
    // Currency: Piutang keluar/masuk (B)
    currencyFormat(R.PIUTANG_KELUAR, R.PIUTANG_MASUK, 1, 2),

    // Spending Total row bold
    { repeatCell: {
      range: { sheetId, startRowIndex: R.SPENDING_TOTAL - 1, endRowIndex: R.SPENDING_TOTAL, startColumnIndex: 0, endColumnIndex: 5 },
      cell: { userEnteredFormat: { backgroundColor: LIGHT_GRAY, textFormat: { bold: true } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    }},
    // Utang Total row bold
    { repeatCell: {
      range: { sheetId, startRowIndex: R.UTANG_TOTAL - 1, endRowIndex: R.UTANG_TOTAL, startColumnIndex: 0, endColumnIndex: 5 },
      cell: { userEnteredFormat: { backgroundColor: LIGHT_GRAY, textFormat: { bold: true } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    }},
    // Piutang keluar/masuk bold
    { repeatCell: {
      range: { sheetId, startRowIndex: R.PIUTANG_KELUAR - 1, endRowIndex: R.PIUTANG_MASUK, startColumnIndex: 0, endColumnIndex: 2 },
      cell: { userEnteredFormat: { textFormat: { bold: true } } },
      fields: 'userEnteredFormat.textFormat',
    }},
  ];

  try {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, resource: { requests } });
  } catch (err) {
    log.warn('Format error (non-critical):', err.message);
  }
}

// =============================================
// INITIALIZE MONTHLY SHEET
// =============================================

/**
 * Buat & inisialisasi sheet bulan ini
 */
async function initializeMonthlySheet(spreadsheetId, sheetName, userData, saldoAwal) {
  const meta = await getSheetsMeta(spreadsheetId);
  const sheetId = await ensureSheet(spreadsheetId, sheetName, meta);

  // Write semua data
  const ranges = buildMonthlySheetData(sheetName, userData, saldoAwal);
  await writeMultipleRanges(spreadsheetId, ranges);

  // Apply formatting
  await formatMonthlySheet(spreadsheetId, sheetId);

  return sheetId;
}

/**
 * Dapatkan atau buat sheet bulan ini.
 * Jika bulan baru: auto-buat dengan carry-over saldo dari data user.
 */
async function getOrCreateMonthlySheet(spreadsheetId, userData) {
  const now = new Date();
  const sheetName = getMonthlySheetName(now);
  const meta = await getSheetsMeta(spreadsheetId);

  if (meta[sheetName] !== undefined) {
    return { sheetName, sheetId: meta[sheetName], isNew: false };
  }

  // Sheet belum ada — buat baru
  // Saldo awal = jumlah saldo semua akun user
  const saldoAwal = (userData.accounts || []).reduce((s, a) => s + (a.balance || 0), 0);
  const sheetId = await initializeMonthlySheet(spreadsheetId, sheetName, userData, saldoAwal);

  return { sheetName, sheetId, isNew: true };
}

// =============================================
// TRANSACTION FUNCTIONS
// =============================================

/**
 * Format tanggal ke "DD MMM YY" (e.g., "02 Jan 26")
 */
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()];
  const y = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${d} ${m} ${y} ${hh}:${mm}`;
}

/**
 * Parse date string "DD Mon YY HH:MM" back to Date for sorting
 */
function parseDateStr(str) {
  if (!str) return new Date(0);
  const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const parts = str.trim().split(' ');
  if (parts.length < 3) return new Date(0);
  const d = parseInt(parts[0]);
  const m = months[parts[1]] ?? 0;
  const y = 2000 + parseInt(parts[2]);
  let hh = 0, mm = 0;
  if (parts[3] && parts[3].includes(':')) {
    [hh, mm] = parts[3].split(':').map(Number);
  }
  return new Date(y, m, d, hh, mm);
}

/**
 * Sort transaction rows by date (ascending) in the sheet
 */
async function sortTransactions(spreadsheetId, sheetName, totalRows) {
  const lastRow = totalRows;
  if (lastRow <= 2) return; // nothing to sort

  const data = await readRange(spreadsheetId, `'${sheetName}'!H2:N${lastRow}`);
  if (!data || data.length <= 1) return;

  // Sort by date column (index 0)
  data.sort((a, b) => parseDateStr(a[0]) - parseDateStr(b[0]));

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!H2:N${lastRow}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: data },
  });
}

/**
 * Cari baris kosong berikutnya di kolom H (transaction table)
 * Mulai dari baris 2.
 */
async function findNextTxRow(spreadsheetId, sheetName) {
  const data = await readRange(spreadsheetId, `'${sheetName}'!H2:H10000`);
  // Hitung baris terisi + 2 (karena mulai dari row 2)
  return (data ? data.length : 0) + 2;
}

/**
 * Tambah transaksi ke monthly sheet
 * @param {string} spreadsheetId
 * @param {Object} tx - { type, name, amount, cashflow, category, dari, ke, date?, note? }
 */
async function addTransaction(spreadsheetId, tx) {
  const sheets = await getSheetsClient();
  const userData = tx._userData; // passed from handler

  const { sheetName } = await getOrCreateMonthlySheet(spreadsheetId, userData || {});
  const now = tx.date ? new Date(tx.date) : new Date();
  const dateStr = formatDate(now);

  const row = [
    dateStr,
    tx.name || tx.note || '',
    tx.amount || 0,
    tx.cashflow || '',
    tx.category || '',
    tx.dari || '',
    tx.ke || '',
  ];

  // Append ke transaction table
  const nextRow = await findNextTxRow(spreadsheetId, sheetName);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!H${nextRow}:N${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [row] },
  });

  // Sort transaksi berdasarkan tanggal (ascending)
  await sortTransactions(spreadsheetId, sheetName, nextRow);

  // Jika Piutang Baru — tambah nama ke piutang section
  if (tx.cashflow === 'Piutang Baru' && tx.category) {
    await addNameToSection(spreadsheetId, sheetName, tx.category, R.PIUTANG_START, R.PIUTANG_MAX, 'A');
  }

  // Jika Utang Baru — tambah nama ke utang section
  if (tx.cashflow === 'Utang Baru' && tx.category) {
    await addNameToSection(spreadsheetId, sheetName, tx.category, R.UTANG_START, R.UTANG_MAX, 'A');
  }

  return { sheetName, row: nextRow };
}

/**
 * Tambah nama ke section (Piutang/Utang) jika belum ada
 */
async function addNameToSection(spreadsheetId, sheetName, name, startRow, maxRows, col) {
  const data = await readRange(
    spreadsheetId,
    `'${sheetName}'!${col}${startRow}:${col}${startRow + maxRows - 1}`
  );
  // Normalize: pastikan array punya panjang maxRows (API tidak return cell kosong)
  const existing = [];
  for (let i = 0; i < maxRows; i++) {
    existing.push(((data[i] && data[i][0]) || '').toLowerCase());
  }
  if (existing.includes(name.toLowerCase())) return; // sudah ada

  // Cari baris kosong
  const emptyIdx = existing.findIndex((v) => !v);
  if (emptyIdx === -1) return; // section penuh

  const targetRow = startRow + emptyIdx;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!${col}${targetRow}`,
    valueInputOption: 'RAW',
    resource: { values: [[name]] },
  });
}

/**
 * Baca transaksi dari monthly sheet
 */
async function getTransactions(spreadsheetId, month = null, year = null) {
  const now = new Date();
  const targetDate = new Date(year || now.getFullYear(), (month || now.getMonth() + 1) - 1, 1);
  const sheetName = getMonthlySheetName(targetDate);

  const meta = await getSheetsMeta(spreadsheetId);
  if (meta[sheetName] === undefined) return [];

  // Gunakan valueRenderOption UNFORMATTED_VALUE agar angka currency tidak jadi string
  let data = [];
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!H2:N`,
      valueRenderOption: 'UNFORMATTED_VALUE',  // ← kunci: baca nilai asli, bukan formatted string
      dateTimeRenderOption: 'FORMATTED_STRING',
    });
    data = res.data.values || [];
  } catch {
    return [];
  }

  if (!data || data.length === 0) return [];

  /**
   * Parse amount: bisa berupa number (dari UNFORMATTED_VALUE),
   * atau string seperti "Rp25.000" / "25,000" / "25000"
   */
  function parseAmount(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;
    // Strip semua non-digit kecuali titik dan koma, lalu parse
    const cleaned = String(val).replace(/[Rp\s]/g, '').replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  return data
    .filter((row) => row && row[0]) // filter baris kosong
    .map((row) => {
      const cashflow = String(row[3] || '');
      const cashflowLower = cashflow.toLowerCase();
      // Tentukan type berdasarkan cashflow
      let type;
      if (cashflowLower === 'income' || cashflowLower === 'dari asset') {
        type = 'income';
      } else if (cashflowLower === 'spending') {
        type = 'expense';
      } else if (cashflowLower === 'transfer') {
        type = 'transfer';
      } else if (cashflowLower === 'bills') {
        type = 'bills';
      } else if (cashflowLower === 'sinking fund' || cashflowLower === 'financial goals') {
        type = 'savings';
      } else if (cashflowLower === 'utang baru') {
        type = 'utang';
      } else if (cashflowLower === 'piutang baru') {
        type = 'piutang';
      } else if (cashflowLower === 'pelunasan utang') {
        type = 'pelunasan_utang';
      } else if (cashflowLower === 'pelunasan piutang') {
        type = 'pelunasan_piutang';
      } else {
        type = 'other';
      }
      return {
        date: String(row[0] || ''),
        name: String(row[1] || ''),
        amount: parseAmount(row[2]),
        cashflow,
        category: String(row[4] || ''),
        dari: String(row[5] || ''),
        ke: String(row[6] || ''),
        type,
      };
    });
}

/**
 * Update saldo akun di sheet bulan ini (kolom B - Initial)
 * Dipanggil saat sync setelah transaksi — tidak perlu karena saldo otomatis via formula
 * Tapi Initial perlu di-update jika user edit saldo
 */
async function updateInitialBalance(spreadsheetId, sheetName, accountName, newBalance) {
  const data = await readRange(spreadsheetId, `'${sheetName}'!A${R.ACCT_START}:A${R.ACCT_START + R.ACCT_MAX - 1}`);
  const idx = (data || []).findIndex((r) => r[0] && r[0].toLowerCase() === accountName.toLowerCase());
  if (idx === -1) return;
  const targetRow = R.ACCT_START + idx;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!B${targetRow}`,
    valueInputOption: 'RAW',
    resource: { values: [[newBalance]] },
  });
}

/**
 * Update status bills di sheet
 */
async function updateBillStatus(spreadsheetId, sheetName, billName, status) {
  const data = await readRange(
    spreadsheetId,
    `'${sheetName}'!A${R.BILLS_START}:D${R.BILLS_START + R.BILLS_MAX - 1}`
  );
  const idx = (data || []).findIndex((r) => r[0] && r[0].toLowerCase() === billName.toLowerCase());
  if (idx === -1) return;
  const targetRow = R.BILLS_START + idx;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!C${targetRow}`,
    valueInputOption: 'RAW',
    resource: { values: [[status]] },
  });
}

/**
 * Sync semua status bills ke sheet bulan ini sekaligus
 */
async function syncBillsToSheet(spreadsheetId, bills) {
  if (!bills || bills.length === 0) return;
  const now = new Date();
  const sheetName = getMonthlySheetName(now);
  const meta = await getSheetsMeta(spreadsheetId);
  if (meta[sheetName] === undefined) return;

  const data = await readRange(
    spreadsheetId,
    `'${sheetName}'!A${R.BILLS_START}:D${R.BILLS_START + R.BILLS_MAX - 1}`
  );
  if (!data || data.length === 0) return;

  const sheetsClient = await getSheetsClient();
  const updates = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    const bill = bills.find(b => b.name.toLowerCase() === String(row[0]).toLowerCase());
    if (bill) {
      updates.push({
        range: `'${sheetName}'!C${R.BILLS_START + i}`,
        values: [[bill.paidThisMonth ? 'Paid' : 'Unpaid']],
      });
    }
  }

  if (updates.length > 0) {
    await sheetsClient.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: { valueInputOption: 'RAW', data: updates },
    });
  }
}

/**
 * Init awal: buat sheet bulan ini dari setup data user
 */
async function initializeFirstSheet(spreadsheetId, userData) {
  const saldoAwal = (userData.accounts || []).reduce((s, a) => s + (a.balance || 0), 0);
  const sheetName = getMonthlySheetName(new Date());
  await initializeMonthlySheet(spreadsheetId, sheetName, userData, saldoAwal);
  return sheetName;
}

/**
 * Inisialisasi sheet yang sudah ada (gunakan sheetId yang sudah ada, tidak buat baru)
 * Dipakai oleh reset script agar tidak perlu hapus+buat ulang
 */
async function initializeMonthlySheetById(spreadsheetId, sheetName, sheetId, userData, saldoAwal) {
  // Write semua data
  const ranges = buildMonthlySheetData(sheetName, userData, saldoAwal);
  await writeMultipleRanges(spreadsheetId, ranges);

  // Apply formatting
  await formatMonthlySheet(spreadsheetId, sheetId);
  return sheetId;
}

/**
 * Baca semua budget spending dari sheet bulan ini
 * @returns {Object} { 'Makan/Minum': 500000, 'Transport': 200000, ... }
 */
async function getSpendingBudgets(spreadsheetId) {
  const sheetName = getMonthlySheetName(new Date());
  const data = await readRange(
    spreadsheetId,
    `'${sheetName}'!B${R.SPENDING_START}:C${R.SPENDING_START + R.SPENDING_MAX - 1}`
  );
  const result = {};
  (data || []).forEach(row => {
    if (row[0]) result[row[0]] = parseFloat(row[1]) || 0;
  });
  return result;
}

/**
 * Set budget untuk satu kategori spending di sheet bulan ini
 * @param {string} spreadsheetId
 * @param {string} categoryName - nama kategori
 * @param {number|string} amount - nominal budget, atau '' untuk hapus
 */
async function setSpendingBudget(spreadsheetId, categoryName, amount) {
  const sheetName = getMonthlySheetName(new Date());
  const data = await readRange(
    spreadsheetId,
    `'${sheetName}'!B${R.SPENDING_START}:B${R.SPENDING_START + R.SPENDING_MAX - 1}`
  );
  const idx = (data || []).findIndex(
    row => row[0] && row[0].toLowerCase().trim() === categoryName.toLowerCase().trim()
  );
  if (idx === -1) throw new Error(`Kategori '${categoryName}' tidak ditemukan di sheet`);
  const targetRow = R.SPENDING_START + idx;
  const sheetsClient = await getSheetsClient();
  await sheetsClient.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!C${targetRow}`,
    valueInputOption: 'RAW',
    resource: { values: [[amount === '' ? '' : Number(amount)]] },
  });
}

// =============================================
// MONTHLY FINANCIAL SUMMARY SHEET
// =============================================

/**
 * Buat atau update sheet "Monthly Financial Summary"
 * Berisi ringkasan bulanan, spending breakdown, dan data untuk chart
 */
async function createMonthlySummarySheet(spreadsheetId, userData) {
  const SUMMARY_SHEET = 'Monthly Financial Summary';
  const meta = await getSheetsMeta(spreadsheetId);
  const sheetId = await ensureSheet(spreadsheetId, SUMMARY_SHEET, meta);

  const now = new Date();
  const monthSheet = getMonthlySheetName(now);
  const monthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const accounts = userData.accounts || [];
  const categories = userData.spendingCategories || [];
  const bills = userData.bills || [];

  // Helper: reference ke monthly sheet
  const ref = (cell) => `'${monthSheet}'!${cell}`;

  const ranges = [];

  // ── ROW 1: Title ──
  ranges.push({ range: `'${SUMMARY_SHEET}'!A1`, values: [[`📊 Monthly Financial Summary — ${monthLabel}`]] });

  // ── ROW 3-12: Monthly Statement ──
  ranges.push({ range: `'${SUMMARY_SHEET}'!A3:C3`, values: [['📋 Monthly Statement', '', 'Amount']] });
  const stmtRows = [
    ['💰 Total Income', '', `=${ref('D6')}`],
    ['💸 Total Spending', '', `=${ref('D14')}`],
    ['📅 Bills Paid', '', `=${ref('D9')}`],
    ['🎯 Sinking Fund Saved', '', `=${ref('D10')}`],
    ['📈 Financial Goals', '', `=${ref('D11')}`],
    ['💳 Cicilan/Utang Paid', '', `=${ref('D12')}`],
    ['💼 Akumulasi Piutang', '', `=${ref('D13')}`],
    ['💵 Sisa Uang', '', `=${ref('D15')}`],
    ['📊 Savings Rate', '', `=IFERROR(ROUND((C4-C5)/C4*100${SEP}0)&"%"${SEP}"0%")`],
  ];
  ranges.push({ range: `'${SUMMARY_SHEET}'!A4:C12`, values: stmtRows });

  // ── ROW 14-30: Spending Breakdown ──
  ranges.push({ range: `'${SUMMARY_SHEET}'!A14:E14`, values: [['🛍️ Spending per Kategori', '', 'Budget', 'Spent', 'Remaining']] });
  const spendRows = [];
  for (let i = 0; i < categories.length && i < 15; i++) {
    const catRow = R.SPENDING_START + i;
    spendRows.push([
      categories[i].emoji + ' ' + categories[i].name,
      '',
      `=${ref(`C${catRow}`)}`,
      `=${ref(`D${catRow}`)}`,
      `=${ref(`E${catRow}`)}`,
    ]);
  }
  if (spendRows.length > 0) {
    ranges.push({ range: `'${SUMMARY_SHEET}'!A15:E${14 + spendRows.length}`, values: spendRows });
  }
  const spendTotalRow = 15 + spendRows.length;
  ranges.push({ range: `'${SUMMARY_SHEET}'!A${spendTotalRow}:E${spendTotalRow}`, values: [['TOTAL', '', `=SUM(C15:C${spendTotalRow - 1})`, '', `=SUM(E15:E${spendTotalRow - 1})`]] });

  // ── Account Balances ──
  const acctStartRow = spendTotalRow + 2;
  ranges.push({ range: `'${SUMMARY_SHEET}'!A${acctStartRow}:C${acctStartRow}`, values: [['🏦 Saldo Akun', '', 'Balance']] });
  const acctRows = [];
  for (let i = 0; i < accounts.length && i < 15; i++) {
    const acctRow = R.ACCT_START + i;
    acctRows.push([
      accounts[i].emoji + ' ' + accounts[i].name,
      '',
      `=${ref(`E${acctRow}`)}`,
    ]);
  }
  if (acctRows.length > 0) {
    ranges.push({ range: `'${SUMMARY_SHEET}'!A${acctStartRow + 1}:C${acctStartRow + acctRows.length}`, values: acctRows });
  }
  const acctTotalRow = acctStartRow + acctRows.length + 1;
  ranges.push({ range: `'${SUMMARY_SHEET}'!A${acctTotalRow}:C${acctTotalRow}`, values: [['TOTAL', '', `=SUM(C${acctStartRow + 1}:C${acctTotalRow - 1})`]] });

  // ── Chart Data (right side) for pie chart ──
  ranges.push({ range: `'${SUMMARY_SHEET}'!G3:H3`, values: [['Kategori', 'Amount']] });
  const chartDataRows = categories.slice(0, 15).map((cat, i) => [
    cat.name,
    `=${ref(`D${R.SPENDING_START + i}`)}`,
  ]);
  if (chartDataRows.length > 0) {
    ranges.push({ range: `'${SUMMARY_SHEET}'!G4:H${3 + chartDataRows.length}`, values: chartDataRows });
  }

  // ── Chart Data for bar comparison ──
  const barStartRow = 3 + chartDataRows.length + 2;
  ranges.push({ range: `'${SUMMARY_SHEET}'!G${barStartRow}:H${barStartRow}`, values: [['Cashflow', 'Amount']] });
  const barData = [
    ['Income', `=${ref('D6')}`],
    ['Spending', `=${ref('D14')}`],
    ['Bills', `=${ref('D9')}`],
    ['Cicilan/Utang', `=${ref('D12')}`],
    ['Savings', `=C4-C5-C6`],
  ];
  ranges.push({ range: `'${SUMMARY_SHEET}'!G${barStartRow + 1}:H${barStartRow + 5}`, values: barData });

  // Write all data
  await writeMultipleRanges(spreadsheetId, ranges);

  // Add charts
  await addSummaryCharts(spreadsheetId, sheetId, chartDataRows.length, barStartRow);

  // Apply formatting & colors
  await formatSummarySheet(spreadsheetId, sheetId, spendRows.length, acctStartRow, acctRows.length);

  return { sheetName: SUMMARY_SHEET, sheetId };
}

/**
 * Apply formatting & colors to summary sheet
 */
async function formatSummarySheet(spreadsheetId, sheetId, spendCount, acctStartRow, acctCount) {
  const sheetsClient = await getSheetsClient();

  // Color helpers
  const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });
  const white = rgb(255, 255, 255);
  const darkBlue = rgb(26, 35, 126);
  const lightBlue = rgb(227, 242, 253);
  const darkGreen = rgb(27, 94, 32);
  const lightGreen = rgb(232, 245, 233);
  const darkOrange = rgb(230, 81, 0);
  const lightOrange = rgb(255, 243, 224);
  const darkPurple = rgb(74, 20, 140);
  const lightPurple = rgb(243, 229, 245);

  const bold = { bold: true };
  const centerAlign = { horizontalAlignment: 'CENTER' };

  const requests = [];

  // Background keseluruhan — matcha green
  const matcha = rgb(234, 245, 234);
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 50, startColumnIndex: 0, endColumnIndex: 15 }, cell: { userEnteredFormat: { backgroundColor: matcha } }, fields: 'userEnteredFormat(backgroundColor)' } });

  // Title row (row 0)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: darkBlue, textFormat: { ...bold, foregroundColor: white, fontSize: 13 } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Monthly Statement header (row 2)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: darkGreen, textFormat: { ...bold, foregroundColor: white, fontSize: 10 } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Monthly Statement rows (rows 3-11)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 12, startColumnIndex: 0, endColumnIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: lightGreen } }, fields: 'userEnteredFormat(backgroundColor)' } });

  // Spending header (row 13)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 13, endRowIndex: 14, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { backgroundColor: darkOrange, textFormat: { ...bold, foregroundColor: white, fontSize: 10 } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Spending rows
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 14, endRowIndex: 14 + spendCount, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { backgroundColor: lightOrange } }, fields: 'userEnteredFormat(backgroundColor)' } });

  // Spending total row
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 14 + spendCount, endRowIndex: 15 + spendCount, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { backgroundColor: darkOrange, textFormat: { ...bold, foregroundColor: white } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Account header
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: acctStartRow - 1, endRowIndex: acctStartRow, startColumnIndex: 0, endColumnIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: darkPurple, textFormat: { ...bold, foregroundColor: white, fontSize: 10 } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Account rows
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: acctStartRow, endRowIndex: acctStartRow + acctCount, startColumnIndex: 0, endColumnIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: lightPurple } }, fields: 'userEnteredFormat(backgroundColor)' } });

  // Account total row
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: acctStartRow + acctCount, endRowIndex: acctStartRow + acctCount + 1, startColumnIndex: 0, endColumnIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: darkPurple, textFormat: { ...bold, foregroundColor: white } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Chart data header (G3)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 6, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: darkBlue, textFormat: { ...bold, foregroundColor: white } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });

  // Chart data rows (G4:H...)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 3 + spendCount, startColumnIndex: 6, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: lightBlue } }, fields: 'userEnteredFormat(backgroundColor)' } });

  // Column widths
  requests.push({ updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } });
  requests.push({ updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 5 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } });

  // Number format for currency columns (C, D, E)
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: acctStartRow + acctCount + 1, startColumnIndex: 2, endColumnIndex: 5 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: 'Rp#,##0' } } }, fields: 'userEnteredFormat(numberFormat)' } });

  try {
    await sheetsClient.spreadsheets.batchUpdate({ spreadsheetId, resource: { requests } });
  } catch (e) {
    log.warn('Summary formatting failed (non-critical):', e.message);
  }
}

/**
 * Add pie chart and bar chart to the summary sheet
 */
async function addSummaryCharts(spreadsheetId, sheetId, categoryCount, barStartRow) {
  const sheetsClient = await getSheetsClient();

  // Delete existing charts on this sheet first
  try {
    const spreadsheet = await sheetsClient.spreadsheets.get({ spreadsheetId });
    const existingCharts = (spreadsheet.data.sheets || [])
      .find(s => s.properties.sheetId === sheetId)?.charts || [];
    if (existingCharts.length > 0) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: existingCharts.map(c => ({ deleteEmbeddedObject: { objectId: c.chartId } })),
        },
      });
    }
  } catch (e) { /* ignore */ }

  const requests = [];

  // Pie Chart — Spending per kategori
  requests.push({
    addChart: {
      chart: {
        position: { overlayPosition: { anchorCell: { sheetId, rowIndex: 2, columnIndex: 9 }, offsetXPixels: 0, offsetYPixels: 0, widthPixels: 500, heightPixels: 350 } },
        spec: {
          title: 'Spending per Kategori',
          pieChart: {
            legendPosition: 'RIGHT_LEGEND',
            domain: { sourceRange: { sources: [{ sheetId, startRowIndex: 3, endRowIndex: 3 + categoryCount, startColumnIndex: 6, endColumnIndex: 7 }] } },
            series: { sourceRange: { sources: [{ sheetId, startRowIndex: 3, endRowIndex: 3 + categoryCount, startColumnIndex: 7, endColumnIndex: 8 }] } },
          },
        },
      },
    },
  });

  // Bar Chart — Cashflow comparison
  requests.push({
    addChart: {
      chart: {
        position: { overlayPosition: { anchorCell: { sheetId, rowIndex: 18, columnIndex: 9 }, offsetXPixels: 0, offsetYPixels: 0, widthPixels: 500, heightPixels: 300 } },
        spec: {
          title: 'Perbandingan Cashflow',
          basicChart: {
            chartType: 'COLUMN',
            legendPosition: 'NO_LEGEND',
            domains: [{ domain: { sourceRange: { sources: [{ sheetId, startRowIndex: barStartRow, endRowIndex: barStartRow + 5, startColumnIndex: 6, endColumnIndex: 7 }] } } }],
            series: [{ series: { sourceRange: { sources: [{ sheetId, startRowIndex: barStartRow, endRowIndex: barStartRow + 5, startColumnIndex: 7, endColumnIndex: 8 }] } } }],
          },
        },
      },
    },
  });

  try {
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests },
    });
  } catch (e) {
    log.warn('Chart creation failed (non-critical):', e.message);
  }
}

module.exports = {
  getServiceAccountEmail,
  validateSpreadsheet,
  getMonthlySheetName,
  initializeMonthlySheet,
  initializeMonthlySheetById,
  initializeFirstSheet,
  getOrCreateMonthlySheet,
  addTransaction,
  getTransactions,
  updateInitialBalance,
  updateBillStatus,
  readRange,
  getSheetsMeta,
  syncBillsToSheet,
  getSpendingBudgets,
  setSpendingBudget,
  createMonthlySummarySheet,
  R, // export untuk keperluan lain
};
