# Dashboard API Documentation & Testing Guide

This document provides a comprehensive guide for testing the Admin Dashboard module of the Nour Backend. 

All endpoints in this module require administrative privileges. You must include a valid Admin JWT token in the `Authorization` header for every request.

## Base URL
`{{BACKEND_URL}}/api/dashboard`
*(Default: `http://localhost:5000/api/dashboard`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```
*(You must obtain an admin token via the `/api/auth/admin/login` endpoint)*

---

## 1. Get Overall Stats
Retrieves the high-level statistics displayed at the top of the admin dashboard (e.g., total donations, active projects, beneficiaries count).

- **Endpoint:** `GET /stats`
- **Success Response (200 OK):**
```json
{
  "totalDonations": 1500000,
  "donationsCount": 150,
  "activeProjects": 5,
  "totalBeneficiaries": 200
}
```

---

## 2. Get Recent Donations
Retrieves a short list of the most recent successful donations to display in the dashboard overview.

- **Endpoint:** `GET /recent-donations`
- **Success Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "amount": "5000",
    "type": "ZAKAT",
    "paymentMethod": "CARD",
    "createdAt": "2024-03-29T10:00:00.000Z",
    "project": {
      "id": "project_cuid",
      "title": "كفالة أيتام"
    },
    "user": {
      "name": "محمد علي"
    }
  }
]
```

---

## 3. Get Projects Summary
Retrieves a summary of active projects and their funding progress.

- **Endpoint:** `GET /projects-summary`
- **Success Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "title": "إغاثة عاجلة",
    "goal": "1000000",
    "raised": "850000",
    "donorsCount": 500,
    "status": "ACTIVE"
  }
]
```

---

## 4. Get Recent Activity
Retrieves a feed of recent system activity (e.g., new registrations, new large donations, project completions).

- **Endpoint:** `GET /updates`
- **Success Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "type": "DONATION",
    "message": "تم استلام تبرع جديد بقيمة 5000",
    "createdAt": "2024-03-29T10:00:00.000Z"
  }
]
```

---

## Testing with CURL Examples

*(Replace `ADMIN_ACCESS_TOKEN` with your actual admin token)*

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Get Recent Donations
```bash
curl -X GET http://localhost:5000/api/dashboard/recent-donations \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 500 | Internal Server Error | Server-side or database issues |
