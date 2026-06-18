# Users API Documentation & Testing Guide

This document provides a comprehensive guide for testing the users module of the Nour Backend. 

This module allows administrators to manage all users (Donors and other Admins) registered in the system. All endpoints require administrative privileges.

## Base URL
`{{BACKEND_URL}}/api/users`
*(Default: `http://localhost:5000/api/users`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

---

## 1. List Users
Retrieves a list of all active or inactive users (soft-deleted users are excluded).

- **Endpoint:** `GET /`
- **Success Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "name": "أحمد محمد",
    "email": "admin@nour.org",
    "phone": null,
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2024-03-29T10:00:00.000Z"
  }
]
```

---

## 2. Create User
Creates a new user manually. This is typically used to create new Admins or pre-register certain stakeholders.

- **Endpoint:** `POST /`
- **Body (JSON):**
```json
{
  "name": "سارة أحمد",
  "email": "sara.admin@nour.org",
  "password": "securepassword123",
  "role": "ADMIN"
}
```
*(Valid roles: `USER`, `ADMIN`)*

- **Success Response (201 Created):**
```json
{
  "id": "cuid",
  "name": "سارة أحمد",
  "email": "sara.admin@nour.org",
  "role": "ADMIN",
  "status": "ACTIVE",
  "createdAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 3. Update User
Updates an existing user's details, role, or status.

- **Endpoint:** `PUT /:id`
- **Body (JSON):** *(Only include fields to update)*
```json
{
  "status": "INACTIVE",
  "role": "USER"
}
```
*(Valid statuses: `ACTIVE`, `INACTIVE`, `PENDING`)*

- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "سارة أحمد",
  "email": "sara.admin@nour.org",
  "role": "USER",
  "status": "INACTIVE"
}
```

---

## 4. Delete User (Soft Delete)
Soft-deletes a user. Note: You cannot delete the user account you are currently logged in with.

- **Endpoint:** `DELETE /:id`
- **Success Response (200 OK):**
```json
{
  "success": true
}
```

---

## Testing with CURL Examples

*(Replace `ADMIN_ACCESS_TOKEN` and `USER_ID` with actual values)*

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "منسق جديد",
       "email": "coordinator@nour.org",
       "password": "Password123!",
       "role": "ADMIN"
     }'
```

### List Users
```bash
curl -X GET http://localhost:5000/api/users \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error or attempting to delete yourself |
| 401 | Unauthorized | Missing or invalid Admin JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | User not found |
