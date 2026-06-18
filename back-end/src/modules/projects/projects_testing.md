# Projects API Documentation & Testing Guide

This document provides a comprehensive guide for testing the projects module of the Nour Backend. 

Projects are specific funding goals nested under Programs (e.g., "Sponsor 100 Orphans in Cairo" under the "Orphan Care" program). Read operations are public, while write operations require admin privileges.

## Base URL
`{{BACKEND_URL}}/api/projects`
*(Default: `http://localhost:5000/api/projects`)*

---

## 1. List Projects (Public)
Retrieves a paginated list of all projects.

- **Endpoint:** `GET /`
- **Authentication:** None required.
- **Query Parameters (Optional):** `page`, `limit`, `programId`, `status`
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "programId": "program_cuid",
      "title": "كفالة 100 يتيم",
      "goal": "500000",
      "raised": "320000",
      "donorsCount": 180,
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "total": 10, "page": 1, "limit": 20, "pages": 1
  }
}
```

---

## 2. Get Project by ID (Public)
Retrieves details of a specific project.

- **Endpoint:** `GET /:id`
- **Authentication:** None required.
- **Success Response (200 OK):** Detailed project object including its parent program information.

---

## 3. Create Project (Admin)
Creates a new project. Requires Admin privileges.

- **Endpoint:** `POST /`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Body (JSON):**
```json
{
  "programId": "EXISTING_PROGRAM_CUID",
  "title": "قافلة طبية للصعيد",
  "description": "قافلة طبية شاملة لمحافظة سوهاج",
  "goal": 200000,
  "location": "سوهاج",
  "status": "ACTIVE"
}
```
- **Success Response (201 Created):** Returns the created project object.

---

## 4. Update Project (Admin)
Updates an existing project. Requires Admin privileges.

- **Endpoint:** `PUT /:id`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Body (JSON):** *(Only include fields to update)*
```json
{
  "status": "COMPLETED",
  "raised": 200000
}
```
- **Success Response (200 OK):** Returns the updated project object.

---

## 5. Delete Project (Admin)
Soft-deletes or removes a project. Requires Admin privileges.

- **Endpoint:** `DELETE /:id`
- **Authentication:** Required (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 400 | Bad Request | Validation error on payload |
| 401 | Unauthorized | Missing or invalid Admin JWT token for protected routes |
| 403 | Forbidden | User does not have ADMIN privileges |
| 404 | Not Found | Project not found |
