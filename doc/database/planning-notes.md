### Final Database Schema Recommendations

Here is a summary of the agreed-upon changes for the database schema, based on our discussion.

#### 1. `FapAnalysis` Table (`fap_analysis`)

- **New Columns:**
  - `createdAt`: A `TIMESTAMP` column with a default value of `NOW()`, automatically recording the upload time.
  - `logDate`: A `DATE` or `TIMESTAMP` column to store the date from the log file itself.
  - `fapRegen`: A `BOOLEAN` column to indicate if a regeneration event occurred. The existing `regen` column should be removed.
  - `distance`: A `NUMERIC` or `DECIMAL` column for the distance traveled.
- **Column Type Changes:**
  - `status`: Change from `string` to a new PostgreSQL `ENUM` type named `analysis_status_enum` with the values: `'Success'`, `'Failed'`, `'Processing'`.
- **Constraints & Relationships:**
  - Add a composite `UNIQUE` constraint on the `(userId, sha256)` columns to prevent duplicate file processing for the same user.
  - The foreign key relationship to the `users` table should be configured with `onDelete: 'CASCADE'` to ensure a user's analyses are deleted when their account is.
- **Indexing:**
  - Create a composite index on `(userId, fileName)` to ensure efficient alphabetical sorting of the log history.

#### 2. `FapAverage` Table (`fap_average`)

- **Column Type Changes:**
  - `status`: Change from `string` to a new PostgreSQL `ENUM` type named `fap_average_status_enum` with the values: `'CALCULATING'`, `'SUCCESS'`, `'FAILED'`.
- **Relationships:**
  - The foreign key relationship to the `users` table should be configured with `onDelete: 'CASCADE'`.
- **Columns to Keep:**
  - The `sha256` and `message` columns will be kept as-is.
  - The `average` data will remain in the single `jsonb` column.

#### 3. Row-Level Security (RLS)

- **Implementation:**
  - Enable RLS on both the `fap_analysis` and `fap_average` tables.
  - Create a security policy for each table that restricts `SELECT`, `UPDATE`, and `DELETE` operations to rows where the `userId` column matches the current user's ID.
  - This will be implemented by having the NestJS backend set a session variable (e.g., `app.current_user_id`) for each database transaction.
