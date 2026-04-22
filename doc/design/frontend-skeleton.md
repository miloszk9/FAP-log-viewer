# Frontend UI Skeleton — FAP Log Viewer (MVP)

## 1. Overview

- Purpose: Build a fast, accessible Astro + React app for uploading FAP logs, tracking processing status, viewing detailed single‑analysis metrics, and a cross‑log summary.
- Public views: Login, Register.
- Protected views: Upload, History, Analysis, Summary.
- Global shell: Protected routes use shadcn/ui `dashboard-01` (sidebar + header). Sidebar items: "Summary", "Upload new log", "Sign out". Theme toggle, Language switcher, and Toasts (Sonner via shadcn/ui) are integrated into the layout. Protected routing via in‑memory JWT (hydrated from sessionStorage). UI components are sourced from `frontend/src/components/ui` and imported via the `@/` alias.

## 2. View Routing

- Public:
  - `/` → Login view
  - `/register` → Register view
- Protected:
  - `/upload` → Upload (CSV/ZIP ≤ 20MB)
  - `/history` → Log History (sortable, paginated/infinite scroll)
  - `/analyses/:id` → Single Analysis detail with polling
  - `/summary` → Cross‑log summary
- Redirects:
  - Auth success → `/history`
  - 401 anywhere → clear session → `/`

## 3. Component Structure (High‑level tree)

- `AppShell` (protected uses shadcn `dashboard-01`)
  - `DashboardSidebar`
    - `NavLinks` (Summary, Upload new log, Sign out)
    - `ThemeToggle`
    - `LanguageSwitcher`
  - `Toaster` (Sonner)
  - `ProtectedRoute` (wraps protected pages)
- Public Pages
  - `LoginPage`
    - `AuthForm` (mode="login")
  - `RegisterPage`
    - `AuthForm` (mode="register")
- Protected Pages
  - `UploadPage`
    - `UploadCard`
      - `FileDropzone`
      - `Button` (Submit)
  - `HistoryPage`
    - `SortControls`
    - `AnalysisList`
      - `AnalysisListItem` (uses `StatusBadge`, `DeleteButton`)
    - `InfiniteScroll`
    - `EmptyState` / `ErrorState`
  - `AnalysisPage`
    - `StatusBanner`
    - `PollingController` + `RefreshButton`
    - `Section` x N
      - `MetricCard` / `KeyValueList`
      - `ThresholdIndicator` (FAP pressure)
    - `EmptyState` / `ErrorState`
  - `SummaryPage`
    - `SummaryGrid`
      - `MetricCard` / `KeyValueList`
    - `EmptyState` / `ErrorState`

## 4. Component Details

- AppShell

  - Purpose: Global layout, wraps public/protected shells.
  - Children: `Navbar`, content slot; renders global `Toaster` (Sonner from shadcn/ui).
  - Events: N/A
  - Validation: N/A
  - Types: none
  - Props: `{ children: ReactNode }`

- DashboardSidebar

  - Purpose: Sidebar navigation (shadcn/ui `dashboard-01`).
  - Elements: `NavLinks` (Summary, Upload new log, Sign out), `ThemeToggle`, `LanguageSwitcher`.
  - Events: navigate (Summary, Upload), logout click.
  - Validation: N/A
  - Types: none
  - Props: none

- ProtectedRoute

  - Purpose: Guards routes; checks in‑memory JWT (hydrated from sessionStorage on boot). Clears on 401.
  - Elements: wrapper; may render fallback spinner.
  - Events: N/A
  - Validation: N/A
  - Types: `{ isAuthenticated: boolean }` from `AuthProvider`.
  - Props: `{ children: ReactNode }`

- Toaster (Sonner)

  - Purpose: Global toasts for success/error using shadcn/ui Sonner; aria‑live.
  - Elements: `Toaster` from `@/components/ui/sonner`; stack (≤3), auto dismiss 3–5s.
  - Props: none; rendered once in `AppShell`.

- AuthForm (shared)

  - Purpose: Login/Register form (rendered using shadcn/ui templates `login-01` and `signup-01`).
  - Elements: email, password inputs; submit button; error area.
  - Events: `onSubmit(values)`
  - Validation:
    - email: required, valid email.
    - password: required; Register: min length policy.
  - Types:
    - Request: `LoginUserDto | RegisterUserDto`
    - Response (login): `AuthTokenResponseDto`
  - Props: `{ mode: 'login' | 'register', onSuccess?: () => void }`

- FileDropzone

  - Purpose: Drag/drop and keyboard file select for CSV/ZIP.
  - Events: `onFileSelected(File)`
  - Validation (client): type in [text/csv, application/zip]; size ≤ 20MB; 1 file.
  - Props: `{ accept: string[], maxSizeBytes: number, onFile: (file: File) => void }`

- UploadCard

  - Purpose: Compose `FileDropzone` with submit button; POST to analyses.
  - Events: `onSubmit(file)`; surfaces 202/400/409.
  - Validation: require file chosen; use dropzone validation; disable on uploading.
  - Types:
    - Response 202: `UploadAnalysisResponseDto`
    - Response 409: `ConflictExistingAnalysisDto`
  - Props: none

- SortControls

  - Purpose: Controls for sortBy/order.
  - Events: `onChange({ sortBy, order })`
  - Validation: `sortBy ∈ {'fileName','createdAt'}`, `order ∈ {'asc','desc'}`
  - Types: `GetAnalysesQueryDto`
  - Props: `{ value: GetAnalysesQueryDto, onChange: (v: GetAnalysesQueryDto) => void }`

- AnalysisList

  - Purpose: Paginated/infinite list of analyses.
  - Elements: table ≥ md; accordion/cards on mobile; `AnalysisListItem`.
  - Events: item click → navigate to detail; delete (optimistic).
  - Validation: N/A
  - Types: `GetAnalysesResponseDto`, `AnalysisHistoryItemDto`
  - Props: `{ items: AnalysisHistoryItemDto[], onDelete: (id: string) => Promise<void>, hasMore: boolean, loadMore: () => void }`

- AnalysisListItem

  - Purpose: Single analysis row/card.
  - Elements: filename, createdAt, `StatusBadge`, fapRegen indicator, `DeleteButton`.
  - Events: navigate, delete.
  - Validation: disable delete while pending.
  - Types: `AnalysisHistoryItemDto`
  - Props: `{ item: AnalysisHistoryItemDto, onDelete: () => void, onClick: () => void }`

- StatusBadge

  - Purpose: Show Processing/Success/Failed with ARIA.
  - Types: `AnalysisStatus`
  - Props: `{ status: AnalysisStatus }`

- DeleteButton (optimistic)

  - Purpose: Remove item from list and call DELETE API; rollback on error.
  - Events: `onConfirm()`
  - Props: `{ onConfirm: () => Promise<void>, disabled?: boolean }`

- InfiniteScroll

  - Purpose: Fetch next page when near bottom; preserves loaded pages.
  - Props: `{ hasMore: boolean, onLoadMore: () => void, isLoading: boolean }`

- StatusBanner

  - Purpose: Show analysis status/message; handles Failed notice.
  - Types: `AnalysisDetailDto['status']`, `message`
  - Props: `{ status: AnalysisStatus, message?: string }`

- PollingController

  - Purpose: Poll `GET /analyses/:id` every ~1.5s (≤ 60s); exposes manual refresh and pause/resume hooks.
  - Props: `{ enabled: boolean, intervalMs?: number, timeoutMs?: number, onPoll: () => Promise<unknown>, onTimeout?: () => void }`

- MetricsTree (shared)

  - Purpose: Render nested metric sections dynamically using dictionary metadata.
  - Props: `{ data: Record<string, unknown> | null | undefined, dictionary: MetricsDictionary }`

- MetricCard

  - Purpose: Display label/value/unit; supports fallback formatting.
  - Props: `{ label: string, value: MetricValue, unit?: string, formatValue?: (value: MetricValue) => React.ReactNode }`

- KeyValueList

  - Purpose: Render key/value pairs; uses dictionary formatting.
  - Props: `{ items: { key: string, value?: MetricValue, unit?: string, description?: string, formatValue?: (value: MetricValue) => React.ReactNode }[] }`

- ThresholdIndicator

  - Purpose: Visual thresholds for FAP pressure values.
  - Logic:
    - Idle warning > 15 mbar, error > 50 mbar.
    - Driving warning > 300 mbar, error > 400 mbar.
  - Props: `{ mode: 'idle' | 'driving', value?: number | null, helperText?: string }`

- SummaryGrid

  - Purpose: Wrap `MetricsTree` for averages; dictionary-driven sections.
  - Props: `{ data: FapAverageJson | null | undefined }`

- EmptyState / ErrorState

  - Purpose: Informational placeholders with CTA.
  - Props (Empty): `{ title: string, description?: string, action?: ReactNode }`
  - Props (Error): `{ title: string, description?: string, onRetry?: () => void }`

- ThemeToggle / LanguageSwitcher / LogoutButton
  - ThemeToggle: toggles `dark` on `html`, persists in localStorage.
  - LanguageSwitcher: select PL/EN; provides dictionary and formatters.
  - LogoutButton: POST logout → clear token/cache → redirect `/login`.

## 5. Types (DTOs and View Models)

- Base types (already defined in `frontend/src/types.ts`):
  - `AnalysisStatus`, `FapAverageStatus`, `FapAnalysis`, `FapAnalysisJson`, `FapAverage`, `FapAverageJson`.
  - DTOs: `RegisterUserDto`, `LoginUserDto`, `AuthTokenResponseDto`, `UploadAnalysisResponseDto`, `GetAnalysesQueryDto`, `AnalysisHistoryItemDto`, `PaginationDto`, `GetAnalysesResponseDto`, `AnalysisDetailDto`, `ConflictExistingAnalysisDto`, `UserAverageDto`.
- Additional view models:
  - `AuthState`: `{ accessToken: string | null }`
  - `HistoryQueryState`: `{ sortBy: 'fileName' | 'createdAt'; order: 'asc' | 'desc' }`
  - `PollingState`: `{ isPolling: boolean; elapsedMs: number; maxMs: number }`

## 6. State Management

- Auth
  - In‑memory token store (`AuthProvider`) hydrated from `sessionStorage` on load.
  - On login: set token in memory + `sessionStorage`; redirect `/history`.
  - On 401: clear token, invalidate react‑query cache, redirect `/login`.
  - Optional proactive refresh via `POST /api/v1/auth/refresh`.
- Data fetching
  - `@tanstack/react-query` for server state: keys
    - `['auth']` (token presence only)
    - `['analyses', params]` for history list
    - `['analysis', id]` for detail
    - `['average']` for summary
  - Retry policy: only GET 5xx with backoff; no retries for 4xx.
- Upload flow
  - Local component state for selected file + mutation for upload.
  - On 202: toast success; navigate to `/history` (prefetch detail by id if single id).
  - On 409: toast + CTA to `/analyses/:id`.
- History list
  - Keep sort/pagination in URL query params; infinite scroll appends pages.
  - Optimistic delete: remove from cache, call DELETE, rollback on error.
- Analysis detail
  - PollingController handles interval and timeout; upon completion stop polling.
  - After timeout: show `RefreshButton` to retry; resume on window focus.
- Summary
  - Simple GET with loading/skeleton; hide optional metrics if undefined.

## 7. API Integration

- Base URL: relative (`/api/v1`), JWT in `Authorization: Bearer <token>` header.
- Endpoints and frontend actions:
  - Auth
    - POST `/auth/register` — body: `RegisterUserDto` — 201 no body → toast then redirect to `/login`.
    - POST `/auth/login` — body: `LoginUserDto` — 200: `AuthTokenResponseDto` → store token and redirect.
    - POST `/auth/refresh` — header auth — 200: `AuthTokenResponseDto` → update token.
    - POST `/auth/logout` — header auth — 200 no body → clear token/cache, redirect `/login`.
  - Analyses
    - POST `/analyses` — multipart: `file` — 202: `UploadAnalysisResponseDto` → navigate to `/history`. 400 type/size; 409: `ConflictExistingAnalysisDto` → toast + CTA to `/analyses/:id`.
    - GET `/analyses` — query: `GetAnalysesQueryDto` — 200: `GetAnalysesResponseDto` → feed list with pagination; default sort `fileName asc`.
    - GET `/analyses/:id` — 200: `AnalysisDetailDto` → power `AnalysisPage`; used by polling.
    - DELETE `/analyses/:id` — 204: remove from list; rollback on error.
  - Average
    - GET `/average` — 200: `{ status, message, average }` (`UserAverageDto`) → `SummaryPage`.

## 8. Validation Matrix (client‑side quick rules)

- Login/Register: email required/valid; password required; register: min length.
- Upload: one file, type `text/csv` or `application/zip`, size ≤ 20MB.
- History: `sortBy` in set, `order` in set; numeric `page,limit`.
- Analysis: N/A; display “N/A” for missing fields.

## 9. Accessibility and RWD

- aria-live regions for status/toasts.
- Keyboard: forms submit via Enter; `FileDropzone` fully keyboardable.
- Tables with `scope` and horizontal scroll ≥ md; cards on mobile.
- Color contrast AA; semantic headings; focus outlines.

## 10. Error Handling

- 401: clear session, redirect `/login`.
- 404 analysis: render Not Found card with link to `/history`.
- 5xx/network: toast + retry for GET via react‑query; no retry for 4xx.
- Upload 400: show explicit type/size message.

## 11. Directory & File Suggestions (frontend)

- `frontend/src/pages`
  - `index.astro`, `register.astro`, `upload.astro`, `history.astro`, `analyses/[id].astro`, `summary.astro`
- `frontend/src/components`
  - `AppShell.tsx`, `ProtectedRoute.tsx`
  - `dashboard/DashboardSidebar.tsx`
  - `auth/AuthForm.tsx`
  - `upload/UploadCard.tsx`, `upload/FileDropzone.tsx`
  - `history/AnalysisList.tsx`, `history/AnalysisListItem.tsx`, `history/SortControls.tsx`, `history/DeleteButton.tsx`, `history/StatusBadge.tsx`, `history/InfiniteScroll.tsx`
  - `analysis/StatusBanner.tsx`, `analysis/PollingController.tsx`, `analysis/Section.tsx`, `analysis/MetricCard.tsx`, `analysis/KeyValueList.tsx`, `analysis/ThresholdIndicator.tsx`
  - `summary/SummaryGrid.tsx`
  - `shared/EmptyState.tsx`, `shared/ErrorState.tsx`
- `frontend/src/components/ui`
  - shadcn/ui generated primitives (e.g., `button.tsx`, `card.tsx`, `tabs.tsx`, `sonner.tsx`, etc.). Import via `@/components/ui/*` as per `components.json`.
- `frontend/src/lib`
  - `apiClient.ts` (fetch wrapper with auth header, error mapping)
  - `auth.ts` (AuthProvider, hooks, sessionStorage hydration)
  - `queries.ts` (react-query keys and hooks: useLogin, useRegister, useUpload, useAnalyses, useAnalysis, useAverage)
  - `i18n.ts`, `format.ts` (Intl helpers: dates DD‑MM‑YYYY, units)

This skeleton aligns with the PRD and UI plan and leverages types defined in `frontend/src/types.ts`. It is intentionally implementation‑ready for another engineer to build views efficiently.

## 12. UI Library (shadcn/ui)

- Components live in `frontend/src/components/ui` and are imported with the `@/` alias, e.g. `import { Button } from '@/components/ui/button`.
- Use the CLI to add components and templates as needed:
  - `npx shadcn@latest add button card tabs sonner`
  - `npx shadcn@latest add login-01` (A simple login form)
  - `npx shadcn@latest add signup-01` (A simple signup form)
  - `npx shadcn@latest add dashboard-01` (Dashboard with sidebar, charts, data table)
- Toasts use Sonner: render `Toaster` from `@/components/ui/sonner` once in `AppShell`.
- Project uses the "new-york" style with "neutral" base color and CSS variables as configured in `components.json`.
