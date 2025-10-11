# API Changes Implementation Plan

This document outlines the planned changes to the NestJS backend API, based on the agreed-upon API plan.

## 1. General Changes

- **API Versioning**: All endpoints will be moved under an `/api/v1/` prefix to allow for future API versions.
- **Resource Naming**: Resource paths will be pluralized for consistency (e.g., `/analyse` becomes `/analyses`).

## 2. Controller-Specific Changes

### `analysis.controller.ts`

- **Base Path**: Change from `/analyse` to `/api/v1/analyses`.

- **`POST /` (Upload File)**

  - **Auth**: Will remain as is, using `OptionalJwtAuthGuard` to allow uploads from both authenticated and unauthenticated users.
  - **Success Code**: The success status code will be changed from `201 Created` to `202 Accepted` to better signify that the file has been queued for asynchronous processing.

- **`GET /` (Get Log History)**

  - **Auth**: Will remain as is, requiring authentication with `JwtAuthGuard`.
  - **Functionality**: Implement pagination and sorting.
    - **Query Params**: Add support for `page`, `limit`, `sortBy`, and `order`.
    - **Response**: The response will be updated to a structured object containing a `data` array with analysis items and a `pagination` object.
  - **Cleanup**: The `emailService.refresh()` call will be removed.

- **`GET /:id` (Get Single Analysis)**

  - **Auth**: Will remain as is, using `OptionalJwtAuthGuard`.
  - **Logic**: The side-effect that re-triggers a pending analysis will be removed. A `GET` request should not have side-effects.

- **`DELETE /:id` (Delete Analysis)**
  - **Functionality**: A new endpoint will be created to handle the deletion of a log analysis, as required by the PRD.
  - **Auth**: This endpoint will require authentication using `JwtAuthGuard`.

### `average.controller.ts`

- **Base Path**: Change from `/average` to `/api/v1/average`.
- No other changes are required for this controller's logic.

### `auth.controller.ts`

- **Base Path**: Change from `/auth` to `/api/v1/auth`.
- No other changes are required for this controller's logic.
