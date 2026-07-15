# CHANGELOG

Project        : CuanTrack
Document Type  : Changelog
Current Version: 2.0.0
Status         : Active

---

# PURPOSE

Dokumen ini mencatat seluruh perubahan yang terjadi pada CuanTrack.

Semua perubahan wajib dicatat agar:

- Riwayat pengembangan terdokumentasi.
- Memudahkan rollback.
- Memudahkan debugging.
- Memudahkan developer baru memahami evolusi project.

Format changelog mengikuti prinsip **Keep a Changelog**, disesuaikan dengan kebutuhan CuanTrack.

---

# CHANGE TYPE

Gunakan kategori berikut.

### Added

Fitur baru.

---

### Changed

Perubahan fitur yang sudah ada.

---

### Fixed

Perbaikan bug.

---

### Removed

Fitur yang dihapus.

---

### Deprecated

Fitur yang akan dihapus.

---

### Security

Perbaikan keamanan.

---

### Performance

Optimasi performa.

---

### Database

Perubahan struktur database.

---

### AI

Perubahan OCR, Voice, AI Insight, AI Recommendation.

---

# VERSION HISTORY

---

# [2.0.0] - In Development

Status

🟡 Development

---

## Added

- Dokumentasi engineering lengkap.
- AI Memory.
- Product Overview.
- Architecture.
- Flow.
- Data Model.
- AI Rules.
- Coding Standard.
- Development Guide.
- Product Roadmap.
- Product Requirements Document.
- Master Prompt.
- API Specification.
- Telegram Bot Specification.
- Web Dashboard Specification.
- Database Migration Guide.
- Testing Guide.

---

## Planned

- Backend API.
- Dashboard Next.js.
- Telegram Bot v2.
- AI OCR.
- AI Voice.
- Subscription System.
- Premium Dashboard.

---

## Notes

Versi ini merupakan fondasi utama CuanTrack sebagai AI Personal Finance Platform.

---

# [1.0.0]

Status

📦 Legacy Reference

Belum tersedia.

Digunakan sebagai referensi proyek awal sebelum dokumentasi engineering dibuat.

---

# RELEASE TEMPLATE

Gunakan template berikut setiap release.

```markdown
# [x.y.z] - YYYY-MM-DD

## Added

-

## Changed

-

## Fixed

-

## Removed

-

## Security

-

## Performance

-

## Database

-

## AI

-

## Notes

-
```

---

# VERSIONING POLICY

Gunakan Semantic Versioning.

```
Major.Minor.Patch
```

Contoh.

```
1.0.0

1.1.0

1.1.1

1.2.0

2.0.0
```

---

## Major

Breaking Change.

Perubahan besar.

Architecture berubah.

---

## Minor

Fitur baru.

Tidak merusak fitur lama.

---

## Patch

Bug Fix.

Optimasi.

Perbaikan kecil.

---

# RELEASE PROCESS

Setiap release harus melalui urutan berikut.

```text
Requirement

↓

Development

↓

Testing

↓

Review

↓

Documentation

↓

Changelog

↓

Release
```

---

# RELEASE CHECKLIST

Sebelum membuat entry baru.

☐ Testing selesai.

☐ Dokumentasi diperbarui.

☐ Migration selesai.

☐ Tidak ada bug kritikal.

☐ Versi diperbarui.

☐ Tag Git dibuat.

---

# GIT TAG

Gunakan format.

```
v1.0.0

v1.1.0

v1.2.0

v2.0.0
```

---

# COMMIT STANDARD

Gunakan Conventional Commit.

```
feat:

fix:

docs:

refactor:

perf:

test:

style:

build:

ci:

chore:
```

Contoh.

```
feat: add OCR receipt parser

fix: resolve wallet balance issue

docs: update API specification

perf: optimize dashboard query

refactor: simplify wallet service
```

---

# HOTFIX POLICY

Jika terjadi bug production.

Gunakan versi Patch.

Contoh.

```
2.0.0

↓

2.0.1
```

Hotfix hanya boleh berisi:

- Bug Fix.
- Security Fix.
- Critical Performance Fix.

Tidak boleh menambahkan fitur baru.

---

# DEPRECATION POLICY

Fitur yang akan dihapus harus melalui tahapan berikut.

Deprecated

↓

Announcement

↓

Migration

↓

Removal

Penghapusan langsung tidak diperbolehkan apabila masih digunakan pengguna.

---

# DOCUMENTATION UPDATE

Setiap release harus memastikan dokumen berikut telah diperbarui jika diperlukan.

- AI_MEMORY.md
- PRD.md
- ROADMAP.md
- API_SPECIFICATION.md
- TELEGRAM_BOT_SPECIFICATION.md
- WEB_DASHBOARD_SPECIFICATION.md
- DATA_MODEL.md
- CHANGELOG.md

---

# FINAL PRINCIPLE

CHANGELOG adalah sumber kebenaran mengenai evolusi CuanTrack.

Setiap perubahan yang memengaruhi pengguna, arsitektur, API, database, AI, maupun pengalaman penggunaan harus dicatat secara konsisten.

Dokumentasi perubahan sama pentingnya dengan perubahan kode itu sendiri.