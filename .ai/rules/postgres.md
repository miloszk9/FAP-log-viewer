# Postgres Rules

### Applicable Files
- `backend/http-backend/src/database/migrations/sql/**/*`

---


## DATABASE

### Guidelines for SQL

#### POSTGRES

- Use connection pooling to manage database connections efficiently
- Implement JSONB columns for semi-structured data instead of creating many tables for {{flexible_data}}
- Use materialized views for complex, frequently accessed read-only data
