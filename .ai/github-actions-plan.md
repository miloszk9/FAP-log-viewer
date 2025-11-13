# GitHub Actions Implementation Plan

## Reusable Workflows

### 1. Run Playwright Tests (`playwright-tests.yml`)

**File:** `.github/workflows/playwright-tests.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `e2e-tests`:
  - `runs-on: ubuntu-latest`
  - Steps:
    1. `actions/checkout@v4`
    2. `actions/setup-node@v4` (node-version: '20')
    3. `cd frontend`
    4. `npm ci`
    5. `npx playwright install --with-deps`
    6. Run tests:
       - `npm run test:e2e-teardown`
       - `docker compose -f ../docker-compose-e2e.yml up -d --build`
       - Wait: `timeout 120 bash -c 'until curl -f http://localhost:3000/health/readiness; do echo "Waiting..."; sleep 1; done' || (echo "Failed"; exit 1)`
       - `npx playwright test`
       - `npm run test:e2e-teardown`
    7. Upload artifacts: `actions/upload-artifact` for reports (if failed)

### 2. Build Frontend Image (`build-frontend.yml`)

**File:** `.github/workflows/build-frontend.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - Steps:
    1. `actions/checkout@v4`
    2. `make docker-local`

### 3. Build Data-Analyser Image (`build-data-analyser.yml`)

**File:** `.github/workflows/build-data-analyser.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - Steps:
    1. `actions/checkout@v4`
    2. `cd backend/data-analyser`
    3. `make docker-local`

### 4. Build Email-Receiver Image (`build-email-receiver.yml`)

**File:** `.github/workflows/build-email-receiver.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - Steps:
    1. `actions/checkout@v4`
    2. `cd backend/email-receiver`
    3. `make docker-local`

### 5. Build HTTP-Backend Image (`build-http-backend.yml`)

**File:** `.github/workflows/build-http-backend.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - Steps:
    1. `actions/checkout@v4`
    2. `cd backend/http-backend`
    3. `make docker-local`

## Main CI Workflow (`verify-pr.yml`)

**File:** `.github/workflows/verify-pr.yml`

**Triggers:**

- `pull_request` (branches: `main`)
- `workflow_dispatch`

**Jobs:**

- `playwright-tests`: `uses: ./.github/workflows/playwright-tests.yml`
- `build-frontend`: `uses: ./.github/workflows/build-frontend.yml`
- `build-data-analyser`: `uses: ./.github/workflows/build-data-analyser.yml`
- `build-email-receiver`: `uses: ./.github/workflows/build-email-receiver.yml`
- `build-http-backend`: `uses: ./.github/workflows/build-http-backend.yml`

All jobs run in parallel (no `needs` dependencies).

## Implementation Steps

1. Create reusable YAML files.
2. Test manually via GitHub UI.
3. Create `verify-pr.yml`.
4. Update or deprecate `verify-and-build.yml`.
5. Document in README.md.

## Notes

- Optional: Add Docker push to registry (use `docker/login-action` and `docker/push-action` with `GHCR_TOKEN`).
- Verify Makefile targets in each directory.
- Upload artifacts on failure.
