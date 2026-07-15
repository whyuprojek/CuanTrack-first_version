# APPLICATION FLOW DOCUMENT

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Application Flow
Status         : Production

---

# 1. PURPOSE

Dokumen ini mendeskripsikan seluruh alur bisnis (Business Flow) CuanTrack.

Seluruh developer dan AI wajib mengikuti flow ini saat:

- menambah fitur
- memperbaiki bug
- membuat halaman baru
- membuat command Telegram
- membuat API
- membuat Dashboard

Flow pada dokumen ini menjadi acuan utama sebelum melakukan implementasi.

---

# 2. APPLICATION ENTRY POINT

User dapat masuk ke CuanTrack melalui dua platform.

Telegram Bot

↓

Quick Finance

atau

Web Dashboard

↓

Full Finance Management

---

# 3. USER JOURNEY

```text
Install Bot

↓

/start

↓

Onboarding

↓

Setup Wallet

↓

Setup Category

↓

Mulai Mencatat

↓

Laporan

↓

Budget

↓

Goals

↓

Premium

↓

Dashboard

↓

Daily Usage
```

---

# 4. ONBOARDING FLOW

```text
/start

↓

Welcome

↓

Pilih Bahasa

↓

Setujui Privacy Policy

↓

Buat Wallet Pertama

↓

Pilih Mata Uang

↓

Pilih Kategori Default

↓

Tutorial Singkat

↓

Dashboard Home
```

Target:

< 2 menit.

---

# 5. AUTHENTICATION FLOW

Telegram

↓

Telegram ID

↓

Register

↓

Create User

↓

Generate Profile

↓

Ready

Dashboard

↓

Telegram Login

atau

Google Login (Future)

↓

Session

↓

Dashboard

---

# 6. WALLET FLOW

```text
Tambah Wallet

↓

Nama Wallet

↓

Jenis Wallet

↓

Saldo Awal

↓

Simpan

↓

Wallet Aktif
```

Wallet dapat berupa:

Tunai

Bank

E-Wallet

Investasi

Crypto

Lainnya

---

# 7. QUICK TRANSACTION FLOW

Contoh

/masuk 50000 gopay gaji

↓

Parser

↓

Validation

↓

Wallet

↓

Category

↓

Preview

↓

Konfirmasi

↓

Save

↓

Success

Target waktu:

< 5 detik.

---

# 8. MANUAL TRANSACTION FLOW

```text
Klik

Tambah Transaksi

↓

Pilih Jenis

↓

Input Nominal

↓

Pilih Wallet

↓

Pilih Category

↓

Catatan

↓

Preview

↓

Save
```

---

# 9. OCR RECEIPT FLOW

```text
Foto Struk

↓

OCR Engine

↓

Extract Text

↓

AI Parser

↓

Merchant

↓

Nominal

↓

Tanggal

↓

Kategori

↓

Preview

↓

User Edit

↓

Save
```

---

# 10. VOICE FLOW

```text
Voice Note

↓

Speech To Text

↓

AI Understanding

↓

Transaction Object

↓

Preview

↓

Edit

↓

Save
```

---

# 11. AI PARSER FLOW

Input User

↓

Intent Detection

↓

Transaction Detection

↓

Category Detection

↓

Wallet Detection

↓

Nominal Detection

↓

Validation

↓

Transaction Object

↓

Confirmation

---

# 12. CATEGORY FLOW

Tambah

↓

Edit

↓

Delete

↓

Merge

↓

Archive

↓

Restore

Kategori default tidak boleh dihapus.

---

# 13. BUDGET FLOW

```text
Pilih Bulan

↓

Pilih Category

↓

Input Budget

↓

Save

↓

Monitoring

↓

Alert

↓

Monthly Summary
```

---

# 14. GOALS FLOW

```text
Tambah Goal

↓

Nama

↓

Target

↓

Deadline

↓

Simpan

↓

Progress

↓

Selesai
```

---

# 15. DEBT FLOW

Tambah Hutang

↓

Nama

↓

Nominal

↓

Jatuh Tempo

↓

Cicilan

↓

Reminder

↓

Lunas

---

# 16. RECEIVABLE FLOW

Tambah Piutang

↓

Nama

↓

Nominal

↓

Reminder

↓

Pelunasan

↓

Selesai

---

# 17. SPLIT BILL FLOW

```text
Tambah Tagihan

↓

Pilih Metode

↓

Sama Rata

atau

Custom

↓

Generate Link

↓

Share

↓

Status Pembayaran
```

---

# 18. REPORT FLOW

```text
Dashboard

↓

Pilih Periode

↓

Generate

↓

Chart

↓

Category

↓

Export
```

Telegram

↓

/ringkasan

↓

Generate

↓

Summary

---

# 19. DASHBOARD FLOW

Dashboard

↓

Overview

↓

Wallet

↓

Transaction

↓

Budget

↓

Goals

↓

Debt

↓

Reports

↓

Settings

---

# 20. PREMIUM FLOW

User

↓

Upgrade

↓

Pilih Paket

↓

Pembayaran

↓

Verifikasi

↓

Premium Aktif

↓

Unlock Feature

---

# 21. SUBSCRIPTION FLOW

```text
Expired

↓

Reminder

↓

Renew

↓

Payment

↓

Success
```

---

# 22. NOTIFICATION FLOW

Scheduler

↓

Reminder

↓

Telegram

↓

User

Jenis Reminder:

Budget

Bills

Goals

Subscription

Debt

Recurring Transaction

---

# 23. IMPORT FLOW

CSV

↓

Validation

↓

Preview

↓

Mapping

↓

Import

↓

Success

---

# 24. EXPORT FLOW

User

↓

Export

↓

PDF

atau

Excel

↓

Download

---

# 25. AI INSIGHT FLOW

Data

↓

AI Analysis

↓

Financial Score

↓

Recommendation

↓

Summary

↓

User

---

# 26. ERROR FLOW

Validation Error

↓

User Friendly Message

↓

Retry

↓

Success

Tidak boleh langsung crash.

---

# 27. FUTURE FLOW

Investment Tracking

↓

Cashflow Prediction

↓

Financial Health Score

↓

AI Coach

↓

Smart Recommendation

↓

Automation

---

# 28. STATE MACHINE

Setiap flow wajib memiliki state yang jelas.

State harus:

Predictable

Reusable

Backward Compatible

Tidak boleh mengubah state lama tanpa migration.

---

# 29. DESIGN PRINCIPLE

Semua flow harus memenuhi syarat berikut.

✓ Maksimal sederhana.

✓ Maksimal cepat.

✓ Maksimal jelas.

✓ Mudah dipahami.

✓ Mobile First.

✓ AI First.

---

# 30. FINAL PRINCIPLE

Flow dibuat untuk membantu pengguna menyelesaikan tujuan mereka dengan langkah sesedikit mungkin.

Jika ada dua alternatif implementasi yang sama baiknya, pilih flow yang:

- lebih singkat,
- lebih sedikit klik,
- lebih sedikit input,
- lebih mudah dipahami pengguna baru.