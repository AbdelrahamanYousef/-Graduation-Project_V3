# Finance API Documentation & Testing Guide

This document provides a comprehensive guide for testing the finance and disbursement module of the Nour Backend. 

All endpoints in this module require administrative privileges. You must include a valid Admin JWT token in the `Authorization` header for every request.

## Base URL
`{{BACKEND_URL}}/api/finance`
*(Default: `http://localhost:5000/api/finance`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

---

## 1. Get Finance Stats
Retrieves overall financial health statistics (Total funds, total disbursed, remaining balance).

- **Endpoint:** `GET /stats`
- **Success Response (200 OK):**
```json
{
  "totalIncome": 2500000,
  "totalDisbursed": 500000,
  "netBalance": 2000000
}
```

---

## 2. Get Monthly Chart Data
Retrieves historical monthly income vs outcome data for charting.

- **Endpoint:** `GET /monthly`
- **Success Response (200 OK):**
```json
[
  {
    "month": "2024-03",
    "income": 150000,
    "outcome": 45000
  }
]
```

---

## 3. List Disbursements
Retrieves a paginated list of financial disbursements (money given out to beneficiaries).

- **Endpoint:** `GET /`
- **Query Parameters (Optional):** `page`, `limit`, `status`
- **Success Response (200 OK):** Paginated array of disbursement objects.

---

## 4. Create Disbursement Request
Creates a new pending disbursement request for a beneficiary.

- **Endpoint:** `POST /`
- **Body (JSON):**
```json
{
  "beneficiaryId": "beneficiary_cuid",
  "amount": 2500,
  "type": "مساعدة شهرية منتظمة"
}
```
- **Success Response (201 Created):**
```json
{
  "id": "cuid",
  "beneficiaryId": "beneficiary_cuid",
  "amount": "2500",
  "type": "مساعدة شهرية منتظمة",
  "status": "PENDING"
}
```

---

## 5. Workflow: Approve / Complete / Reject

These endpoints advance the lifecycle of a disbursement request.

### Approve Disbursement
Moves status from `PENDING` to `APPROVED`. Notes the admin who approved it.
- **Endpoint:** `PUT /:id/approve`

### Complete Disbursement
Moves status from `APPROVED` to `COMPLETED`. Indicates money has physically been transferred.
- **Endpoint:** `PUT /:id/complete`

### Reject Disbursement
Moves status from `PENDING` to `REJECTED`.
- **Endpoint:** `PUT /:id/reject`

---

## Testing with CURL Examples

### Create Disbursement
```bash
curl -X POST http://localhost:5000/api/finance \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "beneficiaryId": "BENEFICIARY_ID_HERE",
       "amount": 1500,
       "type": "علاج طبي"
     }'
```

### Approve Disbursement
```bash
curl -X PUT http://localhost:5000/api/finance/DISBURSEMENT_ID/approve \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error or invalid status transition |
| 401 | Unauthorized | Missing or invalid Admin JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Disbursement (or beneficiary) not found |
