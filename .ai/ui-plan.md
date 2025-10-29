# UI Architecture for FAP Log Viewer (MVP)

## 1. Overview of the UI Structure

A web application built with Astro (shell/layout) and React (dynamic views), using client-side navigation and route protection based on JWT stored in memory (hydrated from sessionStorage). The interface uses shadcn/ui templates for auth and dashboard shells and provides:

- **Public views**: `Login` (shadcn `login-01`), `Register` (shadcn `signup-01`).
- **Protected views**: `Upload`, `History`, `Analysis`, `Summary`.
- **Global shell**: shadcn `dashboard-01` layout for protected routes (sidebar + header), language and theme switchers, global toasts for errors/actions.
- **State and data**: `@tanstack/react-query` with keys and cache/staleTime policies per planning notes; retry behavior only for GET 5xx.
- **Accessibility and RWD**: mobile-first, aria-live for status updates, focus management, tables with `scope` and horizontal scrolling ≥ md, metric cards in a grid.
- **Security**: JWT in memory (hydrated from sessionStorage), clearing on 401, protected routes, file type/size validation (CSV/ZIP ≤ 20MB), no cookies.

API alignment (v1):

The UI communicates with a separately implemented backend (NestJS HTTP API) via the following REST endpoints:

- Auth: `POST /api/v1/auth/{register|login|refresh|logout}`.
- Analyses: `POST/GET /api/v1/analyses`, `GET/DELETE /api/v1/analyses/:id`.
- Averages: `GET /api/v1/average`.

## 2. View List

### View: Login

- **Path**: `/login`
- **Primary goal**: Authenticate the user and issue a session (JWT in memory).
- **Key information**: Email/password fields, link to registration, error messages (401).
- **Key components**: shadcn `login-01` template (wrapped with our `AuthForm` handlers), `Toast`.
- **API calls**: `POST /api/v1/auth/login`.
- **UX/a11y/security**: Field validation (zod), inline error messages, focus after error, keyboard submit, soft redirect after 401 from protected views, redirect to `/history` on success.
- **Mapped PRD requirements**: “User Authentication” (login), “Logout” (navigation flow after login).

### View: Register

- **Path**: `/register`
- **Primary goal**: Create a new account.
- **Key information**: Email/password fields, confirmations, conflict messages (409 if email exists).
- **Key components**: shadcn `signup-01` template (wrapped with our `AuthForm` handlers), `Toast`.
- **API calls**: `POST /api/v1/auth/register`.
- **UX/a11y/security**: Password patterns, password masking, accessible error messages, redirect to `/login` after 201.
- **Mapped PRD requirements**: “User Authentication” (register).

### View: Upload

- **Path**: `/upload`
- **Primary goal**: Upload a single CSV/ZIP file and start asynchronous analysis.
- **Key information**: Acceptance status (202), 400 errors (type/size), 409 (duplicate → CTA to analysis), 20MB limit.
- **Key components**: `FileDropzone` (CSV/ZIP), `UploadCard`, `Button`, `Toast`.
- **API calls**: `POST /api/v1/analyses` (multipart/form-data with `file`).
- **UX/a11y/security**: Drag-and-drop + keyboard file selection; clear validation messages; on success redirect to `History` with detail prefetch; on 409 show “Go to analysis” CTA.
- **Mapped PRD requirements**: “Secure Log Upload & Processing”, 409 handling, redirect to History.

### View: History (Log History)

- **Path**: `/history`
- **Primary goal**: List all user uploads with sorting and infinite scroll.
- **Key information**: File name, upload date, status (“Success/Failed/Processing…”), FAP Regeneration indicator.
- **Key components**: `AnalysisList` (table/accordion), `StatusBadge`, `InfiniteScroll`, `SortControls`, `DeleteButton` (optimistic), `EmptyState`, `ErrorState`.
- **API calls**: `GET /api/v1/analyses?sortBy=...&order=...&page=...&limit=...`.
- **UX/a11y/security**: Default sort `fileName` asc with “Processing” pinned at the top; optional `createdAt desc`; aria-live for status changes; clickable items (View), `Delete` without modal (optimistic + toast, rollback on error).
- **Mapped PRD requirements**: “Log History” list + delete; refresh/polling implicitly via detail; RWD: table ≥ md, accordion on mobile.

### View: Analysis (Single File Analysis Dashboard)

- **Path**: `/analyses/:id`
- **Primary goal**: Present detailed results for a single log with metric sections.
- **Key information**: Status, message, log date, distance; sections: `overall`, `driving`, `engine`, `fap`, and `fapRegen` when present; N/A for missing fields.
- **Key components**: `Section` containers, `MetricCard`, `KeyValueList`, `ThresholdIndicator` (FAP thresholds), `StatusBanner`, `PollingController` (1.5s up to 60s), `RefreshButton`.
- **API calls**: `GET /api/v1/analyses/:id` (polled until completion or timeout).
- **UX/a11y/security**: Polling up to 60s; after the limit show “Refresh status” and resume on focus; visual FAP thresholds (idle/driving); semantic headings, tab order; preserve section scroll position.
- **Mapped PRD requirements**: “Single File Analysis Dashboard” (all metrics, N/A), FAP thresholds, FAP Regeneration section.

### View: Summary (Cross-log summary dashboard)

- **Path**: `/summary`
- **Primary goal**: Present aggregated user averages.
- **Key information**: `overall`, `driving`, `engine`, `fap`, `fapRegen` (optional when available), calculation status message.
- **Key components**: `SummaryGrid`, `MetricCard`, `KeyValueList`, `EmptyState` (when no data), `ErrorState`.
- **API calls**: `GET /api/v1/average`.
- **UX/a11y/security**: Metric cards in a responsive 1–3 column grid; clear metric units (metric system), dates in DD‑MM‑YYYY; no comparison to a single log in MVP.
- **Mapped PRD requirements**: “Cross-log summary dashboard”.

### Action: Logout

- **Path**: global action from navigation
- **Primary goal**: Invalidate session and securely log out.
- **Key information**: No dedicated view; success/error toast.
- **Key components**: `LogoutButton`, `Toast`.
- **API calls**: `POST /api/v1/auth/logout`.
- **UX/a11y/security**: After logout, clear token and cache and redirect to `/login`.
- **Mapped PRD requirements**: “Logout”.

## 3. User Journey Map

- **Onboarding (public → protected)**

  1. The user visits `/login` → enters credentials → success → redirect to `/history`.
  2. Attempting to access a protected route without JWT → soft redirect to `/login`.

- **Main use case: upload and analyze a log**

  1. Go to `/upload` → select a CSV/ZIP file (≤20MB) → submit.
  2. Backend returns `202` with `ids` or `409` with an existing `id`.
     - `202`: redirect to `/history`, the “Processing…” entry is pinned at the top; prefetch `/analyses/:id`.
     - `409`: toast + CTA “Go to analysis” → `/analyses/:id`.
  3. On `/history` the user selects an entry → navigates to `/analyses/:id`.
  4. On `/analyses/:id`: if `status=Processing`, auto-poll every ~1.5s (max 60s). After the limit, “Refresh status”.
  5. After `Success/Failed`: present metric sections; missing values shown as “N/A”.

- **Review and manage history**

  - Default sorting `fileName` asc with “Processing” pinned; optional `createdAt desc`.
  - Infinite scroll (30/page) with previously loaded pages preserved.
  - `Delete` without confirmation (optimistic), toast + rollback on error.

- **User summary**

  - Go to `/summary` → fetch `GET /average` → show metric cards (optional fields hidden when unavailable).

- **Error handling and edge states**
  - `401`: clear session, soft redirect to `/login`.
  - `404` (analysis): detail view shows a “Not found” card, CTA to `History`.
  - `5xx`/network: toasts + retry for GET with backoff; no retry for 4xx.
  - `400` upload: clarify type/size validation; show 20MB limit.

## 4. Layout and Navigation Structure

- **Global AppShell (protected routes)**: shadcn `dashboard-01` with sidebar + header. Sidebar items: `Summary`, `Upload new log`, `Sign out`. Below the main items, a `Saved Report` section lists user reports; each shows the report name, an icon when `fapRegen` is present, and a three-dots menu with a `Delete` option.
- **Public AppShell**: minimal header (logo/title) using shadcn `login-01` and `signup-01` templates for respective pages.
- **Route protection**: `ProtectedRoute` wrapper validating JWT (in memory; hydrated from sessionStorage on load). 401 triggers: clear and redirect.
- **Status indicators**: global `Toast` (stack up to 3, auto-dismiss ~3–5s); per-view `LoadingBar`/skeletons; aria-live for statuses.
- **Local navigation**: links to details in `History`; in `Upload` CTA to `History` after success; in detail view “Refresh status” after polling limit. The sidebar `Summary` and `Upload new log` items navigate to `/summary` and `/upload`; `Sign out` triggers logout.

## 5. Key Components

- **AppShell**: public/protected layout; protected uses shadcn `dashboard-01` (sidebar + header), content slot.
- **DashboardSidebar**: `Summary`, `Upload new log`, `Sign out`, `ThemeToggle`, `LanguageSwitcher`.
- **SavedReportsNav**: below main nav; shows saved reports (name, optional fapRegen icon), three-dots menu with `Delete` that calls `DELETE /analyses/:id` (optimistic UI).
- **ProtectedRoute / AuthProvider**: JWT stored in memory, hydrated from sessionStorage, soft redirect on 401; may proactively refresh via `POST /api/v1/auth/refresh`.
- **ToastProvider**: global error/success toasts.
- **FileDropzone (Upload)**: CSV/ZIP support, type/size validation, DnD/keyboard.
- **AnalysisList**: list/table with `StatusBadge`, `View/Delete` actions, sorting and infinite scroll.
- **StatusBadge**: Success/Failed/Processing (aria-label + AA contrast color).
- **InfiniteScroll**: 30 per page, maintains previously loaded pages, spinner/skeleton.
- **DeleteButton (optimistic)**: removes analysis from the list, rollback on error.
- **AnalysisDetail**: `StatusBanner`, `PollingController`, `RefreshButton`, `Section` and `MetricCard` sections, `KeyValueList`, `ThresholdIndicator` (FAP thresholds: idle >15/>50, driving >300/>400 mbar).
- **SummaryGrid**: grid of metric cards with optional fields.
- **EmptyState / ErrorState**: variants for no data and errors (links to retry/navigate back).
- **Forms (Login/Register)**: shadcn templates `login-01` and `signup-01` integrated with our `AuthForm` logic (submit handlers, validation, toasts).
- **Loaders/Skeletons**: loading states for lists/details/summary.
- **ThemeToggle**: light/dark (respect `prefers-color-scheme`, persist in localStorage), `dark` class on `html`.
- **LanguageSwitcher (PL/EN)**: language selection, UI dictionary, `Intl` formatters (metric units, dates DD‑MM‑YYYY).

API alignment and requirement mapping:

- `POST /api/v1/analyses` ↔ `Upload` (`FileDropzone`, handle 400/409, redirect/CTA).
- `GET /api/v1/analyses` ↔ `History` (sorting, pagination/infinite scroll, status, optimistic delete).
- `GET /api/v1/analyses/:id` ↔ `Analysis` (1.5s/60s polling, metric sections, N/A, 404).
- `DELETE /api/v1/analyses/:id` ↔ `History` (Delete, rollback, toast).
- `GET /api/v1/average` ↔ `Summary` (metric cards, optional fields).
- `POST /api/v1/auth/{register|login|refresh|logout}` ↔ `Login`/`Register`/global `Logout`/proactive refresh (frontend-only strategy from notes).

PRD user story coverage:

- Registration/login/logout – views `Register`, `Login`, action `Logout`.
- File upload and asynchronous processing – `Upload` + redirect to `History`.
- History overview with sorting and status – `History`.
- Single file analysis dashboard – `Analysis` with sections.
- Cross-log summary – `Summary`.
- Error and state handling (“N/A”, 400/401/404/409/5xx) – appropriate views/components and toasts.

## 6. Component library: shadcn/ui

- **Purpose**: Provide a consistent, accessible set of React UI primitives built on Radix UI and styled with Tailwind CSS. Components are generated into the codebase for full control, theming, and long‑term maintainability.
- **Why here**: Works seamlessly with Astro islands and React, aligns with our Tailwind design tokens, and keeps bundle size minimal by importing only used components.

Installation templates and components to add for this UI:

- `npx shadcn@latest add login-01` (A simple login form)
- `npx shadcn@latest add signup-01` (A simple signup form)
- `npx shadcn@latest add dashboard-01` (Dashboard with sidebar, charts, data table)
