# Authentication API Documentation & Testing Guide

This document provides a comprehensive guide for testing the authentication module of the Nour Backend.

## Base URL
`{{BACKEND_URL}}/api/auth`
*(Default: `http://localhost:5000/api/auth`)*

---

## 1. Admin Login
Allows administrators to log in using their email and password.

- **Endpoint:** `POST http://localhost:5000/api/auth/admin/login`
- **Body (JSON):**
```json
{
  "email": "admin@nour.org",
  "password": "admin123"
}
```
- **Success Response (200 OK):**
```json
{
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": "cuid",
    "name": "أحمد محمد",
    "email": "admin@nour.org",
    "role": "ADMIN"
  }
}
```

---

## 2. User OTP Flow (Step 1): Send OTP
Initiates the login process for users by sending a one-time password (OTP) to their phone number.

- **Endpoint:** `POST /send-otp`
- **Body (JSON):**
```json
{
  "phone": "01012345678"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```
> [!NOTE]
> In development mode, the OTP is always `123456` (or as configured in `.env`).

---

## 3. User OTP Flow (Step 2): Verify OTP
Verifies the OTP sent to the user's phone. If the user doesn't exist, a placeholder account is created.

- **Endpoint:** `POST /verify-otp`
- **Body (JSON):**
```json
{
  "phone": "01012345678",
  "otp": "123456"
}
```
- **Success Response (200 OK):**
```json
{
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": "cuid",
    "name": "محمد علي",
    "phone": "01012345678",
    "email": "donor@example.com",
    "role": "USER"
  },
  "isNewUser": false
}
```

---

## 4. Complete Registration
Complements user data after OTP verification (e.g., set name and email). Requires a valid JWT token.

- **Endpoint:** `POST /register`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "01234567890",
  "email": "john.doe@example.com"
}
```

---

## 5. Get Current User Profile
Retrieves the profile of the currently authenticated user.

- **Endpoint:** `GET /me`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "01234567890",
  "role": "USER",
  "status": "ACTIVE",
  "avatarUrl": null,
  "createdAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 6. Refresh Token
Generates a new access token and refresh token using an existing refresh token.

- **Endpoint:** `POST /refresh`
- **Body (JSON):**
```json
{
  "refreshToken": "eyJhbG..."
}
```
- **Success Response (200 OK):**
```json
{
  "token": "newAccessJWT",
  "refreshToken": "newRefreshJWT"
}
```

---

## 7. Logout
Invalidates the current session (frontend should clear the tokens).

- **Endpoint:** `POST /logout`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out"
}
```

---

## Testing with CURL Examples

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@nour.org", "password":"admin123"}'
```

### Get Me (Requires Token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Missing or invalid token / incorrect credentials |
| 403 | Forbidden | User lacks required permissions (e.g., non-admin trying to login as admin) |
| 404 | Not Found | User not found |
