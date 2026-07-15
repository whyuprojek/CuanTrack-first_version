# WEB DASHBOARD SPECIFICATION

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Web Dashboard Specification
Status         : Production

---

# 1. PURPOSE

Dokumen ini mendefinisikan spesifikasi lengkap Web Dashboard CuanTrack.

Dokumen menjadi acuan utama bagi:

- Frontend Developer
- Backend Developer
- UI/UX Designer
- AI Coding Assistant
- QA Engineer

Dashboard merupakan pusat pengelolaan seluruh data pengguna, sedangkan Telegram Bot difokuskan sebagai media input tercepat.

---

# 2. PRODUCT GOAL

Dashboard harus memungkinkan pengguna melakukan seluruh aktivitas pengelolaan keuangan tanpa harus menggunakan Telegram.

Telegram digunakan untuk input cepat.

Dashboard digunakan untuk:

- Mengelola data
- Melihat laporan
- Menganalisis keuangan
- Mengatur konfigurasi akun

---

# 3. DESIGN PRINCIPLES

Dashboard harus memenuhi prinsip berikut.

✓ Clean

✓ Modern

✓ Fast

✓ Mobile Responsive

✓ Accessible

✓ AI Friendly

✓ Minimal Learning Curve

---

# 4. TARGET DEVICE

Desktop

Laptop

Tablet

Mobile Browser

Semua halaman wajib responsive.

---

# 5. DASHBOARD STRUCTURE

```text
Dashboard

├── Overview
├── Transactions
├── Wallets
├── Categories
├── Budget
├── Goals
├── Debt
├── Receivables
├── Split Bill
├── Reports
├── AI Insight
├── Notifications
├── Subscription
├── Settings
└── Profile
```

---

# 6. SIDEBAR MENU

Sidebar utama.

🏠 Dashboard

💸 Transactions

👛 Wallets

🏷 Categories

💰 Budget

🎯 Goals

🤝 Split Bill

💳 Debt

📥 Receivables

📊 Reports

🤖 AI Insight

🔔 Notifications

⭐ Premium

⚙ Settings

👤 Profile

---

# 7. DASHBOARD HOME

Menampilkan.

Total Balance

Income

Expense

Cashflow

Financial Score (Future)

Recent Transactions

Upcoming Bills

Budget Progress

Saving Goal Progress

Quick Action

Dashboard Home harus menjadi halaman pertama setelah login.

---

# 8. TRANSACTIONS PAGE

Fitur.

Tambah transaksi

Edit transaksi

Hapus transaksi

Cari transaksi

Filter transaksi

Import

Export

OCR History

Voice History

Pagination

---

# 9. WALLET PAGE

User dapat.

Membuat wallet.

Mengubah wallet.

Menghapus wallet.

Mengubah warna.

Mengubah icon.

Mengatur wallet default.

Melihat saldo.

Transfer antar wallet.

---

# 10. CATEGORY PAGE

Kategori dapat.

Ditambah.

Diubah.

Diarsipkan.

Dihapus (jika tidak digunakan).

Dikelompokkan berdasarkan:

Income

Expense

---

# 11. BUDGET PAGE

Menampilkan.

Budget Bulanan.

Progress.

Remaining Budget.

Warning.

History.

Perbandingan bulan sebelumnya.

---

# 12. GOALS PAGE

Menampilkan.

Saving Goals.

Target.

Progress.

Persentase.

Deadline.

Deposit.

Withdrawal.

Riwayat.

---

# 13. DEBT PAGE

Menampilkan.

Daftar hutang.

Status.

Sisa hutang.

Riwayat cicilan.

Reminder.

Lunas.

---

# 14. RECEIVABLE PAGE

Menampilkan.

Daftar piutang.

Sisa piutang.

Reminder.

Riwayat pembayaran.

Status.

---

# 15. SPLIT BILL PAGE

Fitur.

Buat Split Bill.

Tambah peserta.

Atur metode pembagian.

Pantau pembayaran.

Generate link.

Riwayat.

---

# 16. REPORT PAGE

Jenis laporan.

Bulanan.

Tahunan.

Kategori.

Wallet.

Cashflow.

Income vs Expense.

Export PDF.

Export Excel.

---

# 17. AI INSIGHT PAGE

Menampilkan.

Financial Summary.

Top Spending.

Budget Recommendation.

Saving Recommendation.

Cashflow Analysis.

Monthly Insight.

AI Recommendation.

AI tidak mengubah data pengguna.

AI hanya memberikan analisis.

---

# 18. NOTIFICATION PAGE

Riwayat.

Reminder.

Budget Alert.

Goal Alert.

Subscription.

Bills.

System Notification.

---

# 19. PREMIUM PAGE

Menampilkan.

Paket.

Harga.

Fitur.

Riwayat pembayaran.

Status langganan.

Upgrade.

Downgrade.

---

# 20. SETTINGS PAGE

Pengguna dapat mengubah.

Nama.

Bahasa.

Zona waktu.

Mata uang.

Tema.

Notifikasi.

Privasi.

Integrasi Telegram.

---

# 21. PROFILE PAGE

Menampilkan.

Foto.

Telegram.

Email.

Paket.

Tanggal bergabung.

Statistik penggunaan.

---

# 22. QUICK ACTION

Dashboard menyediakan tombol cepat.

Tambah Income.

Tambah Expense.

Scan Receipt.

Voice Input.

Transfer.

Tambah Wallet.

Tambah Goal.

---

# 23. GLOBAL SEARCH

Dashboard wajib memiliki pencarian global.

Mencari.

Transaksi.

Wallet.

Kategori.

Goal.

Debt.

Receivable.

---

# 24. FILTER SYSTEM

Semua halaman yang memiliki daftar data wajib mendukung filter.

Tanggal.

Kategori.

Wallet.

Nominal.

Status.

Keyword.

---

# 25. TABLE STANDARD

Semua tabel wajib memiliki.

Pagination.

Sorting.

Filtering.

Search.

Export.

Responsive.

---

# 26. CHART STANDARD

Gunakan grafik sederhana.

Income vs Expense.

Cashflow.

Budget.

Wallet Distribution.

Kategori.

Trend Bulanan.

Chart tidak boleh memperlambat halaman.

---

# 27. EMPTY STATE

Jika data kosong.

Dashboard harus memberikan:

Pesan yang jelas.

Ajakan membuat data pertama.

Shortcut.

Tidak boleh menampilkan halaman kosong.

---

# 28. ERROR STATE

Jika terjadi error.

Tampilkan:

Pesan.

Retry.

Refresh.

Hubungi Support.

Jangan tampilkan stack trace.

---

# 29. LOADING STATE

Gunakan skeleton loading.

Hindari loading spinner penuh kecuali proses lama.

---

# 30. RESPONSIVE RULE

Desktop.

Sidebar tetap.

Tablet.

Sidebar collapse.

Mobile.

Bottom Navigation + Drawer.

---

# 31. PERFORMANCE TARGET

Dashboard Load

< 2 detik

Navigation

< 500 ms

Search

< 500 ms

Chart

< 2 detik

---

# 32. ACCESSIBILITY

Keyboard Friendly.

Screen Reader Friendly.

Kontras warna cukup.

Ukuran klik minimal 44px.

---

# 33. SECURITY

Semua request melalui Backend API.

Tidak ada business logic di frontend.

Tidak menyimpan secret.

Menggunakan JWT Session.

---

# 34. FUTURE MODULE

Investment.

Crypto.

Open Banking.

Family Dashboard.

Business Dashboard.

Workspace.

Marketplace.

Plugin.

---

# 35. DEFINITION OF DONE

Halaman dianggap selesai apabila.

✓ Responsive.

✓ Terhubung API.

✓ Loading State.

✓ Empty State.

✓ Error State.

✓ Validation.

✓ Testing.

✓ Accessibility.

---

# 36. FINAL PRINCIPLE

Dashboard bukan sekadar tempat melihat data.

Dashboard adalah pusat kendali seluruh aktivitas pengguna di CuanTrack.

Setiap halaman harus membantu pengguna memahami kondisi keuangan mereka dengan cepat, sederhana, dan nyaman.

Jika terdapat dua alternatif desain yang sama baiknya, pilih desain yang membutuhkan lebih sedikit klik, lebih mudah dipahami pengguna baru, dan lebih konsisten dengan keseluruhan pengalaman CuanTrack.