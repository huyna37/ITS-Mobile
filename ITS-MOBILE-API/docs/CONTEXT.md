# ITS-MOBILE-API — Project Context & Implementation Plan

> **Created**: 2026-05-28
> **Project**: ITS-MOBILE-API — API service trung gian cho ITS Mobile frontend
> **Stack**: ASP.NET Core 9.0 + EF Core + SQL Server
> **Workspace**: `C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS-MOBILE-API\`
> **Mobile Frontend**: `C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS_Mobile_VEC\` (Vite + React + Tailwind)
> **DB Target**: `its_share` trên `10.10.10.244` (User: sa / Pass: Etc@123!!)

---

## 1. PROJECT OVERVIEW

### 1.1 Architecture

```
ITS Mobile (React/Vite) → ITS-MOBILE-API (.NET 9) → its_share DB (SQL Server)
    Port 5173              Port 5000/5263            10.10.10.244
```

### 1.2 Mobile Frontend API Endpoints Called

Mobile app calls these endpoints (defined in `ITS_Mobile_VEC/src/api/*.js`):

| Module | File | Endpoints |
|---|---|---|
| Auth | `src/api/auth.js` | `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/change-password`, `POST /api/auth/refresh`, `POST /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/verify-otp`, `POST /api/auth/reset-password` |
| Tasks | `src/api/tasks.js` | `GET /api/tasks/assigned`, `GET /api/tasks/completed-recent`, `GET /api/tasks/{id}`, `POST /api/tasks/{id}/accept`, `POST /api/tasks/{id}/reassign`, `GET /api/tasks/search` |
| Incidents | `src/api/incidents.js` | `GET /api/incidents`, `GET /api/incidents/{id}`, `PATCH /api/incidents/{id}`, `POST /api/incidents`, `POST /api/incidents/{id}/notes`, `GET /api/incidents/{id}/timeline`, `GET /api/incidents/by-location`, `GET /api/incidents/stats` |
| Contacts | `src/api/contacts.js` | `GET /api/contacts`, `GET /api/contacts/{ext}`, `POST /api/contacts`, `PATCH /api/contacts/{ext}`, `DELETE /api/contacts/{ext}`, `PATCH /api/contacts/{ext}/online`, `GET /api/contacts/search`, `POST /api/contacts/import`, `GET /api/contacts/export` |
| Calls | `src/api/calls.js` | `GET /api/calls/history`, `POST /api/calls/history`, `POST /api/calls/{id}/end`, `GET /api/calls/missed`, `DELETE /api/calls/history`, `DELETE /api/calls/history/{id}`, `GET /api/calls/stats` |
| Notifications | `src/api/notifications.js` | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/{id}/unread`, `PATCH /api/notifications/read-all`, `DELETE /api/notifications/{id}`, `POST /api/notifications/push/register`, `POST /api/notifications/push/unregister`, `GET /api/notifications/settings`, `PATCH /api/notifications/settings`, `GET /api/notifications/stream` |
| Profile | `src/api/profile.js` | `GET /api/profile`, `PATCH /api/profile`, `POST /api/profile/avatar`, `DELETE /api/profile/avatar`, `GET /api/profile/activity`, `GET /api/profile/preferences`, `PATCH /api/profile/preferences` |
| Files | `src/api/files.js` | `POST /api/files/upload`, `POST /api/files/upload-multiple`, `DELETE /api/files/{id}`, `GET /api/files/{id}/download`, `GET /api/files/{id}`, `POST /api/files/upload-with-progress` |

### 1.3 Mobile Data Structures (from `src/api/mocks.js`)

```javascript
// Profile
{
  ten_nhan_vien: 'Nguyễn Minh Hoàng',
  chuc_vu: 'Nhân viên tuần tra hiện trường',
  don_vi: 'Đội số 2',
  email: 'hoang.nm@etc.vn',
  so_dien_thoai: '0901234567',
  avatar_url: null
}

// Task
{
  id: 'NB-2024-001', code: 'TASK-8821', type: 'Tai nạn giao thông',
  level: 'Nghiêm trọng', location: 'Km 24+500', direction: 'Hướng Lào Cai',
  time: '14:20 25/05', status: 1, description: '...', script: '...'
}

// Contact
{ ext: '9901', name: 'Trung tâm điều hành (TMC)', online: true }

// Call History
{ id, extension, name, time, duration, status }  // status: "Đang quay số"/"Đang kết nối"/"Đã ngắt"/"Nhỡ cuộc"

// Incident
{ id, title, location, time, category, tag }

// Notification
{ id, title, desc, time, unread, kind }
```

---

## 2. DATABASE SCHEMA (its_share)

### 2.1 Connection String

**Current** (`appsettings.json:3`):
```
Server=PTPM-HUNGPT1-LA;Database=ITS_PRODUCT_STAGING;User Id=sa;Password=admin;...
```

**Target**:
```
Server=10.10.10.244;Database=its_share;User Id=sa;Password=Etc@123!!;Trusted_Connection=False;Encrypt=False;TrustServerCertificate=True;
```

### 2.2 Existing Tables Mapped

| Table | Model Class | Used By | Purpose |
|---|---|---|---|
| `AbpUsers` | `AbpUser.cs` | Auth | User accounts (ABP) |
| `AbpRoles` | `AbpRole.cs` | Auth | Roles |
| `AbpUserRoles` | `AbpUserRole.cs` (line 7-18) | Auth | User-Role mapping |
| `AbpUserLogins` | `AbpUserLogin.cs` | Auth | Login providers |
| `AbpUserOrganizationUnits` | `AbpUserOrganizationUnit.cs` | Auth | Org unit mapping |
| `AbpOrganizationUnits` | `AbpOrganizationUnit.cs` | Auth | Org units |
| `WorkerInfos` | `WorkerInfo.cs` | Auth, Profile | Employee info (UserId link) |
| `TaskOfIncidents` | `TaskOfIncident.cs` | Tasks | Tasks with status 0-3 |
| `WorkerTaskIncidents` | `WorkerTaskIncident.cs` | Tasks | Task-worker assignment |
| `IncidentProfiles` | `IncidentProfile.cs` | Tasks, Incidents | Incident master data |
| `IncidentLogs` | `IncidentLog.cs` | Tasks | Status change logs |
| `FilesOfIncidents` | `FilesOfIncident.cs` | Files | File attachments |
| `Extensions` | `Extension.cs` | Contacts | PBX extensions (directory) |
| `ExtensionDetails` | `ExtensionDetail.cs` | Contacts | Extension metadata |
| `IpPhones` | `IpPhone.cs` | Contacts | Phone status (online/offline) |
| `EventInfos` | `EventInfo.cs` | Incidents | Raw event data |
| `CallHistories` | `CallHistory.cs` | Calls | Call logs from PBX |
| `AsteriskCDR` | `AsteriskCDR.cs` | Calls | CDR raw records |
| `AbpNotifications` | `AbpNotification.cs` | Notifications | ABP notifications |
| `AbpUserNotifications` | `AbpUserNotification.cs` | Notifications | User-notification mapping |
| `TaskOfScripts` | `TaskOfScript.cs` | — | Scripts/templates (unused) |

### 2.3 DbContext Registration (`Data/ItsDbContext.cs`)

```csharp
// Lines 10-40 - all DbSets registered
DbSet<AbpUser> AbpUsers
DbSet<AbpUserLogin> AbpUserLogins
DbSet<AbpUserRole> AbpUserRoles
DbSet<AbpRole> AbpRoles
DbSet<AbpUserOrganizationUnit> AbpUserOrganizationUnits
DbSet<AbpOrganizationUnit> AbpOrganizationUnits
DbSet<TaskOfIncident> TaskOfIncidents
DbSet<WorkerTaskIncident> WorkerTaskIncidents
DbSet<IncidentProfile> IncidentProfiles
DbSet<IncidentLog> IncidentLogs
DbSet<TaskOfScript> TaskOfScripts
DbSet<WorkerInfo> WorkerInfos
DbSet<Extension> Extensions
DbSet<ExtensionDetail> ExtensionDetails
DbSet<IpPhone> IpPhones
DbSet<CallHistory> CallHistories
DbSet<AsteriskCDR> AsteriskCDRs
DbSet<EventInfo> EventInfos
DbSet<AbpUserNotification> AbpUserNotifications
DbSet<AbpNotification> AbpNotifications
DbSet<FilesOfIncident> FilesOfIncidents
```

### 2.4 Key Entity Fields for Mapping

**AbpUser** (`Models/AbpUser.cs:6-21`):
- `Id` (long), `UserName`, `Name`, `Surname`, `EmailAddress`, `PhoneNumber`, `SipNumber`
- `IsActive` — must check for login

**WorkerInfo** (`Models/WorkerInfo.cs:6-13`):
- `UserId` (FK to AbpUsers.Id), `IsDeleted`, `CreationTime`
- Note: Missing fields like `chuc_vu`, `don_vi` — may need to join with other tables or derive from AbpOrganizationUnits

**TaskOfIncident** (`Models/TaskOfIncident.cs:6-21`):
- `Id`, `Code`, `Name`, `Description`, `Status` (0-3), `StartDate`, `EndDate`, `IncidentProfileId`
- Links to `IncidentProfile` via FK

**IncidentProfile** (`Models/IncidentProfile.cs:6-30`):
- `Id`, `Code`, `TimeDetect`, `Direction` (0=Ha Noi, 1=Lo Cai), `PositionKM`, `PositionM`
- `Status`, `Level`, `Description`, `Script`, `IsDeleted`

**EventInfo** (`Models/EventInfo.cs:6-23`):
- `Id`, `Code`, `TimeDetect`, `Direction`, `PositionKM`, `PositionM`, `Description`
- `Status` (0=Đang diễn ra, 1=Đã kết thúc), `IsDeleted`

**Extension** (`Models/Extension.cs:6-18`):
- `Id`, `ExtensionNumber`, `ExtensionName`, `ExtensionUnsignedName`, `IsDeleted`

**IpPhone** (`Models/IpPhone.cs:6-25`):
- `Id`, `Code`, `PhoneNumber`, `Status` (1=online), `IsDeleted`

**CallHistory** (`Models/CallHistory.cs:6-23`):
- `Id`, `PhoneNumber`, `Duration`, `CallDate`, `Supporter`, `Status`, `IsSOS`

---

## 3. CURRENT API STATUS AUDIT

### 3.1 Build Status
**✅ Build succeeds** — 0 error, 0 warning on .NET 9.0

### 3.2 Controllers & Services Inventory

| Controller | Service | Status |
|---|---|---|
| `AuthController` | `AuthService` | ✅ Partially implemented |
| `TasksController` | `TaskService` | ✅ Partially implemented |
| `IncidentsController` | `IncidentService` | ⚠️ Minimal (GET only) |
| `ContactsController` | `ContactService` | ✅ Implemented (CRUD) |
| `CallsController` | `CallHistoryService` | ⚠️ Minimal (GET only) |
| `NotificationsController` | `NotificationService` | ⚠️ Minimal (GET only) |
| `ProfileController` | — | ❌ Missing entirely |
| `FilesController` | — | ❌ Missing entirely |

### 3.3 Endpoint Gap Analysis

| Controller | Mobile Endpoint | API Status | Issue |
|---|---|---|---|
| **Auth** | `POST /api/auth/login` | ✅ OK | No real password validation (line 28-35 AuthService.cs) |
| | `POST /api/auth/logout` | ⚠️ Placeholder | Returns OK without doing anything (line 42-45) |
| | `POST /api/auth/change-password` | ⚠️ Placeholder | Returns OK without doing anything (line 47-51) |
| | `POST /api/auth/me` | ❌ Missing | No endpoint at all |
| | `POST /api/auth/refresh` | ❌ Missing | No endpoint at all |
| | `POST /api/auth/forgot-password` | ❌ Missing | No endpoint at all |
| | `POST /api/auth/verify-otp` | ❌ Missing | No endpoint at all |
| | `POST /api/auth/reset-password` | ❌ Missing | No endpoint at all |
| **Tasks** | `GET /api/tasks/assigned` | ✅ OK | Queries DB correctly |
| | `GET /api/tasks/completed-recent` | ✅ OK | Queries DB correctly |
| | `GET /api/tasks/{id}` | ✅ OK | Returns detail with logs |
| | `PATCH /api/tasks/{id}` | ✅ OK | Updates status, creates log |
| | `POST /api/tasks/{id}/accept` | ❌ Missing | — |
| | `POST /api/tasks/{id}/reassign` | ❌ Missing | — |
| | `GET /api/tasks/search` | ❌ Missing | — |
| **Incidents** | `GET /api/incidents` | ✅ OK | Returns EventInfos list |
| | `GET /api/incidents/{id}` | ❌ Missing | — |
| | `PATCH /api/incidents/{id}` | ❌ Missing | — |
| | `POST /api/incidents` | ❌ Missing | — |
| | `POST /api/incidents/{id}/notes` | ❌ Missing | — |
| | `GET /api/incidents/{id}/timeline` | ❌ Missing | — |
| | `GET /api/incidents/by-location` | ❌ Missing | — |
| | `GET /api/incidents/stats` | ❌ Missing | — |
| **Contacts** | `GET /api/contacts` | ✅ OK | Queries Extensions + IpPhones |
| | `GET /api/contacts/{ext}` | ❌ Missing | — |
| | `POST /api/contacts` | ✅ OK | Creates Extension |
| | `PATCH /api/contacts/{ext}` | ⚠️ Wrong param | Uses `long id` instead of `string ext` (line 33) |
| | `DELETE /api/contacts/{ext}` | ⚠️ Wrong param | Uses `long id` instead of `string ext` (line 42) |
| | `PATCH /api/contacts/{ext}/online` | ❌ Missing | — |
| | `GET /api/contacts/search` | ❌ Missing | — |
| | `POST /api/contacts/import` | ❌ Missing | — |
| | `GET /api/contacts/export` | ❌ Missing | — |
| **Calls** | `GET /api/calls/history` | ✅ OK | Queries CallHistories |
| | `POST /api/calls/history` | ❌ Missing | — |
| | `POST /api/calls/{id}/end` | ❌ Missing | — |
| | `GET /api/calls/missed` | ❌ Missing | — |
| | `DELETE /api/calls/history` | ❌ Missing | — |
| | `DELETE /api/calls/history/{id}` | ❌ Missing | — |
| | `GET /api/calls/stats` | ❌ Missing | — |
| **Notifications** | `GET /api/notifications` | ✅ OK | Queries AbpNotifications |
| | All other endpoints | ❌ Missing | 10 endpoints missing |
| **Profile** | All endpoints | ❌ Missing | Controller doesn't exist |
| **Files** | All endpoints | ❌ Missing | Controller doesn't exist |

### 3.4 Critical Issues

1. **Connection string wrong** — `appsettings.json:3` points to `ITS_PRODUCT_STAGING` on `PTPM-HUNGPT1-LA`. Must change to `its_share` on `10.10.10.244`.

2. **No real password validation** — `AuthService.cs:28-35`: if user exists and active, login succeeds with any password. No ABP password hasher used.

3. **JWT is hand-rolled** — `AuthService.cs:83-91`: SHA256 hash of payload + secret. Not standard JWT format. Client cannot parse/verify token.

4. **ChangePassword & Logout are placeholders** — `AuthController.cs:47-51` returns OK immediately.

5. **Contacts param type mismatch** — Controller accepts `long id` (`ContactsController.cs:33,42`), mobile sends string `ext`.

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Foundation (Connect to its_share + Fix Auth)

#### Task 1.1: Update Connection String
- **File**: `appsettings.json` (line 3)
- **Change**: Replace with `its_share` connection
- **Also check**: `appsettings.Development.json` for dev override

#### Task 1.2: Add ABP Password Hasher / Validate Password
- **Options**:
  - A: Use `AbpCryptoProvider` from ABP framework (requires adding ABP NuGet packages)
  - B: Manual hash check against ABP stored hash format
  - C: For now, store password as plain hash — insert admin user with known hash
- **Recommendation**: Option C — use ABP's password hashing algorithm directly

#### Task 1.3: Replace JWT with Standard JWT
- **Add NuGet**: `System.IdentityModel.Tokens.Jwt` + `Microsoft.IdentityModel.Tokens`
- **File**: `AuthService.cs` method `GenerateToken()` (line 83-91)
- **Use**: `JwtSecurityTokenHandler` with HS256

#### Task 1.4: Implement Missing Auth Endpoints
- `POST /api/auth/me` — get current user from token
- `POST /api/auth/refresh` — refresh token
- `POST /api/auth/change-password` — validate old + set new (with ABP hasher)
- `POST /api/auth/forgot-password` — generate OTP (placeholder for now)
- `POST /api/auth/verify-otp` — verify OTP
- `POST /api/auth/reset-password` — reset with new password

#### Task 1.5: Create Admin User in DB
- **SQL script**: Insert admin user into `AbpUsers`, `AbpRoles`, `AbpUserRoles`, `AbpUserLogins`
- **Username**: admin
- **Password**: 123qwe (stored with ABP hash format)
- **Role**: ADMIN (SuperAdmin if needed)

---

### Phase 2: Create Missing Controllers

#### Task 2.1: ProfileController
- **File**: `Controllers/ProfileController.cs` (NEW)
- **Endpoints**:
  - `GET /api/profile` — from token
  - `PATCH /api/profile` — update user info
  - `POST /api/profile/avatar` — upload avatar (multipart)
  - `DELETE /api/profile/avatar` — remove avatar
  - `GET /api/profile/activity` — login/activity log
  - `GET /api/profile/preferences` — user preferences
  - `PATCH /api/profile/preferences` — update preferences

#### Task 2.2: FilesController
- **File**: `Controllers/FilesController.cs` (NEW)
- **Endpoints**:
  - `POST /api/files/upload` — single file upload (multipart)
  - `POST /api/files/upload-multiple` — multiple files
  - `DELETE /api/files/{id}` — delete file
  - `GET /api/files/{id}/download` — serve file
  - `GET /api/files/{id}` — file metadata
  - `POST /api/files/upload-with-progress` — same as upload but with progress tracking

#### Task 2.3: IncidentsController — Expand
- **File**: `Controllers/IncidentsController.cs`
- **Add endpoints**:
  - `GET /api/incidents/{id}` — get by ID
  - `PATCH /api/incidents/{id}` — update incident
  - `POST /api/incidents` — create new incident
  - `POST /api/incidents/{id}/notes` — add note/log
  - `GET /api/incidents/{id}/timeline` — get timeline
  - `GET /api/incidents/by-location` — filter by km
  - `GET /api/incidents/stats` — count by status/category

#### Task 2.4: TasksController — Expand
- **File**: `Controllers/TasksController.cs`
- **Add endpoints**:
  - `POST /api/tasks/{id}/accept` — accept task assignment
  - `POST /api/tasks/{id}/reassign` — reassign to another user
  - `GET /api/tasks/search` — search by keyword

#### Task 2.5: ContactsController — Fix + Expand
- **File**: `Controllers/ContactsController.cs`
- **Fix**: Change param type from `long id` to `string ext`
- **Add endpoints**:
  - `GET /api/contacts/{ext}` — get by extension number
  - `PATCH /api/contacts/{ext}/online` — update online status
  - `GET /api/contacts/search` — search by name/ext
  - `POST /api/contacts/import` — bulk import
  - `GET /api/contacts/export` — export to CSV

#### Task 2.6: CallsController — Expand
- **File**: `Controllers/CallsController.cs`
- **Add endpoints**:
  - `POST /api/calls/history` — log new call
  - `POST /api/calls/{id}/end` — end call with duration
  - `GET /api/calls/missed` — filter missed calls
  - `DELETE /api/calls/history` — clear all
  - `DELETE /api/calls/history/{id}` — delete single record
  - `GET /api/calls/stats` — call statistics

#### Task 2.7: NotificationsController — Expand
- **File**: `Controllers/NotificationsController.cs`
- **Add endpoints**:
  - `GET /api/notifications/unread-count` — count unread
  - `PATCH /api/notifications/{id}/read` — mark read
  - `PATCH /api/notifications/{id}/unread` — mark unread
  - `PATCH /api/notifications/read-all` — mark all read
  - `DELETE /api/notifications/{id}` — delete notification
  - `POST /api/notifications/push/register` — register push token
  - `POST /api/notifications/push/unregister` — unregister push token
  - `GET /api/notifications/settings` — get settings
  - `PATCH /api/notifications/settings` — update settings
  - `GET /api/notifications/stream` — SSE stream for real-time

---

### Phase 3: Services Layer

#### Task 3.1: AuthService Enhancements
- Implement real password validation using ABP crypto
- Implement `RefreshToken` generation/validation
- Implement `ChangePassword` with old password check

#### Task 3.2: NotificationService Enhancements
- Filter by user_id
- Mark as read/unread
- Generate unread count

#### Task 3.3: CallHistoryService Enhancements
- Create new call record
- End call (update status + duration)
- Filter missed calls
- Statistics

#### Task 3.4: ProfileService (NEW)
- Get/update user profile
- Avatar upload/storage
- Preferences storage

#### Task 3.5: FileService (NEW)
- File upload to disk or cloud
- File download
- Metadata management

---

### Phase 4: Mobile Frontend Update

#### Task 4.1: Update config.js
- Set `VITE_API_BASE_URL=http://localhost:5000`

#### Task 4.2: Remove Mock Fallback
- Update `client.js` `tryApiOrMock` to remove mock providers
- Or keep for offline mode

#### Task 4.3: Fix auth flow in App.jsx
- Use real token from API
- Store in session storage
- Attach to all API requests

#### Task 4.4: Test all endpoints
- Login → get token
- Load each tab → verify data
- Test create/update/delete flows

---

## 5. FILE STRUCTURE REFERENCE

```
ITS-MOBILE-API/
├── appsettings.json              # Connection string (needs update)
├── appsettings.Development.json  # Dev overrides
├── Program.cs                    # DI, middleware, CORS
├── Data/
│   └── ItsDbContext.cs           # EF Core DbContext
├── Models/
│   ├── AbpUser.cs                # AbpUsers table
│   ├── AbpRole.cs                # AbpRoles + AbpUserRoles
│   ├── AbpUserLogin.cs           # AbpUserLogins
│   ├── WorkerInfo.cs             # WorkerInfos
│   ├── Extension.cs              # Extensions + ExtensionDetails
│   ├── IpPhone.cs                # IpPhones
│   ├── TaskOfIncident.cs         # TaskOfIncidents
│   ├── WorkerTaskIncident.cs     # WorkerTaskIncidents
│   ├── IncidentProfile.cs        # IncidentProfiles
│   ├── IncidentLog.cs            # IncidentLogs
│   ├── FilesOfIncident.cs        # FilesOfIncidents
│   ├── EventInfo.cs              # EventInfos
│   ├── CallHistory.cs            # CallHistories
│   ├── AdditionalModels.cs       # AbpOrganizationUnit, AbpNotifications, etc.
│   └── Dto.cs                    # Request/Response DTOs
├── Controllers/
│   ├── AuthController.cs         # Auth endpoints
│   ├── TasksController.cs        # Tasks endpoints
│   ├── IncidentsController.cs    # Incidents endpoints (minimal)
│   ├── ContactsController.cs     # Contacts endpoints
│   ├── CallsController.cs        # Calls endpoints (minimal)
│   └── NotificationsController.cs # Notifications endpoints (minimal)
├── Services/
│   ├── AuthService.cs
│   ├── TaskService.cs
│   ├── IncidentService.cs
│   ├── ContactService.cs
│   ├── CallHistoryService.cs
│   └── NotificationService.cs
└── docs/
    └── CONTEXT.md                # This file
```

---

## 6. ABP PASSWORD HASH FORMAT

ABP Framework uses `AbpCryptoProvider` for hashing. The stored hash in `AbpUserLogins.ProviderKey` is base64 of:
```
PBKDF2 with salt + hashed password
```

For manual hash creation, use:
```csharp
// Using ABP's hashing algorithm
var hash = new AbpCryptoProvider().HashPassword(password);
// Store hash in AbpUserLogins.ProviderKey
// Store login provider as "Common" or "Username"
```

Alternatively, use this C# equivalent of ABP's password hashing:
```csharp
// ABP password hash format: salt:hash
// Salt: 16 bytes random
// Hash: PBKDF2-SHA256, 10000 iterations
```

---

## 7. RUNNING THE PROJECT

### Prerequisites
- .NET SDK 9.0+
- SQL Server reachable at `10.10.10.244`
- Database `its_share` exists

### Build & Run
```powershell
cd C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS-MOBILE-API
dotnet build
dotnet run
# API runs on https://localhost:5001 / http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Mobile Frontend
```powershell
cd C:\D\ETC\PROJECT\ITS_Mobile_VEC\ITS_Mobile_VEC
# Set env: VITE_API_BASE_URL=http://localhost:5000
# Or edit .env file
npm run dev
# Runs on http://localhost:5173
```

---

## 8. PRIORITY ORDER

1. **Connection string** → switch to its_share (BLOCKS everything)
2. **Admin user creation** → need working credentials for testing
3. **Auth password validation** → so login works securely
4. **ProfileController + FilesController** → missing entirely
5. **Expand IncidentsController** → only GET /api/incidents works
6. **Fix ContactsController param type** → mismatch with mobile
7. **Expand remaining controllers** → fill all missing endpoints
8. **Mobile frontend update** → point to real API

---

## 9. KEY DECISIONS & NOTES

- **No ABP NuGet packages**: The API connects to ABP DB directly, does NOT run ABP framework. This means:
  - Must manually implement ABP password hashing
  - Must manually parse ABP JWT if using ABP tokens
  - Can query AbpNotifications/AbpUserNotifications directly for notifications

- **Token format**: Current token is custom base64 hash, not standard JWT. Need to decide:
  - Option A: Switch to standard JWT (recommended)
  - Option B: Keep custom format, update mobile to parse it

- **File storage**: Decide where to store uploaded files:
  - Option A: Local disk (wwwroot/uploads)
  - Option B: Shared network path
  - Option C: Azure Blob / S3

- **Notifications**: ABP framework already has notification system. Consider using AbpNotifications table directly vs creating new table.

- **Push notifications**: `POST /api/notifications/push/register` — requires FCM/APNS setup. Can be placeholder initially.

- **Real-time stream**: `GET /api/notifications/stream` — use SignalR or Server-Sent Events (SSE).

---

## 10. NEXT STEPS FOR NEW SESSION

When a new session starts, read this file first to understand:
1. Project context (Section 1)
2. Database mapping (Section 2)
3. Current state audit (Section 3)
4. Implementation plan (Section 4)
5. Priority order (Section 8)

**Start with**: Phase 1 — Connection string + Auth fix.
