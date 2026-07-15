# V2 MIGRATION PLAN

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Migration Plan
Status         : Active

---

# PURPOSE

Dokumen ini menjadi panduan resmi migrasi CuanTrack V1 menuju CuanTrack V2.

Tujuan utama migrasi adalah meningkatkan kemampuan aplikasi tanpa menghilangkan fondasi yang sudah ada.

Migrasi harus dilakukan secara bertahap, aman, dan selalu menjaga kompatibilitas dengan sistem lama.

---

# MIGRATION PRINCIPLES

Seluruh proses migrasi wajib mengikuti prinsip berikut.

- Jangan melakukan rewrite total.
- Jangan mengubah struktur project tanpa alasan yang kuat.
- Jangan menghapus fitur yang sudah berfungsi.
- Prioritaskan penambahan fitur dibanding penggantian fitur.
- Setiap perubahan harus dapat diuji dan di-rollback.
- Selalu utamakan stabilitas aplikasi.

---

# CURRENT ARCHITECTURE (V1)

Telegram Bot

↓

Google Sheets

↓

AI Service

↓

JSON User Store

↓

Google Drive

Karakteristik:

- Telegram sebagai antarmuka utama.
- Google Sheets sebagai database utama.
- JSON sebagai penyimpanan konfigurasi pengguna.
- Dashboard belum tersedia.
- Subscription belum tersedia.

---

# TARGET ARCHITECTURE (V2)

Telegram Bot

↓

Backend API

↓

Supabase

↓

AI Service

↓

Web Dashboard

↓

Google Sheets Export (Opsional)

Karakteristik:

- Telegram tetap menjadi media utama.
- Dashboard menjadi pusat pengelolaan data.
- Supabase menjadi database utama.
- Google Sheets hanya sebagai fitur ekspor atau backup.
- Mendukung Premium Subscription.

---

# COMPONENT STATUS

## Telegram Bot

Status

KEEP

Alasan

Flow Telegram sudah baik dan menjadi identitas utama CuanTrack.

Perubahan

- Rebranding.
- Penambahan OCR.
- Penambahan Voice.
- Penambahan Split Bill.
- Penambahan Saving Goals.
- Penambahan Premium.

---

## Google Sheets

Status

MIGRATE

Saat ini

Database utama.

Target

Export & Backup.

Semua transaksi utama akan disimpan di Supabase.

---

## User Store

Status

MIGRATE

Saat ini

JSON File.

Target

Database users di Supabase.

JSON hanya digunakan jika mode development diperlukan.

---

## AI Service

Status

KEEP & IMPROVE

Tetap mempertahankan:

- Gemini
- ChatGPT
- Groq

Penambahan:

- OpenRouter (opsional)
- Claude (opsional)
- DeepSeek (opsional)

---

## Logger

Status

KEEP

Tidak ada perubahan besar.

Tambahkan:

- Error Tracking
- Request ID
- Performance Log

---

## Session

Status

KEEP

Flow session tetap digunakan.

Optimasi hanya jika diperlukan.

---

## Handler

Status

KEEP

Tidak dilakukan rewrite.

Jika handler menjadi terlalu besar, pemecahan dilakukan secara bertahap tanpa mengubah perilaku yang sudah ada.

---

## Menu

Status

KEEP

Hanya dilakukan penambahan tombol sesuai fitur baru.

---

## Report

Status

IMPROVE

Tambahan:

- Grafik Dashboard.
- Insight AI.
- Budget Progress.
- Saving Goals.
- Monthly Summary.

---

## Budget

Status

KEEP

Ditambahkan:

- Budget Bulanan.
- Budget Tahunan.
- Notifikasi Budget.

---

# REBRANDING

Semua branding lama:

MoneyFlowID

akan diganti menjadi

CuanTrack

Meliputi:

- Nama Bot
- Pesan
- Logo
- Dokumentasi
- README
- Dashboard
- Website

Perubahan branding tidak boleh mengubah struktur kode.

---

# FEATURE MIGRATION

## Tetap Dipertahankan

- Setup User
- Multi Wallet
- Income
- Expense
- Transfer
- Bills
- Budget
- AI Chat
- Report
- Multi Language
- Broadcast Admin
- Google Sheets Integration

---

## Ditingkatkan

- AI Insight
- Financial Summary
- AI Recommendation
- Logging
- Error Handling
- Performance
- Dashboard Integration

---

## Fitur Baru

### OCR Receipt

Status

NEW

Telegram menerima foto struk.

AI membaca:

- Merchant
- Nominal
- Tanggal
- Kategori

User melakukan konfirmasi sebelum transaksi disimpan.

---

### Voice Transaction

Status

NEW

User mengirim voice note.

AI mengubah menjadi transaksi.

Tetap membutuhkan konfirmasi.

---

### Split Bill

Status

NEW

Mendukung:

- Equal Split
- Custom Split
- Per Item

---

### Saving Goals

Status

NEW

Target tabungan.

Progress.

Reminder.

---

### Debt Management

Status

IMPROVE

Riwayat.

Cicilan.

Reminder.

---

### Subscription

Status

NEW

Free

Premium

Kuota AI.

Kuota OCR.

Kuota Voice.

---

### Dashboard

Status

NEW

Dashboard menjadi pusat pengelolaan.

Fitur:

- Edit transaksi
- Hapus transaksi
- Grafik
- Budget
- Goals
- OCR History
- Voice History
- Profile
- Subscription

---

# DATABASE MIGRATION

Tahap 1

Google Sheets tetap berjalan.

↓

Tahap 2

Supabase mulai menyimpan transaksi baru.

↓

Tahap 3

Dashboard membaca dari Supabase.

↓

Tahap 4

Google Sheets menjadi fitur Export.

---

# DEVELOPMENT STRATEGY

Strategi pengembangan.

1.

Audit kode.

2.

Perbaikan bug.

3.

Rebranding.

4.

Supabase Integration.

5.

OCR.

6.

Voice.

7.

Dashboard.

8.

Subscription.

9.

Optimization.

10.

Production.

---

# BACKWARD COMPATIBILITY

Selama migrasi.

Seluruh command lama tetap berjalan.

Flow lama tetap berjalan.

Data lama tetap dapat digunakan.

Tidak boleh ada breaking change tanpa persetujuan.

---

# SUCCESS CRITERIA

Migrasi dianggap berhasil apabila.

- Telegram Bot tetap stabil.
- Struktur project tetap mudah dipahami.
- Seluruh fitur lama tetap berfungsi.
- Dashboard berhasil terhubung.
- Supabase menjadi database utama.
- Google Sheets berubah menjadi export.
- OCR berjalan.
- Voice berjalan.
- Subscription berjalan.
- Dokumentasi diperbarui.

---

# OUT OF SCOPE

Versi 2.0 tidak mencakup:

- Mobile App Native.
- Akuntansi perusahaan.
- Multi organisasi.
- Marketplace.
- Investasi otomatis.
- Integrasi bank secara langsung.

Fitur-fitur tersebut akan dipertimbangkan pada versi berikutnya.

---

# FINAL PRINCIPLE

CuanTrack V2 bukan proyek baru.

CuanTrack V2 adalah evolusi dari CuanTrack V1.

Seluruh pengembangan harus menghormati fondasi yang sudah ada, mengurangi risiko perubahan, dan memberikan peningkatan yang nyata bagi pengguna.

Setiap fitur baru harus terintegrasi dengan arsitektur lama secara bertahap tanpa mengorbankan stabilitas sistem.