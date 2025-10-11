# REST API Plan

This document outlines the necessary adjustments and improvements for the FAP Log Viewer's REST API, based on the product requirements, database schema, and existing implementation. The goal is to enhance consistency, align with REST best practices, and fulfill all functional requirements.

## 1. Resources

The API revolves around three primary resources, which map directly to the database schema:

- **Users**: Represents user accounts. Corresponds to the `users` table.
- **Analyses**: Represents individual log file analyses. Corresponds to the `fap_analysis` table.
- **Averages**: Represents aggregated, cross-log statistics for a user. Corresponds to the `fap_average` table.

## 2. Endpoints

The following adjustments are proposed to the existing endpoints. All endpoints will be versioned under `/api/v1/`.

### Resource: Authentication

**Controller:** `auth.controller.ts`
**Base Path:** `/api/v1/auth`

The existing authentication endpoints are well-designed and require no changes. They align with the PRD for registration, login, logout, and token refresh.

- **`POST /register`**
- **`POST /login`**
- **`POST /refresh`**
- **`POST /logout`**

### Resource: Analyses

**Controller:** `analysis.controller.ts`
**Base Path:** `/api/v1/analyses`

This resource requires several adjustments to meet PRD requirements and improve consistency.

---

#### **Upload and Analyze Log File**

- **HTTP Method:** `POST`
- **URL Path:** `/api/v1/analyses`
- **Description:** Uploads a `.csv` or `.zip` file for asynchronous analysis. This endpoint can be used by both authenticated and unauthenticated users.
- **Authentication:** Optional (JWT Bearer Token).
- **JSON Request Payload:** `multipart/form-data` with a `file` field.
- **JSON Response Payload:**

  ```json
  // Status 202
  {
    "ids": ["uuid-of-analysis-1", "uuid-of-analysis-2"]
  }
  ```

- **Success Codes:**
  - `202 Accepted`: File received and queued for processing.
- **Error Codes:**
  - `400 Bad Request`: Invalid file format or size exceeds the 20MB limit.
  - `401 Unauthorized`: User is not authenticated.
  - `409 Conflict`: The user has already uploaded a file with the same content (SHA256 hash). The ID of the existing analysis is returned.

---

#### **Get Log History**

- **HTTP Method:** `GET`
- **URL Path:** `/api/v1/analyses`
- **Description:** Retrieves a paginated and sorted list of the user's log analyses.
- **Authentication:** Required (JWT Bearer Token).
- **Query Parameters:**
  - `sortBy` (string, optional, default: `fileName`): Field to sort by. e.g., `fileName`, `createdAt`.
  - `order` (string, optional, default: `asc`): Sort order. `asc` or `desc`.
  - `page` (number, optional, default: `1`): Page number for pagination.
  - `limit` (number, optional, default: `20`): Number of items per page.
- **JSON Response Payload:**
  ```json
  {
    "data": [
      {
        "id": "uuid-of-analysis",
        "fileName": "log_file_1.csv",
        "createdAt": "2025-10-11T10:00:00.000Z",
        "status": "Success",
        "fapRegen": true
      }
    ],
    "pagination": {
      "totalItems": 100,
      "currentPage": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
  ```
- **Success Codes:**
  - `200 OK`: A list of analyses is returned.
- **Error Codes:**
  - `401 Unauthorized`: User is not authenticated.

---

#### **Get Single Analysis**

- **HTTP Method:** `GET`
- **URL Path:** `/api/v1/analyses/:id`
- **Description:** Retrieves the detailed results of a single log analysis.
- **Authentication:** Optional (JWT Bearer Token).
- **JSON Response Payload:**
  ```json
  {
    "id": "uuid-of-analysis",
    "status": "Success",
    "message": "Analysis complete",
    "logDate": "2025-10-10T00:00:00.000Z",
    "fapRegen": true,
    "distance": 123.45,
    "analysis": {
      "engineTemp": { "min": 80, "max": 95, "avg": 90 },
      "rpm": { "min": 750, "max": 4000, "avg": 2100 }
    },
    "version": "1.0.0"
  }
  ```
- **Success Codes:**
  - `200 OK`: Analysis found and returned.
- **Error Codes:**
  - `401 Unauthorized`: User is not authenticated.
  - `404 Not Found`: No analysis found with the given ID for the current user.

---

#### **Delete Log Analysis**

- **HTTP Method:** `DELETE`
- **URL Path:** `/api/v1/analyses/:id`
- **Description:** Deletes a log analysis from the user's history. This is a new endpoint required by the PRD.
- **Authentication:** Required (JWT Bearer Token).
- **Success Codes:**
  - `204 No Content`: The analysis was successfully deleted.
- **Error Codes:**
  - `401 Unauthorized`: User is not authenticated.
  - `404 Not Found`: No analysis found with the given ID for the current user.

### Resource: Averages

**Controller:** `average.controller.ts`
**Base Path:** `/api/v1/average`

The existing endpoint is mostly compliant but will be moved to the new versioned path.

---

#### **Get User Average Data**

- **HTTP Method:** `GET`
- **URL Path:** `/api/v1/average`
- **Description:** Retrieves the aggregated, cross-log average data for the authenticated user.
- **Authentication:** Required (JWT Bearer Token).
- **JSON Response Payload:**
  ```json
  {
    "status": "SUCCESS",
    "message": "Calculation complete",
    "average": {
      "totalDistance": 500.5,
      "avgEngineTemp": 91.2
    }
  }
  ```
- **Success Codes:**
  - `200 OK`: User average data found.
- **Error Codes:**
  - `401 Unauthorized`: User is not authenticated.
  - `404 Not Found`: No average data has been calculated for the user yet.

## 3. Authentication and Authorization

- **Mechanism:** Authentication will be handled via JWT Bearer Tokens, as currently implemented. The `Authorization: Bearer <token>` header is required for all protected endpoints.
- **Authorization:** Access control will be strictly enforced. All data-related endpoints (`analyses`, `average`) will require authentication and will be scoped to the authenticated user's data. This will be enforced at the service layer by passing the `user.id` from the JWT payload to all database queries, which leverages the database's Row-Level Security (RLS) policies.

## 4. Validation and Business Logic

- **File Upload Validation:**
  - The `POST /api/v1/analyses` endpoint will validate uploads for:
    - **File Type:** `application/zip` or `text/csv`.
    - **File Size:** Maximum 20MB.
- **Polling Logic:** The PRD mentions client-side polling for status updates. The `GET /api/v1/analyses/:id` endpoint serves this purpose. The logic of re-triggering analysis from a GET request will be removed to adhere to REST principles.
- **Sorting:** The `GET /api/v1/analyses` endpoint will implement server-side sorting based on query parameters, defaulting to sorting by `fileName` in ascending order as specified in the PRD.
- **Pagination:** The `GET /api/v1/analyses` endpoint will implement server-side pagination to ensure performance and a good user experience.
