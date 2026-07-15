# TELEGRAM BOT SPECIFICATION

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Telegram Bot Specification
Status         : Production

---

# 1. PURPOSE

Dokumen ini mendefinisikan seluruh spesifikasi Telegram Bot CuanTrack.

Dokumen menjadi acuan bagi:

- Backend Developer
- Telegram Bot Developer
- AI Assistant
- QA Engineer

Seluruh perubahan Telegram Bot wajib mengikuti spesifikasi ini.

---

# 2. BOT OBJECTIVE

Telegram Bot merupakan platform utama CuanTrack.

Tujuan bot:

- Mencatat transaksi secepat mungkin.
- Mengurangi input manual.
- Menjadi AI Personal Finance Assistant.
- Menjadi pusat notifikasi pengguna.

Dashboard hanya melengkapi pengalaman pengguna.

---

# 3. BOT PHILOSOPHY

Telegram digunakan karena:

- Cepat.
- Familiar.
- Ringan.
- Selalu dibuka pengguna.
- Cocok untuk AI Chat.

Target utama.

Input transaksi < 10 detik.

---

# 4. USER JOURNEY

```text
/start

↓

Onboarding

↓

Setup Wallet

↓

Dashboard Bot

↓

Catat Transaksi

↓

Ringkasan

↓

Daily Usage

↓

Dashboard Web

↓

Premium
```

---

# 5. BOT MENU

Menu utama.

💸 Catat Transaksi

📷 Scan Struk

🎙 Voice AI

👛 Dompet

📊 Ringkasan

🎯 Target

💰 Budget

⚙ Pengaturan

🌐 Dashboard

⭐ Premium

---

# 6. COMMAND LIST

General

/start

/help

/settings

/dashboard

/upgrade

Finance

/masuk

/keluar

/transfer

/dompet

/ringkasan

/budget

/goal

/utang

/piutang

AI

/scan

/voice

/ai

System

/cancel

/back

---

# 7. QUICK COMMAND

Income

/masuk 50000 gopay gaji

Expense

/keluar 18000 gopay kopi

Transfer

/transfer 100000 bca gopay

Goal

/goal 1000000 laptop

Budget

/budget makan 1000000

Quick Command menjadi prioritas utama dibanding wizard.

---

# 8. ONBOARDING FLOW

/start

↓

Welcome

↓

Pilih Bahasa

↓

Persetujuan Kebijakan

↓

Buat Wallet Pertama

↓

Pilih Mata Uang

↓

Tutorial Singkat

↓

Home

Target onboarding < 2 menit.

---

# 9. HOME SCREEN

Menampilkan:

- Sapaan
- Status paket (Free/Premium)
- Ringkasan saldo
- Penggunaan kuota bulan ini
- Shortcut utama
- Tombol Dashboard

---

# 10. TRANSACTION FLOW

Quick Command

↓

Parser

↓

AI Validation

↓

Preview

↓

Konfirmasi

↓

Simpan

↓

Saldo diperbarui

---

# 11. OCR FLOW

Kirim Foto

↓

OCR Engine

↓

AI Parser

↓

Preview

↓

Edit (opsional)

↓

Konfirmasi

↓

Simpan

---

# 12. VOICE FLOW

Kirim Voice Note

↓

Speech to Text

↓

AI Parser

↓

Preview

↓

Konfirmasi

↓

Simpan

---

# 13. AI CHAT FLOW

User

↓

AI Intent Detection

↓

Finance Context

↓

Response

AI Chat tidak boleh mengubah data tanpa konfirmasi pengguna.

---

# 14. INLINE KEYBOARD

Gunakan tombol untuk:

- Konfirmasi
- Batal
- Edit
- Pilih Wallet
- Pilih Kategori
- Navigasi

Hindari meminta user mengetik jika pilihan dapat dibuat menjadi tombol.

---

# 15. CALLBACK DATA

Format standar:

module:action

Contoh:

wallet:add

wallet:edit

wallet:delete

transaction:confirm

transaction:cancel

budget:create

goal:add

settings:language

Gunakan format yang konsisten.

---

# 16. SESSION STATE

Seluruh percakapan menggunakan finite state machine.

Setiap state harus:

- Memiliki satu tujuan.
- Mudah dipahami.
- Tidak saling tumpang tindih.
- Dapat dibatalkan dengan /cancel.

---

# 17. ERROR HANDLING

Jika terjadi kesalahan:

- Berikan pesan yang jelas.
- Berikan solusi.
- Jangan tampilkan stack trace.
- Jangan mengakhiri session secara paksa.

---

# 18. FREE PLAN

Limit bulanan:

- 100 transaksi
- 5 OCR
- 10 Voice
- 3 Split Bill

Saat limit tercapai:

- Berikan informasi penggunaan.
- Tawarkan upgrade.
- Jangan memblokir fitur lain yang masih tersedia.

---

# 19. PREMIUM PLAN

Unlimited:

- Transaction
- OCR
- Voice
- Split Bill

Tambahan:

- AI Priority
- Advanced Analytics
- Export
- Dashboard Premium

---

# 20. NOTIFICATION

Bot digunakan untuk:

- Reminder Budget
- Reminder Tagihan
- Reminder Goal
- Reminder Subscription
- Monthly Summary
- Weekly Insight

---

# 21. MESSAGE STYLE

Gunakan Bahasa Indonesia yang:

- Ramah
- Singkat
- Jelas
- Profesional

Hindari paragraf panjang.

Gunakan emoji secukupnya.

---

# 22. UX PRINCIPLES

Prioritas:

1. Sedikit mengetik.
2. Banyak tombol.
3. Konfirmasi sebelum menyimpan.
4. Cepat dipahami.
5. Mobile First.

---

# 23. PERFORMANCE TARGET

/start < 2 detik

Quick Command < 2 detik

OCR Preview < 10 detik

Voice Preview < 10 detik

Ringkasan < 3 detik

---

# 24. ACCESSIBILITY

Seluruh menu harus dapat digunakan hanya dengan Telegram.

Dashboard bersifat pelengkap, bukan syarat.

---

# 25. DEFINITION OF DONE

Perubahan Telegram Bot dianggap selesai apabila:

✓ Flow sesuai spesifikasi.

✓ Session berjalan benar.

✓ Callback valid.

✓ Command valid.

✓ Tidak merusak flow lama.

✓ Dokumentasi diperbarui.

---

# 26. FINAL PRINCIPLE

Telegram Bot adalah wajah utama CuanTrack.

Seluruh keputusan desain harus mengutamakan kecepatan, kesederhanaan, dan kenyamanan pengguna.

Jika ada dua solusi yang sama baiknya, pilih solusi yang mengurangi jumlah langkah yang harus dilakukan pengguna.