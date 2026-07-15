# API SPECIFICATION

Project        : CuanTrack
Version        : 2.0.0
Document Type  : API Specification
Status         : Production

---

# 1. PURPOSE

Dokumen ini mendefinisikan seluruh kontrak API (Application Programming Interface) yang digunakan oleh CuanTrack.

Dokumen ini menjadi acuan utama bagi:

- Backend Developer
- Frontend Developer
- Telegram Bot
- AI Assistant
- Future Mobile App

Semua endpoint baru harus mengikuti standar pada dokumen ini.

---

# 2. API ARCHITECTURE

```text
Telegram Bot
        │
        │
Web Dashboard
        │
        │
Future Mobile App
        │
        ▼
 REST API
        │
────────┼────────
        │
 Authentication
 Wallet
 Transaction
 Budget
 Goal
 OCR
 Voice
 AI
 Subscription
 Notification
        │
 PostgreSQL
```

---

# 3. BASE URL

Development

/api/v1

Production

https://api.cuantrack.com/v1

---

# 4. API DESIGN PRINCIPLES

RESTful

Stateless

JSON Response

Consistent Structure

Backward Compatible

Versioned API

---

# 5. STANDARD RESPONSE

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": []
}
```

---

# 6. AUTHENTICATION

Telegram Login

POST

/auth/telegram

Google Login

POST

/auth/google

Refresh Token

POST

/auth/refresh

Logout

POST

/auth/logout

Profile

GET

/auth/me

---

# 7. USER ENDPOINT

GET

/users/me

PATCH

/users/me

DELETE

/users/me

GET

/users/settings

PATCH

/users/settings

---

# 8. WALLET ENDPOINT

GET

/wallets

GET

/wallets/{id}

POST

/wallets

PATCH

/wallets/{id}

DELETE

/wallets/{id}

POST

/wallets/{id}/default

GET

/wallets/balance

---

# 9. CATEGORY ENDPOINT

GET

/categories

POST

/categories

PATCH

/categories/{id}

DELETE

/categories/{id}

GET

/categories/default

---

# 10. TRANSACTION ENDPOINT

GET

/transactions

GET

/transactions/{id}

POST

/transactions

PATCH

/transactions/{id}

DELETE

/transactions/{id}

GET

/transactions/history

GET

/transactions/search

POST

/transactions/import

GET

/transactions/export

---

# 11. OCR ENDPOINT

POST

/ocr/upload

GET

/ocr/{id}

POST

/ocr/{id}/confirm

DELETE

/ocr/{id}

---

# 12. VOICE ENDPOINT

POST

/voice/upload

GET

/voice/{id}

POST

/voice/{id}/confirm

DELETE

/voice/{id}

---

# 13. BUDGET ENDPOINT

GET

/budgets

POST

/budgets

PATCH

/budgets/{id}

DELETE

/budgets/{id}

GET

/budgets/summary

---

# 14. GOAL ENDPOINT

GET

/goals

POST

/goals

PATCH

/goals/{id}

DELETE

/goals/{id}

POST

/goals/{id}/deposit

---

# 15. DEBT ENDPOINT

GET

/debts

POST

/debts

PATCH

/debts/{id}

DELETE

/debts/{id}

POST

/debts/{id}/payment

---

# 16. RECEIVABLE ENDPOINT

GET

/receivables

POST

/receivables

PATCH

/receivables/{id}

DELETE

/receivables/{id}

POST

/receivables/{id}/payment

---

# 17. SPLIT BILL ENDPOINT

GET

/split-bills

POST

/split-bills

GET

/split-bills/{id}

PATCH

/split-bills/{id}

DELETE

/split-bills/{id}

POST

/split-bills/{id}/invite

---

# 18. REPORT ENDPOINT

GET

/reports/monthly

GET

/reports/yearly

GET

/reports/category

GET

/reports/wallet

GET

/reports/cashflow

GET

/reports/dashboard

---

# 19. DASHBOARD ENDPOINT

GET

/dashboard/overview

GET

/dashboard/chart

GET

/dashboard/statistics

GET

/dashboard/recent-transactions

GET

/dashboard/budget

---

# 20. AI ENDPOINT

POST

/ai/chat

POST

/ai/category

POST

/ai/summary

POST

/ai/insight

POST

/ai/recommendation

---

# 21. NOTIFICATION ENDPOINT

GET

/notifications

PATCH

/notifications/{id}/read

DELETE

/notifications/{id}

---

# 22. SUBSCRIPTION ENDPOINT

GET

/subscription

POST

/subscription/upgrade

POST

/subscription/cancel

POST

/subscription/webhook

---

# 23. ADMIN ENDPOINT

GET

/admin/users

GET

/admin/statistics

GET

/admin/subscription

GET

/admin/logs

POST

/admin/broadcast

---

# 24. HTTP STATUS CODE

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Too Many Requests

500 Internal Server Error

---

# 25. PAGINATION

```json
{
  "page":1,
  "limit":20,
  "total":150,
  "total_pages":8,
  "data":[]
}
```

---

# 26. FILTERING

Gunakan Query Parameter.

Contoh

GET /transactions?wallet=gopay

GET /transactions?category=food

GET /transactions?month=7

GET /transactions?year=2026

---

# 27. SORTING

Contoh

?sort=date

?sort=-amount

?sort=created_at

---

# 28. API VERSIONING

Gunakan:

/api/v1

Seluruh breaking change dibuat pada versi baru.

---

# 29. SECURITY

JWT Authentication

HTTPS Only

Rate Limiter

Input Validation

Authorization

Audit Log

---

# 30. FINAL PRINCIPLE

API merupakan kontrak utama antara Telegram Bot, Dashboard, AI, dan Backend.

Endpoint yang sudah dipublikasikan tidak boleh diubah tanpa mekanisme versioning.

Backward compatibility harus selalu dijaga agar seluruh client tetap dapat berfungsi dengan baik.