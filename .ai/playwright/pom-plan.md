# Plan for Implementing Page Object Models for Playwright Tests Based on TEST_PLAN

## Overview

This document outlines the implementation of Page Object Models (POMs) for Playwright end-to-end tests, following best practices from [Playwright POM Docs](https://playwright.dev/docs/pom). The plan is tailored to the provided TEST_PLAN, which tests the core user flow: login, upload a log file, verify in history, and sign out.

**Goals**:

- Introduce stable `data-testid` attributes to UI elements involved in the test flow for resilient locators.
- Define POM classes encapsulating locators and interactions for Login, Dashboard (Sidebar), Upload, and History pages.
- Ensure changes are minimal, preserving functionality, accessibility (ARIA roles/labels), and styling.
- Enable writing concise, maintainable tests using POM methods (e.g., `login()`, `uploadFile()`, `expectAnalysis()`).
- Prioritize elements for the TEST_PLAN steps; defer others (e.g., register, summary).

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
