# CODING STANDARD

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Engineering Standard
Status         : Production

---

# Development Rule

Setiap milestone wajib melalui siklus berikut:

1. Analisis
2. Implementasi
3. Build
4. Run
5. Testing
6. Bug Fix
7. Code Review
8. Commit
9. Baru melanjutkan milestone berikutnya.

Tidak diperbolehkan mengembangkan fitur baru apabila milestone sebelumnya belum lulus testing.

# 1. PURPOSE

Dokumen ini mendefinisikan standar penulisan kode pada seluruh project CuanTrack.

Seluruh developer maupun AI wajib mengikuti standar ini agar source code tetap konsisten, mudah dipahami, mudah dirawat, dan siap berkembang menjadi produk SaaS.

Dokumen ini berlaku untuk:

- Telegram Bot
- Backend API
- Dashboard Web
- AI Module
- Automation Service
- Future Mobile App

---

# 2. CORE PRINCIPLES

Semua kode harus memenuhi prinsip berikut.

✓ Readable

✓ Maintainable

✓ Reusable

✓ Predictable

✓ Testable

✓ Scalable

---

# 3. ENGINEERING PHILOSOPHY

Selalu prioritaskan:

Correctness

↓

Readability

↓

Maintainability

↓

Performance

↓

Optimization

Jangan mengorbankan keterbacaan hanya demi membuat kode lebih pendek.

---

# 4. GENERAL RULES

Kode harus mudah dipahami oleh developer baru.

Kode harus memiliki struktur yang konsisten.

Hindari "magic code".

Gunakan nama yang jelas.

Jangan membuat solusi yang terlalu kompleks.

---

# 5. LANGUAGE STANDARD

Runtime

Node.js LTS

Module

CommonJS

Style

ES2022

Async

async / await

Package Manager

npm

---

# 6. FILE STRUCTURE

Satu file memiliki satu tanggung jawab utama.

Contoh:

Transaction Handler

Wallet Service

OCR Service

Budget Service

Jangan mencampur banyak domain dalam satu file.

---

# 7. NAMING CONVENTION

Gunakan:

camelCase

untuk:

variable

function

parameter

Contoh

transactionAmount

walletBalance

defaultCategory

---

Gunakan:

PascalCase

untuk:

Class

Type

Error

Contoh

TransactionService

WalletManager

BudgetError

---

Gunakan:

UPPER_CASE

untuk:

Constant

Environment Variable

Contoh

MAX_UPLOAD_SIZE

DEFAULT_LANGUAGE

API_TIMEOUT

---

# 8. FUNCTION STANDARD

Function harus:

Pendek.

Fokus.

Memiliki satu tanggung jawab.

Ideal:

20–40 baris.

Hindari function yang sangat panjang.

---

# 9. FUNCTION NAMING

Gunakan nama yang menjelaskan aksi.

Contoh:

createTransaction()

updateWallet()

deleteBudget()

calculateBalance()

generateMonthlyReport()

parseReceipt()

transcribeVoice()

Jangan gunakan:

process()

handle()

run()

execute()

tanpa konteks.

---

# 10. VARIABLE NAMING

Gunakan nama yang deskriptif.

Contoh:

userWallet

transactionDate

monthlyBudget

voiceTranscript

receiptImage

Jangan gunakan:

a

b

tmp

test

data1

---

# 11. COMMENT RULE

Komentar digunakan untuk:

Menjelaskan alasan.

Bukan menjelaskan syntax.

Contoh baik:

// Menggunakan cache agar tidak memanggil API berulang.

Contoh buruk:

// Tambah angka 1

count++

---

# 12. ERROR HANDLING

Seluruh operasi penting wajib menggunakan:

try/catch

Logging

Return yang jelas

User Friendly Message

Tidak boleh membiarkan Promise tanpa penanganan error.

---

# 13. LOGGING STANDARD

Gunakan logging untuk:

Start

Success

Warning

Error

Contoh:

Transaction created

OCR completed

Budget exceeded

Voice parsing failed

Jangan logging data sensitif.

---

# 14. VALIDATION

Seluruh input wajib divalidasi.

Nominal

Tanggal

Wallet

Kategori

Upload

OCR

Voice

API Request

Tidak boleh mempercayai input user.

---

# 15. BUSINESS LOGIC

Business Logic hanya boleh berada pada Service Layer.

Handler hanya bertugas:

- menerima request

- validasi awal

- memanggil service

- mengirim response

---

# 16. SESSION MANAGEMENT

Session hanya digunakan untuk:

Conversation State

Temporary Input

Wizard

Session bukan database.

---

# 17. CALLBACK STANDARD

Gunakan callback yang konsisten.

Contoh:

wallet:add

wallet:delete

wallet:update

budget:create

budget:edit

transaction:confirm

transaction:cancel

Gunakan format:

module:action

---

# 18. COMMAND STANDARD

Gunakan command yang singkat.

Contoh:

/start

/help

/masuk

/keluar

/dompet

/ringkasan

/scan

/goal

/budget

/settings

Hindari command yang terlalu panjang.

---

# 19. API STANDARD

Gunakan RESTful Convention.

GET

POST

PUT

PATCH

DELETE

Response harus konsisten.

---

# 20. DATABASE STANDARD

Gunakan:

UUID

Timestamp

Soft Delete

Foreign Key

Index

Audit Log

Tidak menyimpan data yang sama di banyak tabel.

---

# 21. SECURITY STANDARD

Gunakan Environment Variable.

Jangan Hardcode API Key.

Validasi semua input.

Sanitasi semua data.

Gunakan HTTPS.

Hash data sensitif.

---

# 22. PERFORMANCE STANDARD

Kurangi query.

Kurangi API call.

Gunakan pagination.

Gunakan caching bila diperlukan.

Hindari nested loop yang tidak perlu.

---

# 23. AI STANDARD

AI Module harus:

Deterministic

Traceable

Auditable

Configurable

Semua hasil AI harus divalidasi sebelum disimpan.

---

# 24. TESTING STANDARD

Setiap perubahan harus memastikan:

✓ Tidak ada syntax error.

✓ Flow lama tetap berjalan.

✓ Flow baru berjalan.

✓ Tidak ada regression.

✓ Tidak ada callback rusak.

✓ Tidak ada state rusak.

---

# 25. DOCUMENTATION STANDARD

Jika menambah fitur besar.

Developer wajib memperbarui:

Flow

PRD

API

Data Model

Roadmap

Architecture

---

# 26. GIT STANDARD

Branch:

feature/...

bugfix/...

hotfix/...

refactor/...

Commit Message:

feat:

fix:

docs:

refactor:

test:

chore:

Contoh:

feat: add OCR receipt parser

fix: resolve wallet balance calculation

docs: update AI memory

---

# 27. DEFINITION OF GOOD CODE

Kode dianggap baik apabila:

Mudah dibaca.

Mudah diuji.

Mudah diperbaiki.

Mudah dikembangkan.

Tidak mengejutkan developer lain.

---

# 28. FINAL PRINCIPLE

Kode yang baik bukanlah kode yang paling pintar.

Kode yang baik adalah kode yang:

Dapat dipahami dalam beberapa menit.

Mudah dipelihara selama bertahun-tahun.

Stabil ketika project berkembang.

Seluruh keputusan implementasi harus mengutamakan keberlangsungan project CuanTrack, bukan preferensi pribadi developer maupun AI.