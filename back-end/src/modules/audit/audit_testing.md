# Audit API Documentation & Testing Guide

This document provides a comprehensive guide for testing the audit module of the Nour Backend. The audit logs track system activities and require administrative privileges to access.

## Base URL
`{{BACKEND_URL}}/api/audit-logs`
*(Default: `http://localhost:5000/api/audit-logs`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```
*(You must obtain an admin token via the `/api/auth/admin/login` endpoint)*

---

## 1. List Audit Logs
Retrieves a paginated list of system audit logs. Can be filtered using query parameters.

- **Endpoint:** `GET /`
- **Query Parameters (Optional):**
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `20`, max: `100`)
  - `entity`: Filter by entity type (e.g., `Donation`, `System`)
  - `action`: Filter by action type (e.g., `SEED_DATABASE`, `DONATION_CREATED`)
- **Example:** `GET /?page=1&limit=10&entity=Donation`
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "actorId": "admin_cuid",
      "actorRole": "ADMIN",
      "action": "SEED_DATABASE",
      "entity": "System",
      "entityId": "seed",
      "payload": {
        "seedVersion": "2.0"
      },
      "createdAt": "2024-03-29T10:00:00.000Z",
      "actor": {
        "id": "admin_cuid",
        "name": "أحمد محمد"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

## Testing with CURL Examples

*(Replace `ADMIN_ACCESS_TOKEN` with a valid admin token)*

### List Audit Logs
```bash
curl -X GET "http://localhost:5000/api/audit-logs?page=1&limit=5" \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 500 | Internal Server Error | Server-side or database issues |
