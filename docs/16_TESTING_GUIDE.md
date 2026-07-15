# TESTING GUIDE

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Testing Guide
Status         : Production

---

# 1. PURPOSE

Dokumen ini menjelaskan standar pengujian seluruh sistem CuanTrack.

Setiap fitur baru, bug fix, refactor, maupun migration wajib melewati proses testing sebelum dianggap selesai.

Dokumen ini berlaku untuk:

- Telegram Bot
- Backend API
- Web Dashboard
- AI Engine
- Database
- Integrasi Third Party

---

# 2. TESTING OBJECTIVE

Tujuan utama testing adalah memastikan:

✓ Fitur berjalan sesuai requirement.

✓ Tidak merusak fitur lama.

✓ Tidak terjadi regression.

✓ Performa tetap baik.

✓ Data tetap konsisten.

✓ Pengalaman pengguna tetap terjaga.

---

# 3. TESTING PRINCIPLES

Testing harus:

Repeatable

Consistent

Independent

Simple

Documented

Automation Friendly

---

# 4. TESTING WORKFLOW

```text
Requirement

↓

Development

↓

Unit Test

↓

Integration Test

↓

Manual Test

↓

Regression Test

↓

Performance Test

↓

Release
```

Testing tidak boleh dilewati.

---

# 5. TEST LEVEL

## Unit Test

Menguji satu function.

Contoh:

calculateBalance()

parseQuickCommand()

validateWallet()

---

## Integration Test

Menguji hubungan antar module.

Contoh:

Telegram → API

API → Database

OCR → Transaction

Voice → AI Parser

---

## System Test

Menguji keseluruhan sistem.

Contoh:

Tambah transaksi → saldo berubah → laporan ikut berubah.

---

## User Acceptance Test

Menguji dari sudut pandang pengguna.

---

# 6. TELEGRAM BOT TEST

Pastikan:

✓ /start

✓ /help

✓ /masuk

✓ /keluar

✓ /transfer

✓ /scan

✓ /voice

✓ /ringkasan

✓ /budget

✓ /goal

✓ /settings

Semua command harus berjalan.

---

# 7. CALLBACK TEST

Seluruh callback harus diuji.

Contoh.

wallet:add

wallet:edit

wallet:delete

transaction:confirm

transaction:cancel

budget:create

goal:create

settings:language

Tidak boleh ada callback mati.

---

# 8. SESSION TEST

Pastikan.

State berpindah dengan benar.

State dapat dibatalkan.

State tidak terkunci.

Session tidak hilang.

---

# 9. QUICK COMMAND TEST

Contoh.

```
/masuk 50000 gopay gaji
```

```
/keluar 18000 kopi
```

```
/transfer 100000 bca gopay
```

Parser harus membaca data dengan benar.

---

# 10. OCR TEST

Upload struk.

Pastikan.

Merchant terbaca.

Nominal benar.

Tanggal benar.

Kategori sesuai.

Preview muncul.

Konfirmasi berhasil.

---

# 11. VOICE TEST

Upload voice.

Pastikan.

Speech berhasil.

Nominal benar.

Kategori benar.

Preview muncul.

Konfirmasi berhasil.

---

# 12. WALLET TEST

Tambah Wallet.

Edit Wallet.

Hapus Wallet.

Default Wallet.

Transfer Wallet.

Saldo berubah.

---

# 13. TRANSACTION TEST

Tambah.

Edit.

Hapus.

Import.

Export.

Filter.

Search.

Summary.

---

# 14. DASHBOARD TEST

Dashboard Home.

Chart.

Statistics.

Wallet.

Budget.

Goal.

Debt.

Split Bill.

Settings.

Responsive.

---

# 15. API TEST

Pastikan.

GET

POST

PUT

PATCH

DELETE

Semua endpoint:

Response benar.

Status Code benar.

Validation benar.

---

# 16. DATABASE TEST

Pastikan.

Insert.

Update.

Delete.

Soft Delete.

Index.

Foreign Key.

Migration.

Rollback.

---

# 17. AI TEST

OCR.

Voice.

Recommendation.

Insight.

Summary.

Pastikan.

Output masuk akal.

Tidak crash.

Tidak menyimpan tanpa konfirmasi.

---

# 18. SECURITY TEST

Authentication.

Authorization.

JWT.

Input Validation.

Rate Limit.

SQL Injection.

XSS.

CSRF (Dashboard).

---

# 19. PERFORMANCE TEST

Telegram Response

< 2 detik

Dashboard

< 2 detik

Search

< 500 ms

API

< 300 ms

OCR

< 10 detik

Voice

< 10 detik

---

# 20. RESPONSIVE TEST

Desktop.

Laptop.

Tablet.

Mobile.

Tidak boleh ada layout rusak.

---

# 21. REGRESSION TEST

Setiap perubahan harus memastikan.

Flow lama tetap berjalan.

Tidak ada command rusak.

Tidak ada callback rusak.

Tidak ada API rusak.

---

# 22. ERROR HANDLING TEST

Pastikan.

Input kosong.

Input salah.

Nominal negatif.

Wallet tidak ada.

Kategori tidak ada.

OCR gagal.

Voice gagal.

Semua menghasilkan pesan yang jelas.

---

# 23. EDGE CASE TEST

Nominal sangat besar.

Nominal nol.

Tanggal masa depan.

Emoji.

Karakter Unicode.

Input panjang.

Upload file rusak.

Internet lambat.

---

# 24. SUBSCRIPTION TEST

Free User.

Premium User.

Quota.

Upgrade.

Downgrade.

Expired.

Renew.

---

# 25. NOTIFICATION TEST

Budget Reminder.

Goal Reminder.

Subscription Reminder.

Monthly Report.

Weekly Summary.

---

# 26. BROWSER TEST

Chrome

Edge

Firefox

Safari (jika didukung)

---

# 27. MANUAL TEST CHECKLIST

Sebelum release.

☐ Login berhasil

☐ Dashboard berjalan

☐ Telegram berjalan

☐ API berjalan

☐ Database normal

☐ OCR normal

☐ Voice normal

☐ Premium normal

☐ Export normal

☐ Import normal

---

# 28. RELEASE CHECKLIST

☐ Semua testing selesai

☐ Tidak ada bug kritikal

☐ Dokumentasi diperbarui

☐ Migration berhasil

☐ Backup tersedia

☐ Changelog diperbarui

---

# 29. BUG SEVERITY

Critical

Aplikasi tidak bisa digunakan.

High

Fitur utama gagal.

Medium

Fitur berjalan tetapi bermasalah.

Low

Masalah UI atau kosmetik.

---

# 30. DEFINITION OF DONE

Sebuah task dianggap selesai apabila.

✓ Semua testing berhasil.

✓ Tidak ada regression.

✓ Tidak ada bug kritikal.

✓ Dokumentasi diperbarui.

✓ Siap dipakai production.

---

# 31. FINAL PRINCIPLE

Testing bukan tahap terakhir.

Testing adalah bagian dari proses pengembangan.

Tidak ada fitur yang dianggap selesai hanya karena berhasil dikompilasi.

Fitur baru dinyatakan selesai apabila telah melalui proses pengujian yang memadai, tidak merusak sistem yang sudah ada, dan memberikan pengalaman yang stabil bagi pengguna CuanTrack.