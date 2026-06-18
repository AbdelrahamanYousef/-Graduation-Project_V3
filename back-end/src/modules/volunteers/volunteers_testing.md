# Volunteers API Documentation & Testing Guide

This document provides a comprehensive guide for testing the volunteers module of the Nour Backend. 

This module consists of a public endpoint for users to submit volunteer applications, and admin endpoints for reviewing, approving, or rejecting those applications.

## Base URL
`{{BACKEND_URL}}/api/volunteers`
*(Default: `http://localhost:5000/api/volunteers`)*

---

## 1. Submit Volunteer Application (Public)
Allows a public user to apply to be a volunteer. Does not require authentication.

- **Endpoint:** `POST /apply`
- **Authentication:** None required.
- **Body (JSON):**
```json
{
  "name": "محمود المتطوع",
  "email": "mahmoud.vol@example.com",
  "phone": "01099998888",
  "area": "MEDICAL",
  "message": "طبيب أطفال متخصص متفرغ يومي الجمعة والسبت"
}
```
*(Valid areas: `MEDICAL`, `EDUCATION`, `COMMUNITY`, `TECH`, `ADMIN`, `FIELD`)*

- **Success Response (201 Created):**
```json
{
  "id": "cuid",
  "name": "محمود المتطوع",
  "email": "mahmoud.vol@example.com",
  "phone": "01099998888",
  "area": "MEDICAL",
  "status": "PENDING",
  "createdAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 2. List Volunteer Applications (Admin Only)
Retrieves a paginated list of all submitted volunteer applications.

- **Endpoint:** `GET /`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Query Parameters (Optional):** `page`, `limit`
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "محمود المتطوع",
      "area": "MEDICAL",
      "status": "PENDING",
      "createdAt": "2024-03-29T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5, "page": 1, "limit": 20, "pages": 1
  }
}
```

---

## 3. Approve Volunteer (Admin Only)
Approves a pending volunteer application.

- **Endpoint:** `PATCH /:id/approve`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Success Response (200 OK):** Returns the updated application object with `status` set to `APPROVED`.

---

## 4. Reject Volunteer (Admin Only)
Rejects a pending volunteer application and optionally records a reason.

- **Endpoint:** `PATCH /:id/reject`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Body (JSON):** *(Optional)*
```json
{
  "reason": "لا يوجد احتياج حالي في هذا التخصص"
}
```
- **Success Response (200 OK):** Returns the updated application object with `status` set to `REJECTED`.

---

## Testing with CURL Examples

### Apply to Volunteer (Public)
```bash
curl -X POST http://localhost:5000/api/volunteers/apply \
     -H "Content-Type: application/json" \
     -d '{
       "name": "متطوع جديد",
       "email": "new.volunteer@example.com",
       "phone": "01234567890",
       "area": "TECH"
     }'
```

*(For Admin endpoints, replace `ADMIN_ACCESS_TOKEN` and `APPLICATION_ID` with actual values)*

### Approve Volunteer (Admin)
```bash
curl -X PATCH http://localhost:5000/api/volunteers/APPLICATION_ID/approve \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload |
| 401 | Unauthorized | Missing or invalid Admin JWT token (for protected endpoints) |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Application ID not found |
