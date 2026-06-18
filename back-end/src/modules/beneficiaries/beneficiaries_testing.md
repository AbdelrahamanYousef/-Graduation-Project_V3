# Beneficiaries API Documentation & Testing Guide

This document provides a comprehensive guide for testing the beneficiaries module of the Nour Backend. 

All endpoints in this module require administrative privileges. You must include a valid Admin JWT token in the `Authorization` header for every request.

## Base URL
`{{BACKEND_URL}}/api/beneficiaries`
*(Default: `http://localhost:5000/api/beneficiaries`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```
*(You must obtain an admin token via the `/api/auth/admin/login` endpoint)*

---

## 1. List Beneficiaries
Retrieves a paginated list of all beneficiaries.

- **Endpoint:** `GET /`
- **Query Parameters (Optional):**
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `20`)
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "عائلة محمد أحمد",
      "type": "FAMILY",
      "status": "ACTIVE",
      "program": {
        "id": "program_cuid",
        "name": "رعاية الأيتام"
      }
      // ... other summary fields
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

## 2. Get Beneficiaries Stats
Retrieves aggregated statistics for beneficiaries.

- **Endpoint:** `GET /stats`
- **Success Response (200 OK):**
```json
{
  "total": 3,
  "activeFamilies": 1,
  "activeIndividuals": 1,
  "totalMonthlyAid": 6000
}
```

---

## 3. Get Beneficiary by ID
Retrieves detailed information for a specific beneficiary.

- **Endpoint:** `GET /:id`
- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "عائلة محمد أحمد",
  "type": "FAMILY",
  "phone": "01112223333",
  "nationalId": "29001010123456",
  "governorate": "القاهرة",
  "programId": "program_cuid",
  "status": "ACTIVE",
  "monthlyAid": 2500,
  "membersCount": 5,
  "disbursements": []
}
```

---

## 4. Create Beneficiary
Creates a new beneficiary record.

- **Endpoint:** `POST /`
- **Body (JSON):**
```json
{
  "name": "عائلة جديدة",
  "type": "FAMILY",
  "phone": "01000000000",
  "nationalId": "30001010000000",
  "governorate": "الاسكندرية",
  "status": "PENDING",
  "membersCount": 4
}
```
- **Success Response (201 Created):**
```json
{
  "id": "new_cuid",
  "name": "عائلة جديدة",
  // ... created fields
}
```

---

## 5. Update Beneficiary
Updates an existing beneficiary's details.

- **Endpoint:** `PUT /:id`
- **Body (JSON):** *(Only include fields you want to update)*
```json
{
  "status": "ACTIVE",
  "monthlyAid": 3000
}
```
- **Success Response (200 OK):** Returns the updated beneficiary object.

---

## 6. Delete Beneficiary
Deletes a beneficiary.

- **Endpoint:** `DELETE /:id`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Beneficiary deleted successfully"
}
```

---

## Testing with CURL Examples

*(Replace `ADMIN_ACCESS_TOKEN` and `BENEFICIARY_ID` with actual values)*

### Get Stats
```bash
curl -X GET http://localhost:5000/api/beneficiaries/stats \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### List Beneficiaries
```bash
curl -X GET http://localhost:5000/api/beneficiaries \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Create Beneficiary
```bash
curl -X POST http://localhost:5000/api/beneficiaries \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "مستفيد تجريبي", "type": "INDIVIDUAL", "phone": "01000000000"}'
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Beneficiary not found |
