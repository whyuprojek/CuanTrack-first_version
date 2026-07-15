# PRODUCT REQUIREMENTS DOCUMENT (PRD)

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Product Requirements Document
Status         : Production
Owner          : CuanTrack Team

---

# 1. EXECUTIVE SUMMARY

## 1.1 Overview

CuanTrack adalah AI Personal Finance Assistant yang membantu pengguna mencatat, mengelola, dan memahami kondisi keuangan melalui Telegram Bot dan Web Dashboard.

Produk dirancang dengan filosofi **AI First**, sehingga pengguna dapat mencatat transaksi hanya dengan mengetik pesan, mengirim foto struk, atau voice note.

Dashboard melengkapi pengalaman tersebut dengan analitik, pengelolaan data, serta fitur lanjutan.

---

## 1.2 Product Vision

Menjadi AI Personal Finance Assistant terbaik di Indonesia.

Bukan sekadar aplikasi pencatat transaksi.

Tetapi asisten yang membantu pengguna mengambil keputusan finansial yang lebih baik.

---

## 1.3 Problem Statement

Sebagian besar aplikasi keuangan memiliki masalah:

- Input transaksi lambat.
- Terlalu banyak langkah.
- Tidak konsisten digunakan.
- Tidak memanfaatkan AI.
- Sulit dipahami pengguna baru.

Akibatnya pengguna berhenti mencatat keuangan dalam beberapa minggu.

---

## 1.4 Solution

CuanTrack menyediakan pengalaman mencatat transaksi melalui:

- Telegram Bot
- OCR Receipt
- Voice Note
- Quick Command
- Dashboard Web

Semua metode menggunakan satu data yang sama.

---

# 2. BUSINESS GOALS

Target bisnis.

- Meningkatkan konsistensi pencatatan keuangan.
- Mengurangi waktu input transaksi.
- Membangun recurring revenue melalui Premium.
- Menjadi platform AI Personal Finance.

---

# 3. PRODUCT GOALS

Produk harus mampu:

✓ Mencatat transaksi dalam < 10 detik.

✓ Mengurangi input manual.

✓ Memberikan insight otomatis.

✓ Mendukung multi wallet.

✓ Mendukung AI.

✓ Siap berkembang menjadi SaaS.

---

# 4. TARGET USER

## Primary

- Mahasiswa
- Karyawan
- Freelancer
- Trader
- UMKM
- Pebisnis Online
- Content Creator

## Secondary

- Pasangan
- Keluarga
- Tim kecil

---

# 5. USER PERSONA

## Persona 1

Nama

Andi

Umur

24

Pekerjaan

Programmer

Masalah

Sering lupa mencatat pengeluaran.

Tujuan

Mencatat transaksi secepat mungkin.

---

## Persona 2

Nama

Siti

Umur

29

Pekerjaan

Online Seller

Masalah

Menggunakan banyak e-wallet.

Tujuan

Memiliki laporan keuangan yang rapi.

---

# 6. CORE FEATURES

## Telegram Bot

- Catat transaksi
- OCR
- Voice
- Reminder
- Quick Report
- Balance

---

## Dashboard

- Dashboard
- Analytics
- Budget
- Goals
- Wallet
- Category
- Settings
- Import
- Export

---

## AI

- OCR
- Voice Parsing
- Auto Category
- AI Summary
- AI Insight
- AI Recommendation

---

# 7. FUNCTIONAL REQUIREMENTS

### Transaction

User dapat:

- membuat transaksi
- mengedit transaksi
- menghapus transaksi
- mencari transaksi
- memfilter transaksi

---

### Wallet

User dapat:

- membuat wallet
- mengedit wallet
- menghapus wallet
- memilih default wallet

---

### Budget

User dapat:

- membuat budget
- melihat progress
- menerima notifikasi

---

### Goals

User dapat:

- membuat target tabungan
- melihat progress
- menyelesaikan target

---

### Debt

User dapat:

- mencatat hutang
- mencatat cicilan
- menerima reminder

---

### Split Bill

User dapat:

- membuat split bill
- mengundang teman
- melihat status pembayaran

---

# 8. NON FUNCTIONAL REQUIREMENTS

Performance

- Respon Telegram < 2 detik.
- Dashboard responsif.

Security

- Authentication.
- Authorization.
- Audit Log.
- Environment Variable.

Scalability

- Mendukung jutaan transaksi.
- Mendukung ribuan pengguna aktif.

Maintainability

- Modular.
- Backward Compatible.
- Mudah diuji.

---

# 9. FREE PLAN

Limit bulanan.

- 100 transaksi
- 5 OCR
- 10 Voice
- 3 Split Bill

---

# 10. PREMIUM PLAN

Unlimited:

- Transaction
- OCR
- Voice
- Split Bill

Tambahan:

- Advanced Analytics
- Priority AI
- Export
- Dashboard Premium

---

# 11. SUCCESS METRICS

- Daily Active User
- Monthly Active User
- Retention
- OCR Usage
- Voice Usage
- Premium Conversion
- Average Transaction/User
- MRR

---

# 12. ACCEPTANCE CRITERIA

Sebuah fitur dianggap selesai apabila:

- Requirement terpenuhi.
- UI sesuai desain.
- Telegram berjalan.
- Dashboard berjalan.
- AI berjalan.
- Dokumentasi diperbarui.
- Tidak ada regression.

---

# 13. FUTURE SCOPE

- Investment Tracker
- Crypto
- Open Banking
- Family Finance
- Business Finance
- AI Coach
- Cashflow Prediction
- Financial Health Score

---

# 14. OUT OF SCOPE

- ERP
- Payroll
- Inventory
- POS
- Accounting Enterprise

---

# 15. PRODUCT PRINCIPLE

Setiap fitur harus:

- Mempermudah pengguna.
- Mengurangi klik.
- Mengurangi waktu input.
- Memanfaatkan AI jika relevan.
- Tetap sederhana.

---

# 16. RELEASE STRATEGY

v1

Telegram MVP

↓

v1.1

AI Input

↓

v1.2

Dashboard

↓

v1.3

Premium

↓

v2

AI Personal Finance Assistant

---

# 17. FINAL STATEMENT

CuanTrack dibangun untuk menjadi platform AI Personal Finance yang sederhana, cepat, dan mudah digunakan.

Seluruh keputusan produk harus selalu mengutamakan pengalaman pengguna, konsistensi, dan keberlanjutan pengembangan.

Apabila terdapat beberapa alternatif implementasi yang sama baiknya, pilih solusi yang memberikan pengalaman pengguna terbaik dengan perubahan arsitektur seminimal mungkin.