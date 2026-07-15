# DATABASE MIGRATION GUIDE

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Database Migration Guide
Status         : Production

---

# 1. PURPOSE

Dokumen ini menjelaskan standar migrasi database pada CuanTrack.

Migration dilakukan untuk memastikan perubahan struktur database dapat dilakukan secara aman tanpa kehilangan data, tanpa downtime yang tidak perlu, dan tanpa merusak kompatibilitas aplikasi.

Dokumen ini berlaku untuk:

- Google Sheets (Current)
- PostgreSQL / Supabase (Future)
- Database Testing
- Database Deployment

---

# 2. MIGRATION PRINCIPLES

Setiap migration wajib memenuhi prinsip berikut.

✓ Aman

✓ Backward Compatible

✓ Dapat diulang (Idempotent bila memungkinkan)

✓ Dapat di-rollback

✓ Tidak menghilangkan data

✓ Mudah diaudit

---

# 3. MIGRATION WORKFLOW

```text
Requirement

↓

Database Design

↓

Migration Script

↓

Local Testing

↓

Staging Testing

↓

Backup Database

↓

Production Migration

↓

Verification

↓

Monitoring
```

Migration tidak boleh langsung dijalankan di production tanpa pengujian.

---

# 4. TYPES OF MIGRATION

Migration dibagi menjadi beberapa kategori.

### Schema Migration

Perubahan struktur tabel.

Contoh:

- tambah kolom
- tambah tabel
- tambah index

---

### Data Migration

Memindahkan atau mengubah data yang sudah ada.

Contoh:

- mengisi default value
- memindahkan data antar tabel
- normalisasi data

---

### Seed Migration

Menambahkan data bawaan.

Contoh:

- kategori default
- mata uang
- bahasa

---

# 5. NAMING CONVENTION

Gunakan format berikut.

```
YYYYMMDD_HHMM_description.sql
```

Contoh.

```
20260710_0900_create_wallet_table.sql

20260711_1500_add_budget_index.sql

20260715_1000_add_subscription_column.sql
```

---

# 6. MIGRATION RULES

Migration hanya boleh:

Tambah tabel.

Tambah kolom.

Tambah index.

Tambah constraint.

Hindari:

Rename tabel.

Rename kolom.

Drop kolom.

Drop tabel.

Breaking Change.

---

# 7. BACKWARD COMPATIBILITY

Migration harus memungkinkan:

Versi lama aplikasi tetap berjalan.

Versi baru aplikasi tetap berjalan.

Data lama tetap dapat dibaca.

---

# 8. BACKUP POLICY

Sebelum migration production.

WAJIB:

Backup database.

Verifikasi backup.

Simpan backup minimal 30 hari.

Pastikan proses restore berhasil.

---

# 9. ROLLBACK POLICY

Setiap migration harus memiliki rollback plan.

Rollback minimal menjelaskan:

- perubahan yang dibatalkan
- data yang dipulihkan
- langkah verifikasi

Jika rollback tidak memungkinkan, alasan harus didokumentasikan.

---

# 10. TABLE CREATION STANDARD

Setiap tabel wajib memiliki:

- Primary Key
- created_at
- updated_at

Disarankan:

- deleted_at (Soft Delete)
- created_by
- updated_by

---

# 11. COLUMN STANDARD

Gunakan nama yang konsisten.

Contoh:

user_id

wallet_id

category_id

created_at

updated_at

Hindari nama yang ambigu.

---

# 12. INDEX STANDARD

Tambahkan index pada kolom yang sering digunakan untuk:

- pencarian
- filter
- join

Contoh:

user_id

wallet_id

transaction_date

category_id

status

---

# 13. FOREIGN KEY STANDARD

Gunakan Foreign Key untuk menjaga integritas data.

Contoh:

Transaction → Wallet

Transaction → Category

Budget → Category

Goal → User

---

# 14. SOFT DELETE POLICY

Gunakan Soft Delete untuk data penting.

Contoh:

Transaction

Wallet

Goal

Debt

Receivable

Gunakan kolom:

deleted_at

---

# 15. DATA VALIDATION

Sebelum migration.

Pastikan:

Tidak ada data duplikat.

Tidak ada orphan record.

Semua foreign key valid.

Semua constraint terpenuhi.

---

# 16. TESTING CHECKLIST

Migration dianggap berhasil apabila.

✓ Script berhasil dijalankan.

✓ Tidak ada error.

✓ Data lama tetap tersedia.

✓ Data baru dapat digunakan.

✓ API tetap berjalan.

✓ Telegram Bot tetap berjalan.

✓ Dashboard tetap berjalan.

---

# 17. GOOGLE SHEETS MIGRATION

Selama masih menggunakan Google Sheets.

Perubahan harus:

Menjaga nama sheet.

Menjaga urutan kolom.

Tidak menghapus formula.

Tidak mengubah struktur tanpa alasan.

Jika diperlukan perubahan besar.

Buat sheet baru.

Jangan menimpa data lama.

---

# 18. SUPABASE MIGRATION

Saat migrasi ke Supabase.

Gunakan migration SQL.

Semua perubahan disimpan dalam repository.

Jangan mengubah schema langsung melalui dashboard production tanpa migration script.

---

# 19. VERSIONING

Setiap migration memiliki:

Nomor versi.

Tanggal.

Penulis.

Deskripsi.

Contoh.

```
Version : 1.2.0

Date : 2026-07-10

Author : CuanTrack Team

Description :

Add subscription table
```

---

# 20. CHANGE MANAGEMENT

Semua migration harus didokumentasikan pada:

CHANGELOG.md

PRD.md (jika mempengaruhi fitur)

DATA_MODEL.md

API_SPECIFICATION.md (jika endpoint berubah)

---

# 21. SECURITY

Migration tidak boleh:

Menyimpan password plaintext.

Menyimpan API key.

Menghapus audit log.

Menghilangkan histori transaksi.

---

# 22. PERFORMANCE

Migration harus memperhatikan:

Waktu eksekusi.

Ukuran data.

Index.

Locking.

Downtime.

Jika migration berpotensi lama.

Gunakan batch processing.

---

# 23. EMERGENCY PROCEDURE

Jika migration gagal.

1. Hentikan deployment.

2. Jangan jalankan migration berikutnya.

3. Restore backup jika diperlukan.

4. Analisis penyebab.

5. Perbaiki migration.

6. Uji kembali.

---

# 24. DEFINITION OF DONE

Migration dinyatakan selesai apabila.

✓ Berhasil dijalankan.

✓ Rollback tersedia.

✓ Dokumentasi diperbarui.

✓ Testing selesai.

✓ Tidak ada kehilangan data.

✓ Production siap digunakan.

---

# 25. FINAL PRINCIPLE

Database adalah aset paling penting dalam CuanTrack.

Perubahan struktur database harus dilakukan secara bertahap, terdokumentasi, dan selalu mengutamakan keamanan data pengguna.

Tidak ada migration yang boleh dijalankan ke production tanpa proses backup, pengujian, dan verifikasi.