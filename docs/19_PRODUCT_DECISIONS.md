# PRODUCT DECISIONS

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Product Decision Log
Status         : Active

---

# PURPOSE

Dokumen ini mencatat alasan di balik keputusan penting yang diambil selama pengembangan CuanTrack.

Tujuannya bukan menjelaskan bagaimana fitur dibuat.

Tetapi menjelaskan mengapa keputusan tersebut diambil.

Developer maupun AI wajib membaca dokumen ini sebelum mengusulkan perubahan besar.

---

# DECISION 001

## Telegram sebagai Platform Utama

Status

Accepted

---

### Decision

Telegram dijadikan media utama interaksi pengguna.

---

### Reason

Telegram memiliki friction yang sangat rendah.

Sebagian besar pengguna sudah membuka Telegram setiap hari.

Input transaksi dapat dilakukan lebih cepat dibanding membuka aplikasi.

---

### Alternative

Mobile App sebagai platform utama.

---

### Why Rejected

Membutuhkan effort pengembangan lebih besar.

User harus membuka aplikasi khusus.

Friction lebih tinggi.

---

# DECISION 002

## Dashboard sebagai Pusat Manajemen

Status

Accepted

---

### Decision

Dashboard digunakan untuk mengelola data.

Telegram digunakan untuk input cepat.

---

### Reason

Dashboard lebih cocok untuk:

Analisis.

Grafik.

Edit transaksi.

Laporan.

Pengaturan.

---

### Impact

UX menjadi lebih sederhana.

---

# DECISION 003

## AI Selalu Meminta Konfirmasi

Status

Accepted

---

### Decision

AI tidak boleh langsung menyimpan transaksi.

---

### Reason

OCR.

Voice.

Natural Language.

Tidak selalu 100% akurat.

Konfirmasi pengguna mengurangi kesalahan pencatatan.

---

# DECISION 004

## Quick Command Diprioritaskan

Status

Accepted

---

### Decision

Quick Command menjadi metode input utama.

---

### Contoh

/keluar 18000 kopi

---

### Reason

Lebih cepat dibanding wizard.

Power User lebih produktif.

---

# DECISION 005

## Multi Wallet Sejak Awal

Status

Accepted

---

### Decision

User dapat memiliki banyak dompet.

---

### Reason

Sebagian besar pengguna Indonesia memiliki:

Bank.

E-Wallet.

Tunai.

Crypto.

---

# DECISION 006

## AI Sebagai Fitur Inti

Status

Accepted

---

### Decision

AI bukan fitur tambahan.

AI adalah bagian inti produk.

---

### AI Digunakan Untuk

OCR.

Voice.

Insight.

Recommendation.

Summary.

---

# DECISION 007

## Freemium Business Model

Status

Accepted

---

### Decision

Produk menggunakan Free dan Premium.

---

### Reason

Memudahkan akuisisi pengguna.

Memberikan jalur monetisasi.

---

# DECISION 008

## Dashboard Tidak Menyimpan Business Logic

Status

Accepted

---

### Decision

Business Logic hanya berada di Backend.

---

### Reason

Menghindari duplikasi.

Memudahkan Mobile App.

Memudahkan API.

---

# DECISION 009

## API Sebagai Single Source

Status

Accepted

---

### Decision

Telegram.

Dashboard.

Future Mobile.

Menggunakan API yang sama.

---

### Reason

Mengurangi duplicate code.

---

# DECISION 010

## Semua Data Dimiliki User

Status

Accepted

---

### Decision

Semua entity memiliki:

user_id

---

### Reason

Mempermudah multi user.

Keamanan lebih baik.

---

# DECISION 011

## OCR Bersifat Opsional

Status

Accepted

---

### Decision

OCR tidak menggantikan input manual.

---

### Reason

Tidak semua transaksi memiliki struk.

---

# DECISION 012

## Voice Bersifat Opsional

Status

Accepted

---

### Decision

Voice hanya alternatif input.

---

### Reason

Tidak semua pengguna nyaman menggunakan voice.

---

# DECISION 013

## Tidak Menggunakan Wizard Jika Tidak Perlu

Status

Accepted

---

### Decision

Prioritaskan tombol.

Prioritaskan quick command.

Wizard hanya digunakan jika benar-benar diperlukan.

---

# DECISION 014

## AI Tidak Mengambil Keputusan Finansial

Status

Accepted

---

### Decision

AI hanya memberikan rekomendasi.

Keputusan tetap berada di pengguna.

---

### Reason

Menghindari ketergantungan.

Mengurangi risiko.

---

# DECISION 015

## Tidak Mengejar Banyak Fitur

Status

Accepted

---

### Decision

Lebih baik sedikit fitur tetapi berkualitas.

---

### Reason

Maintainability.

User Experience.

Kecepatan Development.

---

# DECISION 016

## Backward Compatibility Wajib Dijaga

Status

Accepted

---

### Decision

Fitur baru tidak boleh merusak fitur lama.

---

### Reason

Mengurangi regression.

Mempermudah deployment.

---

# DECISION 017

## AI Tidak Melakukan Refactor Besar

Status

Accepted

---

### Decision

AI hanya melakukan perubahan minimal.

---

### Reason

Mengurangi risiko.

---

# DECISION 018

## User Experience Selalu Menang

Status

Accepted

---

### Decision

Jika ada dua solusi teknis yang sama baiknya.

Pilih yang memberikan UX lebih baik.

---

# DECISION 019

## Dokumentasi Adalah Bagian Produk

Status

Accepted

---

### Decision

Dokumentasi harus diperbarui setiap perubahan besar.

---

### Reason

AI.

Developer baru.

Maintenance.

---

# DECISION 020

## CuanTrack Dibangun Bertahap

Status

Accepted

---

### Tahap

Telegram

↓

Dashboard

↓

AI

↓

Premium

↓

Financial Platform

↓

Financial Ecosystem

---

### Reason

Mengurangi risiko.

Lebih mudah divalidasi.

Lebih mudah berkembang.

---

# FUTURE DECISIONS

Dokumen ini akan terus berkembang.

Setiap keputusan penting wajib dicatat.

Gunakan format berikut.

---

# DECISION XXX

Status

Proposed

Accepted

Rejected

Deprecated

---

### Decision

...

---

### Reason

...

---

### Alternative

...

---

### Impact

...

---

### Date

YYYY-MM-DD

---

### Author

Developer

---

# FINAL PRINCIPLE

Setiap keputusan besar harus memiliki alasan yang jelas.

Keputusan yang terdokumentasi lebih mudah dipahami dibanding asumsi.

Dokumen ini menjadi referensi utama ketika terjadi perbedaan pendapat mengenai arah pengembangan CuanTrack.

Apabila diperlukan perubahan terhadap keputusan yang sudah ada, buat keputusan baru dan jangan menghapus histori keputusan sebelumnya.