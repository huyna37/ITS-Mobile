# Business Analysis Report: ITS Mobile Full Stack (M-001)

## 1. Objective

Phân tích khoảng cách giữa API frontend hiện tại (với mock data) và API backend thực tế, xác định các endpoint cần xây dựng/cập nhật để thay thế toàn bộ mock data bằng data thật từ database ITS_PRODUCT_STAGING.

## 2. Scope

- Backend: `ITS-MOBILE-API` (.NET 9 Web API, EF Core, SQL Server)
- Frontend: `ITS_Mobile_VEC/ITS_Mobile_VEC/src` (React 18, modular API client 11 module)
- Database: Đọc thuần từ `ITS_PRODUCT_STAGING`, không sửa schema

## 3. Gap Analysis

### 3.1 Auth (`/api/auth/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `POST /login` | `post('/api/auth/login', creds)` | EXISTS — `AuthController.Login` | OK |
| `GET /profile` | `get('/api/profile')` (profile.js) | `AuthController.GetProfile(username query)` | PARTIAL — API path mismatch, not token-authenticated |
| `POST /logout` | `post('/api/auth/logout')` | EXISTS — but returns `{success: true}` immediately | NEEDS FIX — no validation against token |
| `POST /change-password` | `post('/api/auth/change-password', payload)` | EXISTS — but returns `{success: true}` immediately | NEEDS FIX — no password validation |
| `POST /refresh` | `post('/api/auth/refresh', {refreshToken})` | NOT EXISTS | MISSING |
| `POST /me` | `post('/api/auth/me')` | NOT EXISTS | MISSING |
| `POST /forgot-password` | `post('/api/auth/forgot-password')` | NOT EXISTS | MISSING |
| `POST /verify-otp` | `post('/api/auth/verify-otp')` | NOT EXISTS | MISSING |
| `POST /reset-password` | `post('/api/auth/reset-password')` | NOT EXISTS | MISSING |

### 3.2 Tasks (`/api/tasks/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `GET /assigned` | `get('/api/tasks/assigned')` | EXISTS | OK |
| `GET /completed-recent` | `get('/api/tasks/completed-recent')` | EXISTS | OK |
| `GET /{id}` | `get('/api/tasks/{id}')` | EXISTS | OK |
| `PATCH /{id}` | implied (status update) | EXISTS as `PATCH /{id}` | OK |
| `POST /{id}/accept` | NOT expected by frontend API client | NOT EXISTS | MISSING (optional) |
| `POST /{id}/reassign` | NOT expected by frontend API client | NOT EXISTS | MISSING (optional) |
| `GET /search` | `get('/api/tasks/search')` | NOT EXISTS | MISSING |

### 3.3 Incidents (`/api/incidents/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `GET /` | `get('/api/incidents')` | EXISTS | OK |
| `GET /{id}` | `get('/api/incidents/{id}')` | NOT EXISTS | MISSING |
| `PATCH /{id}` | `patch('/api/incidents/{id}')` | NOT EXISTS | MISSING |
| `POST /` | `post('/api/incidents')` | NOT EXISTS | MISSING |
| `DELETE /{id}` | `delete('/api/incidents/{id}')` | NOT EXISTS | MISSING |
| `POST /{id}/notes` | `post('/api/incidents/{id}/notes')` | NOT EXISTS | MISSING |
| `GET /{id}/timeline` | `get('/api/incidents/{id}/timeline')` | NOT EXISTS | MISSING |
| `GET /by-location` | `get('/api/incidents/by-location')` | NOT EXISTS | MISSING |
| `GET /stats` | `get('/api/incidents/stats')` | NOT EXISTS | MISSING |

### 3.4 Calls (`/api/calls/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `GET /history` | `get('/api/calls/history')` | EXISTS | OK |
| `POST /history` | `post('/api/calls/history')` (recordCall) | NOT EXISTS | MISSING |
| `POST /{id}/end` | `post('/api/calls/{id}/end')` | NOT EXISTS | MISSING |
| `GET /missed` | `get('/api/calls/missed')` | NOT EXISTS | MISSING |
| `DELETE /history` | `delete('/api/calls/history')` | NOT EXISTS | MISSING |
| `DELETE /history/{id}` | `delete('/api/calls/history/{id}')` | NOT EXISTS | MISSING |
| `GET /stats` | `get('/api/calls/stats')` | NOT EXISTS | MISSING |

### 3.5 Notifications (`/api/notifications/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `GET /` | `get('/api/notifications')` | EXISTS | OK |
| `GET /unread-count` | `get('/api/notifications/unread-count')` | NOT EXISTS | MISSING |
| `PATCH /{id}/read` | `patch('/api/notifications/{id}/read')` | NOT EXISTS | MISSING |
| `PATCH /{id}/unread` | `patch('/api/notifications/{id}/unread')` | NOT EXISTS | MISSING |
| `PATCH /read-all` | `patch('/api/notifications/read-all')` | NOT EXISTS | MISSING |
| `DELETE /{id}` | `delete('/api/notifications/{id}')` | NOT EXISTS | MISSING |
| `POST /push/register` | `post('/api/notifications/push/register')` | NOT EXISTS | MISSING |
| `POST /push/unregister` | `post('/api/notifications/push/unregister')` | NOT EXISTS | MISSING |
| `GET /settings` | `get('/api/notifications/settings')` | NOT EXISTS | MISSING |
| `PATCH /settings` | `patch('/api/notifications/settings')` | NOT EXISTS | MISSING |
| `GET /stream` (SSE) | `new EventSource('/api/notifications/stream')` | NOT EXISTS | MISSING |

### 3.6 Files (`/api/files/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `POST /upload` | `post('/api/files/upload')` multipart | NOT EXISTS — NO FILES CONTROLLER | MISSING |
| `POST /upload-multiple` | `post('/api/files/upload-multiple')` multipart | NOT EXISTS | MISSING |
| `DELETE /{id}` | `delete('/api/files/{id}')` | NOT EXISTS | MISSING |
| `GET /{id}/download` | `get('/api/files/{id}/download')` | NOT EXISTS | MISSING |
| `GET /{id}` | `get('/api/files/{id}')` metadata | NOT EXISTS | MISSING |

### 3.7 Profile (`/api/profile/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `GET /` | `get('/api/profile')` | NOT EXISTS (only in AuthController as `/api/auth/profile?username=...`) | NEEDS RESTRUCTURE |
| `PATCH /` | `patch('/api/profile')` | NOT EXISTS | MISSING |
| `POST /avatar` | `post('/api/profile/avatar')` | NOT EXISTS | MISSING |
| `DELETE /avatar` | `delete('/api/profile/avatar')` | NOT EXISTS | MISSING |
| `GET /activity` | `get('/api/profile/activity')` | NOT EXISTS | MISSING |
| `GET /preferences` | `get('/api/profile/preferences')` | NOT EXISTS | MISSING |
| `PATCH /preferences` | `patch('/api/profile/preferences')` | NOT EXISTS | MISSING |

### 3.8 Contacts (`/api/contacts/*`)

| Endpoint | Frontend expects | Backend exists | Status |
|---|---|---|---|
| `GET /` | `get('/api/contacts')` | EXISTS | OK |
| `POST /` | `post('/api/contacts')` | EXISTS | OK |
| `PATCH /{id}` | `patch('/api/contacts/{id}')` | EXISTS | OK |
| `DELETE /{id}` | `delete('/api/contacts/{id}')` | EXISTS | OK |
| `GET /{ext}/info` | `get('/api/contacts/by-ext/{ext}')` | NOT EXISTS | MISSING |
| `GET /search` | `get('/api/contacts/search')` | NOT EXISTS | MISSING |
| `POST /import` | `post('/api/contacts/import')` | NOT EXISTS | OPTIONAL |
| `GET /export` | `get('/api/contacts/export')` | NOT EXISTS | OPTIONAL |
| `PATCH /{id}/online` | `patch('/api/contacts/{id}/online')` | NOT EXISTS | MISSING |

## 4. Architecture Gaps

### 4.1 JWT Authentication Middleware
- **Current:** `Program.cs` line 51: `app.UseAuthorization()` exists, but no JWT bearer auth scheme is configured. Token generated in `AuthService.GenerateToken()` uses SHA256 hash (not standard JWT). No `AddAuthentication(JwtBearer)` call.
- **Impact:** All protected endpoints are effectively unprotected. Token is never validated on incoming requests.
- **Recommendation:** Implement proper JWT bearer auth with `AddAuthentication` + `AddJwtBearer`. Validate tokens in all endpoints that require auth.

### 4.2 Error Handling
- **Current:** No global exception handler. Unhandled exceptions return default ASP.NET 500 response.
- **Impact:** Poor error UX for mobile app.
- **Recommendation:** Add `UseExceptionHandler` middleware for consistent error responses.

### 4.3 File Storage
- **Current:** No `FilesOfIncident` entity is used by any controller or service. Database has `FilesOfIncidents` DbSet but no upload/download API.
- **Impact:** F-005 cannot be implemented without creating FilesController + I/O service.
- **Recommendation:** Create `FilesController` with multipart upload, store files on disk/blob, persist metadata to `FilesOfIncidents` table.

### 4.4 Frontend-Backend Integration
- **Current:** `App.jsx` uses inline `apiFetch` and hardcoded mock data, NOT the modular `src/api/` client modules.
- **Impact:** Even after backend API is complete, frontend still won't consume real data.
- **Recommendation:** Refactor `App.jsx` to import from `src/api/` modules.

## 5. Feature Mapping to Gaps

| Feature | Gap Categories | Priority |
|---|---|---|
| F-001 Auth & JWT | JWT middleware, logout validation, change-password validation, missing /refresh, /me | CRITICAL |
| F-002 Incident Detail | Missing GET/{id}, PATCH/{id}, notes, timeline | HIGH |
| F-003 Call History | Missing POST /history, endCall, missed calls, delete | MEDIUM |
| F-004 Notifications | Missing 8+ endpoints (read, delete, push, settings, SSE) | HIGH |
| F-005 File Upload | Complete FilesController missing from scratch | MEDIUM |
| F-006 Profile & Preferences | Complete ProfileController missing, profile API restructure | LOW |

## 6. Database Entities Available (from DbContext)

Used by existing services: `AbpUsers`, `AbpUserLogins`, `AbpUserRoles`, `AbpRoles`, `TaskOfIncidents`, `IncidentProfiles`, `IncidentLogs`, `WorkerTaskIncidents`, `WorkerInfos`, `EventInfos`, `AbpNotifications`, `AbpUserNotifications`, `CallHistories`, `Extensions`, `ExtensionDetails`, `IpPhones`, `FilesOfIncidents`, `AsteriskCDRs`

New services may need: `AbpUserNotifications` (for read/unread notifications), `FilesOfIncidents` (for file metadata)

## 7. Assumptions

1. Staging DB is accessible from backend server (connection string configured in `appsettings.json`)
2. Passwords in ABP are hashed — `AuthService.Login()` currently allows any password if user exists. This needs proper password verification using ABP's `PasswordHasher`
3. File uploads stored locally on API server disk (not cloud storage)
4. Push notification registration stores token in `AbpUserNotifications` or a dedicated preference table

## 8. Recommendations

1. **Phase 1 (Critical):** JWT middleware + auth endpoints validation + logout/change-password fix
2. **Phase 2 (High):** Incidents detail endpoints + notifications partial (read/delete/push-token)
3. **Phase 3 (Medium):** Call recording POST + FilesController
4. **Phase 4 (Low):** ProfileController + remaining notification settings + contact search
5. **Parallel:** Frontend App.jsx migration from inline mock to modular API client

## 9. Risks

- R-001: ABP password hashing format may differ from standard — requires checking ABP framework version
- R-002: File upload size limits not defined — need to configure max request body size
- R-003: SSE (Server-Sent Events) requires Kestral configuration for long-lived connections
- R-004: Frontend `tryApiOrMock` fallback pattern means backend must match mock response shapes exactly

## 10. Sign-Off

- **Analyst:** BA Agent (ETC AI)
- **Date:** 2026-05-28
- **Status:** Ready for SA review
