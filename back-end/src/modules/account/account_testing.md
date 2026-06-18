# Account API Documentation & Testing Guide

This document provides a comprehensive guide for testing the user account and profile module of the Nour Backend. 

All endpoints in this module require the user to be authenticated. You must include a valid JWT token in the `Authorization` header for every request.

## Base URL
`{{BACKEND_URL}}/api/donor`
*(Default: `http://localhost:5000/api/donor`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```
*(You can get this token by logging in via the `/api/auth/verify-otp` or `/api/auth/admin/login` endpoints)*

---

## 1. Get User Profile
Retrieves the profile information of the currently authenticated user.

- **Endpoint:** `GET /profile`
- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "محمد علي",
  "email": "donor@example.com",
  "phone": "01012345678",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 2. Update User Profile
Updates the profile information of the currently authenticated user. All fields are optional.

- **Endpoint:** `PUT /profile`
- **Body (JSON):**
```json
{
  "name": "محمد علي معدل",
  "email": "new.donor@example.com",
  "phone": "01012345678"
}
```
- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "محمد علي معدل",
  "email": "new.donor@example.com",
  "phone": "01012345678",
  "role": "USER",
  "avatarUrl": null
}
```

---

## 3. Get User's Donation History
Retrieves a paginated list of all donations made by the currently authenticated user.

- **Endpoint:** `GET /donations`
- **Query Parameters (Optional):**
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `20`, max: `100`)
- **Example:** `GET /donations?page=1&limit=10`
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "userId": "user_cuid",
      "projectId": "project_cuid",
      "amount": "5000",
      "type": "ORPHAN_SPONSORSHIP",
      "paymentMethod": "CARD",
      "status": "SUCCESS",
      "createdAt": "2024-03-29T10:00:00.000Z",
      "project": {
        "id": "project_cuid",
        "title": "كفالة 100 يتيم"
      }
      // ... other donation fields
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 4. Get User Donation Stats
Retrieves the aggregated donation statistics for the currently authenticated user (only counts `SUCCESS` status donations).

- **Endpoint:** `GET /stats`
- **Success Response (200 OK):**
```json
{
  "totalDonations": 15000,
  "donationCount": 2,
  "averageDonation": 7500
}
```

---

## Testing with CURL Examples

*(Replace `YOUR_ACCESS_TOKEN` with a valid token obtained from the Auth module)*

### Get Profile
```bash
curl -X GET http://localhost:5000/api/donor/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/donor/profile \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{"name": "محمد علي", "email": "donor@example.com"}'
```

### Get Donations History
```bash
curl -X GET "http://localhost:5000/api/donor/donations?page=1&limit=5" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Donation Stats
```bash
curl -X GET http://localhost:5000/api/donor/stats \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on profile update payload |
| 401 | Unauthorized | Missing or invalid JWT token |
| 500 | Internal Server Error | Server-side or database issues |
