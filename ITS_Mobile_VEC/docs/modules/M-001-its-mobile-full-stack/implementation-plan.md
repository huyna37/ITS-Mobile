# Implementation Plan — M-001: ITS Mobile Full Stack

## 1. Executive Summary

This plan decomposes the gap between current mock-data frontend + staging-mode backend into a fully integrated production system. After thorough code review, the **backend has 6 controllers and 6 services already scaffolded with most endpoints implemented**. The primary remaining work is: (1) fixing auth validation bugs, (2) adding missing API endpoints (refresh), and (3) migrating the frontend from inline mock data to the modular `src/api/` client modules.

### Current State Assessment

| Layer | Status | Notes |
|---|---|---|
| Backend JWT Config | DONE | `Program.cs` has `AddJwtBearer` + `UseAuthentication()` fully configured |
| Backend AuthController | PARTIAL | login/ME/profile/Logout/ChangePassword exist but logout doesn't validate token, change-password is in staging mode |
| Backend IncidentsController | DONE | GET, GET/{id}, GET/{id}/timeline, PATCH/{id} all implemented |
| Backend NotificationsController | DONE | GET, unread-count, read, unread, read-all, delete, push/register, push/unregister all implemented |
| Backend CallsController | DONE | history GET/POST, {id}/end, history/{id} delete all implemented |
| Backend FilesController | DONE | upload, upload-multiple, {id}/download, {id} metadata, {id} delete all implemented |
| Backend ProfileController | DONE | GET profile, PATCH profile, GET preferences, PATCH preferences all implemented |
| Frontend `src/api/` modular clients | DONE | 11 modules (auth, incidents, notifications, calls, files, profile, contacts, tasks, client, mocks, index) all scaffolded with tryApiOrMock pattern |
| Frontend `App.jsx` | NEEDS MIGRATION | Uses inline `apiFetch` + hardcoded mock data, does NOT import from `src/api/` modules |
| Frontend `useAuth` hook | DONE | Fully wired to `src/api/auth.js` with session management and refresh |
| Frontend `src/api/client.js` | DONE | Full HTTP client with JWT bearer, offline detection, error classes |

### Key Finding

**The backend is 95% complete. The main gap is frontend integration — `App.jsx` must be refactored to use the existing modular API client modules.**

## 2. Wave Decomposition

### Wave 1 — Critical: Auth Hardening + Frontend Integration Foundation

**Goal:** Secure all auth endpoints, add missing refresh endpoint, migrate App.jsx to modular API clients.

**Duration:** 3-4 days (parallel backend + frontend)

| Task ID | Description | Files Changed | Dependencies |
|---|---|---|---|
| WT-1.1 | Fix `AuthController.Logout` to validate token before returning success | `ITS-MOBILE-API/Controllers/AuthController.cs` (Logout method) | None |
| WT-1.2 | Fix `AuthController.ChangePassword` to validate current password via ABP | `ITS-MOBILE-API/Controllers/AuthController.cs` (ChangePassword method), `ITS-MOBILE-API/Services/AuthService.cs` (Add `ValidateCurrentPassword` method) | WT-1.1 |
| WT-1.3 | Add `POST /api/auth/refresh` endpoint to `AuthController` | `ITS-MOBILE-API/Controllers/AuthController.cs` (Add Refresh action), `ITS-MOBILE-API/Services/AuthService.cs` (Add `RefreshToken` method) | WT-1.2 |
| WT-1.4 | Add `refreshToken` field to `LoginResponse` DTO | `ITS-MOBILE-API/Models/Dto.cs` (Update `LoginResponse` record) | None |
| WT-1.5 | Refactor `App.jsx` `api` object to import from `src/api/` modules | `ITS_Mobile_VEC/src/App.jsx` (Replace inline `api` object with imports) | None (parallel with WT-1.1..1.4) |
| WT-1.6 | Ensure `src/api/auth.js` field naming matches backend `LoginResponse` | `ITS_Mobile_VEC/src/api/auth.js`, `ITS_Mobile_VEC/src/hooks/useAuth.jsx` (Align field names: token/profile shape) | WT-1.5 |
| WT-1.7 | Verify all `tryApiOrMock` calls in modular API modules match backend response shapes | All files in `ITS_Mobile_VEC/src/api/` | WT-1.5, WT-1.6 |
| WT-1.8 | Integration smoke test: login → get profile → list incidents → logout | Manual/Playwright test scenario | All WT-1.x |

### Wave 2 — High: Incident Detail + Advanced Notifications in App.jsx

**Goal:** Wire incident detail view and notifications tab to real API data in App.jsx.

**Duration:** 2-3 days (frontend-focused, backend already has endpoints)

| Task ID | Description | Files Changed | Dependencies |
|---|---|---|---|
| WT-2.1 | Wire `TaskDetailViewPanel` to use `api/incidents.js` `getIncidentDetail` + `updateIncident` + `getIncidentTimeline` | `ITS_Mobile_VEC/src/App.jsx` (TaskDetailViewPanel component — replace inline API calls) | WT-1.5 |
| WT-2.2 | Wire notifications tab to use `api/notifications.js` for all operations (list, markRead, markUnread, markAllRead, delete, registerPushToken) | `ITS_Mobile_VEC/src/App.jsx` (Notification panel section — replace inline `api.listNotifications`) | WT-1.5 |
| WT-2.3 | Add unread notification badge count using `api/notifications.js` `getUnreadCount` | `ITS_Mobile_VEC/src/App.jsx` (Header tab icons) | WT-2.2 |
| WT-2.4 | Add incident status transition validation (0→1→2→3) in frontend | `ITS_Mobile_VEC/src/App.jsx` (TaskDetailViewPanel status buttons) | WT-2.1 |
| WT-2.5 | Handle API error states in incident detail (loading, error, not-found) | `ITS_Mobile_VEC/src/App.jsx` (TaskDetailViewPanel error handling) | WT-2.1 |
| WT-2.6 | Smoke test: incident detail load → status update → timeline → notifications mark-read | Manual/Playwright test scenario | WT-2.1..2.5 |

### Wave 3 — Medium: Call History POST + File Upload Integration

**Goal:** Wire call recording and file upload to real API in App.jsx.

**Duration:** 2-3 days

| Task ID | Description | Files Changed | Dependencies |
|---|---|---|---|
| WT-3.1 | Wire call history `POST /history` to use `api/calls.js` `recordCall` + `endCall` + `deleteCallRecord` | `ITS_Mobile_VEC/src/App.jsx` (Call history section — replace `addMockCallHistory` with API call) | WT-1.5 |
| WT-3.2 | Wire file upload to use `api/files.js` `uploadFile` + `uploadMultiple` + `uploadWithProgress` | `ITS_Mobile_VEC/src/App.jsx` (TaskDetailViewPanel attachment handling — replace local blob URLs with API upload) | WT-1.5 |
| WT-3.3 | Add upload progress indicator in incident detail for file uploads | `ITS_Mobile_VEC/src/App.jsx` (TaskDetailViewPanel attachment UI) | WT-3.2 |
| WT-3.4 | Handle file type/size validation feedback in UI | `ITS_Mobile_VEC/src/App.jsx` (File upload error handling) | WT-3.2 |
| WT-3.5 | Smoke test: record call → end call → delete → upload file → download | Manual/Playwright test scenario | WT-3.1..3.4 |

### Wave 4 — Low: Profile Integration

**Goal:** Wire profile tab to real API data in App.jsx.

**Duration:** 1-2 days

| Task ID | Description | Files Changed | Dependencies |
|---|---|---|---|
| WT-4.1 | Wire profile tab to use `api/profile.js` `getProfile` + `updateProfile` + `getPreferences` + `updatePreferences` | `ITS_Mobile_VEC/src/App.jsx` (Profile panel section) | WT-1.5 |
| WT-4.2 | Wire change-password modal to use `api/auth.js` `changePassword` with correct field names | `ITS_Mobile_VEC/src/App.jsx` (submitPasswordChange — align with backend `ChangePasswordRequest`) | WT-1.2, WT-1.6 |
| WT-4.3 | Add profile preferences (language, theme, map_style) editor UI | `ITS_Mobile_VEC/src/App.jsx` (Profile tab preferences section) | WT-4.1 |
| WT-4.4 | Smoke test: load profile → update → change password → update preferences | Manual/Playwright test scenario | WT-4.1..4.3 |

## 3. Parallel Execution Strategy

```
Wave 1:
  Backend:  WT-1.1 ──> WT-1.2 ──> WT-1.3 ──> WT-1.4 ──> WT-1.8
                     \                              /
                     WT-1.5 ──> WT-1.6 ──> WT-1.7 ──/
                              Frontend:
```

- Backend auth hardening (WT-1.1..1.4) is sequential due to dependency chain (logout → validate-password → refresh → token shape)
- Frontend migration (WT-1.5..1.7) can proceed in parallel with backend auth fixes
- Both converge on WT-1.8 (integration smoke test)

```
Wave 2: All frontend — sequential within wave (incident detail before notifications before badges)
Wave 3: All frontend — parallel where possible (call history independent of file upload)
Wave 4: All frontend — sequential (profile before preferences)
```

## 4. File Inventory

### Backend Files to Modify

| File | Wave | Tasks | Changes Summary |
|---|---|---|---|
| `ITS-MOBILE-API/Controllers/AuthController.cs` | 1 | WT-1.1, WT-1.2, WT-1.3 | Fix logout validation, fix change-password, add refresh endpoint |
| `ITS-MOBILE-API/Services/AuthService.cs` | 1 | WT-1.2, WT-1.3, WT-1.4 | Add `ValidateCurrentPassword()`, add `RefreshToken()`, update `LoginResponse` |
| `ITS-MOBILE-API/Models/Dto.cs` | 1 | WT-1.4 | Add `RefreshToken` to `LoginResponse` record |

**Files verified as already complete (NO changes needed):**
- `ITS-MOBILE-API/Controllers/IncidentsController.cs` — all endpoints exist
- `ITS-MOBILE-API/Controllers/NotificationsController.cs` — all endpoints exist
- `ITS-MOBILE-API/Controllers/CallsController.cs` — all endpoints exist
- `ITS-MOBILE-API/Controllers/FilesController.cs` — all endpoints exist
- `ITS-MOBILE-API/Controllers/ProfileController.cs` — all endpoints exist
- `ITS-MOBILE-API/Services/FileService.cs` — fully implemented
- `ITS-MOBILE-API/Services/ProfileService.cs` — fully implemented
- `ITS-MOBILE-API/Program.cs` — JWT config is correct

### Frontend Files to Modify

| File | Wave | Tasks | Changes Summary |
|---|---|---|---|
| `ITS_Mobile_VEC/src/App.jsx` | 1-4 | WT-1.5..WT-4.3 | Full refactor: replace inline apiFetch with modular api imports, wire all data to real endpoints |
| `ITS_Mobile_VEC/src/api/auth.js` | 1 | WT-1.6 | Field name alignment (verify `refreshToken` shape) |
| `ITS_Mobile_VEC/src/hooks/useAuth.jsx` | 1 | WT-1.6 | Verify session shape matches backend `LoginResponse` |
| `ITS_Mobile_VEC/src/api/*.js` | 1 | WT-1.7 | Verify all mock fallbacks match backend response shapes |

**Frontend files verified as already complete (NO changes needed):**
- `ITS_Mobile_VEC/src/api/client.js` — full HTTP client with JWT, error classes, offline detection
- `ITS_Mobile_VEC/src/api/incidents.js` — all endpoints with tryApiOrMock
- `ITS_Mobile_VEC/src/api/notifications.js` — all endpoints including SSE stream
- `ITS_Mobile_VEC/src/api/calls.js` — all endpoints with tryApiOrMock
- `ITS_Mobile_VEC/src/api/files.js` — all endpoints including uploadWithProgress
- `ITS_Mobile_VEC/src/api/profile.js` — all endpoints with tryApiOrMock
- `ITS_Mobile_VEC/src/api/contacts.js` — already working
- `ITS_Mobile_VEC/src/api/tasks.js` — already working

## 5. Risk Register

| ID | Risk | Mitigation | Owner |
|---|---|---|---|
| R-001 | ABP password hashing format unknown — `ValidateCurrentPassword` may need ABP's `PasswordHasher` | Check ABP framework version in project; use `AbpUserLogins` hash column if available | Backend (WT-1.2) |
| R-002 | `App.jsx` is 1400+ lines — large single-file refactor is error-prone | Use `WT-1.5` to extract API section first, then incrementally replace mock → API in subsequent waves | Frontend (WT-1.5) |
| R-003 | `tryApiOrMock` pattern means both API and mock must return identical shapes | Run `WT-1.7` to audit every mock fallback against backend DTOs | Frontend (WT-1.7) |
| R-004 | File upload to disk path `uploads/{username}/{yyyyMMdd}/` may not exist on target server | Ensure `FileService` directory creation handles permissions; add config for upload path | Backend (already handled in FileService.cs:19-21) |
| R-005 | Frontend `src/api/client.js` and `App.jsx` both define apiFetch — potential duplication | `WT-1.5` eliminates the duplication by removing inline `apiFetch` entirely | Frontend (WT-1.5) |

## 6. Dependencies Between Features

```
F-001 (Auth)  ──> F-002 (Incident Detail)    [F-002 needs JWT auth]
F-001 (Auth)  ──> F-003 (Call History)       [F-003 needs JWT auth]
F-001 (Auth)  ──> F-004 (Notifications)      [F-004 needs JWT auth]
F-001 (Auth)  ──> F-005 (File Upload)        [F-005 needs JWT auth]
F-001 (Auth)  ──> F-006 (Profile)            [F-006 needs JWT auth]

F-002 (Incident) ──> F-005 (File Upload)     [Incident detail uploads files]
```

All features depend on F-001 (Auth). F-002 and F-005 have a cross-feature dependency (uploading files within incident detail).

## 7. Build & Test Commands

### Backend
```powershell
cd C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS-MOBILE-API
dotnet restore
dotnet build
dotnet test
```

### Frontend
```powershell
cd C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS_Mobile_VEC\ITS_Mobile_VEC
npm install
npm run build
# For dev server:
npm run dev
```

### Integration Test
```powershell
cd C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS_Mobile_VEC\ITS_Mobile_VEC
npx playwright test
```

## 8. Acceptance Criteria per Feature

| Feature | Acceptance Criteria |
|---|---|
| **F-001: Auth & JWT** | - `POST /login` returns valid JWT token with issuer/audience/lifetime<br>- All `[Authorize]` endpoints reject unauthenticated requests (401)<br>- `POST /logout` validates token before returning success<br>- `POST /change-password` validates current password hash<br>- `POST /api/auth/refresh` returns new JWT and refreshToken<br>- `GET /api/auth/me` returns current user from JWT claims |
| **F-002: Incident Detail** | - `GET /api/incidents/{id}` returns full incident with StatusLog<br>- `PATCH /api/incidents/{id}` updates status and adds IncidentLog<br>- `GET /api/incidents/{id}/timeline` returns ordered status history<br>- Frontend TaskDetailViewPanel loads real data and displays timeline |
| **F-003: Call History POST** | - `POST /api/calls/history` creates call record with username from JWT<br>- `POST /api/calls/{id}/end` updates call status and duration<br>- `DELETE /api/calls/history/{id}` removes call record<br>- Frontend call history uses `api/calls.js` modules |
| **F-004: Advanced Notifications** | - `GET /api/notifications/unread-count` returns count<br>- `PATCH /api/notifications/{id}/read` marks single notification read<br>- `PATCH /api/notifications/read-all` marks all read<br>- `DELETE /api/notifications/{id}` removes notification<br>- `POST /api/notifications/push/register` stores push token<br>- Frontend notifications tab uses `api/notifications.js` modules<br>- Unread badge count displayed in header |
| **F-005: File Upload** | - `POST /api/files/upload` accepts multipart, validates type+size, saves to disk<br>- `POST /api/files/upload-multiple` handles multiple files<br>- `GET /api/files/{id}/download` streams file with Content-Disposition<br>- `DELETE /api/files/{id}` soft-deletes file<br>- Frontend incident detail uploads files via API (not just local blobs)<br>- Upload progress indicator visible |
| **F-006: Profile** | - `GET /api/profile` returns profile from JWT username<br>- `PATCH /api/profile` updates user name<br>- `GET /api/profile/preferences` returns language/theme/map_style<br>- `PATCH /api/profile/preferences` stores preferences<br>- Frontend profile tab displays real data and allows editing |

## 9. Sign-Off

- **Tech Lead:** Tech Lead Agent (ETC AI)
- **Date:** 2026-05-28
- **Status:** Approved — ready for Dev execution
