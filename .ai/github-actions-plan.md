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
  - `working-directory: frontend`
  - Steps:
    1. `actions/checkout@v4`
    2. `actions/setup-node@v4` (node-version: '20')
    3. `npm ci`
    4. `npx playwright install --with-deps`
    5. Run tests:
       - `npm run test:e2e-teardown`
       - `docker compose -f ../docker-compose-e2e.yml up -d --build`
       - `docker ps -a` (list containers)
       - Wait: `timeout 120 bash -c 'until curl -f http://localhost:3000/health/readiness; do echo "Waiting for backend..."; sleep 1; done' || (echo "Backend health check failed"; exit 1)`
       - `npx playwright test`
       - `npm run test:e2e-teardown` (always)
    6. Upload artifacts: `actions/upload-artifact@v4` for reports (if failed)

### 2. Build Frontend Image (`build-frontend.yml`)

**File:** `.github/workflows/build-frontend.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - `working-directory: frontend`
  - Steps:
    1. `actions/checkout@v4`
    2. `docker/login-action@v3` (username: ${{ vars.DOCKERHUB_USERNAME }}, password: ${{ secrets.DOCKERHUB_TOKEN }})
    3. `docker/setup-buildx-action@v3`
    4. `make docker-prod`

### 3. Build Data-Analyser Image (`build-data-analyser.yml`)

**File:** `.github/workflows/build-data-analyser.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - `working-directory: backend/data-analyser`
  - Steps:
    1. `actions/checkout@v4`
    2. `docker/login-action@v3` (username: ${{ vars.DOCKERHUB_USERNAME }}, password: ${{ secrets.DOCKERHUB_TOKEN }})
    3. `docker/setup-buildx-action@v3`
    4. `make docker-prod`

### 4. Build Email-Receiver Image (`build-email-receiver.yml`)

**File:** `.github/workflows/build-email-receiver.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - `working-directory: backend/email-receiver`
  - Steps:
    1. `actions/checkout@v4`
    2. `docker/login-action@v3` (username: ${{ vars.DOCKERHUB_USERNAME }}, password: ${{ secrets.DOCKERHUB_TOKEN }})
    3. `docker/setup-buildx-action@v3`
    4. `make docker-prod`

### 5. Build HTTP-Backend Image (`build-http-backend.yml`)

**File:** `.github/workflows/build-http-backend.yml`

**Triggers:**

- `workflow_dispatch`
- `workflow_call`

**Jobs:**

- `build`:
  - `runs-on: ubuntu-latest`
  - `working-directory: backend/http-backend`
  - Steps:
    1. `actions/checkout@v4`
    2. `docker/login-action@v3` (username: ${{ vars.DOCKERHUB_USERNAME }}, password: ${{ secrets.DOCKERHUB_TOKEN }})
    3. `docker/setup-buildx-action@v3`
    4. `make docker-prod`

## Main CI Workflow (`verify-pr.yml`)

**File:** `.github/workflows/verify-pr.yml`

**Triggers:**

- `pull_request` (branches: `main`)
- `workflow_dispatch`

**Jobs:**

- `playwright-tests`: `uses: ./.github/workflows/playwright-tests.yml` (with `secrets: inherit`)

**Note:** Currently only runs Playwright tests. Build verification is handled separately.

## Build All Images Workflow (`build-all.yml`)

**File:** `.github/workflows/build-all.yml`

**Triggers:**

- `workflow_dispatch`

**Jobs:**

- `build-frontend`: `uses: ./.github/workflows/build-frontend.yml`
- `build-http-backend`: `uses: ./.github/workflows/build-http-backend.yml`
- `build-data-analyser`: `uses: ./.github/workflows/build-data-analyser.yml`
- `build-email-receiver`: `uses: ./.github/workflows/build-email-receiver.yml`

All jobs run in parallel (no `needs` dependencies).

## Implementation Status

✅ **Completed:**

1. All reusable workflow YAML files created and implemented.
2. Manual testing via GitHub UI completed.
3. `verify-pr.yml` created (currently runs only Playwright tests).
4. `build-all.yml` created for building all images in parallel.
5. All build workflows include Docker Hub login and push capability.

## Current Configuration

- **CI Pipeline:** `verify-pr.yml` runs Playwright E2E tests on PRs to main branch.
- **Build Pipeline:** `build-all.yml` builds and pushes all Docker images to Docker Hub.
- **Individual Builds:** Each service has its own build workflow for targeted builds.
- **Secrets Required:** `DOCKERHUB_TOKEN` secret and `DOCKERHUB_USERNAME` variable.

## Notes

- Build verification is currently separate from PR verification (only E2E tests run on PRs).
- All build workflows use `make docker-prod` target for production builds with Docker Hub push.
- Docker Buildx is configured for advanced build features and multi-platform support.
- Playwright tests include proper teardown and artifact upload on failure.
