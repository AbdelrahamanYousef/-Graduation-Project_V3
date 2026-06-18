# Notifications API Documentation & Testing Guide

This document provides a comprehensive guide for testing the notifications module of the Nour Backend. 

These endpoints are used by BOTH Donors and Admins. The system determines which notifications to show based on the provided JWT token.

## Base URL
`{{BACKEND_URL}}/api/notifications`
*(Default: `http://localhost:5000/api/notifications`)*

## Authentication Requirement
**Headers:**
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```
*(Token can belong to a `USER` or an `ADMIN`)*

---

## 1. List Notifications
Retrieves the logged-in user's notification feed. For Admins, this might include global system alerts or new donation alerts. For Users, this includes updates on their specific donations or followed projects.

- **Endpoint:** `GET /`
- **Query Parameters (Optional):**
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `20`)
  - `unreadOnly`: Set to `true` to only fetch unread notifications.
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cuid",
      "title": "تم استلام التبرع بنجاح",
      "message": "شكراً لك، تم تأكيد تبرعك لمشروع كفالة الأيتام.",
      "type": "DONATION_SUCCESS",
      "isRead": false,
      "createdAt": "2024-03-29T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "unreadCount": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 2. Mark Notification as Read
Marks a specific single notification as read.

- **Endpoint:** `PUT /:id/read`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "id": "cuid",
  "isRead": true
}
```

---

## 3. Mark All Notifications as Read
Bulk updates all unread notifications belonging to the logged-in user to read.

- **Endpoint:** `PUT /read-all`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read."
}
```

---

## 4. Clear All Notifications
Deletes all notifications from the logged-in user's inbox permanently.

- **Endpoint:** `DELETE /`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications cleared."
}
```

---

## Testing with CURL Examples

*(Replace `YOUR_ACCESS_TOKEN` with a valid Admin or User token)*

### List Unread Notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?unreadOnly=true" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Mark All as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Error Codes Reference
| Status Code | Message | Description |
|---|---|---|
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Notification ID not found or doesn't belong to user |
