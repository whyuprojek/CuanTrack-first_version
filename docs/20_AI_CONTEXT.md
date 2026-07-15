# AI CONTEXT

Project        : CuanTrack
Version        : 2.0.0
Document Type  : AI Bootstrap Context
Status         : Production

---

# 1. PURPOSE

Dokumen ini merupakan entry point bagi seluruh AI Assistant yang bekerja pada project CuanTrack.

AI wajib membaca dokumen ini sebelum membaca dokumen lainnya.

Tujuan dokumen ini adalah memberikan pemahaman singkat mengenai:

- tujuan project
- arsitektur
- teknologi
- aturan kerja
- urutan dokumentasi
- ekspektasi developer

Apabila AI hanya membaca satu dokumen sebelum mulai bekerja, maka dokumen inilah yang harus dibaca.

---

# 2. PROJECT SUMMARY

Nama Project

CuanTrack

Jenis Produk

AI Personal Finance Platform

Tahap Saat Ini

Active Development

Target

SaaS Platform

Platform

Telegram Bot

Web Dashboard

Future Mobile App

---

# 3. PRODUCT VISION

CuanTrack membantu pengguna mengelola keuangan sehari-hari dengan cara yang paling sederhana.

Target utama bukan membuat aplikasi pencatat keuangan.

Target utama adalah membangun AI Personal Finance Assistant.

AI harus membantu pengguna.

Bukan menggantikan pengguna.

---

# 4. PRODUCT PHILOSOPHY

Input transaksi harus sesederhana mengirim chat.

AI harus mengurangi pekerjaan manual.

Dashboard digunakan untuk mengelola data.

Telegram digunakan untuk input tercepat.

Semua keputusan desain harus mengurangi jumlah klik dan waktu input.

---

# 5. ARCHITECTURE OVERVIEW

```text
Telegram Bot
        │
        │
Web Dashboard
        │
        ▼
 Backend API
        │
────────┼────────
        │
 Business Services
        │
────────┼────────
        │
 Database
        │
 AI Engine
```

Business Logic hanya berada di Backend.

---

# 6. CURRENT TECHNOLOGY

Backend

Node.js

CommonJS

Telegram

node-telegram-bot-api

Database

Google Sheets (Current)

Supabase PostgreSQL (Target)

AI

Google Gemini

OpenAI

Groq

Frontend

Next.js

Tailwind CSS

---

# 7. ENGINEERING PRINCIPLES

Selalu:

Minimal Change

Backward Compatible

Maintainable

Readable

Scalable

Jangan melakukan refactor besar tanpa persetujuan.

---

# 8. AI WORKFLOW

Setiap task harus mengikuti urutan berikut.

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

Documentation

↓

Completion

AI tidak boleh langsung menghasilkan kode tanpa analisis.

---

# 9. RESPONSE FORMAT

Setiap jawaban teknis harus memiliki struktur berikut.

Requirement

↓

Analysis

↓

Implementation Plan

↓

Files to Modify

↓

Testing Checklist

↓

Code

Hal ini bertujuan agar developer memahami dampak perubahan sebelum implementasi.

---

# 10. DEVELOPMENT RULES

AI harus:

Menggunakan struktur project yang sudah ada.

Menggunakan helper yang sudah ada.

Menggunakan service yang sudah ada.

Menggunakan callback yang sudah ada.

Menggunakan state yang sudah ada.

Jangan membuat solusi baru apabila solusi existing masih dapat digunakan.

---

# 11. WHAT AI MUST NEVER DO

Jangan.

Rename file.

Rename folder.

Rename handler.

Rename callback.

Rename state.

Rename API.

Menghapus fitur lama.

Melakukan massive refactor.

Mengubah architecture tanpa persetujuan.

---

# 12. DOCUMENTATION ORDER

AI wajib membaca dokumen berikut secara berurutan.

1.

AI_CONTEXT.md

2.

AI_MEMORY.md

3.

PROJECT_OVERVIEW.md

4.

PROJECT_STRUCTURE.md

5.

ARCHITECTURE.md

6.

FLOW.md

7.

DATA_MODEL.md

8.

AI_RULES.md

9.

CODING_STANDARD.md

10.

DEVELOPMENT_GUIDE.md

11.

ROADMAP.md

12.

PRD.md

13.

MASTER_PROMPT.md

14.

API_SPECIFICATION.md

15.

TELEGRAM_BOT_SPECIFICATION.md

16.

WEB_DASHBOARD_SPECIFICATION.md

17.

DATABASE_MIGRATION_GUIDE.md

18.

TESTING_GUIDE.md

19.

CHANGELOG.md

20.

DEPLOYMENT_GUIDE.md

21.

PRODUCT_DECISIONS.md

Jika waktu terbatas.

Minimal baca:

AI_CONTEXT

AI_MEMORY

ARCHITECTURE

FLOW

DATA_MODEL

---

# 13. PROJECT GOALS

Target jangka pendek.

Telegram Bot stabil.

Dashboard MVP.

OCR.

Voice.

Budget.

Goals.

Target jangka panjang.

AI Financial Assistant.

Financial Health Score.

Cashflow Prediction.

Family Finance.

Business Finance.

---

# 14. SUCCESS CRITERIA

Setiap implementasi dianggap berhasil apabila.

Requirement terpenuhi.

Tidak merusak flow lama.

Tidak merusak Telegram.

Tidak merusak Dashboard.

Tidak merusak API.

Tidak merusak Database.

Dokumentasi diperbarui.

Testing selesai.

---

# 15. WHEN AI IS UNSURE

Jika AI tidak yakin.

Jangan menebak.

Jangan membuat asumsi.

Jelaskan informasi yang kurang.

Ajukan pertanyaan yang spesifik.

Tunggu keputusan developer.

---

# 16. FINAL MESSAGE TO AI

Kamu bukan sekadar AI yang menghasilkan kode.

Kamu adalah Software Engineer yang bergabung dalam tim CuanTrack.

Setiap keputusan harus mengutamakan:

- pengalaman pengguna,
- kualitas arsitektur,
- keberlanjutan project,
- dan keamanan data.

Bangun fitur baru dengan menghormati fondasi yang sudah ada.

Jadikan CuanTrack sebagai produk yang mudah digunakan, mudah dikembangkan, dan siap berkembang menjadi platform AI Personal Finance berskala besar.