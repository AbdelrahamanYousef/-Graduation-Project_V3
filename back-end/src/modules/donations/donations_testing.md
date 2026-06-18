# Donations API Documentation & Testing Guide

This document provides a comprehensive guide for testing the donations module of the Nour Backend. 

This module contains public endpoints for retrieving reference data (types, methods) used by the frontend checkout form, and protected admin endpoints for managing donations.

## Base URL
`{{BACKEND_URL}}/api/donations`
*(Default: `http://localhost:5000/api/donations`)*

---

## 1. Public Reference Endpoints
These endpoints require NO authentication and are used to populate dropdowns and UI options.

### Get Donation Types
- **Endpoint:** `GET /types`
- **Success Response (200 OK):**
```json
["SADAQAH", "ZAKAT", "ORPHAN_SPONSORSHIP", "SADAQAH_JARIYAH", "GENERAL"]
```

### Get Payment Methods
- **Endpoint:** `GET /payment-methods`
- **Success Response (200 OK):**
```json
["CARD", "VODAFONE_CASH", "ORANGE_CASH", "INSTAPAY", "FAWRY", "BANK_TRANSFER"]
```

### Get Suggested Amounts
- **Endpoint:** `GET /amounts`
- **Success Response (200 OK):**
```json
[100, 250, 500, 1000, 5000]
```

---

## 2. Admin Endpoints
These endpoints require an Admin JWT token (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`).

### List Donations
Retrieves a paginated list of all system donations.
- **Endpoint:** `GET /`
- **Query Parameters (Optional):** `page`, `limit`, `status`, `type`
- **Success Response (200 OK):** List of donations with pagination meta.

### Get Donation Stats
Retrieves comprehensive statistics about donations (total volume, per type, monthly trends).
- **Endpoint:** `GET /stats`
- **Success Response (200 OK):** Aggregated metrics object.

### Get Donation by ID
- **Endpoint:** `GET /:id`
- **Success Response (200 OK):** Detailed donation object including associated user and project data.

### Refund a Donation
Processes a refund for a previously successful donation.
- **Endpoint:** `POST /:id/refund`
- **Body (JSON):**
```json
{
  "reason": "Requested by donor via phone"
}
```
- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "status": "REFUNDED",
  "refundReason": "Requested by donor via phone",
  // ... other fields
}
```

---

## Testing with CURL Examples

### Get Payment Methods (Public)
```bash
curl -X GET http://localhost:5000/api/donations/payment-methods
```

### List Donations (Admin)
```bash
curl -X GET http://localhost:5000/api/donations \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Process Refund (Admin)
```bash
curl -X POST http://localhost:5000/api/donations/DONATION_ID/refund \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Customer cancellation request"}'
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error (e.g., missing refund reason) or donation not eligible for refund |
| 401 | Unauthorized | Missing or invalid Admin JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Donation ID not found |
