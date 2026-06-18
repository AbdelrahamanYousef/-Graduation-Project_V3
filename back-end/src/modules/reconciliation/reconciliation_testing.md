# Reconciliation API Documentation & Testing Guide

This document provides a comprehensive guide for testing the payment reconciliation module of the Nour Backend. 

Reconciliation helps administrators match the system's recorded successful donations against actual bank/gateway payouts for a specific period. All endpoints require administrative privileges.

## Base URL
`{{BACKEND_URL}}/api/reconciliation`
*(Default: `http://localhost:5000/api/reconciliation`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

---

## 1. Generate Reconciliation Report
Triggers the generation of a new reconciliation record for a specified time period.

- **Endpoint:** `POST /`
- **Body (JSON):**
```json
{
  "periodStart": "2024-03-01T00:00:00Z",
  "periodEnd": "2024-03-31T23:59:59Z"
}
```
*(Dates can be ISO 8601 DateTimes or simple dates like `"2024-03-01"`)*

- **Success Response (201 Created):**
```json
{
  "id": "cuid",
  "periodStart": "2024-03-01T00:00:00.000Z",
  "periodEnd": "2024-03-31T23:59:59.000Z",
  "totalSystemAmount": "125000",
  "totalSuccessfulDonations": 45,
  "createdAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 2. List Reconciliation Records
Retrieves a list of all historically generated reconciliation reports.

- **Endpoint:** `GET /`
- **Success Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "periodStart": "2024-03-01T00:00:00.000Z",
    "periodEnd": "2024-03-31T23:59:59.000Z",
    "totalSystemAmount": "125000",
    "totalSuccessfulDonations": 45,
    "createdAt": "2024-03-29T10:00:00.000Z"
  }
]
```

---

## Testing with CURL Examples

### Generate Reconciliation
```bash
curl -X POST http://localhost:5000/api/reconciliation \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"periodStart": "2024-01-01", "periodEnd": "2024-01-31"}'
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on date formats |
| 401 | Unauthorized | Missing or invalid Admin JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
