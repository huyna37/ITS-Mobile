# Systems Analysis: ITS Mobile Full Stack (M-001)

## 1. System Architecture

### 1.1 Layered Architecture (3-tier)

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React 18 + Vite + TailwindCSS)               │
│  src/                                                     │
│    ├── App.jsx (UI components)                           │
│    ├── api/ (11 modular client modules)                  │
│    ├── components/ (UI fragments)                        │
│    └── hooks/ (custom hooks)                             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (.NET 9 Web API + EF Core)                     │
│  Controllers/                                            │
│    ├── AuthController    → AuthService                  │
│    ├── TasksController   → TaskService                  │
│    ├── IncidentsController → IncidentService            │
│    ├── ContactsController → ContactService              │
│    ├── CallsController   → CallHistoryService           │
│    ├── NotificationsController → NotificationService   │
│    ├── FilesController (NEW) → FileService (NEW)        │
│    └── ProfileController (NEW) → ProfileService (NEW)  │
│  Services/                                               │
│  Models/                                                 │
│    ├── DTOs (Dto.cs, Entity models)                     │
│    └── Entities (AbpUser.cs, TaskOfIncident.cs, etc.)   │
│  Data/                                                   │
│    └── ItsDbContext.cs                                  │
└────────────────────────┬────────────────────────────────┘
                         │ EF Core (ADO.NET)
                         ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE (SQL Server — ITS_PRODUCT_STAGING)             │
│  dbo.AbpUsers, AbpRoles, AbpUserLogins, AbpUserRoles    │
│  dbo.TaskOfIncidents, IncidentProfiles, IncidentLogs    │
│  dbo.EventInfos, AbpNotifications, AbpUserNotifications │
│  dbo.CallHistories, Extensions, IpPhones                │
│  dbo.FilesOfIncidents, WorkerInfos, WorkerTaskIncidents │
│  dbo.AsteriskCDRs                                       │
└─────────────────────────────────────────────────────────┘
```

### 1.2 New Controllers to Add

| Controller | Route Prefix | Purpose | Depends On |
|---|---|---|---|
| FilesController | `/api/files` | Upload/download/delete files | FileService, ItsDbContext |
| ProfileController | `/api/profile` | Profile CRUD, avatar, preferences, activity log | ProfileService, AuthService |

## 2. API Contract Definitions

### 2.1 JWT Authentication

**Auth Configuration (`Program.cs`):**
```
AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
      ValidateIssuer = false,
      ValidateAudience = false,
      ClockSkew = TimeSpan.Zero
    }
  })
```

**JWT Token Generation:** Replace SHA256 hash-based token with `System.IdentityModel.Tokens.Jwt`

### 2.2 Auth Endpoints (Full List)

| Method | Endpoint | Auth Required | Request Body | Response | Notes |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | No | `{username, password, extension}` | `{token, tenNhanVien, chucVu, donVi, extension, username}` | Validate password via ABP PasswordHasher |
| GET | `/api/auth/profile` | Yes (Bearer) | — | `{tenNhanVien, chucVu, donVi, extension, username}` | Extract user from JWT claims |
| POST | `/api/auth/logout` | Yes (Bearer) | — | `{success: true}` | Invalidate token / clear session |
| POST | `/api/auth/change-password` | Yes (Bearer) | `{currentPassword, newPassword}` | `{success: true}` | Validate current password first |
| POST | `/api/auth/refresh` | No | `{refreshToken}` | `{token, refreshToken, expiresIn}` | NEW — refresh expired tokens |
| GET | `/api/auth/me` | Yes (Bearer) | — | `{tenNhanVien, chucVu, donVi, extension, username, avatarUrl}` | NEW — get current user info |
| POST | `/api/auth/forgot-password` | No | `{username}` | `{success: true}` | OPTIONAL — not needed for V1 |
| POST | `/api/auth/verify-otp` | No | `{username, otp}` | `{success: true, resetToken}` | OPTIONAL — not needed for V1 |
| POST | `/api/auth/reset-password` | No | `{resetToken, newPassword}` | `{success: true}` | OPTIONAL — not needed for V1 |

### 2.3 Incidents Endpoints (Full List)

| Method | Endpoint | Auth Required | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/incidents` | Yes | — | `IncidentResponse[]` | List recent incidents |
| GET | `/api/incidents/{id}` | Yes | — | `IncidentDetailResponse` | NEW — detail with timeline |
| PATCH | `/api/incidents/{id}` | Yes | `{status, notes}` | `{success: true}` | NEW — update incident |
| GET | `/api/incidents/{id}/timeline` | Yes | — | `StatusLogEntry[]` | NEW — status change history |
| POST | `/api/incidents/{id}/notes` | Yes | `{text}` | `{id, incidentId, text, createdAt}` | OPTIONAL |

**IncidentDetailResponse:**
```csharp
public record IncidentDetailResponse(
    string Id, string Kind, string Title, string Location, string Time,
    string Tag, string Description, string Script,
    int Level, string Direction,
    List<StatusLogEntry> StatusLog
);
```

### 2.4 Notifications Endpoints (Full List)

| Method | Endpoint | Auth Required | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/notifications` | Yes | — | `NotificationResponse[]` | List notifications |
| GET | `/api/notifications/unread-count` | Yes | — | `{count}` | NEW |
| PATCH | `/api/notifications/{id}/read` | Yes | — | `{success: true}` | NEW |
| PATCH | `/api/notifications/{id}/unread` | Yes | — | `{success: true}` | NEW |
| PATCH | `/api/notifications/read-all` | Yes | — | `{success: true}` | NEW |
| DELETE | `/api/notifications/{id}` | Yes | — | `{success: true}` | NEW |
| POST | `/api/notifications/push/register` | Yes | `{token, platform}` | `{success: true}` | NEW |
| POST | `/api/notifications/push/unregister` | Yes | `{token}` | `{success: true}` | NEW |

**Note:** SSE stream (`/api/notifications/stream`), settings endpoints, and notification categories are deferred to Phase 2 (low priority / not critical for MVP).

### 2.5 Calls Endpoints (Full List)

| Method | Endpoint | Auth Required | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/calls/history` | Yes | — | `CallHistoryResponse[]` | List call history |
| POST | `/api/calls/history` | Yes | `{extension, name, duration?, status}` | `CallHistoryResponse` | NEW — record new call |
| POST | `/api/calls/{id}/end` | Yes | `{duration}` | `{success: true, id}` | NEW — end call recording |
| DELETE | `/api/calls/history/{id}` | Yes | — | `{success: true}` | NEW — delete call record |

**Note:** Missed calls filter, stats, and clear-all are deferred (read from existing `CallHistories.Status` field).

### 2.6 Files Endpoints (Full List)

| Method | Endpoint | Auth Required | Request Body | Response | Notes |
|---|---|---|---|---|---|
| POST | `/api/files/upload` | Yes | multipart: `file`, `incidentId?` | `{id, url, name, size, type}` | NEW — upload single file |
| POST | `/api/files/upload-multiple` | Yes | multipart: `files[]`, `incidentId?` | `{id[], url[], name[], size[], type[]}` | NEW — upload multiple |
| DELETE | `/api/files/{id}` | Yes | — | `{success: true}` | NEW — delete file |
| GET | `/api/files/{id}/download` | Yes | — | binary stream | NEW — download file |
| GET | `/api/files/{id}` | Yes | — | `{id, name, size, type, uploadedAt}` | NEW — metadata |

### 2.7 Profile Endpoints (Full List)

| Method | Endpoint | Auth Required | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/profile` | Yes (Bearer) | — | `{tenNhanVien, chucVu, donVi, extension, username}` | NEW — replaces `/api/auth/profile` |
| PATCH | `/api/profile` | Yes (Bearer) | `{tenNhanVien?, chucVu?, donVi?}` | `{success: true}` | NEW — update profile |
| GET | `/api/profile/preferences` | Yes (Bearer) | — | `{language, theme, map_style}` | NEW |
| PATCH | `/api/profile/preferences` | Yes (Bearer) | `{language?, theme?, map_style?}` | `{success: true}` | NEW |
| POST | `/api/profile/avatar` | Yes (Bearer) | multipart: `avatar` | `{avatarUrl}` | OPTIONAL — deferred |
| DELETE | `/api/profile/avatar` | Yes (Bearer) | — | `{success: true}` | OPTIONAL — deferred |

## 3. Data Models

### 3.1 FilesOfIncidents Entity (existing, needs mapping)

```csharp
// Expected structure based on DbSet usage
public class FilesOfIncident
{
    public long Id { get; set; }
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public string FileType { get; set; }
    public long FileSize { get; set; }
    public long? IncidentProfileId { get; set; }
    public long? TaskId { get; set; }
    public DateTime CreationTime { get; set; }
    public bool IsDeleted { get; set; }
}
```

### 3.2 AbpUserNotifications for notifications

Used for unread tracking. The `State` field determines read/unread status.

### 3.3 New DTOs Required

```csharp
// Incident
public record IncidentDetailResponse(string Id, string Kind, string Title, string Location, 
    string Time, string Tag, string Description, string Script, int Level, string Direction, 
    List<StatusLogEntry> StatusLog);

// Notifications
public record UnreadCountResponse(int Count);
public record PushTokenRequest(string Token, string Platform);

// Profile
public record UpdateProfileRequest(string TenNhanVien, string ChucVu, string DonVi);
public record PreferencesResponse(string Language, string Theme, string MapStyle);
public record UpdatePreferencesRequest(string Language, string Theme, string MapStyle);

// Calls
public record RecordCallRequest(string Extension, string Name, int? Duration, int Status);

// Files
public record FileResponse(string Id, string Url, string Name, long Size, string Type);
```

## 4. Service Layer Design

### 4.1 AuthService (Enhanced)

```
AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options => { ... })

[Authorize] on all protected endpoints except /login

Login: Validate password using AbpSecurityStampValidator or PasswordHasher.VerifyHashedPassword
GenerateToken: Use System.IdentityModel.Tokens.Jwt.JwtSecurityToken
```

### 4.2 IncidentService (Enhanced)

```
GetIncidentDetail(id): 
  - Query IncidentProfile + TaskOfIncident + IncidentLogs
  - Return IncidentDetailResponse

UpdateIncident(id, status, notes):
  - Validate status transition (0→1→2→3)
  - Update TaskOfIncident.Status
  - Add IncidentLog entry

GetTimeline(id):
  - Return IncidentLogs ordered by CreationTime DESC
  - Prepend system dispatch entry
```

### 4.3 NotificationService (Enhanced)

```
GetUnreadCount(username):
  - Query AbpUserNotifications where UserId matches and State = 0 (Unread)
  - Return count

MarkRead(id, username):
  - Find notification by ID + UserId
  - Update State = 1 (Read)

MarkUnread(id, username):
  - Update State = 0 (Unread)

MarkAllRead(username):
  - Update all notifications for user where State = 0

DeleteNotification(id, username):
  - Delete or soft-delete AbpUserNotification

RegisterPushToken(username, token, platform):
  - Store in AbpUserNotifications or create dedicated entity
```

### 4.4 CallHistoryService (Enhanced)

```
RecordCall(request):
  - Create new CallHistory entry with Status = Ringing or Connecting
  - Return CallHistoryResponse

EndCall(callId, duration):
  - Update CallHistory.Status = 2 (Completed), Duration = request.duration
  - Return success

DeleteCallRecord(callId):
  - Delete or soft-delete CallHistory entry
```

### 4.5 FileService (NEW)

```
UploadFile(file, incidentId, username):
  - Validate file type (image/*, video/*, application/pdf)
  - Validate file size (max 10MB)
  - Save to disk: /uploads/{username}/{yyyyMMdd}/{guid}.{ext}
  - Persist metadata to FilesOfIncidents
  - Return FileResponse with URL

DownloadFile(fileId, username):
  - Validate ownership (file belongs to user or shared incident)
  - Stream file from disk
  - Set Content-Disposition: attachment

DeleteFile(fileId, username):
  - Validate ownership
  - Delete physical file
  - Delete database record
```

### 4.6 ProfileService (NEW)

```
GetProfile(username):
  - Query AbpUsers + WorkerInfos
  - Return ProfileResponse

UpdateProfile(request, username):
  - Update AbpUsers.Name, AbpUsers.Surname (for name change)
  - Store custom fields in AbpUserCustomClaims or metadata

GetPreferences(username):
  - Read from stored preferences (AbpUserCustomClaims or dedicated table)
  - Return defaults if not set

UpdatePreferences(request, username):
  - Persist to AbpUserCustomClaims or dedicated table
```

## 5. Frontend Integration Plan

### 5.1 App.jsx Refactoring Priority

1. **Replace inline `apiFetch`** → import from `src/api/client.js`
2. **Replace hardcoded mock data** → call real API modules from `src/api/`
3. **Update API calls** → match endpoint contracts defined in Section 2
4. **Handle auth token** → store JWT in localStorage/sessionStorage, attach to requests via `client.js` interceptor

### 5.2 API Client Configuration

```javascript
// src/api/client.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Interceptor: attach Authorization header from stored token
```

### 5.3 `.env` Update

```
VITE_API_BASE_URL=http://localhost:5000  # Backend API
```

### 5.4 `tryApiOrMock` Pattern — Deprecation Strategy

Current frontend uses `tryApiOrMock()` in all API modules — falls back to mock if API unavailable. 

**Migration path:**
1. Phase 1: Keep `tryApiOrMock` for backward compatibility
2. Phase 2: After backend running, set `USE_MOCK=false` in env
3. Phase 3: Remove mock fallbacks entirely

## 6. Cross-Cutting Concerns

### 6.1 JWT Auth Middleware

**Required changes to `Program.cs`:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtKey"]!)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// Use BEFORE UseAuthorization
app.UseAuthentication();
app.UseAuthorization();
```

**Protect endpoints with `[Authorize]` attribute** on controllers/actions that require auth.

### 6.2 Global Exception Handler

```csharp
app.UseExceptionHandler("/error");  // or UseMiddleware<ExceptionHandlerMiddleware>()
```

### 6.3 CORS

Current CORS policy (`AllowMobile`) allows `http://localhost:5173` (Vite default). Update to include mobile app origins when deployed.

### 6.4 File Upload Limits

```csharp
builder.Services.Configure<IISServerOptions>(options => { ... });
app.UseStaticFiles();
// Configure max request body size for multipart uploads
builder.Services.Configure<FormOptions>(options => {
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});
```

## 7. Implementation Phases

### Phase 1 (Critical — F-001)
- JWT middleware in `Program.cs`
- `[Authorize]` on protected endpoints
- Login: proper password validation via ABP
- Logout: validate token
- Change-password: validate current password
- `/api/auth/me` endpoint

### Phase 2 (High — F-002, F-004 partial)
- Incidents: GET/{id}, PATCH/{id}, timeline
- Notifications: read/unread/mark-all/delete/push-token
- Frontend integration: App.jsx → modular API client

### Phase 3 (Medium — F-003, F-005)
- Calls: POST /history, endCall, delete
- Files: Upload/download/delete with FileService

### Phase 4 (Low — F-004 full, F-006)
- Notifications: settings endpoints (deferred)
- Profile: GET/PATCH profile, preferences
- Frontend: profile tab real data

## 8. Sign-Off

- **Analyst:** SA Agent (ETC AI)
- **Date:** 2026-05-28
- **Status:** Ready for Design/Tech-Lead review
