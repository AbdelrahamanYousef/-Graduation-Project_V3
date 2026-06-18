# Organization Settings API Documentation & Testing Guide

This document provides a comprehensive guide for testing the organization settings module of the Nour Backend. 

This module manages global configuration for the charity organization (e.g., charity name, contact info, notification preferences). Because there is only one organization, settings are managed as a singleton object. All endpoints require administrative privileges.

## Base URL
`{{BACKEND_URL}}/api/settings`
*(Default: `http://localhost:5000/api/settings`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

---

## 1. Get Organization Settings
Retrieves the current organization settings. If no settings exist yet, it automatically creates and returns default settings.

- **Endpoint:** `GET /`
- **Success Response (200 OK):**
```json
{
  "id": "singleton",
  "name": "جمعية نور الخيرية",
  "email": "info@nour-charity.org",
  "phone": "+20 2 1234 5678",
  "address": "القاهرة، مصر",
  "language": "ar",
  "timezone": "Africa/Cairo",
  "currency": "EGP",
  "notifyNewDonation": true,
  "notifyDisbursement": true,
  "notifyNewBeneficiary": false,
  "notifyWeeklyReport": true,
  "updatedAt": "2024-03-29T10:00:00.000Z"
}
```

---

## 2. Update Organization Settings
Updates the organization settings. Any field omitted from the payload will retain its existing value (partial updates).

- **Endpoint:** `PUT /`
- **Body (JSON):** *(Only include fields you wish to modify)*
```json
{
  "phone": "01099998888",
  "notifyNewBeneficiary": true
}
```
- **Success Response (200 OK):** Returns the fully updated settings object.

---

## Testing with CURL Examples

### Get Settings
```bash
curl -X GET http://localhost:5000/api/settings \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Update Settings
```bash
curl -X PUT http://localhost:5000/api/settings \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "جمعية النور والأمل", "currency": "USD"}'
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload types |
| 401 | Unauthorized | Missing or invalid Admin JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
