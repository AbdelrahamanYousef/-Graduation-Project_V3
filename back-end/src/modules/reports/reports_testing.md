# Reports API Documentation & Testing Guide

This document provides a comprehensive guide for testing the reports module of the Nour Backend. 

This module allows administrators to view high-level quick statistics and generate downloadable reports for various system entities (Donations, Beneficiaries, Projects, Finance). All endpoints require administrative privileges.

## Base URL
`{{BACKEND_URL}}/api/reports`
*(Default: `http://localhost:5000/api/reports`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

---

## 1. Get Quick Stats
Retrieves a fast overview of key system metrics, often used for dashboard header widgets.

- **Endpoint:** `GET /quick-stats`
- **Success Response (200 OK):**
```json
{
  "totalDonations": 1500000,
  "donationsCount": 150,
  "activeProjects": 5,
  "beneficiariesCount": 200
  // Structure depends on controller implementation
}
```

---

## 2. List Generated Reports
Retrieves a paginated list of all previously generated reports.

- **Endpoint:** `GET /`
- **Query Parameters (Optional):** `page`, `limit`, `type`
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "title": "تقرير التبرعات للربع الأول",
      "type": "DONATIONS",
      "period": "Q1 2024",
      "fileUrl": "https://url-to-download-pdf-or-csv...",
      "createdAt": "2024-03-29T10:00:00.000Z",
      "generatedBy": {
        "name": "أحمد محمد"
      }
    }
  ],
  "meta": {
    "total": 10, "page": 1, "limit": 20, "pages": 1
  }
}
```

---

## 3. Get Report by ID
Retrieves details of a specific generated report.

- **Endpoint:** `GET /:id`
- **Success Response (200 OK):** Detailed report object.

---

## 4. Generate New Report
Triggers the generation of a new report. Depending on the system's asynchronous setup, this may return the report object immediately or queue it.

- **Endpoint:** `POST /`
- **Body (JSON):**
```json
{
  "title": "تقرير المستفيدين - مارس 2024",
  "type": "BENEFICIARIES",
  "period": "March 2024"
}
```
*(Valid types: `DONATIONS`, `BENEFICIARIES`, `PROJECTS`, `FINANCE`)*

- **Success Response (201 Created):**
```json
{
  "id": "cuid",
  "title": "تقرير المستفيدين - مارس 2024",
  "type": "BENEFICIARIES",
  "period": "March 2024",
  // ... created fields
}
```

---

## Testing with CURL Examples

### Generate Report
```bash
curl -X POST http://localhost:5000/api/reports \
     -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "إجمالي التبرعات لعام 2023",
       "type": "DONATIONS",
       "period": "2023"
     }'
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload |
| 401 | Unauthorized | Missing or invalid Admin JWT token |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Report ID not found |
