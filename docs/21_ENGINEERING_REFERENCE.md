# ENGINEERING REFERENCE

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Engineering Reference
Status         : Production

---

# PURPOSE

Dokumen ini merupakan referensi utama bagi seluruh developer dan AI Assistant selama proses pengembangan CuanTrack.

Dokumen ini menggabungkan berbagai referensi engineering menjadi satu sumber informasi yang ringkas namun lengkap.

Apabila terdapat konflik dengan dokumentasi lain, gunakan source code sebagai acuan utama dan perbarui dokumentasi setelah implementasi selesai.

---

# 1. DEVELOPMENT PRIORITY

Saat menerima task.

Selalu lakukan urutan berikut.

Requirement

↓

AI Context

↓

Architecture

↓

Flow

↓

Data Model

↓

Engineering Reference

↓

Source Code

↓

Coding

---

# 2. PROJECT LAYERS

Presentation

Telegram Bot

Dashboard

↓

Application

Handler

Middleware

↓

Business

Service

AI

↓

Data

Repository

Database

↓

Infrastructure

External API

Storage

Notification

---

# 3. FOLDER RESPONSIBILITY

handlers/

Mengatur alur Telegram.

services/

Business Logic.

middleware/

Validation.

Session.

Authentication.

config/

Konfigurasi.

data/

Temporary Data.

credentials/

Credential.

logs/

Log aplikasi.

---

# 4. HANDLER RULE

Handler hanya bertugas:

- menerima request
- validasi awal
- memanggil service
- mengembalikan response

Handler tidak boleh mengakses database secara langsung.

---

# 5. SERVICE RULE

Service bertanggung jawab terhadap:

Business Logic.

Query.

AI.

External API.

Storage.

Service tidak boleh bergantung pada Telegram.

---

# 6. STATE RULE

State digunakan hanya untuk Conversation Flow.

Setiap state harus.

Predictable.

Reusable.

Minimal.

Backward Compatible.

---

# 7. CALLBACK RULE

Format.

module:action

Contoh.

wallet:add

wallet:edit

transaction:confirm

goal:create

settings:language

Gunakan callback yang konsisten.

---

# 8. COMMAND RULE

Command harus.

Pendek.

Mudah diingat.

Contoh.

```
/start
/help
/masuk
/keluar
/dompet
/ringkasan
/budget
/goal
/settings
```

---

# 9. FILE MODIFICATION RULE

Sebelum membuat file baru.

Cari.

Handler.

Service.

Helper.

Utility.

Yang sudah ada.

Jika bisa digunakan.

Gunakan.

---

# 10. ERROR HANDLING

Semua module wajib.

try/catch

Logging

Validation

User Friendly Message

---

# 11. LOGGING

Minimal log.

Start.

Success.

Warning.

Error.

---

# 12. DATABASE RULE

Semua perubahan database.

Migration.

Rollback.

Backup.

Documentation.

---

# 13. API RULE

Gunakan REST.

JSON.

Versioning.

Backward Compatible.

---

# 14. AI RULE

OCR.

Voice.

Insight.

Recommendation.

Harus divalidasi.

Tidak boleh langsung menyimpan data.

---

# 15. REVIEW CHECKLIST

Sebelum merge.

☐ Requirement selesai

☐ Flow benar

☐ Data Model benar

☐ AI Rules dipatuhi

☐ Tidak ada breaking change

☐ Testing selesai

☐ Dokumentasi diperbarui

---

# 16. COMMON MISTAKES

Jangan.

Rename file.

Rename folder.

Rename callback.

Rename state.

Hardcode API Key.

Duplicate code.

Massive refactor.

Skip validation.

Skip testing.

---

# 17. AI WORKFLOW

AI wajib.

Analisis.

↓

Planning.

↓

Implementasi.

↓

Testing.

↓

Documentation.

↓

Completion.

---

# 18. WHEN ADDING FEATURE

Cari.

Flow.

↓

Handler.

↓

Service.

↓

Database.

↓

API.

↓

Dashboard.

↓

Telegram.

Baru implementasi.

---

# 19. WHEN FIXING BUG

Cari Root Cause.

Minimal Fix.

Regression Test.

Update Changelog jika diperlukan.

---

# 20. FINAL PRINCIPLE

Seluruh pengembangan CuanTrack harus mengikuti prinsip.

Minimal Change.

Maximum Compatibility.

Maintainability First.

Security First.

AI First.

User Experience First.

CuanTrack dibangun untuk berkembang selama bertahun-tahun.

Seluruh keputusan engineering harus mendukung tujuan tersebut.