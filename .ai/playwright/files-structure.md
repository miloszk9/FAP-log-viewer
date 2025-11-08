# Playwright Test File Structure for FAP Log Viewer

Based on the analysis of test scenarios from `scenarios.md` and Playwright guidelines, I propose the following file structure for E2E tests. The structure incorporates the Page Object Model (POM) according to the plan from `pom-plan.md`, as well as Cursor rules guidelines.

## Proposed directory and file structure

```
frontend/tests/playwright/
├── pages/                           # Page Object Models
│   ├── base.page.ts                 # Base class for all pages
│   ├── auth.page.ts                 # Login/registration page
│   ├── dashboard.page.ts            # Main page with sidebar (protected)
│   ├── upload.page.ts               # File upload page
│   ├── history.page.ts              # Analysis history page
│   ├── analysis.page.ts             # Detailed analysis of single log
│   └── summary.page.ts              # Summary of all analyses
├── tests/                           # Test files
│   ├── auth.spec.ts                 # Authentication tests (register, login, logout)
│   ├── upload.spec.ts               # Upload tests (single + multiple logs)
│   ├── analysis.spec.ts             # Analysis tests (single + summary)
│   └── fixtures.ts                  # Test fixtures and test data
├── utils/                           # Helper utilities
│   ├── test-helpers.ts              # Helper functions for tests
│   └── constants.ts                 # Constants used in tests
├── sample_logs/                     # Sample log files (already exists)
│   ├── DCM62v2_20250203.csv
│   ├── DCM62v2_20250205.csv
│   └── multiple_logs.zip
└── scenarios.md                     # Test scenarios documentation (already exists)
```

## Detailed structure description

### 1. Configuration (`playwright.config.ts` - in the root directory of the frontend app)

- Configuration only for Chromium/Desktop Chrome browser
- Settings for browser contexts
- Screenshot and trace configuration
- Settings for test parallelization

### 2. Page Object Models (`pages/`)

Each POM class contains:

- Locators (selectors with `data-testid`)
- Action methods (e.g., `login()`, `uploadFile()`)
- Assertion methods (e.g., `isLoggedIn()`)

### 3. Test files (`tests/`)

- **`auth.spec.ts`**: Registration, login, logout scenarios
- **`upload.spec.ts`**: Single file upload and ZIP archive upload
- **`analysis.spec.ts`**: Detailed analysis checking and summary

### 4. Helper utilities (`utils/`)

- **`test-helpers.ts`**: Setup/teardown functions, test data generators
- **`constants.ts`**: URLs, credentials, timeouts

### 5. Test fixtures (`fixtures.ts`)

- Test data for users, files, etc.
- Setup of common test states

## Key structure features

- **Modularity**: Each POM corresponds to one page/application
- **Reusability**: Common actions in base classes
- **Maintainability**: Separation of logic from assertions
- **Scalability**: Easy addition of new tests and POMs
- **Compliance with guidelines**: Use of `data-testid`, POM, 'Arrange-Act-Assert'

This structure provides solid foundation for all scenarios described in `scenarios.md` and allows for easy extension of tests in the future.
