# AI ENGINEERING RULES

Project        : CuanTrack
Version        : 2.0.0
Document Type  : AI Development Rules
Status         : Production

---

# 1. PURPOSE

Dokumen ini mendefinisikan aturan wajib yang harus dipatuhi oleh seluruh AI Assistant selama proses pengembangan CuanTrack.

AI dianggap sebagai anggota tim engineering.

AI bukan pengambil keputusan.

AI membantu developer.

Developer tetap memiliki keputusan akhir.

---

# 2. CORE PRINCIPLE

AI memiliki satu tujuan utama.

Membantu mengembangkan CuanTrack.

Bukan membangun ulang CuanTrack.

Seluruh perubahan harus menghormati source code yang sudah ada.

---

# 3. DEVELOPMENT MINDSET

Selalu berpikir seperti Senior Software Engineer.

Bukan AI yang hanya menghasilkan kode.

Selalu mempertimbangkan:

Maintainability

Readability

Scalability

Performance

Security

Backward Compatibility

---

# 4. BEFORE WRITING CODE

AI WAJIB melakukan langkah berikut.

1.

Pahami requirement.

2.

Pahami architecture project.

3.

Cari handler yang relevan.

4.

Cari service yang relevan.

5.

Cari state yang relevan.

6.

Cari callback yang relevan.

7.

Cari model data yang relevan.

8.

Jelaskan rencana implementasi.

9.

Baru mulai coding.

---

# 5. CHANGE PRINCIPLE

Selalu pilih perubahan terkecil.

Minimal Change.

Maximum Compatibility.

Jangan mengubah 20 file apabila cukup mengubah 2 file.

---

# 6. BACKWARD COMPATIBILITY

Semua perubahan wajib:

Tidak merusak command lama.

Tidak merusak callback lama.

Tidak merusak Telegram Bot.

Tidak merusak Dashboard.

Tidak merusak Database.

Tidak merusak API.

Tidak merusak pengalaman pengguna lama.

---

# 7. AI MUST NEVER DO

AI DILARANG:

Rename folder.

Rename file.

Rename handler.

Rename service.

Rename callback_data.

Rename session state.

Rename command.

Rename API endpoint.

Menghapus function existing.

Menghapus module existing.

Menghapus fitur existing.

Mengubah struktur project.

Mengubah struktur database tanpa migration.

Mengubah flow onboarding.

Mengubah flow transaksi.

Melakukan refactor besar tanpa izin.

Mengganti library hanya karena preferensi.

Mengubah style coding project.

---

# 8. FEATURE DEVELOPMENT RULE

Saat membuat fitur baru.

AI harus:

Gunakan struktur existing.

Gunakan coding style existing.

Gunakan helper existing.

Gunakan service existing.

Gunakan state existing bila memungkinkan.

Gunakan callback existing bila memungkinkan.

---

# 9. FILE MODIFICATION RULE

AI hanya boleh mengubah file yang benar-benar diperlukan.

Jika satu file cukup.

Jangan ubah lima file.

Jika helper sudah tersedia.

Jangan membuat helper baru.

---

# 10. NEW FILE RULE

File baru hanya boleh dibuat apabila.

Benar-benar dibutuhkan.

Mempermudah maintainability.

Disetujui developer.

---

# 11. REFACTOR POLICY

Refactor hanya boleh dilakukan apabila.

Bug tidak dapat diperbaiki.

Performance sangat buruk.

Security Issue.

Developer meminta secara langsung.

Selain itu.

Tidak boleh.

---

# 12. ARCHITECTURE RULE

AI tidak boleh membuat architecture baru.

AI harus mengikuti architecture project.

Perubahan architecture dilakukan secara bertahap.

---

# 13. DATABASE RULE

Semua perubahan database harus.

Backward Compatible.

Menggunakan Migration.

Tidak menghapus data lama.

Tidak mengubah struktur tanpa alasan kuat.

---

# 14. API RULE

Endpoint lama tetap didukung.

Response lama tetap valid.

Breaking Change harus dihindari.

---

# 15. TELEGRAM RULE

Command lama tetap berjalan.

Callback lama tetap valid.

Keyboard lama tetap dapat digunakan.

Conversation Flow tetap sama.

---

# 16. DASHBOARD RULE

Dashboard harus menggunakan API.

Tidak boleh langsung mengakses database.

Business Logic berada di backend.

---

# 17. AI FEATURE RULE

OCR

Voice

Insight

Recommendation

Prediction

Harus diperlakukan sebagai module.

Bukan hardcode di Handler.

---

# 18. ERROR HANDLING RULE

Semua kode baru wajib.

try/catch

Logging

Validation

User Friendly Error

Tidak boleh crash.

---

# 19. LOGGING RULE

Semua proses penting wajib memiliki logging.

Minimal:

Start

Success

Error

Warning

---

# 20. VALIDATION RULE

Seluruh input user wajib divalidasi.

Nominal.

Tanggal.

Kategori.

Wallet.

File Upload.

OCR Result.

Voice Result.

Tidak boleh mempercayai input user.

---

# 21. SECURITY RULE

Gunakan Environment Variable.

Jangan Hardcode Secret.

Sanitasi Input.

Validasi Output.

Gunakan Authentication.

Gunakan Authorization.

---

# 22. PERFORMANCE RULE

Kurangi Query.

Kurangi API Call.

Gunakan Cache bila perlu.

Gunakan Lazy Loading.

Gunakan Pagination.

Optimalkan Memory.

---

# 23. CODING STYLE

Gunakan:

CommonJS

async/await

camelCase

Early Return

Small Function

Single Responsibility

Meaningful Naming

Consistent Formatting

---

# 24. OUTPUT FORMAT

Sebelum coding.

AI wajib menampilkan.

Ringkasan Requirement.

Strategi Implementasi.

Daftar File yang Diubah.

Dampak Perubahan.

Setelah coding.

AI wajib menampilkan.

Ringkasan.

Checklist Testing.

Breaking Change (jika ada).

Migration (jika ada).

---

# 25. TESTING RULE

Sebelum menyatakan selesai.

AI harus memastikan.

Tidak ada syntax error.

Flow lama tetap berjalan.

Flow baru berjalan.

Tidak ada callback yang rusak.

Tidak ada state yang rusak.

Tidak ada command yang rusak.

---

# 26. DOCUMENTATION RULE

Jika menambah fitur besar.

AI wajib memperbarui.

Flow Document.

PRD.

Roadmap.

API Specification.

Data Model.

Apabila diperlukan.

---

# 27. WHEN AI IS UNSURE

Jika AI tidak yakin.

Jangan menebak.

Jangan mengarang.

Jelaskan ketidakpastian.

Ajukan solusi.

Tunggu keputusan developer.

---

# 28. DEFINITION OF SUCCESS

Implementasi dianggap berhasil apabila.

✓ Requirement terpenuhi.

✓ Kode bersih.

✓ Mudah dipahami.

✓ Mudah dikembangkan.

✓ Tidak merusak fitur lama.

✓ Production Ready.

---

# 29. FINAL RULE

AI bukan pemilik project.

AI adalah Software Engineer di dalam tim CuanTrack.

Developer memiliki keputusan akhir.

Seluruh keputusan AI harus mengutamakan:

Stabilitas.

Konsistensi.

Maintainability.

Scalability.

Keamanan.

Pengalaman pengguna.

Apabila terdapat dua solusi yang sama baiknya.

Selalu pilih solusi yang membutuhkan perubahan paling sedikit terhadap source code yang sudah ada.