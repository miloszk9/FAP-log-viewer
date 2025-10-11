# FAP Log Viewer: Database Schema

This document outlines the PostgreSQL database schema for the FAP Log Viewer application, designed based on the project's PRD and planning notes.

## 1. Tables and Data Types

### ENUM Types

First, we define the custom `ENUM` types for status fields to ensure data consistency.

```sql
CREATE TYPE analysis_status_enum AS ENUM ('Processing', 'Success', 'Failed');
CREATE TYPE fap_average_status_enum AS ENUM ('CALCULATING', 'SUCCESS', 'FAILED');
```

### `users` Table

Stores user account information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### `fap_analysis` Table

Stores metadata and analysis results for each uploaded log file.

```sql
CREATE TABLE fap_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    sha256 CHAR(64) NOT NULL,
    status analysis_status_enum NOT NULL DEFAULT 'Processing',
    message VARCHAR(255) NOT NULL,
    log_date TIMESTAMP WITH TIME ZONE,
    fap_regen BOOLEAN NOT NULL DEFAULT false,
    distance NUMERIC(10, 2),
    analysis JSONB,
    version VARCHAR(255) NOT NULL DEFAULT '',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

### `fap_average` Table

Stores aggregated, cross-log analysis statistics for a user.

```sql
CREATE TABLE fap_average (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    status fap_average_status_enum NOT NULL DEFAULT 'CALCULATING',
    average JSONB,
    message TEXT,
    sha256 CHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

## 2. Relationships

- **`users` ↔ `fap_analysis` (One-to-Many):** A single user can have multiple log analyses. The `fap_analysis.user_id` column establishes this relationship. When a user is deleted, all their associated analyses are also deleted (`ON DELETE CASCADE`).
- **`users` ↔ `fap_average` (One-to-One):** A user has one aggregated average calculation. The `fap_average.user_id` links to the `users` table, and `ON DELETE CASCADE` ensures data integrity upon user deletion.

## 3. Indexes

Indexes are created to optimize query performance for common lookup and sorting operations.

### `users` Table

- An implicit `UNIQUE` index is created on the `id` (Primary Key).
- The `UNIQUE` constraint on `email` automatically creates a unique index.

### `fap_analysis` Table

```sql
-- Index for efficient lookup of a user's analyses
CREATE INDEX idx_fap_analysis_user_id ON fap_analysis(user_id);

-- Composite unique index to prevent duplicate file uploads per user
CREATE UNIQUE INDEX idx_fap_analysis_user_sha256 ON fap_analysis(user_id, sha256);

-- Composite index to optimize sorting log history by file name
CREATE INDEX idx_fap_analysis_user_filename ON fap_analysis(user_id, file_name);
```

### `fap_average` Table

```sql
-- Index for efficient lookup of a user's average calculations
CREATE INDEX idx_fap_average_user_id ON fap_average(user_id);
```

## 4. Row-Level Security (RLS) Policies

RLS is enabled to ensure that users can only access their own data. The backend application (NestJS) is responsible for setting the `app.current_user_id` session variable for each transaction.

### Enable RLS on Tables

```sql
ALTER TABLE fap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE fap_average ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Policy for fap_analysis table
CREATE POLICY select_fap_analysis_for_user ON fap_analysis
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY modify_fap_analysis_for_user ON fap_analysis
    FOR ALL -- Applies to INSERT, UPDATE, DELETE
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy for fap_average table
CREATE POLICY select_fap_average_for_user ON fap_average
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY modify_fap_average_for_user ON fap_average
    FOR ALL -- Applies to INSERT, UPDATE, DELETE
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

## 5. Additional Notes & Design Decisions

- **Primary Keys:** `UUID` is used for all primary keys to avoid issues with integer sequences in a distributed environment and to prevent resource enumeration.
- **Timestamps:** `TIMESTAMP WITH TIME ZONE` is used for all date/time columns to ensure data is timezone-aware and consistently stored.
- **`updated_at` Automation:** A trigger should be implemented to automatically update the `updated_at` column on any row modification.

  ```sql
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  CREATE TRIGGER update_fap_analysis_updated_at BEFORE UPDATE ON fap_analysis FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  CREATE TRIGGER update_fap_average_updated_at BEFORE UPDATE ON fap_average FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  ```

- **ORM Cascade:** The `users` to `fap_average` `OneToOne` relationship includes `{ cascade: true }` at the ORM level. This enables convenient, single-operation persistence of the parent (`User`) and its child (`FapAverage`) from the application layer.
- **JSONB Data Type:** The `analysis` in `fap_analysis` and `average` in `fap_average` are `JSONB` type. This provides flexibility for storing semi-structured analysis data without needing to alter the table schema as analytics evolve. It is also efficient to query and index.
- **`password_hash`:** The `users` table stores a `password_hash`, not the plaintext password. The application layer is responsible for hashing and verification.
