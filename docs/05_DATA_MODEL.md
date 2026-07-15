# DATA MODEL

Project        : CuanTrack
Version        : 2.0.0
Document Type  : Data Model
Status         : Production

---

# 1. PURPOSE

Dokumen ini mendefinisikan seluruh entitas utama yang digunakan oleh CuanTrack.

Seluruh implementasi backend, dashboard, Telegram Bot, API, AI, dan database harus mengacu pada model data ini.

Data Model menjadi Single Source of Truth untuk seluruh penyimpanan data.

---

# 2. DESIGN PRINCIPLES

Data harus:

- Normalized
- Scalable
- Maintainable
- Audit Friendly
- Multi User
- Multi Wallet
- Multi Device
- AI Ready

---

# 3. ENTITY RELATIONSHIP

```text
User
 │
 ├── Wallet
 │      │
 │      └── Transaction
 │
 ├── Category
 │      │
 │      └── Budget
 │
 ├── Goal
 │
 ├── Debt
 │
 ├── Receivable
 │
 ├── RecurringTransaction
 │
 ├── OCR Scan
 │
 ├── Voice Record
 │
 ├── Subscription
 │
 └── AI Conversation
```

---

# 4. USER

Representasi satu akun pengguna.

Field

id

telegram_id

email

full_name

username

photo_url

language

timezone

currency

default_wallet_id

subscription_id

status

created_at

updated_at

---

# 5. WALLET

Setiap pengguna dapat memiliki banyak dompet.

Contoh

BCA

BRI

Mandiri

GoPay

OVO

Dana

ShopeePay

Cash

Crypto

Investment

Field

id

user_id

name

type

balance

currency

color

icon

is_default

created_at

updated_at

---

# 6. CATEGORY

Kategori transaksi.

Field

id

user_id

name

icon

color

type

income

expense

system

sort_order

created_at

updated_at

Kategori bawaan tidak boleh dihapus.

---

# 7. TRANSACTION

Merupakan entity terpenting.

Field

id

user_id

wallet_id

category_id

type

amount

note

merchant

location

transaction_date

source

manual

ocr

voice

api

attachment_url

created_at

updated_at

---

# 8. OCR RECEIPT

Data hasil scan AI.

Field

id

user_id

image_url

merchant

total

date

raw_text

confidence

status

transaction_id

created_at

---

# 9. VOICE TRANSACTION

Data hasil Voice AI.

Field

id

user_id

audio_url

transcript

confidence

transaction_id

created_at

---

# 10. BUDGET

Budget bulanan.

Field

id

user_id

category_id

month

year

budget

spent

remaining

created_at

updated_at

---

# 11. GOAL

Saving Goal.

Field

id

user_id

name

target

current

deadline

status

created_at

updated_at

---

# 12. DEBT

Hutang.

Field

id

user_id

person_name

total

remaining

due_date

status

created_at

updated_at

---

# 13. RECEIVABLE

Piutang.

Field

id

user_id

person_name

total

remaining

due_date

status

created_at

updated_at

---

# 14. SPLIT BILL

Split pembayaran.

Field

id

user_id

title

total

method

status

created_at

---

# 15. SPLIT BILL MEMBER

Field

id

split_bill_id

name

amount

paid

paid_at

---

# 16. RECURRING TRANSACTION

Transaksi otomatis.

Field

id

user_id

wallet_id

category_id

amount

frequency

daily

weekly

monthly

yearly

next_run

status

created_at

---

# 17. SUBSCRIPTION

Langganan pengguna.

Field

id

user_id

plan

Free

Premium

Pro

started_at

expired_at

status

payment_provider

transaction_reference

---

# 18. USAGE QUOTA

Kuota Free/Premium.

Field

id

user_id

month

year

transactions_used

ocr_used

voice_used

split_bill_used

api_used

---

# 19. AI CONVERSATION

Riwayat AI.

Field

id

user_id

provider

model

prompt

response

tokens

created_at

---

# 20. NOTIFICATION

Reminder.

Field

id

user_id

type

title

message

schedule

sent_at

status

---

# 21. DEVICE

Perangkat login.

Field

id

user_id

platform

device_name

last_login

ip_address

created_at

---

# 22. FILE STORAGE

Semua file upload.

Field

id

user_id

type

receipt

voice

avatar

attachment

url

size

mime

created_at

---

# 23. AUDIT LOG

Semua aktivitas penting.

Field

id

user_id

action

resource

resource_id

old_value

new_value

created_at

---

# 24. SETTINGS

Pengaturan pengguna.

Field

id

user_id

currency

timezone

theme

language

notification

privacy

created_at

updated_at

---

# 25. DATA OWNERSHIP

Semua data harus memiliki:

user_id

Tidak boleh ada data transaksi tanpa pemilik.

---

# 26. DELETE POLICY

User

↓

Soft Delete

Transaction

↓

Soft Delete

Wallet

↓

Tidak boleh dihapus jika masih memiliki transaksi.

---

# 27. FUTURE ENTITY

Investment

Portfolio

Asset

Liability

Insurance

Tax

Financial Score

AI Recommendation

Cashflow Prediction

Family Account

Workspace

---

# 28. PRIMARY RULE

Semua entity harus:

Memiliki Primary Key.

Timestamp.

Relationship yang jelas.

Tidak boleh menyimpan data yang sama di banyak tempat.

Seluruh relasi menggunakan ID, bukan nama.

---

# 29. FINAL PRINCIPLE

Data Model dirancang agar mampu berkembang dari Telegram Bot sederhana menjadi platform AI Personal Finance berskala SaaS tanpa perlu mengubah struktur dasar database.