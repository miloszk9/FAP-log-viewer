# NATS Communication Plan

This document outlines the proposed communication strategy between the NestJS backend and the Python data analysis service using NATS messaging. The goal is to create a clear, efficient, and scalable workflow for processing log files and calculating user averages.

## 1. Overview

The process is divided into two main stages:

1.  **Single Log Analysis**: Triggered when a user uploads a new log file.
2.  **User Average Calculation**: Triggered after a single log analysis is successfully completed.

This approach ensures that user averages are always kept up-to-date without requiring inefficient data transfers.

## 2. Communication Flow

### Step 1: File Upload and Analysis Request

1.  A user uploads a `.csv` or `.zip` file via the `POST /api/v1/analyses` endpoint. If a `.zip` is provided, it is unarchived, and a separate analysis is triggered for each `.csv` file within it.
2.  For each log file, the **NestJS backend** creates a new record in the `fap_analysis` table with a unique `id`.
3.  The backend saves the file to a persistent volume, using the `id` as the new filename (e.g., `<uuid>.csv`).
4.  The backend publishes a message to the `analysis.request` topic for each file using the following envelope:

    ```json
    {
      "pattern": "analysis.request",
      "data": {
        "fileName": "<uuid-of-the-analysis-record>"
      }
    }
    ```

### Step 2: Python Service Performs Analysis

1.  The **Python analysis service**, subscribed to `analysis.request`, receives the message.
2.  It uses the `fileName` (which is the analysis ID) to construct the full file path (e.g., `<fileName>.csv`) and retrieve the correct file from the persistent volume.
3.  It uses the `fileName` directly as the `analysisId`.
4.  It performs the data analysis, generating the detailed JSON result.
5.  The service then publishes a message to the `analysis.result` topic, including the original `analysisId`, the final `status` (`Success` or `Failed`), and the `result` JSON.

### Step 3: Backend Processes Result and Requests Average Update

1.  The **NestJS backend**, subscribed to `analysis.result`, receives the outcome.
2.  It updates the corresponding `fap_analysis` record in the database with the status, message, and result JSON.
3.  If the analysis was successful, the backend check if any of the user's analysis is pending (to avoid average calculation multiple times in a short period of time). If not, proceeds to trigger the user average calculation.
4.  Backend check if the average needs to be updated, by comparing sha256 of the analysis jsons that were taken to average calculation, with the new list of jsons, if the sha256 is different, backend continues with the average update.
5.  It then publishes a message to the `average.request` topic, containing the user's ID, all of the user's analysis, and the analysis jsons sha256, wrapped in the same NATS envelope format:

    ```json
    {
      "pattern": "average.request",
      "data": {
        "userId": "uuid-of-the-user",
        "analysisSha": "sha256-hash-of-the-analyses",
        "analysis": [{ "...": "..." }, { "...": "..." }]
      }
    }
    ```

### Step 4: Python Service Calculates New Average

1.  The **Python analysis service**, subscribed to `average.request`, receives the message.
2.  It uses the `analysis` data (list of single file analysis) to compute the updated user average.
3.  The service then publishes the final calculation to the `average.result` topic.

### Step 5: Backend Stores Updated Average

1.  The **NestJS backend**, subscribed to `average.result`, receives the updated average.
2.  It updates the user's record in the `fap_average` table with the new data.

## 3. NATS Message Formats

### Topic: `analysis.request`

Published by the NestJS backend to request analysis of a file.

```json
{
  "pattern": "analysis.request",
  "data": {
    "fileName": "uuid-of-the-analysis-record"
  }
}
```

### Topic: `analysis.result`

Published by the Python service with the outcome of a single analysis.

```json
{
  "analysisId": "uuid-of-the-analysis-record",
  "status": "Success" | "Failed",
  "message": "A descriptive message about the outcome.",
  "analysis": { "...": "..." },
  "fapRegen": true,
  "logDate": "2025-10-10T00:00:00.000Z",
  "distance": 123.45
}
```

_(The `analysis` object contains the full single analysis JSON as defined in the API plan. The analyser must include `logDate` directly in the payload (legacy `date` support has been removed), along with the optional `distance` field when available.)_

### Topic: `average.request`

Published by the NestJS backend to request an update to a user's average data.

```json
{
  "pattern": "average.request",
  "data": {
    "userId": "uuid-of-the-user",
    "analysisSha": "sha256-hash-of-the-analyses",
    "analysis": [{ "...": "..." }, { "...": "..." }]
  }
}
```

_(The `analysis` array contains the list of successful analysis records for the user, each with their full JSON result. The `analysisSha` field contains the SHA256 hash of the concatenated analysis JSONs to detect changes and avoid redundant calculations.)_

### Topic: `average.result`

Published by the Python service with the newly calculated average data.

```json
{
  "userId": "uuid-of-the-user",
  "analysisSha": "hash-of-the-analyses-used-for-average",
  "status": "SUCCESS" | "FAILED",
  "message": "A descriptive message about the outcome.",
  "average": { "...": "..." }
}
```

_(The `average` object contains the full user average JSON as defined in the API plan. The backend validates that the object is non-empty before persisting it, and the `analysisSha` field contains the SHA256 hash of the concatenated analysis JSONs used for this average calculation.)_
