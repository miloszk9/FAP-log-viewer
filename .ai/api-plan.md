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

---

#### Register

- **HTTP Method:** `POST`
- **URL Path:** `/api/v1/auth/register`
- **Description:** Creates a new user account.
- **Authentication:** Not required.
- **JSON Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **JSON Response Payload:**
  - No response body.
- **Success Codes:**
  - `201 Created`: User registered successfully.
- **Error Codes:**
  - `409 Conflict`: Email already exists.

---

#### Login

- **HTTP Method:** `POST`
- **URL Path:** `/api/v1/auth/login`
- **Description:** Authenticates a user and returns an access token.
- **Authentication:** Not required.
- **JSON Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **JSON Response Payload:**
  ```json
  {
    "access_token": "<JWT>"
  }
  ```
- **Success Codes:**
  - `200 OK`: Login successful.
- **Error Codes:**
  - `401 Unauthorized`: Invalid credentials.

---

#### Refresh Access Token

- **HTTP Method:** `POST`
- **URL Path:** `/api/v1/auth/refresh`
- **Description:** Issues a new access token for the authenticated user.
- **Authentication:** Required (JWT Bearer Token via `Authorization: Bearer <access_token>`).
- **JSON Request Payload:**
  - No request body.
- **JSON Response Payload:**
  ```json
  {
    "access_token": "<JWT>"
  }
  ```
- **Success Codes:**
  - `200 OK`: Token refreshed successfully.
- **Error Codes:**
  - `401 Unauthorized`: Invalid or expired token.

Note: This endpoint requires a valid access token to succeed.

---

#### Logout

- **HTTP Method:** `POST`
- **URL Path:** `/api/v1/auth/logout`
- **Description:** Logs out the current user and invalidates server-stored refresh token.
- **Authentication:** Required (JWT Bearer Token via `Authorization: Bearer <access_token>`).
- **JSON Request Payload:**
  - No request body.
- **JSON Response Payload:**
  - No response body.
- **Success Codes:**
  - `200 OK`: Logout successful.
- **Error Codes:**
  - `401 Unauthorized`: Invalid token.

### Resource: Analyses

**Controller:** `analysis.controller.ts`
**Base Path:** `/api/v1/analyses`

This resource requires several adjustments to meet PRD requirements and improve consistency.

---

#### **Upload and Analyze Log File**

- **HTTP Method:** `POST`
- **URL Path:** `/api/v1/analyses`
- **Description:** Uploads a `.csv` or `.zip` file for asynchronous analysis.
- **Authentication:** Required (JWT Bearer Token).
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
- **Description:** Retrieves the detailed results of a single log analysis. All fields within the `analysis` object are optional and will only be present if the corresponding data is available from the user's logs.
- **Authentication:** Required (JWT Bearer Token).
- **JSON Response Payload:**
  ```json
  {
    "id": "2e6c68d4-a8c2-46e2-aa62-d14a4a47018a",
    "status": "Success",
    "message": "Analysis completed successfully.",
    "logDate": "2024-05-05T00:00:00.000Z",
    "fapRegen": false,
    "distance": "2.30",
    "analysis": {
      "fap": {
        "life": {
          "left_km": 159920,
          "life_km": 3072
        },
        "soot": {
          "end_gl": 18.45,
          "diff_gl": 0.15,
          "start_gl": 18.3
        },
        "temp": {
          "avg_c": 161,
          "max_c": 240,
          "min_c": 12
        },
        "additive": {
          "vol_ml": 1260,
          "remain_ml": 806
        },
        "deposits": {
          "weight_gram": 1,
          "percentage_perc": 1
        },
        "pressure": {
          "avg_mbar": 10.9,
          "max_mbar": 49,
          "min_mbar": 0
        },
        "lastRegen_km": 843,
        "pressure_idle": {
          "avg_mbar": 4.6,
          "max_mbar": 11,
          "min_mbar": 0
        },
        "last10Regen_km": 388
      },
      "engine": {
        "errors": 0,
        "battery": {
          "beforeDrive_v": null,
          "engineRunning_v": 14.11
        },
        "oilTemp": {
          "avg_c": 38,
          "max_c": 57,
          "min_c": 18
        },
        "coolantTemp": {
          "avg_c": 40,
          "max_c": 62,
          "min_c": 17
        },
        "engineWarmup": {
          "oil_sec": null,
          "coolant_sec": null
        },
        "oilDilution_perc": 1,
        "oilCarbonate_perc": 0
      },
      "driving": {
        "revs": {
          "avg": 1139,
          "max": 1964,
          "min": 0,
          "avgDriving": 1261
        },
        "speed": {
          "avg_kmh": 15.24,
          "max_kmh": 58,
          "min_kmh": 0
        },
        "acceleration": {
          "avg_perc": 17.78,
          "max_perc": 40
        }
      },
      "overall": {
        "date": {
          "end": "15:12:09",
          "date": "2024-05-05",
          "start": "15:02:24"
        },
        "duration": {
          "idle_sec": 132,
          "driving_sec": 399,
          "overall_sec": 541,
          "engineOn_sec": 532,
          "engineOff_sec": 9
        },
        "distance_km": 2.3,
        "externalTemp": {
          "avg_c": 18.6,
          "max_c": 23,
          "min_c": 14
        }
      },
      "fapRegen": null,
      "fuelConsumption": {
        "overall": {
          "total_l": 0.26,
          "avg_l100km": 11.44
        },
        "bySpeedRange": {
          "_5-15_km": 0.27,
          "_15-25_km": 0.31,
          "_25-35_km": 0.52,
          "_35-45_km": 0.81,
          "_45-55_km": 0.09,
          "_55-65_km": 0.25,
          "5-15_l100km": 18.7,
          "15-25_l100km": 12.61,
          "25-35_l100km": 9.35,
          "35-45_l100km": 6.29,
          "45-55_l100km": 4.09,
          "55-65_l100km": 5.61
        }
      }
    },
    "_version": "1.0.0"
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

#### **Get User Summary (Averages)**

- **HTTP Method:** `GET`
- **URL Path:** `/api/v1/average`
- **Description:** Retrieves the aggregated, cross-log average data for the authenticated user. All fields within the `average` object are optional and will only be present if the corresponding data is available from the user's logs.
- **Authentication:** Required (JWT Bearer Token).
- **JSON Response Payload:**
  ```json
  {
    "status": "SUCCESS",
    "message": "Calculation complete",
    "average": {
      "overall": {
        "distance_km": 18.91,
        "duration": {
          "overall_sec": 2376,
          "engineOff_sec": 170,
          "engineOn_sec": 2206,
          "idle_sec": 589,
          "driving_sec": 1616
        }
      },
      "driving": {
        "acceleration": {
          "max_perc": 39,
          "avg_perc": 18.89
        },
        "fuelConsumption_l100km": 12.48,
        "revs": {
          "min": 0,
          "max": 2906,
          "avg": 1457,
          "avgDriving": 1679
        },
        "speed": {
          "avg_kmh": 23.2,
          "max_kmh": 74
        }
      },
      "engine": {
        "battery": {
          "beforeDrive": {
            "avg_v": 12.3
          },
          "engineRunning": {
            "avg_v": 14.45
          }
        },
        "coolantTemp": {
          "min_c": 11,
          "max_c": 97,
          "avg_c": 76
        },
        "engineWarmup": {
          "coolant_sec": 20.37,
          "oil_sec": 23.73
        },
        "errors": {
          "min": 0,
          "max": 2
        },
        "oilCarbonate": {
          "min_perc": 0,
          "max_perc": 3
        },
        "oilDilution": {
          "min_perc": 0,
          "max_perc": 2
        },
        "oilTemp": {
          "min_c": 12,
          "max_c": 100,
          "avg_c": 76
        }
      },
      "fap": {
        "pressure": {
          "min_mbar": 0,
          "max_mbar": 100,
          "avg_mbar": 10.1
        },
        "pressure_idle": {
          "avg_mbar": 10.1
        },
        "soot": {
          "min_gl": 0.74,
          "max_gl": 17.5
        },
        "temp": {
          "min_c": 7,
          "max_c": 440,
          "avg_c": 224
        }
      },
      "fapRegen": {
        "previousRegen_km": 868,
        "duration_sec": 905,
        "distance_km": 8.5,
        "speed": {
          "min_kmh": 0,
          "max_kmh": 70,
          "avg_kmh": 33.7
        },
        "fapTemp": {
          "min_c": 225,
          "max_c": 440,
          "avg_c": 341.21
        },
        "fapPressure": {
          "min_mbar": 11,
          "max_mbar": 133,
          "avg_mbar": 44.75
        },
        "revs": {
          "min": 756,
          "max": 2906,
          "avg": 1943.92
        },
        "fapSoot": {
          "start_gl": 17.66,
          "end_gl": 1.77
        },
        "fuelConsumption": {
          "regen_l100km": 17.64,
          "nonRegen_l100km": 9.47
        }
      }
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
