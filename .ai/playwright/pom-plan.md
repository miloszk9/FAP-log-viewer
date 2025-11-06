# Plan for Implementing Page Object Models for Playwright Tests Based on TEST_PLAN

## Overview

This document outlines the implementation of Page Object Models (POMs) for Playwright end-to-end tests, following best practices from [Playwright POM Docs](https://playwright.dev/docs/pom). The plan is tailored to the provided TEST_PLAN, which tests the core user flow: login, upload a log file, verify in history, and sign out.

**Goals**:

- Introduce stable `data-testid` attributes to UI elements involved in the test flow for resilient locators.
- Define POM classes encapsulating locators and interactions for Login, Dashboard (Sidebar), Upload, and History pages.
- Ensure changes are minimal, preserving functionality, accessibility (ARIA roles/labels), and styling.
- Enable writing concise, maintainable tests using POM methods (e.g., `login()`, `uploadFile()`, `expectAnalysis()`).
- Prioritize elements for the TEST_PLAN steps; defer others (e.g., register, summary).

**Benefits** (per Playwright docs):

- **Maintainability**: Page-specific logic in classes reduces test duplication and eases refactoring.
- **Stability**: `data-testid` avoids fragility from text/i18n changes or minor DOM tweaks.
- **Readability**: Methods like `uploadFile(filePath)` mirror user actions clearly.
- **Scalability**: Easy to extend for future tests.

No logic changes—only additive `data-testid` attributes (~20-25 lines total). After UI updates, create POMs and a sample test spec.

## Analysis of Current DOM Elements

Based on source code review of relevant files (`frontend/src/components/auth/AuthForm.tsx`, `LoginView.tsx`, `dashboard/DashboardSidebar.tsx`, `upload/UploadCard.tsx` & `FileDropzone.tsx`, `history/HistoryPage.tsx`, and Astro pages like `index.astro`, `upload.astro`, `history.astro`):

### 1. AuthForm.tsx (Used in LoginView for Login)

- **Email Input**: `<Input id="email" type="email" name="email" placeholder="you@example.com" ... />` with `<Label htmlFor="email">Email</Label>`.
  - Current Locator: `getByRole('textbox', { name: 'Email' })` – Stable but label-text dependent.
- **Password Input**: `<Input id="password" type="password" name="password" ... />` with `<Label htmlFor="password">Password</Label>`.
  - Current Locator: `getByRole('textbox', { name: 'Password' })` – Same.
- **Submit Button**: `<Button type="submit" ...>{isSubmitting ? 'Signing in...' : 'Sign in'}</Button>`.
  - Current Locator: `getByRole('button', { name: 'Sign in' })` – Text-based; varies on loading.
- **General Error**: `<div role="alert" aria-live="assertive" ...>{generalError}</div>` – Useful for error testing.

### 2. LoginView.tsx (Loaded by index.astro)

- **Create Account Link**: `<a ... href="/register">Create one now</a>` – Not in TEST_PLAN but present.
  - Current: `getByRole('link', { name: 'Create one now' })` – Text-based.
- **Success Status (Post-Login)**: `<div role="status" aria-live="polite" ...>Account created...` (if register, but for login: dashboard redirect).
  - After login, redirects to dashboard; no specific status in login view for success.

### 3. DashboardSidebar.tsx (Used in AppShell for Protected Routes)

- **Upload Button**: `<Button variant="ghost" className="w-full justify-start text-sm" onClick={handleNavigate} >{translations.nav.upload}</Button>` (text: "Upload new log").
  - Current Locator: `getByRole('button', { name: 'Upload new log' })` – i18n-dependent.
- **Sign Out Button**: `<Button variant="outline" ... onClick={handleSignOut}>{signOutLabel}</Button>` (text: "Sign out").
  - Current: `getByRole('button', { name: 'Sign out' })` – i18n-dependent.
- **Navigation <nav>**: `<nav className="space-y-1">` – Stable via `getByRole('navigation')`.

### 4. UploadCard.tsx & FileDropzone.tsx (Loaded by upload.astro)

- **Dropzone Area**: `<div role="button" tabIndex="0" className="... min-h-[220px] ..." onDrop={handleDrop} ... >` with inner text "Drag and drop your log file or click to browse".
  - Contains hidden `<input ref={inputRef} type="file" accept="..." className="hidden" />`.
  - Current Locator: `getByRole('button', { name: /Drag and drop/ })` or `getByText('Drag and drop your log file')` – Text-fragile.
  - For file upload in Playwright: Target the hidden input with `setInputFiles()`.
- **Upload Button**: `<Button type="button" ... onClick={handleUpload} disabled={!selectedFile} >{isUploading ? 'Uploading…' : 'Upload file'}</Button>`.
  - Current: `getByRole('button', { name: 'Upload file' })` – Text-based; changes on upload.
- **Success Feedback**: `<div role="status" className="... bg-emerald-500/10 ..." >Uploaded successfully. Redirecting to history…</div>`.
  - Current: `getByRole('status')` – Generic; multiple possible.
- **Error/Validation**: `<div aria-live="assertive" ... ><span className="text-destructive">{errorMessage}</span></div>` – Below dropzone.

### 5. HistoryPage.tsx (Loaded by history.astro)

- **History Heading**: `<h1 className="text-2xl ...">{t.title}</h1>` (text: "Log history").
  - Current: `getByRole('heading', { name: 'Log history' })` – i18n-dependent.
- **Analysis List**: `<ul className="space-y-3">` containing `<li>` for each analysis.
  - **Filename**: Inside `<button>`: `<p className="font-semibold ... line-clamp-1" title={item.fileName}>{item.fileName}</p>`.
    - Current: `getByText('DCM62v2_20250203.csv')` – Works for expectation but brittle if text changes.
  - **Status Badge**: `<span className="... rounded-full ...">{item.status}</span>` (e.g., "queued", "completed").
  - **List Item**: `<li className="rounded-lg border ...">` – No specific role.
- **Empty State**: `<div className="rounded-lg border-dashed ...">{t.emptyState}</div>` – Not triggered in TEST_PLAN (after upload, item appears).
- **Loading Skeletons**: `<div role="status" className="animate-pulse ...">` – Multiple.
- **Load More Button**: `<Button variant="outline" ... >Load more</Button>` – If hasMore.

## Proposed Changes

Add `data-testid` attributes to targeted elements. Use semantic kebab-case prefixes (e.g., `login-`, `upload-`). Changes are additive; verify no ARIA conflicts. Total: ~15-20 attributes across 5 files.

### 1. AuthForm.tsx

- Email: `<Input ... data-testid="login-email-input" />`
- Password: `<Input ... data-testid="login-password-input" />`
- Submit: `<Button ... data-testid="login-submit-button" />`
- General Error: `<div ... data-testid="login-general-error" />` (optional)

### 2. LoginView.tsx

- Success Status: `<div role="status" ... data-testid="login-success-status" />` (if applicable; login redirects)

### 3. DashboardSidebar.tsx

- Upload Button: `<Button ... data-testid="sidebar-upload-button" />`
- Sign Out Button: `<Button ... data-testid="sidebar-sign-out-button" />`

### 4. FileDropzone.tsx (in UploadCard)

- Dropzone Div: `<div role="button" ... data-testid="upload-dropzone" >`
- Hidden Input: No change needed; locate via `input[type="file"]` (unique).

### 5. UploadCard.tsx

- Upload Button: `<Button ... data-testid="upload-submit-button" />`
- Success Div: `<div role="status" ... data-testid="upload-success-status" />`
- Error Span: `<span ... data-testid="upload-error-message" />` (optional)

### 6. HistoryPage.tsx (AnalysisListItem)

- Filename P: `<p ... data-testid="analysis-filename" >{item.fileName}</p>`
- Analysis List Ul: `<ul ... data-testid="analysis-list" >` (for scoping)

**Files to Edit**:

- `frontend/src/components/auth/AuthForm.tsx`
- `frontend/src/components/auth/LoginView.tsx`
- `frontend/src/components/dashboard/DashboardSidebar.tsx`
- `frontend/src/components/upload/FileDropzone.tsx`
- `frontend/src/components/upload/UploadCard.tsx`
- `frontend/src/components/history/HistoryPage.tsx`

**i18n Note**: Text locators (e.g., button names) are translation-dependent; `data-testid` decouples tests from i18n.

## POM Classes Outline

Create directory `frontend/tests/playwright/pages/` with TypeScript classes extending a `BasePage`. Use `Locator` for elements and async methods for actions. Import from `@playwright/test`.

### BasePage.ts

```typescript
import { Page } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }
}
```

### LoginPage.ts

```typescript
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByTestId("login-email-input");
  readonly passwordInput = this.page.getByTestId("login-password-input");
  readonly submitButton = this.page.getByTestId("login-submit-button");
  readonly successStatus = this.page.getByTestId("login-success-status");

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // Wait for redirect to dashboard
    await this.page.waitForURL("**/dashboard**", { waitUntil: "networkidle" });
    await expect(this.page).not.toHaveURL(/login/);
  }
}
```

### DashboardPage.ts (Focus on Sidebar)

```typescript
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly uploadButton = this.page.getByTestId("sidebar-upload-button");
  readonly signOutButton = this.page.getByTestId("sidebar-sign-out-button");

  async navigateToUpload(): Promise<void> {
    await this.uploadButton.click();
    await this.page.waitForURL("/upload");
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
    await this.page.waitForURL("/");
  }
}
```

### UploadPage.ts

```typescript
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class UploadPage extends BasePage {
  readonly fileInput = this.page.locator('input[type="file"]');
  readonly submitButton = this.page.getByTestId("upload-submit-button");
  readonly successStatus = this.page.getByTestId("upload-success-status");

  async uploadLogFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    await this.submitButton.click();
    await expect(this.successStatus).toBeVisible({ timeout: 10000 });
    // Wait for redirect to history
    await this.page.waitForURL("/history", { waitUntil: "networkidle" });
  }
}
```

### HistoryPage.ts

```typescript
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HistoryPage extends BasePage {
  readonly analysisList = this.page.getByTestId("analysis-list");
  readonly filenameLocator = this.page.locator(
    '[data-testid="analysis-filename"]'
  );

  async expectLogInHistory(filename: string): Promise<void> {
    await expect(
      this.filenameLocator.filter({ hasText: filename })
    ).toBeVisible({ timeout: 30000 });
  }
}
```

**Notes**:

- Timeouts increased for async upload/processing.
- File upload uses `setInputFiles()` on hidden input (simpler than drag simulation).
- Fallback locators: If `data-testid` unavailable, use `getByRole`/`getByText`.

## Updated Test Using POMs

Sample spec: `frontend/tests/playwright/upload-flow.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { HistoryPage } from "./pages/HistoryPage";

test("Complete upload flow per TEST_PLAN", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto("http://localhost:4321");
  await loginPage.login("user2@example.com", "password123");

  const dashboard = new DashboardPage(page);
  await dashboard.navigateToUpload();

  const uploadPage = new UploadPage(page);
  await uploadPage.uploadLogFile("./frontend/tests/DCM62v2_20250203.csv"); // Adjust path

  const historyPage = new HistoryPage(page);
  await historyPage.expectLogInHistory("DCM62v2_20250203.csv");

  await dashboard.signOut();
  await expect(page).toHaveURL("/");
});
```

## Implementation Steps

1. **UI Enhancements**:

   - Edit the 6 source files to add `data-testid` as proposed.
   - Run `npm run lint` and manual accessibility check (e.g., Lighthouse).
   - Commit: `feat: add data-testid for E2E test stability`.

2. **POM Implementation**:

   - Create `frontend/tests/playwright/pages/` directory and add the 5 TS files above.
   - Ensure `playwright.config.ts` includes the pages dir in test setup if needed.

3. **Test Development**:

   - Add the sample spec to `frontend/tests/playwright/`.
   - Place test file `DCM62v2_20250203.csv` in `frontend/tests/` (or use fixture).
   - Run `npx playwright test` to validate (start dev server: `npm run dev`).

4. **Verification & Docs**:
   - Confirm tests pass without text locators.
   - Update `frontend/tests/playwright/scenarios.md` with this flow.
   - Add to README: "E2E tests use POMs with data-testid for stability."
   - Scope: TEST_PLAN covered; expand to error cases (e.g., invalid file) later.

This plan ensures robust, POM-driven tests for the upload workflow. Total effort: 1-2 hours for UI + POMs + test. If i18n changes, only POM methods need minor updates.
