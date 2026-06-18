# Contact API Documentation & Testing Guide

This document provides a comprehensive guide for testing the contact messages module of the Nour Backend. 

Some endpoints are public (for users submitting messages), while others require administrative privileges (for viewing and managing messages).

## Base URL
`{{BACKEND_URL}}/api/contact`
*(Default: `http://localhost:5000/api/contact`)*

---

## 1. Submit Contact Message (Public)
Allows anyone to submit a message to the charity (e.g., questions, feedback, support).

- **Endpoint:** `POST /`
- **Authentication:** None required.
- **Body (JSON):**
```json
{
  "name": "زائر الموقع",
  "email": "visitor@example.com",
  "phone": "01012345678",
  "subject": "استفسار عن التبرع",
  "message": "كيف يمكنني التبرع عن طريق التحويل البنكي؟"
}
```
- **Success Response (201 Created):**
```json
{
  "id": "cuid",
  "name": "زائر الموقع",
  "email": "visitor@example.com",
  "phone": "01012345678",
  "subject": "استفسار عن التبرع",
  "message": "كيف يمكنني التبرع عن طريق التحويل البنكي؟",
  "status": "NEW",
  "createdAt": "2024-03-29T10:00:00.000Z",
  "updatedAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 2. List Contact Messages (Admin Only)
Retrieves a paginated list of all contact messages. Requires Admin privileges.

- **Endpoint:** `GET /`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Query Parameters (Optional):**
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `20`)
  - `status`: Filter by status (`NEW`, `IN_PROGRESS`, `RESOLVED`)
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "زائر الموقع",
      "email": "visitor@example.com",
      "subject": "استفسار عن التبرع",
      "status": "NEW",
      "createdAt": "2024-03-29T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 3. Update Contact Status (Admin Only)
Updates the status of a specific contact message (e.g., marking it as resolved). Requires Admin privileges.

- **Endpoint:** `PATCH /:id/status`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Body (JSON):**
```json
{
  "status": "RESOLVED"
}
```
*(Valid statuses: `IN_PROGRESS`, `RESOLVED`)*

- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "status": "RESOLVED",
  // ... other fields
}
```

---

## Testing with CURL Examples

### Submit Message (Public)
```bash
curl -X POST http://localhost:5000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "مستخدم تجريبي",
       "email": "test@example.com",
       "subject": "تجربة إرسال",
       "message": "هذه رسالة تجريبية من النظام"
     }'
```

*(For Admin endpoints, replace `ADMIN_ACCESS_TOKEN` and `MESSAGE_ID` with actual values)*

### List Messages (Admin)
```bash
curl -X GET http://localhost:5000/api/contact \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Mark Message as Resolved (Admin)
```bash
curl -X PATCH http://localhost:5000/api/contact/MESSAGE_ID/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -d '{"status": "RESOLVED"}'
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload |
| 401 | Unauthorized | Missing or invalid Admin JWT token (for protected endpoints) |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Message ID not found |
