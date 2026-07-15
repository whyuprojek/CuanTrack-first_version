# DEVELOPMENT GUIDE

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Engineering SOP
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

Dokumen ini menjelaskan standar operasional (SOP) pengembangan CuanTrack.

Seluruh developer dan AI Assistant wajib mengikuti panduan ini agar proses pengembangan tetap konsisten, aman, dan terukur.

Panduan ini berlaku untuk:

- Feature Development
- Bug Fix
- Refactor
- Database Migration
- API Development
- Telegram Bot
- Dashboard
- AI Module

---

# 2. DEVELOPMENT PRINCIPLES

Seluruh pengembangan harus mengikuti prinsip berikut:

• Feature Driven Development

• Backward Compatible

• Incremental Improvement

• Production First

• Maintainability First

• Security First

• AI Assisted Development

Jangan melakukan perubahan besar apabila dapat diselesaikan dengan perubahan kecil.

---

# 3. DEVELOPMENT WORKFLOW

Semua pekerjaan wajib mengikuti alur berikut.

```text
Requirement

↓

Analysis

↓

Planning

↓

Implementation

↓

Testing

↓

Review

↓

Documentation

↓

Release
```

Tidak boleh melewati salah satu tahap di atas.

---

# 4. STEP 1 — REQUIREMENT ANALYSIS

Sebelum menulis kode.

Developer atau AI wajib memahami:

Tujuan fitur.

Masalah yang diselesaikan.

Dampak terhadap user.

Dampak terhadap architecture.

Dampak terhadap database.

Dampak terhadap Telegram Bot.

Dampak terhadap Dashboard.

---

# 5. STEP 2 — SOURCE CODE ANALYSIS

AI wajib mencari:

Handler terkait.

Service terkait.

State terkait.

Callback terkait.

API terkait.

Database terkait.

Jangan langsung membuat file baru.

---

# 6. STEP 3 — PLANNING

Sebelum coding.

AI wajib menjelaskan:

Ringkasan fitur.

Strategi implementasi.

Daftar file yang akan diubah.

Perubahan database (jika ada).

Perubahan API (jika ada).

Perubahan Flow (jika ada).

Estimasi risiko.

---

# 7. STEP 4 — IMPLEMENTATION

Saat implementasi.

AI harus:

Mengubah file seminimal mungkin.

Menggunakan coding style existing.

Menggunakan helper existing.

Menjaga backward compatibility.

Menghindari duplicate code.

---

# 8. STEP 5 — TESTING

Minimal dilakukan:

✓ Syntax Check

✓ Manual Test

✓ Telegram Flow

✓ Dashboard Flow

✓ Database Validation

✓ Error Handling

✓ AI Validation

Jika satu saja gagal.

Fitur belum dianggap selesai.

---

# 9. STEP 6 — REVIEW

Review dilakukan terhadap:

Readability.

Maintainability.

Performance.

Security.

Architecture.

Consistency.

Backward Compatibility.

---

# 10. STEP 7 — DOCUMENTATION

Jika perubahan mempengaruhi arsitektur atau fitur, dokumentasi berikut harus diperbarui:

AI Memory

Flow

Data Model

API

PRD

Roadmap

Changelog

---

# 11. STEP 8 — RELEASE

Sebelum release.

Pastikan:

Tidak ada error.

Semua fitur berjalan.

Semua command Telegram valid.

Semua callback valid.

Semua state valid.

Semua migration berhasil.

---

# 12. FEATURE DEVELOPMENT CHECKLIST

Sebelum mulai:

☐ Requirement dipahami

☐ Architecture dipahami

☐ Handler ditemukan

☐ Service ditemukan

☐ State ditemukan

☐ Risiko dipahami

Sebelum selesai:

☐ Feature berjalan

☐ Tidak merusak fitur lama

☐ Testing selesai

☐ Dokumentasi diperbarui

---

# 13. BUG FIX WORKFLOW

```text
Bug Report

↓

Reproduce Bug

↓

Cari Root Cause

↓

Minimal Fix

↓

Testing

↓

Release
```

Jangan memperbaiki bug dengan mengubah banyak bagian yang tidak terkait.

---

# 14. REFACTOR WORKFLOW

Refactor hanya boleh dilakukan jika:

• Developer meminta.

• Struktur benar-benar sulit dipelihara.

• Ada masalah performa.

• Ada masalah keamanan.

Refactor bukan bagian dari penambahan fitur.

---

# 15. DATABASE MIGRATION WORKFLOW

```text
Design

↓

Migration

↓

Testing

↓

Deploy

↓

Verification
```

Migration harus:

Backward Compatible.

Tidak menghapus data.

Memiliki rollback plan.

---

# 16. TELEGRAM BOT DEVELOPMENT

Saat menambah command.

Periksa:

Command.

Callback.

Keyboard.

Session State.

Localization.

Help Menu.

---

# 17. DASHBOARD DEVELOPMENT

Saat menambah halaman.

Pastikan:

Menggunakan API.

Tidak langsung query database.

Menggunakan komponen reusable.

Responsive.

Mobile Friendly.

---

# 18. AI FEATURE DEVELOPMENT

Semua fitur AI harus memiliki:

Input Validation.

Confidence Score.

User Confirmation.

Fallback.

Logging.

Audit.

AI tidak boleh langsung menyimpan transaksi tanpa konfirmasi pengguna.

---

# 19. PERFORMANCE GUIDELINE

Hindari:

Duplicate Query.

Nested Loop berlebihan.

API Call berulang.

Loading data yang tidak diperlukan.

Optimalkan:

Cache.

Pagination.

Lazy Loading.

Batch Processing.

---

# 20. SECURITY GUIDELINE

Seluruh input divalidasi.

Gunakan Environment Variable.

Jangan Hardcode Secret.

Sanitasi Input.

Gunakan HTTPS.

Lindungi API.

---

# 21. RELEASE CHECKLIST

Sebelum merge ke production.

☐ Feature selesai.

☐ Testing selesai.

☐ Bug tidak ditemukan.

☐ Dokumentasi diperbarui.

☐ Tidak ada breaking change.

☐ Changelog diperbarui.

---

# 22. AI DEVELOPMENT CHECKLIST

Setiap AI Assistant wajib menjawab pertanyaan berikut sebelum coding:

Apakah saya memahami requirement?

Apakah saya memahami architecture?

Apakah saya memahami flow?

Apakah saya memahami data model?

Apakah saya mengubah file seminimal mungkin?

Apakah saya menjaga backward compatibility?

Apakah saya sudah mempertimbangkan dampak perubahan?

Jika salah satu jawabannya "Tidak", hentikan implementasi dan lakukan analisis ulang.

---

# 23. ENGINEERING ETHICS

Developer maupun AI tidak boleh:

Mengubah kode hanya karena preferensi pribadi.

Mengganti library tanpa alasan yang jelas.

Melakukan refactor tersembunyi.

Menghapus fitur tanpa persetujuan.

Mengorbankan stabilitas demi optimasi kecil.

---

# 24. DEFINITION OF DONE

Sebuah task dinyatakan selesai apabila:

✓ Requirement terpenuhi.

✓ Kode sesuai standar.

✓ Flow lama tetap berjalan.

✓ Tidak ada regression.

✓ Dokumentasi diperbarui.

✓ Siap dipakai di production.

---

# 25. FINAL PRINCIPLE

Setiap perubahan pada CuanTrack harus meningkatkan kualitas produk tanpa mengurangi stabilitas yang sudah ada.

Kecepatan pengembangan penting.

Namun konsistensi, maintainability, dan pengalaman pengguna selalu menjadi prioritas utama.