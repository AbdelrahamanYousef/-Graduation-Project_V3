# Nour Charity — Frontend ↔ Backend API Contract

> **Base URL:** `http://localhost:5000/api`  
> **Auth:** JWT via `Authorization: Bearer <token>`  
> **Roles:** `ADMIN` · `DONOR`  
> **Currency:** All amounts in **EGP** (Egyptian Pounds)  
> **⚠️ PAYMENT IS SIMULATED** — No real payment gateway. The backend simulates payment processing (instant success/failure). No real money is charged.

---

## 1. Authentication

### 1.1 `POST /auth/admin/login`
**Auth:** Public | **Purpose:** Admin panel login

| Field | Type | Constraints |
|-------|------|------------|
| `email` | string | Required, valid email |
| `password` | string | Required, min 6 chars |

**✅ 200:**
```json
{
  "user": { "email": "", "name": "", "nameEn": "", "role": "", "roleEn": "", "loggedInAt": "ISO8601" },
  "token": "JWT string"
}
```
**❌ 401:** `{ "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة" }`

**Logic:** Frontend stores token as `nour-admin-token` and user object as `nour-admin` in localStorage.

---

### 1.2 `POST /auth/donor/login`
**Auth:** Public | **Purpose:** Send OTP to donor phone

| Field | Type | Constraints |
|-------|------|------------|
| `phone` | string | Required, 10-11 digits, Egyptian format (01x) |

**✅ 200:** `{ "message": "OTP sent", "isNewUser": true/false }`

**Logic:** Backend sends a 4-digit OTP (simulated). `isNewUser` tells frontend whether to show registration step after OTP.

---

### 1.3 `POST /auth/donor/verify-otp`
**Auth:** Public | **Purpose:** Verify OTP, return token

| Field | Type | Constraints |
|-------|------|------------|
| `phone` | string | Required |
| `otp` | string | Required, exactly 4 digits |

**✅ 200:**
```json
{
  "user": {
    "phone": "", "name": "", "nameEn": "", "email": "string|null",
    "joinDate": "YYYY-MM-DD", "totalDonations": 0, "donationCount": 0,
    "isNew": true/false, "loggedInAt": "ISO8601"
  },
  "token": "JWT string"
}
```
**❌ 401:** `{ "message": "رمز التحقق غير صحيح" }`

**Logic:** OTP expires after ~5 min. Token stored as `nour-donor-token`, user as `nour-donor`.

---

### 1.4 `POST /auth/donor/register`
**Auth:** Bearer (DONOR) | **Purpose:** Complete new donor profile

| Field | Type | Constraints |
|-------|------|------------|
| `name` | string | Required, min 3 chars |
| `nameEn` | string | Optional |
| `email` | string | Optional, valid email if provided |

**✅ 200:** Updated user object (same shape as 1.3).

---

### 1.5 `GET /auth/me`
**Auth:** Bearer (any) | **Returns:** `{ "user": {...} }` or `{ "user": null }` if invalid token.

### 1.6 `POST /auth/logout`
**Auth:** Bearer | **Returns:** `{ "message": "Logged out" }`

**Logic:** Frontend clears all `nour-admin-*` and `nour-donor-*` keys from localStorage. On **any 401 response**, frontend auto-clears tokens.

---

## 2. Donations

> ⚠️ **All payment processing is SIMULATED.** `createDonation` does NOT charge real money. It records the donation with `status: "pending"` and the backend simulates confirmation.

### 2.1 `GET /donations`
**Auth:** Bearer (ADMIN)

**Query Params:** `status` (confirmed|pending|refunded), `type` (sadaqah|zakat|kafala|waqf|fidya), `dateFrom`, `dateTo`, `search` (donor name or ID), `projectId`, `page`, `limit`

**✅ 200:**
```json
[{
  "id": 1,
  "donor": "string (donor name)",
  "project": "string (project title)",
  "amount": 5000,
  "date": "YYYY-MM-DD",
  "method": "string (payment method name in Arabic)",
  "status": "completed|pending|refunded",
  "type": "sadaqah|zakat|kafala|waqf|fidya"
}]
```

**Logic:** Admin Donations page shows 3 stat cards computed from this data:
- **إجمالي التبرعات** = sum of all `amount`
- **عدد التبرعات** = count
- **متوسط التبرع** = sum / count

The page also supports filtering by: project, status, date range (today/week/month/all), and text search.

---

### 2.2 `GET /donations/:id`
**Auth:** Bearer (ADMIN or owning DONOR)

**✅ 200:** Single donation + nested `project` object `{ id, title, titleEn }`.  
**❌ 404:** `{ "message": "التبرع غير موجود" }`

### 2.2.1 `GET /donations/stats`
**Auth:** Bearer (ADMIN)
**Logic:** Returns summary statistics for all donations.

### 2.2.2 `POST /donations/:id/refund`
**Auth:** Bearer (ADMIN)
**Body:** `{ "reason": "string" }`
**Logic:** Initiates a refund for a donation.

---

### 2.3 `POST /donations`
**Auth:** Bearer (DONOR) or public with donor info  
**Purpose:** Create a **simulated** donation (no real payment)

| Field | Type | Constraints |
|-------|------|------------|
| `amount` | number | Required, **minimum 10 EGP** |
| `type` | string | Required: `sadaqah\|zakat\|kafala\|waqf\|fidya` |
| `projectId` | number\|null | Optional — `null` = general donation |
| `paymentMethod` | string | Required: `card\|vodafone\|insta\|fawry\|bank` |
| `isRecurring` | boolean | Optional, default false |
| `isAnonymous` | boolean | Optional, default false |
| `fullName` | string | **Required if not anonymous** |
| `phone` | string | **Required if not anonymous** |
| `email` | string | Optional |

**✅ 201:**
```json
{
  "id": 123, "amount": 500, "type": "sadaqah",
  "status": "pending", "date": "YYYY-MM-DD",
  "receiptNumber": "REC-1234567890"
}
```

**Logic:**
- **No real payment is processed.** Backend simulates: creates record → sets `status: "pending"` → auto-confirms after simulated delay.
- Unique `receiptNumber` generated (format: `REC-<timestamp>`).
- Frontend redirects to `/confirmation?receipt=<receiptNumber>` on success.
- If `isRecurring === true`, store a recurring schedule (monthly) — also simulated.

---

### 2.4 `GET /donations/types`
**Auth:** Public

```json
[{ "id": "sadaqah", "name": "صدقة جارية", "nameEn": "Sadaqah Jariyah", "icon": "fa-solid fa-hand-holding-heart" }]
```
IDs: `sadaqah`, `zakat`, `kafala`, `waqf`, `fidya`

### 2.5 `GET /donations/payment-methods`
**Auth:** Public

```json
[{ "id": "card", "name": "بطاقة بنكية", "nameEn": "Credit Card", "icon": "fa-solid fa-credit-card" }]
```
IDs: `card`, `vodafone`, `insta`, `fawry`, `bank` — **All simulated, no real integration.**

### 2.6 `GET /donations/amounts`
**Auth:** Public | **Response:** `[50, 100, 200, 500, 1000, 5000]`

---

## 2A. Payments (Simulated)

### 2A.1 `POST /payments/intents`
**Auth:** Optional
**Body:** `{ "amount": number, "paymentMethod": "CARD|...", "type": "SADAQAH|...", ... }`
**Logic:** Creates a payment intent (pending state).

### 2A.2 `POST /payments/:id/confirm`
**Auth:** Optional
**Body:** `{ "status": "SUCCESS|FAILED" }` (optional)
**Logic:** Simulates payment gateway confirmation.

---

## 3. Programs (Admin CRUD + Public Read)

### 3.1 `GET /programs`
**Auth:** Public

```json
[{
  "id": 1, "name": "كفالة الأيتام", "nameEn": "Orphan Sponsorship",
  "icon": "fa-solid fa-children", "color": "#0B6B6B",
  "projectCount": 5, "totalDonations": 850000, "status": "active"
}]
```

**Logic:** Admin Programs page displays table with: program name+icon, project count, total donations, status, and action buttons (edit/view/delete). The `projectCount` and `totalDonations` are **computed by backend** (count of projects under this program, sum of their raised amounts).

### 3.2 `POST /programs`
**Auth:** Bearer (ADMIN)

| Field | Type | Constraints |
|-------|------|------------|
| `name` | string | Required |
| `icon` | string | FontAwesome class (e.g. `fa-solid fa-house`) |
| `color` | string | HEX color (e.g. `#0B6B6B`) |
| `description` | string | Optional |

### 3.3 `PUT /programs/:id`
**Auth:** Bearer (ADMIN) | Same fields as POST (partial update).

### 3.4 `DELETE /programs/:id`
**Auth:** Bearer (ADMIN)  
**Logic:** Should fail if program has active projects linked to it.

---

## 4. Projects (Admin CRUD + Public Read)

### 4.1 `GET /projects`
**Auth:** Public

**Query Params:** `programId`, `status` (active|completed|pending)

```json
[{
  "id": 1, "programId": 1,
  "program": "كفالة الأيتام", "programEn": "Orphan Sponsorship",
  "title": "string", "titleEn": "string",
  "description": "string", "descriptionEn": "string",
  "location": "string", "locationEn": "string",
  "goal": 1500000, "raised": 850000,
  "donors": 1240, "daysLeft": 45,
  "donationAmount": 500,
  "image": "URL string",
  "status": "active|completed|pending",
  "featured": true/false
}]
```

**Logic:** `progress` is computed on frontend: `Math.round((raised / goal) * 100)`. Admin can filter by tabs: all / active / completed / pending.

### 4.2 `GET /projects/:id`
**Auth:** Public | **❌ 404:** `{ "message": "المشروع غير موجود" }`

### 4.3 `GET /projects/featured`
**Auth:** Public | Returns projects where `featured === true`. Used on homepage hero.

### 4.4 `POST /projects`
**Auth:** Bearer (ADMIN)

| Field | Type | Constraints |
|-------|------|------------|
| `title` | string | Required |
| `titleEn` | string | Optional |
| `programId` | number | Required, must reference existing program |
| `goal` | number | Required, positive, in EGP |
| `donationAmount` | number | Optional, suggested per-unit donation |
| `location` | string | Required (governorate) |
| `description` | string | Required |
| `descriptionEn` | string | Optional |
| `image` | file/URL | Optional |

**Logic:** New projects default to `status: "active"`, `raised: 0`, `donors: 0`, `featured: false`. `daysLeft` is computed from an optional `endDate`.

### 4.5 `PUT /projects/:id`
**Auth:** Bearer (ADMIN) | Partial update.

### 4.6 `PUT /projects/:id/featured`
**Auth:** Bearer (ADMIN)  
**Body:** `{ "featured": true/false }`  
**Logic:** Admin toggles the ⭐ star icon on project cards. Featured projects appear on homepage donor-facing hero section as urgent/highlighted cases.

### 4.7 `DELETE /projects/:id`
**Auth:** Bearer (ADMIN)

---

## 5. Beneficiaries (Admin Only)

### 5.1 `GET /beneficiaries`
**Auth:** Bearer (ADMIN)

**Query Params:** `status` (active|pending|inactive), `search` (name), `category`, `location`

```json
[{
  "id": 1, "name": "عائلة محمد أحمد",
  "type": "أسرة|فرد",
  "program": "رعاية الأيتام",
  "status": "active|pending|inactive",
  "cases": 2,
  "location": "القاهرة",
  "phone": "string", "nationalId": "string",
  "address": "string", "notes": "string",
  "monthlyAid": 1500, "startDate": "YYYY-MM-DD"
}]
```

**Logic:** Admin page shows 4 stat cards computed from this data:
- **إجمالي المستفيدين** = total count
- **الحالات النشطة** = sum of all `cases` fields
- **مستفيد نشط** = count where `status === "active"`
- **قيد المراجعة** = count where `status === "pending"`

Filterable by tabs: all / active / pending / inactive. Supports text search by name.

### 5.2 `GET /beneficiaries/:id`
**Auth:** Bearer (ADMIN) | **❌ 404:** `{ "message": "المستفيد غير موجود" }`

### 5.3 `POST /beneficiaries`
**Auth:** Bearer (ADMIN)

| Field | Type | Constraints |
|-------|------|------------|
| `name` | string | Required |
| `type` | string | Required: `family\|individual` |
| `phone` | string | Optional |
| `nationalId` | string | Optional |
| `location` | string | Required (governorate) |
| `address` | string | Optional |
| `notes` | string | Optional |

**Logic:** Defaults: `status: "active"`, `startDate: today`, `cases: 0`.

### 5.4 `PUT /beneficiaries/:id`
**Auth:** Bearer (ADMIN) | Partial update.

### 5.5 `GET /beneficiaries/stats`
**Auth:** Bearer (ADMIN)

```json
{
  "total": 5, "active": 3, "totalMonthlyAid": 10200,
  "byCategory": { "orphan": 2, "medical": 1, "housing": 1, "emergency": 1 }
}
```

---

## 6. Dashboard (Admin Only)

> The admin dashboard requires multiple data feeds. Each is a separate endpoint.

### 6.1 `GET /dashboard/stats`
**Auth:** Bearer (ADMIN)

```json
{
  "totalRevenue": 2450000,
  "totalRevenueChange": "+12%",
  "activeProjects": 24,
  "activeProjectsChange": "+3",
  "pendingCases": 18,
  "pendingCasesChange": "-5",
  "monthlyDonations": 485000,
  "monthlyDonationsChange": "+8%"
}
```

**Logic:** These are the 4 KPI cards at the top of the dashboard. Each KPI has a `*Change` field representing comparison to previous month (shown as a colored chip).

### 6.2 `GET /dashboard/recent-donations`
**Auth:** Bearer (ADMIN) | **Query:** `limit` (default 5)

```json
[{
  "id": 1, "donor": "أحمد محمد", "amount": 500,
  "project": "كسوة الشتاء", "type": "صدقة",
  "time": "منذ 5 دقائق"
}]
```

**Logic:** The `time` field is a human-readable relative time in Arabic. Backend can return ISO timestamp and frontend formats it, OR backend returns the pre-formatted string.

### 6.3 `GET /dashboard/pending-tasks`
**Auth:** Bearer (ADMIN)

```json
[{
  "id": 1, "title": "مراجعة طلب استحقاق جديد",
  "priority": "high|medium|low",
  "assignee": "سارة"
}]
```

**Logic:** Shown in sidebar. Count displayed as badge. Priority maps to colors: high=red, medium=yellow, low=green. Admin can mark tasks as done.

### 6.4 `PUT /dashboard/tasks/:id/complete`
**Auth:** Bearer (ADMIN) | **Logic:** Marks a pending task as completed.

### 6.5 `GET /dashboard/activity`
**Auth:** Bearer (ADMIN)

```json
[{
  "id": 1, "action": "تمت إضافة مشروع جديد",
  "user": "محمد أحمد", "time": "منذ 10 دقائق",
  "icon": "fa-solid fa-plus", "color": "primary"
}]
```

**Logic:** Audit log of recent system actions. Shown in sidebar activity feed.

### 6.6 `GET /dashboard/projects-summary`
**Auth:** Bearer (ADMIN)

```json
[{
  "id": 1, "title": "", "titleEn": "",
  "progress": 57, "raised": 850000, "goal": 1500000,
  "donors": 1240, "status": "active|completed"
}]
```

**Logic:** `progress = Math.round((raised / goal) * 100)`. Used for project progress overview.

---

## 7. Contact & Volunteer (Public)

### 7.1 `POST /contact`
**Auth:** Public

| Field | Type | Constraints |
|-------|------|------------|
| `name` | string | Required, min 3 chars |
| `email` | string | Required, valid email |
| `phone` | string | Optional, if provided: 10-15 digits |
| `subject` | string | Required, min 3 chars |
| `message` | string | Required, min 10 chars |
| `preferredContact` | string | Optional: `email\|phone\|whatsapp` |

**✅ 200:** `{ "message": "تم إرسال رسالتك بنجاح" }`

**Logic:** Store message in DB for admin review. No auto-reply needed. `preferredContact` tells admin how the user wants to be contacted back.

### 7.2 `POST /volunteers`
**Auth:** Public

| Field | Type | Constraints |
|-------|------|------------|
| `name` | string | Required, min 3 chars |
| `email` | string | Required, valid email |
| `phone` | string | Required, 10-15 digits |
| `area` | string | Required: `medical\|education\|community\|tech\|admin\|field` |
| `message` | string | Optional |

**✅ 201:** `{ "message": "تم التسجيل بنجاح" }`

---

## 8. Finance (Admin Only)

### 8.1 `GET /finance/overview`
**Auth:** Bearer (ADMIN)

```json
{
  "totalRevenue": 2060000, "revenueChange": "+12%",
  "totalExpenses": 1700000, "expensesChange": "-5%",
  "availableBalance": 360000,
  "pendingRequests": 8,
  "monthlyData": [
    { "month": "يناير", "income": 450000, "expenses": 380000 }
  ]
}
```

**Logic:** 4 stat cards + bar chart. `monthlyData` powers the revenue vs expenses chart.

### 8.2 `GET /finance/disbursements`
**Auth:** Bearer (ADMIN)

```json
[{
  "id": 1, "beneficiary": "عائلة محمد أحمد",
  "amount": 2500, "type": "دعم شهري",
  "date": "YYYY-MM-DD", "status": "pending|approved|completed"
}]
```

### 8.3 `POST /finance/disbursements`
**Auth:** Bearer (ADMIN)  
**Body:** `{ "beneficiaryId": 1, "amount": 2500, "type": "string" }`  
**Logic:** Creates with `status: "pending"`. Simulated — no real bank transfer.

### 8.4 `PUT /finance/disbursements/:id/approve`
**Auth:** Bearer (ADMIN) | Changes status to `"approved"`.

### 8.5 `PUT /finance/disbursements/:id/reject`
**Auth:** Bearer (ADMIN) | Changes status to `"rejected"`.

### 8.6 `GET /finance/budgets`
**Auth:** Bearer (ADMIN)

```json
[{ "program": "رعاية الأيتام", "allocated": 400000, "spent": 200000, "progress": 50 }]
```

---

## 9. Reports (Admin Only)

### 9.1 `GET /reports`
**Auth:** Bearer (ADMIN)

```json
[{
  "id": 1, "title": "تقرير التبرعات الشهري",
  "type": "donations|beneficiaries|projects|finance",
  "period": "يناير 2024", "generated": "YYYY-MM-DD"
}]
```

### 9.2 `POST /reports/generate`
**Auth:** Bearer (ADMIN)  
**Body:** `{ "type": "donations|beneficiaries|projects|finance", "dateFrom?": "", "dateTo?": "" }`

### 9.3 `GET /reports/:id/download`
**Auth:** Bearer (ADMIN) | Returns file (PDF/Excel).

### 9.4 `GET /reports/quick-stats`
**Auth:** Bearer (ADMIN)

```json
{
  "totalDonations": { "value": "15,234,567 ج.م", "change": "+15%" },
  "donorCount": { "value": "1,245", "change": "+8%" },
  "newBeneficiaries": { "value": "342", "change": "+22%" },
  "completedProjects": { "value": "18", "change": "+3" }
}
```

---

## 10. Notifications

### 10.1 `GET /notifications`
**Auth:** Bearer (any)

```json
[{
  "id": 1, "type": "donation|project|alert|welcome|update|campaign",
  "title": "", "titleEn": "", "message": "", "messageEn": "",
  "time": "ISO8601", "read": false, "icon": "fa-solid fa-coins"
}]
```

**Logic:** Admin sees types: `donation`, `project`, `alert`. Donor sees: `welcome`, `update`, `campaign`. Sorted by time desc.

### 10.2 `PUT /notifications/:id/read`
**Auth:** Bearer | Marks single notification as read.

### 10.3 `PUT /notifications/read-all`
**Auth:** Bearer | Marks all notifications as read.

---

## 11. Settings (Admin Only)

### 11.1 `GET /settings` & `PUT /settings`
Organization info: name, email, phone, address, language, timezone, currency.

### 11.2 `PUT /settings/notifications`
**Body:** `{ "newDonation": true, "disbursementRequest": true, "newBeneficiary": false, "weeklyReport": true }`

---

## 11A. Users (Admin Only)

### 11A.1 `GET /users`
```json
[{ "id": 1, "name": "", "email": "", "role": "USER|ADMIN", "status": "ACTIVE|INACTIVE" }]
```

### 11A.2 `POST /users` | `PUT /users/:id` | `DELETE /users/:id`
Admin user CRUD.

---

## 12. Donor Account (Donor Only)

### 12.1 `GET /donor/donations`
**Auth:** Bearer (DONOR)

```json
[{ "id": 1, "date": "YYYY-MM-DD", "project": "string", "amount": 5000, "status": "completed|pending" }]
```

**Logic:** Donor Account page shows: total donations (sum), donation count, average donation, and a table of all donations with receipt download button.

### 12.2 `PUT /donor/profile`
**Auth:** Bearer (DONOR)  
**Body:** `{ "name?": "", "email?": "", "phone?": "", "photo?": "base64 string" }`

### 12.3 `GET /donor/donations/:id/receipt`
**Auth:** Bearer (DONOR) | Returns receipt file/data for download/print.

---

## 13. Audit & Reconciliation (Admin Only)

### 13.1 `GET /audit-logs`
**Auth:** Bearer (ADMIN)
**Logic:** Returns system audit logs for administrative tracking.

### 13.2 `POST /reconciliation`
**Auth:** Bearer (ADMIN)
**Body:** `{ "periodStart": "YYYY-MM-DD", "periodEnd": "YYYY-MM-DD" }`
**Logic:** Generates a new reconciliation report.

### 13.3 `GET /reconciliation`
**Auth:** Bearer (ADMIN)
**Logic:** Lists all reconciliation records.

---

## Global Conventions

### Error Shape
```json
{ "status": 401, "message": "Arabic user-facing message" }
```

### 401 Handling
Frontend auto-clears all tokens on 401 → redirects to login.

### Bilingual Fields
All user-facing text has Arabic + English: `name`/`nameEn`, `title`/`titleEn`, etc.

### Dates
- Requests: `YYYY-MM-DD`
- Responses: ISO 8601 timestamps

### Simulated Payment Note
All payment methods (card, Vodafone Cash, InstaPay, Fawry, bank transfer) are **simulated**. The backend should:
1. Accept the donation data
2. Record it with `status: "pending"`
3. Auto-transition to `status: "confirmed"` (simulating gateway callback)
4. Return a `receiptNumber` — no real charge occurs

### External API (Frontend-Only)
**Gold/Silver prices** for Zakat Calculator are fetched directly from `goldapi.io` by frontend — not proxied through backend.
