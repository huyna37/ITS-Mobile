# Security Overview — ITS Mobile VEC

## Security Model Summary

ITS Mobile VEC sử dụng kiến trúc JWT + HTTPS với một role người dùng duy nhất (nhân viên hiện trường). Các mối quan tâm bảo mật chính là: xác thực SIP, session management trên thiết bị di động, và bảo vệ API call.

## Authentication & Authorization

### Login Mechanism
| Property | Value |
|---|---|
| Method | Dual credential: system account + PBX extension (4 digits) + password |
| Transport | HTTPS (enforced — BR-INTEL-003) |
| Session token | JWT Bearer |
| Storage | localStorage / AsyncStorage (device-local) |
| Session key | `its_session_v1` |

### RBAC Model
- **Mode:** rbac (role-based)
- **Roles:** 1 human role (`nhan-vien-hien-truong`) — toàn bộ app
- **System actors:** `its-backend`, `pbx-system` (không login vào app)
- **Server-side filter:** Task list chỉ trả về nhiệm vụ của người dùng hiện tại (BR-INTEL-011)

### Authorization Rules
| Rule | Enforcement | Severity |
|---|---|---|
| Task list: chỉ xem nhiệm vụ của mình | Server-side filter (BR-INTEL-011) | High |
| Status update: chỉ task được phân công | Server validates user-task assignment | High |
| No backward status transitions | Client + server validation | High |
| HTTPS everywhere | Transport enforcement (BR-INTEL-003) | High |
| Extension number enumeration prevention | Directory endpoint requires auth | Medium |

## Session Security

| Concern | Mitigation |
|---|---|
| Token theft | Short JWT TTL + refresh rotation (TBD by server config) |
| Session on device | AsyncStorage (encrypted by OS on iOS; need Android Keystore consideration) |
| Logout | Clear session token + call history from AsyncStorage (BR-INTEL-004) |
| Session restore | Auto-restore from AsyncStorage on app open (BR-INTEL-002) |

## VoIP / SIP Security

| Attack surface | Mitigation |
|---|---|
| SIP credential exposure | Encrypt SIP credentials at rest; NOT stored in AsyncStorage plaintext |
| SIP replay attacks | SIP nonce/digest auth (standard SIP security) |
| Extension enumeration | Directory only accessible when authenticated |

**Open:** GAP-001 — SIP auth mechanism (separate SIP credentials vs JWT reuse) must be resolved before M1-F003 development.

## Data Security

| Attack surface | Mitigation |
|---|---|
| Unauthorized task status update | Server validates user is assigned to task before accepting status change |
| Mass task access via client params | Server enforces per-user filter — client cannot bypass |
| Photo EXIF data | Decision required: strip EXIF or preserve (document intentionally) |
| Field notes injection | Validate/sanitize `ghi_chu_hien_truong` input on server |
| Notification IDOR | Server validates user is authorized to view linked task (nhiem_vu_id) before returning |
| Notification spoofing | Validate FCM/APNs sender identity server-side |
| Push payload exposure | No sensitive data in FCM payload — use data message + server fetch pattern |

## Platform Security

| Platform | Requirement |
|---|---|
| iOS | Microphone permission + Phone permission handled at OS level; CallKit/PushKit for VoIP |
| Android | CALL_PHONE permission + RECORD_AUDIO; FCM foreground service |
| Both | No API credentials hardcoded in source; use secure config (environment variables / secrets manager) |
| Both | SIP credentials NOT in AsyncStorage plaintext; use EncryptedStorage or Android Keystore |

## NFRs (Security-relevant)

| NFR | Target | Source |
|---|---|---|
| HTTPS everywhere | All API calls | BR-INTEL-003 |
| SOS works offline | GSM only, no internet required | BR-INTEL-008 |
| Session cleared on logout | Call history + JWT removed | BR-INTEL-004 |
| No credentials in source | Secrets via env vars / config | Best practice |
| iOS/Android both | Security model must hold on both | BR-INTEL-027 |

## Security Checklist (Production)

```
[ ] JWT TTL configured + refresh rotation implemented
[ ] SIP credentials encrypted at rest (EncryptedStorage)
[ ] Server validates user-task ownership on status update
[ ] Directory endpoint requires authentication
[ ] FCM/APNs sender validated server-side
[ ] HTTPS certificate pinning (optional — if high-security env)
[ ] Session cleared completely on logout (token + call history)
[ ] No hardcoded API keys, SIP credentials, or tokens in source
[ ] Android Keystore for sensitive key storage
[ ] iOS Keychain for sensitive credential storage
[ ] EXIF stripping policy decided for field photos
[ ] ghi_chu_hien_truong input sanitized server-side
```

## Attack Surface Summary

| Surface | Risk Level | Status |
|---|---|---|
| Auth endpoint | Medium | JWT + HTTPS planned |
| ITS API (task data) | Medium | User filter enforcement required |
| SIP VoIP | High | GAP-001 unresolved |
| Photo upload | Low | File type validation required |
| Push notifications | Low | Standard FCM/APNs security |
| SOS call | Low | Native OS — no app attack surface |
