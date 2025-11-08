# Playwright Page Object Model (POM) Implementation Plan

## Overview

This plan outlines the structure for Page Object Models to support the E2E tests described in `frontend/tests/playwright/scenarios.md`. The POMs will encapsulate locators and actions for key pages in the FAP Log Viewer application, following Playwright's best practices for maintainability and readability. Each POM class will include:

- **Locators**: Selectors for interactive elements (prefer `data-testid` attributes for robustness; fallback to role/text/CSS).
- **Methods**: High-level actions that perform sequences of interactions (e.g., `login()`, `uploadFile()`), returning the page or relevant data.
- **Assertions**: Helper methods for verifying page states (e.g., `isLoggedIn()`).

The scenarios cover authentication, upload, history, single analysis, and summary views. No actual test code is proposed here—only the POM structure.

## Proposed Changes to Application Code (@src)

To improve testability and enable reliable locators, add `data-testid` attributes to key elements in the relevant components. These changes should be minimal and non-intrusive:

1. **Auth Components** (`src/components/auth/AuthForm.tsx` or similar):

   - Email input: `data-testid="auth-email-input"`
   - Password input: `data-testid="auth-password-input"`
   - Submit button: `data-testid="auth-submit-button"`
   - Create account link: `data-testid="create-account-link"`
   - Error message: `data-testid="auth-error"`

2. **Sidebar/Navigation** (`src/components/AppShell/DashboardSidebar.tsx`):

   - Upload new log link: `data-testid="sidebar-upload-link"`
   - History link (if present): `data-testid="sidebar-history-link"`
   - Summary link: `data-testid="sidebar-summary-link"`
   - Sign out button: `data-testid="sidebar-signout-button"`

3. **Upload Page** (`src/components/upload/UploadCard.tsx`):

   - File dropzone/input: `data-testid="file-dropzone"`
   - Upload button: `data-testid="upload-button"`
   - Success message/toast: `data-testid="upload-success"`

4. **History Page** (`src/components/history/AnalysisList.tsx` or similar):

   - Analysis list item (by name): `data-testid="analysis-item-${filename}"` (dynamic)
   - Status badge: `data-testid="analysis-status"`
   - Click to view detail: `data-testid="analysis-view-button"`

5. **Analysis Page** (`src/components/analysis/AnalysisPage.tsx`):

   - FAP filter section: `data-testid="section-fap-filter"`
   - Engine section: `data-testid="section-engine"`
   - Driving section: `data-testid="section-driving"`
   - Overall metrics section: `data-testid="section-overall"`
   - Status banner: `data-testid="status-banner"`
   - Refresh button: `data-testid="refresh-button"`

6. **Summary Page** (`src/components/summary/SummaryPage.tsx`):
   - FAP filter section: `data-testid="summary-section-fap-filter"`
   - Engine section: `data-testid="summary-section-engine"`
   - Driving section: `data-testid="summary-section-driving"`
   - Overall averages section: `data-testid="summary-section-overall"`

These additions ensure locators are stable against UI changes (e.g., class updates). Implement them in the JSX/TSX files, e.g., `<input data-testid="auth-email-input" ... />`. After adding, update linters if needed to ignore test attributes in production builds.

## POM Structure

### 1. AuthPage

Handles login and registration flows. Extends `BasePage`.

- **URL**: `http://localhost:4321` (login), `/register` (if separate).
- **Locators**:
  - `emailInput`: `getByTestId('auth-email-input')` or `getByLabel('Email')`
  - `passwordInput`: `getByTestId('auth-password-input')` or `getByLabel('Password')`
  - `submitButton`: `getByTestId('auth-submit-button')` or `getByRole('button', { name: /sign in|create account/i })`
  - `createAccountLink`: `getByTestId('create-account-link')` or `getByRole('link', { name: 'Create one now' })`
  - `errorMessage`: `getByTestId('auth-error')` or `getByRole('alert')`
- **Methods**:
  - `navigateToLogin()`: Go to login URL.
  - `navigateToRegister()`: Click create account link.
  - `fillCredentials(email: string, password: string)`: Fill email and password fields.
  - `submit()`: Click submit button and wait for navigation.
  - `login(email: string, password: string)`: Combine fill and submit; assert redirect to dashboard.
  - `register(email: string, password: string)`: Navigate to register, fill, submit; assert success.
  - `getErrorText()`: Retrieve error message.
- **Assertions**:
  - `isOnLoginPage()`: Check for login form elements.
  - `isLoggedIn()`: Check absence of login form or presence of sidebar.

### 2. DashboardPage (or BaseProtectedPage)

Common protected page with sidebar navigation. Extends `BasePage`.

- **URL**: Base for protected routes (e.g., `/history` after login).
- **Locators**:
  - `uploadLink`: `getByTestId('sidebar-upload-link')` or `getByRole('link', { name: 'Upload new log' })`
  - `summaryLink`: `getByTestId('sidebar-summary-link')` or `getByRole('link', { name: 'Summary' })`
  - `signOutButton`: `getByTestId('sidebar-signout-button')` or `getByRole('button', { name: 'Sign out' })`
- **Methods**:
  - `navigateToUpload()`: Click upload link and wait for URL.
  - `navigateToSummary()`: Click summary link.
  - `signOut()`: Click sign out and wait for login page.
- **Assertions**:
  - `isOnDashboard()`: Check for sidebar presence.

### 3. UploadPage

Handles file upload for logs.

- **URL**: `/upload`
- **Locators**:
  - `dropzone`: `getByTestId('file-dropzone')` or `getByRole('button', { name: /drag and drop/i })` (for click to select)
  - `fileInput`: Underlying `<input type="file">` via `dropzone.locator('input[type="file"]')`
  - `uploadButton`: `getByTestId('upload-button')` or `getByRole('button', { name: 'Upload file' })`
  - `successToast`: `getByTestId('upload-success')` or toast container
- **Methods**:
  - `uploadFile(filePath: string)`: Set file input value (using `setInputFiles`), click upload, wait for redirect to history.
  - `waitForUploadSuccess()`: Wait for success message or redirect.
- **Assertions**:
  - `isUploadFormVisible()`: Check dropzone presence.

### 4. HistoryPage

Manages log history list and selection.

- **URL**: `/history` (auto-redirect after upload)
- **Locators**:
  - `analysisList`: `getByRole('list')` or container
  - `analysisItem(filename: string)`: `getByTestId(\`analysis-item-\${filename}\`)`or`getByRole('listitem').filter({ hasText: filename })`
  - `viewButton`: `getByTestId('analysis-view-button')` or `getByRole('button', { name: 'View' })`
  - `statusBadge`: `getByTestId('analysis-status')` or `getByRole('status')`
- **Methods**:
  - `getAnalysisItem(filename: string)`: Locate and return the item element.
  - `openAnalysis(filename: string)`: Click view button on item; wait for analysis page.
  - `getStatus(filename: string)`: Retrieve status text from badge.
- **Assertions**:
  - `hasAnalysis(filename: string)`: Check if item exists.
  - `analysisStatusIs(filename: string, status: string)`: Verify status (e.g., 'Success').

### 5. AnalysisPage

Displays detailed analysis for a single log.

- **URL**: `/analyses/:id`
- **Locators**:
  - `statusBanner`: `getByTestId('status-banner')` or `getByRole('banner')`
  - `fapSection`: `getByTestId('section-fap-filter')` or `getByRole('region', { name: 'FAP filter' })`
  - `engineSection`: `getByTestId('section-engine')` or `getByRole('region', { name: 'Engine' })`
  - `drivingSection`: `getByTestId('section-driving')` or `getByRole('region', { name: 'Driving' })`
  - `overallSection`: `getByTestId('section-overall')` or `getByRole('region', { name: 'Overall metrics' })`
  - `refreshButton`: `getByTestId('refresh-button')` or `getByRole('button', { name: /refresh/i })`
- **Methods**:
  - `refreshData()`: Click refresh button.
  - `waitForAnalysisLoaded()`: Wait for sections to appear.
- **Assertions**:
  - `hasFapSection()`: Check section visibility.
  - `hasAllSections()`: Verify all four sections present.
  - `statusIs(expected: string)`: Check banner status.

### 6. SummaryPage

Shows cross-log summary metrics.

- **URL**: `/summary`
- **Locators**:
  - `fapSection`: `getByTestId('summary-section-fap-filter')` or `getByRole('region', { name: 'FAP filter' })`
  - `engineSection`: `getByTestId('summary-section-engine')` or `getByRole('region', { name: 'Engine' })`
  - `drivingSection`: `getByTestId('summary-section-driving')` or `getByRole('region', { name: 'Driving' })`
  - `overallSection`: `getByTestId('summary-section-overall')` or `getByRole('region', { name: 'Overall averages' })`
- **Methods**:
  - `waitForSummaryLoaded()`: Wait for sections.
- **Assertions**:
  - `hasAllSummarySections()`: Verify all four sections present.

## Implementation Notes

- **BasePage**: Common class with `page` property, `goto(url)`, and wait helpers (e.g., `waitForLoadState()`).
- **File Upload**: Use `page.locator('input[type="file"]').setInputFiles(path)` for the CSV file (`frontend/tests/DCM62v2_20250203.csv`).
- **Test Flow Integration**: Tests will chain POM methods, e.g., `authPage.login(...)` → `dashboardPage.navigateToUpload()` → `uploadPage.uploadFile(...)` → `historyPage.openAnalysis(...)` → `analysisPage.hasAllSections()`.
- **Best Practices**: Use `expect` for assertions in tests; POMs focus on actions. Handle async with `await`. For Polish text, use exact matches or i18n-aware locators if needed.
- **Next Steps**: After adding test IDs to src, implement POM classes in `frontend/tests/playwright/pages/`. Update scenarios.md tests to use POMs.

This plan ensures tests are modular, readable, and resilient to minor UI changes.
