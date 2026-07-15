# PROJECT STRUCTURE

Version        : 2.0.0
Project        : CuanTrack
Document Type  : Engineering Documentation
Status         : Production

---

# 1. PURPOSE

Dokumen ini menjelaskan struktur source code CuanTrack.

Tujuan utama dokumen ini adalah membantu developer dan AI memahami lokasi setiap komponen sehingga pengembangan fitur baru dapat dilakukan tanpa merusak arsitektur yang sudah ada.

Dokumen ini menjadi acuan utama sebelum melakukan perubahan pada source code.

---

# 2. ARCHITECTURE OVERVIEW

CuanTrack menggunakan pendekatan modular.

Setiap folder memiliki tanggung jawab yang jelas.

Tidak diperbolehkan mencampur business logic, data access, dan presentation dalam satu file.

High Level Architecture

Telegram User

↓

Telegram Bot

↓

Middleware

↓

Handler

↓

Service

↓

Storage

↓

Response

---

# 3. CURRENT PROJECT STRUCTURE

```text
cuantrack/

│

├── handlers/

├── services/

├── middleware/

├── locales/

├── config/

├── credentials/

├── data/

├── logs/

├── index.js

├── package.json

└── README.md
```

---

# 4. FOLDER RESPONSIBILITIES

## handlers/

Berisi seluruh business flow Telegram.

Contoh:

- onboarding
- setup
- transaksi
- laporan
- budget
- settings

Handler bertugas menerima request dari Telegram.

Handler TIDAK boleh menyimpan data secara langsung.

Handler harus menggunakan Service.

---

## services/

Berisi business service.

Contoh:

Google Sheets

AI

Logger

User Store

Service bertugas:

- membaca data

- menyimpan data

- memanggil API

- melakukan proses bisnis

Service tidak boleh mengetahui detail Telegram.

---

## middleware/

Berisi middleware project.

Saat ini digunakan untuk:

Session

Conversation State

Authentication (future)

Rate Limit (future)

Logging (future)

---

## locales/

Seluruh text aplikasi.

Semua string user harus berasal dari folder ini.

Dilarang hardcode text ke handler.

---

## config/

Seluruh konfigurasi project.

Contoh:

Default Category

Default Wallet

Constant

Feature Flag

Environment Config

---

## credentials/

Credential pihak ketiga.

Tidak boleh di-commit ke repository public.

---

## data/

Penyimpanan lokal.

Digunakan untuk:

User Cache

JSON

Temporary Data

Bukan database utama.

---

## logs/

Semua logging.

Digunakan debugging.

Tidak boleh digunakan menyimpan data aplikasi.

---

# 5. FILE RESPONSIBILITIES

index.js

Entry Point.

Hanya bertugas:

- inisialisasi bot

- load handler

- register command

- register callback

Business logic tidak boleh berada di sini.

---

# 6. REQUEST FLOW

Telegram User

↓

Telegram API

↓

index.js

↓

Middleware

↓

Handler

↓

Service

↓

Google Sheets

↓

Handler

↓

Telegram Response

---

# 7. DATA FLOW

Input User

↓

Validation

↓

Session

↓

Business Logic

↓

Storage

↓

Response

---

# 8. LAYER RESPONSIBILITY

Presentation Layer

Telegram

Dashboard

Handler

Business Layer

Service

AI

Validation

Data Layer

Google Sheets

JSON

Future Database

---

# 9. DEPENDENCY RULE

Handler

↓

Service

↓

Storage

Handler tidak boleh memanggil storage secara langsung apabila sudah tersedia service.

---

# 10. SESSION FLOW

Telegram

↓

Session

↓

State

↓

Handler

↓

Next State

↓

Complete

Session menjadi sumber kebenaran seluruh conversation.

---

# 11. STATE MACHINE

Seluruh percakapan menggunakan finite state machine.

State menentukan:

- langkah berikutnya

- validasi

- callback

- input user

State tidak boleh diubah tanpa alasan kuat.

---

# 12. CALLBACK FLOW

Telegram Button

↓

Callback Data

↓

Router

↓

Handler

↓

Service

↓

Response

Format callback harus konsisten.

Tidak boleh diubah sembarangan.

---

# 13. GOOGLE SHEETS FLOW

Telegram

↓

Handler

↓

Sheets Service

↓

Google Sheets

↓

Sheets Service

↓

Telegram

Seluruh komunikasi dengan Google Sheets hanya melalui Service.

---

# 14. FUTURE ARCHITECTURE

Telegram

↓

API Layer

↓

Business Layer

↓

Database

↓

Dashboard

↓

AI Engine

↓

Notification

Migrasi dilakukan bertahap.

Tidak dilakukan sekaligus.

---

# 15. FOLDER THAT SHOULD RARELY CHANGE

credentials/

locales/

config/

middleware/

Perubahan harus mempertimbangkan dampak ke seluruh project.

---

# 16. FOLDER THAT WILL GROW

handlers/

services/

Dashboard

API

AI

OCR

Voice

Analytics

Folder-folder tersebut diperkirakan akan terus berkembang.

---

# 17. EXTENSION RULES

Saat menambahkan fitur baru.

AI harus:

Cari handler yang sesuai.

Cari service yang sesuai.

Cari state yang sesuai.

Cari callback yang sesuai.

Tambahkan perubahan sekecil mungkin.

Jangan membuat folder baru apabila belum diperlukan.

---

# 18. FILE MODIFICATION PRIORITY

Jika ingin menambah fitur.

Prioritas:

1.

Tambah function.

2.

Tambah service.

3.

Tambah state.

4.

Tambah callback.

Hindari mengubah flow existing.

---

# 19. REFACTOR POLICY

Refactor hanya boleh dilakukan apabila:

Bug tidak bisa diperbaiki.

Performa sangat buruk.

Maintainability sangat rendah.

Selain itu.

Gunakan pendekatan incremental improvement.

---

# 20. FINAL PRINCIPLE

Project ini dibangun untuk berkembang selama bertahun-tahun.

Karena itu.

Setiap perubahan harus:

Stabil.

Mudah dipahami.

Backward Compatible.

Scalable.

Maintainable.

Jangan pernah mengorbankan stabilitas demi perubahan besar yang tidak diperlukan.