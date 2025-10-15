# NATS Changes Plan

This document outlines the modifications for `nats-plan.md` to synchronize it with `api-plan.md`, `db-plan.md`, and `prd.md`.

## Summary of Changes

### 1. General Updates

- **File Types**: Updated descriptions to include `.zip` file uploads in addition to `.csv`, reflecting the API's capability to handle multiple log files from a single archive.
- **Naming Conventions**: Standardized JSON field names to `camelCase` for consistency across services (e.g., `analysisId`, `fapRegen`, `analysisSha`).

### 2. Message Format Updates

#### `analysis.request`

- Replaced `analysisId` and `filePath` with a single `fileName` field, which contains the analysis ID (the filename without extension). The backend saves the log file using its `analysisId` as the base filename (e.g., `<analysisId>.csv`), and the Python service uses the `fileName` from the message to reconstruct the full filename and as the `analysisId`. This simplifies the message contract.

```json
{
  "fileName": "uuid-of-the-analysis-record"
}
```

#### `analysis.result`

- Renamed `regen` to `fapRegen` to match the database schema and API response.
- Added `logDate` and `distance` fields to allow the NestJS backend to update the `fap_analysis` table without parsing the large `analysis` JSON object, improving efficiency. The `version` is no longer passed, as the NestJS backend will source it from its own configuration.

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

#### `average.request`

- Renamed `id` to `userId` for clarity.
- Renamed `analysis_sha` to `analysisSha` for `camelCase` consistency.

```json
{
  "userId": "uuid-of-the-user",
  "analysisSha": "sha256-hash-of-the-analyses",
  "analysis": [{ "...": "..." }, { "...": "..." }]
}
```

#### `average.result`

- Changed `status` values from `"Success" | "Failed"` to `"SUCCESS" | "FAILED"` to align with the `fap_average_status_enum` defined in `db-plan.md`.
- Renamed `sha256` to `analysisSha` to consistently refer to the hash of the analyses list used for the calculation.

```json
{
  "userId": "uuid-of-the-user",
  "analysisSha": "hash-of-the-analyses-used-for-average",
  "status": "SUCCESS" | "FAILED",
  "message": "A descriptive message about the outcome.",
  "average": { "...": "..." }
}
```
