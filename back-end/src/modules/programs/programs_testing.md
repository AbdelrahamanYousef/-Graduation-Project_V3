# Programs API Documentation & Testing Guide

This document provides a comprehensive guide for testing the programs module of the Nour Backend. 

Programs represent the high-level charitable initiatives (e.g., "Orphan Care", "Medical Convoys"). Read operations are public, while write operations require admin privileges.

## Base URL
`{{BACKEND_URL}}/api/programs`
*(Default: `http://localhost:5000/api/programs`)*

---

## 1. List Programs (Public)
Retrieves a paginated list of all programs.

- **Endpoint:** `GET /`
- **Authentication:** None required.
- **Query Parameters (Optional):** `page`, `limit`
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "رعاية الأيتام",
      "icon": "fa-solid fa-children",
      "color": "#FF6B6B",
      "status": "ACTIVE",
      "createdAt": "2024-03-29T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5, "page": 1, "limit": 20, "pages": 1
  }
}
```

---

## 2. Get Program by ID (Public)
Retrieves details of a specific program, including its active projects.

- **Endpoint:** `GET /:id`
- **Authentication:** None required.
- **Success Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "رعاية الأيتام",
  "description": "نوفر الرعاية الشاملة للأيتام",
  "projects": []
}
```

---

## 3. Create Program (Admin)
Creates a new program. Requires Admin privileges.

- **Endpoint:** `POST /`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Body (JSON):**
```json
{
  "name": "كفالة طلاب العلم",
  "icon": "fa-solid fa-book",
  "color": "#123456",
  "description": "دعم الطلاب غير القادرين",
  "status": "ACTIVE"
}
```
- **Success Response (201 Created):** Returns the created program object.

---

## 4. Update Program (Admin)
Updates an existing program. Requires Admin privileges.

- **Endpoint:** `PUT /:id`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Body (JSON):** *(Only include fields to update)*
```json
{
  "status": "INACTIVE"
}
```
- **Success Response (200 OK):** Returns the updated program object.

---

## 5. Delete Program (Admin)
Soft-deletes or removes a program. Requires Admin privileges.

- **Endpoint:** `DELETE /:id`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Program deleted successfully"
}
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload |
| 401 | Unauthorized | Missing or invalid Admin JWT token for protected routes |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Program not found |
