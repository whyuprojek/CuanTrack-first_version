# AI MEMORY

Version      : 2.0.0
Project       : CuanTrack
Document Type : Engineering Memory
Status        : Production
Owner         : CuanTrack Team

---

# PURPOSE

Dokumen ini adalah sumber kebenaran (Single Source of Truth) bagi seluruh AI Assistant yang berkontribusi pada pengembangan CuanTrack.

Seluruh AI wajib membaca dokumen ini sebelum melakukan:

- Analisis project
- Menjawab pertanyaan mengenai source code
- Menulis kode
- Memperbaiki bug
- Menambah fitur
- Melakukan optimasi
- Melakukan refactor

Apabila terdapat konflik antara asumsi AI dengan dokumen ini, maka dokumen ini memiliki prioritas yang lebih tinggi.

---

# PROJECT IDENTITY

Project Name

CuanTrack

Product Type

AI Personal Finance Assistant

Platform

Telegram Bot
Web Dashboard

Current Stage

MVP menuju SaaS Production

Primary Market

Indonesia

Language

Bahasa Indonesia

Target Audience

• Mahasiswa

• Freelancer

• Karyawan

• UMKM

• Trader

• Pebisnis Online

• Content Creator

---

# PRODUCT VISION

CuanTrack bukan sekadar aplikasi pencatat keuangan.

CuanTrack adalah AI Personal Finance Assistant yang membantu pengguna mengelola uang sehari-hari dengan cara yang paling sederhana.

Visi jangka panjang adalah menjadikan AI sebagai "asisten keuangan pribadi", bukan hanya alat pencatat transaksi.

---

# PRODUCT PHILOSOPHY

Semakin mudah mencatat transaksi,
semakin besar kemungkinan pengguna akan konsisten.

Karena itu seluruh desain produk harus mengikuti prinsip berikut.

Input lebih penting daripada laporan.

AI membantu pengguna.

Bukan menggantikan pengguna.

Dashboard melengkapi Telegram.

Telegram bukan pelengkap Dashboard.

Semua fitur harus mengurangi jumlah klik.

---

# CORE EXPERIENCE

Target pengalaman pengguna.

Buka Telegram.

↓

Ketik

/keluar 18000 kopi

↓

atau

Kirim foto struk.

↓

atau

Kirim voice note.

↓

AI memahami transaksi.

↓

User konfirmasi.

↓

Transaksi tersimpan.

Target waktu:

< 10 detik.

---

# PRODUCT POSITIONING

Bukan ERP.

Bukan software akuntansi.

Bukan aplikasi pembukuan perusahaan.

CuanTrack adalah AI Personal Finance Assistant.

---

# PLATFORM STRATEGY

Telegram

Berfungsi sebagai:

- Input tercepat

- OCR

- Voice

- Reminder

- Notifikasi

- Quick Report

Dashboard

Berfungsi sebagai:

- Edit transaksi

- Analisis

- Grafik

- Budget

- Goals

- Split Bill

- Hutang Piutang

- Import Data

- Pengaturan

- Subscription

---

# ENGINEERING PHILOSOPHY

Project harus berkembang secara bertahap.

Prioritas utama.

1.
Stabilitas.

2.
Maintainability.

3.
Readability.

4.
Performance.

5.
Scalability.

Jangan mengejar teknologi terbaru apabila tidak memberikan manfaat nyata.

---

# ARCHITECTURE PRINCIPLES

Architecture existing dianggap benar.

AI harus menghormati architecture yang sudah ada.

Tambahkan.

Jangan mengganti.

Perbaiki.

Jangan membangun ulang.

Optimasi.

Jangan melakukan refactor besar.

---

# BACKWARD COMPATIBILITY

Semua perubahan harus:

Backward Compatible.

Artinya.

User lama tetap dapat menggunakan aplikasi tanpa perubahan.

Database lama tetap valid.

Flow lama tetap berjalan.

Command lama tetap berjalan.

---

# DEVELOPMENT PRINCIPLES

Saat menambah fitur.

Selalu lakukan perubahan sekecil mungkin.

Gunakan struktur project yang sudah ada.

Cari handler yang relevan.

Cari service yang relevan.

Cari state yang relevan.

Jangan membuat architecture baru apabila belum diperlukan.

---

# WHAT AI MUST NEVER DO

AI DILARANG:

Rename folder.

Rename file.

Rename handler.

Rename callback_data.

Rename command.

Rename state.

Mengubah flow onboarding.

Mengubah flow transaksi.

Mengubah struktur keyboard.

Mengubah struktur database tanpa migration.

Mengubah struktur API tanpa alasan.

Menghapus function lama.

Menghapus service.

Menghapus handler.

Melakukan refactor massal.

Memindahkan file hanya karena preferensi pribadi.

Mengganti coding style existing.

---

# AI CODING WORKFLOW

Sebelum coding.

AI wajib.

1.

Memahami requirement.

2.

Membaca source code yang relevan.

3.

Menentukan file yang akan diubah.

4.

Menentukan dampak perubahan.

5.

Menjelaskan rencana.

6.

Baru mulai coding.

---

# CHANGE POLICY

AI tidak boleh mengubah lebih banyak file daripada yang diperlukan.

Minimal change.

Maximum compatibility.

---

# FILE CREATION POLICY

Selalu prioritaskan menggunakan file yang sudah ada.

File baru hanya dibuat apabila.

- benar-benar dibutuhkan.

- meningkatkan maintainability.

- disetujui oleh developer.

---

# ERROR HANDLING

Semua fitur baru wajib.

Menggunakan logging.

Menggunakan try/catch.

Tidak membuat bot crash.

Memberikan pesan error yang jelas.

---

# PERFORMANCE PRINCIPLES

Selalu utamakan.

Respons cepat.

Query minimal.

Memory efisien.

Network request minimal.

Lazy loading apabila diperlukan.

---

# SECURITY PRINCIPLES

Jangan menyimpan credential di source code.

Jangan hardcode API Key.

Validasi seluruh input.

Sanitasi data.

Selalu gunakan environment variable.

---

# USER EXPERIENCE PRINCIPLES

User tidak suka mengetik panjang.

Kurangi langkah.

Kurangi klik.

Kurangi menu.

Gunakan AI untuk membantu.

---

# LONG TERM VISION

Tahap 1

Bot Telegram.

Tahap 2

Dashboard Web.

Tahap 3

OCR.

Voice.

Split Bill.

Goals.

Budget.

Recurring.

Import Mutasi.

Tahap 4

Premium.

Subscription.

Analytics.

AI Insight.

Tahap 5

AI Financial Coach.

Cashflow Prediction.

Investment Insight.

Family Finance.

Business Finance.

---

# DEFINITION OF DONE

Sebuah fitur dianggap selesai apabila.

✓ Berjalan sesuai requirement.

✓ Tidak merusak flow lama.

✓ Tidak merusak database.

✓ Tidak merusak Telegram Bot.

✓ Sudah diuji.

✓ Mudah dipelihara.

✓ Mudah dikembangkan.

---

# FINAL PRINCIPLE

AI bukan pemilik project.

AI adalah Software Engineer dalam tim CuanTrack.

Tugas AI adalah membantu developer mengembangkan CuanTrack.

Bukan membangun ulang CuanTrack.

Setiap keputusan harus mengutamakan:

Stabilitas.

Konsistensi.

Maintainability.

Scalability.

Keberlanjutan project.