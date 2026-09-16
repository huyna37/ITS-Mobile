---
feature-id: ITSM-20260429-001
feature-name: Xac thuc va Lien lac (M1)
canonical-source: docs/intel/doc-brief.md
generated-at: 2026-04-29T00:00:00+07:00
scope:
  modules: [M1]
  features: [M1-F001, M1-F002, M1-F003, M1-F004, M1-F005]
  depends-on: []
metrics:
  features-in-scope: 5
  rules-applied: 12
  entities-scoped: 4
  screens-scoped: 4
  integrations: 2
  ambiguities-total: 3
  blocking-gaps: 2
  priority-distribution:
    P0: 3
    P1: 1
    P2: 1
    P3: 0
  complexity-estimate: M
  risk-score: 3
---

# Feature Brief: Xac thuc va Lien lac (M1)

## Scope

| Dimension | Value |
|---|---|
| Modules | M1 — Xac thuc va Lien lac |
| Feature IDs | M1-F001, M1-F002, M1-F003, M1-F004, M1-F005 |
| Rules applied | 12: BR-INTEL-001..010, BR-INTEL-027 (cross-cutting) |
| Entities | NguoiDung, PhienDangNhap, DanhBaNguoiDung, LichSuCuocGoi |
| Screens | 4: LoginView, CallsView, ProfileView, SOS_FAB |
| Integrations | 2: PBX SIP/VoIP, GSM native dialer |
| Depends-on features | none |

## Scope boundary

| Type | Items |
|---|---|
| IN scope | Login (dual credential), logout, VoIP calls via PBX, internal directory, call history, SOS GSM call, profile display |
| OUT scope | Password reset, account creation, SSO, conference calls, call recording, voicemail, force logout from admin, profile editing |
| Deferred | Camera/GPS integration (explicit: future scope) |

## Features in scope

### M1-F001: Dang nhap he thong

| Property | Value |
|---|---|
| Type | Auth |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NguoiDung, PhienDangNhap |
| Screens | LoginView |
| Workflow | Enter credentials → validate dual auth → create JWT session → persist |
| Applied rules | BR-INTEL-001, BR-INTEL-002, BR-INTEL-003 |
| Source | explicit: "Đăng nhập bằng: Tài khoản hệ thống Extension tổng đài PBX" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| tai_khoan | VARCHAR(50) | UNIQUE, NOT NULL | system account |
| extension_pbx | VARCHAR(10) | UNIQUE, NOT NULL | 4 numeric digits |
| mat_khau | VARCHAR(255) | NOT NULL | bcrypt hashed |
| session_token | VARCHAR(500) | UNIQUE | JWT |
| trang_thai_phien | ENUM('active','expired') | DEFAULT 'active' | |

**Validations:** required [tai_khoan, extension_pbx, mat_khau]; extension_pbx = 4 numeric digits; HTTPS enforced
**Reports/Exports:** none

---

### M1-F002: Dang xuat he thong

| Property | Value |
|---|---|
| Type | Auth |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | PhienDangNhap |
| Screens | ProfileView |
| Workflow | Tap logout → confirm → clear session → clear call history → redirect to login |
| Applied rules | BR-INTEL-004 |
| Source | explicit: "Đăng xuất" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| session_token | VARCHAR(500) | FK→PhienDangNhap | mark expired |
| logout_time | TIMESTAMP | NOT NULL | |

**Validations:** none
**Reports/Exports:** none

---

### M1-F003: Thuc hien cuoc goi noi bo (PBX)

| Property | Value |
|---|---|
| Type | Integration |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong, Nhan vien TMC |
| Entities | DanhBaNguoiDung, LichSuCuocGoi |
| Screens | CallsView |
| Workflow | Select contact → initiate SIP call → ringing → connected/missed → ended → log history |
| Applied rules | BR-INTEL-005, BR-INTEL-006, BR-INTEL-007 |
| Source | explicit: "Gọi nội bộ giữa các nhân viên Nhận cuộc gọi từ Trung tâm điều hành" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| extension_nguoi_goi | VARCHAR(10) | NOT NULL | from session |
| extension_nguoi_nhan | VARCHAR(10) | NOT NULL | must exist in directory |
| trang_thai_cuoc_goi | ENUM('ringing','connected','ended','missed') | NOT NULL | |
| online_status | BOOLEAN | DEFAULT false | from PBX presence |
| thoi_gian_goi | TIMESTAMP | NOT NULL | |
| thoi_luong | INT | nullable | seconds |

**Validations:** extension_nguoi_nhan must exist in directory
**Reports/Exports:** call history list view

---

### M1-F004: Goi khan cap SOS qua GSM

| Property | Value |
|---|---|
| Type | Integration |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | none (direct GSM dial) |
| Screens | SOS_FAB (always visible floating button) |
| Workflow | Tap SOS button → confirm dialog → initiate GSM `tel:` call → preconfigured hotline |
| Applied rules | BR-INTEL-008, BR-INTEL-009 |
| Source | explicit: "Nút gọi nhanh SOS Hotline Thực hiện cuộc gọi GSM trực tiếp Hoạt động khi không có internet" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| sos_hotline_number | VARCHAR(15) | config (not user input) | hardcoded or remote config |

**Validations:** must work without internet (GSM only); SOS button visible on ALL screens inside app
**Reports/Exports:** none

---

### M1-F005: Hien thi thong tin ca nhan

| Property | Value |
|---|---|
| Type | CRUD (read-only) |
| Priority | P2 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NguoiDung |
| Screens | ProfileView |
| Workflow | Read-only display from session/profile data |
| Applied rules | BR-INTEL-010 |
| Source | implied: §4.1 "Dữ liệu hiển thị: Tên nhân viên Đơn vị công tác Extension nội bộ" + wireframe ProfileView |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| ten_nhan_vien | VARCHAR(100) | from session | |
| chuc_vu | VARCHAR(50) | from session | |
| extension | VARCHAR(10) | from session | |
| don_vi | VARCHAR(100) | from session | |

**Validations:** none (read-only)
**Reports/Exports:** none

---

## Business Rules (scoped)

| ID | Rule | Type | Applies-to | Severity | Source |
|---|---|---|---|---|---|
| BR-INTEL-001 | Login requires BOTH system account AND PBX extension | Authorization | M1-F001 | High | explicit |
| BR-INTEL-002 | Session must persist across app restarts | State-transition | M1-F001 | Medium | explicit |
| BR-INTEL-003 | Auth must use HTTPS + token session | Authorization | M1-F001 | High | explicit |
| BR-INTEL-004 | Logout must clear local session, require fresh login | State-transition | M1-F002 | Medium | implied |
| BR-INTEL-005 | Internal calls use SIP/VoIP through PBX | Validation | M1-F003 | High | explicit |
| BR-INTEL-006 | Directory shows online/offline status per extension | Validation | M1-F003 | Medium | implied wireframe |
| BR-INTEL-007 | Call history must be recorded and viewable | State-transition | M1-F003 | Medium | explicit |
| BR-INTEL-008 | SOS call must work WITHOUT internet (GSM) | Validation | M1-F004 | High | explicit |
| BR-INTEL-009 | SOS button always visible on every screen inside app | Validation | M1-F004 | High | implied wireframe |
| BR-INTEL-010 | Profile displays read-only: name, unit, extension, role | Validation | M1-F005 | Low | explicit |
| BR-INTEL-027 | Must support iOS AND Android | Validation | M1-F001..005 | High | explicit |

## Entities + Relationships (scoped)

```yaml
entities:
  - name: NguoiDung
    key-fields: [id, tai_khoan, extension_pbx, ten_nhan_vien, don_vi, chuc_vu]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      tai_khoan: VARCHAR(50) UNIQUE
      extension_pbx: VARCHAR(10) UNIQUE
      mat_khau: VARCHAR(255)
      ten_nhan_vien: VARCHAR(100)
      don_vi: VARCHAR(100)
      chuc_vu: VARCHAR(50)

  - name: PhienDangNhap
    key-fields: [id, nguoi_dung_id, token, thoi_gian_tao, trang_thai]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      nguoi_dung_id: BIGINT FK→NguoiDung
      token: VARCHAR(500) UNIQUE
      thoi_gian_tao: TIMESTAMP
      thoi_gian_het_han: TIMESTAMP
      trang_thai: ENUM('active','expired')

  - name: DanhBaNguoiDung
    key-fields: [id, ten, extension, online_status]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      ten: VARCHAR(100)
      extension: VARCHAR(10) UNIQUE
      online_status: BOOLEAN DEFAULT false
      don_vi: VARCHAR(100)

  - name: LichSuCuocGoi
    key-fields: [id, extension_nguoi_goi, extension_nguoi_nhan, thoi_gian_goi, trang_thai_cuoc_goi]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      extension_nguoi_goi: VARCHAR(10)
      extension_nguoi_nhan: VARCHAR(10)
      ten_nguoi_goi: VARCHAR(100)
      thoi_gian_goi: TIMESTAMP
      thoi_luong: INT
      trang_thai_cuoc_goi: ENUM('ringing','connected','ended','missed')

relationships:
  - from: NguoiDung
    to: PhienDangNhap
    cardinality: "1:N"
    fk: PhienDangNhap.nguoi_dung_id

state-machines:
  - entity: PhienDangNhap
    states: [active, expired]
    transitions:
      - from: active
        to: expired
        trigger: logout or token expiry
        guard: authenticated user
```

## Screens (scoped)

| # | Screen | Type | Feature | Key fields | Actions | OCR src |
|---|---|---|---|---|---|---|
| 1 | Dang nhap | auth | M1-F001 | tai_khoan, extension_pbx, mat_khau | DANG NHAP | UI.jsx#LoginView |
| 2 | Lien lac PBX | list | M1-F003 | name, extension, online_status, call history | Goi (phone), Xem tat ca | UI.jsx#CallsView |
| 3 | Ca nhan | settings | M1-F002, M1-F005 | ten_nhan_vien, chuc_vu, extension, don_vi | Dang xuat he thong | UI.jsx#ProfileView |
| 4 | SOS FAB | modal-form | M1-F004 | sos_hotline_number | SOS call trigger | wireframe SOS_FAB |

## Integrations (touching scope)

| From | To | Direction | Protocol | Data | Confidence |
|---|---|---|---|---|---|
| Mobile App | PBX System | bidir | SIP/VoIP | Call signaling, extension auth, presence, call history | High |
| Mobile App | GSM Network | out | GSM native dialer (`tel:` scheme) | SOS number dial | High |

## NFRs Applicable

| Area | Requirement | Target | Source |
|---|---|---|---|
| Security | HTTPS + token session | Enforce everywhere | explicit |
| Offline | SOS call without internet | 100% GSM fallback | explicit |
| Platform | iOS + Android | Both required | explicit |
| UI | SOS button always visible | Global FAB | implied wireframe |
| Brand | Primary color #0097F0 | Apply to LoginView | explicit |

## Ambiguities (blocking `ba` to resolve upfront)

| ID | Severity | Question | Options | Impact-if-wrong |
|---|---|---|---|---|
| GAP-001 | Blocking | How does mobile app auth with PBX for VoIP? | A: Extension+password from login; B: Separate SIP credentials; C: Token-based SIP | Wrong auth = redesign VoIP integration |
| GAP-006 | Non-blocking | Call history — local only or synced from PBX? | A: Local device; B: Synced from PBX | Affects data model |

---

## § Agent Hints (Opus-precomputed)

### § for ba

| Hint | Value |
|---|---|
| Complexity class | Medium |
| Classify rationale | 5 features, 11 rules, PBX integration is high-risk unknown |
| Implicit user stories to infer | 3 — reconnect after dead zone, call priority when incident active, SOS confirmation UX |
| Compliance mappings | BR-INTEL-003 (HTTPS/token), iOS/Android permission requirements |
| Blocking clarifications to prepare | GAP-001 (SIP auth mechanism) — must resolve before M1-F003 spec |

**Inferred implicit stories:**
- As a field operator, I want my session to auto-restore when I reopen the app, so I don't re-login mid-patrol. [source: BR-INTEL-002]
- As a field operator, I want to see who is online in the directory before calling, so I avoid wasting time on unavailable colleagues. [source: BR-INTEL-006]
- As a field operator, I want the SOS button to be one-tap accessible even when I'm on a call, so I can escalate a safety emergency immediately. [source: BR-INTEL-008, BR-INTEL-009]

### § for sa

| Hint | Value |
|---|---|
| Recommended pattern | SIP.js or react-native-voip + JWT auth; separate SIP credentials from app login |
| Pattern rationale | PBX SIP registration needs keep-alive; mobile JWT is too short-lived for SIP registration |
| Anti-pattern risks | Don't reuse app JWT for SIP auth — SIP registration lifetime differs; NAT traversal on mobile requires ICE/STUN/TURN |
| Scalability bottleneck | Concurrent SIP registrations for 200 users — verify PBX capacity |
| Similar-system reference | Push-to-talk mobile field apps (Zello, motorola solutions) |

### § for tech-lead

| Feature | Complexity | Risk | Rationale | Parallel-safe with |
|---|---|---|---|---|
| M1-F001 | M | 2 | Dual credential is custom but straightforward JWT | none (must be first) |
| M1-F002 | S | 1 | Standard logout flow | after M1-F001 |
| M1-F003 | L | 5 | SIP/VoIP on mobile: NAT, codec, iOS CallKit/PushKit, Android foreground service | M2-F001 (independent) |
| M1-F004 | M | 2 | GSM dial via `tel:` scheme; iOS prompts user confirmation | after M1-F001 |
| M1-F005 | S | 1 | Read-only profile from session data | after M1-F001 |

**Tasks likely needed:**
- VoIP library spike (SIP.js vs react-native-sip evaluation) — 2-3 days BEFORE M1-F003 dev
- PBX vendor coordination for SIP test credentials + sandbox
- iOS CallKit + PushKit integration for background incoming calls
- Android foreground service for SIP keep-alive

### § for dev

| Hint | Value |
|---|---|
| Stack library (validated) | react-native-callkeep (CallKit/VoIP), react-native-voip-push-notification, @react-native-async-storage/async-storage |
| GSM SOS | Use `Linking.openURL('tel:XXXXXXX')` — iOS shows confirmation dialog (cannot bypass) |
| Session persistence | AsyncStorage for JWT; clear on logout (BR-INTEL-004) |
| SIP on iOS | Must use PushKit for incoming VoIP calls in background; register with APNs VoIP certificate |
| SIP on Android | Foreground service required for SIP registration keep-alive |
| Charset | utf8mb4 for all Vietnamese text fields |

### § for qa

| Hint | Value |
|---|---|
| Test ratios | unit 50 / integration 35 / e2e 15 |
| Critical edge cases | Login with wrong extension but correct account; SOS while VoIP active; incoming call while app backgrounded; session expiry during active use; call drop mid-incident |
| Performance SLA | Login < 2s; VoIP call setup < 5s |
| Test data | see docs/intel/test-data-hints.md |

### § for reviewer — Feature-specific DoD

```
[ ] All ACs from ba spec implemented and tested
[ ] BR-INTEL-001..010 + BR-INTEL-027 unit tests present
[ ] Session persistence tested across app restart
[ ] SOS call tested on physical device WITHOUT internet (airplane mode + GSM)
[ ] SOS FAB visible on all screens including task detail and call screens
[ ] VoIP tested on both iOS and Android physical devices
[ ] Login error messages in Vietnamese
[ ] Session token cleared on logout (call history cleared per security §13.7)
[ ] iOS permissions: microphone, phone call handled gracefully
[ ] Android permissions: phone, audio granted before SIP registration
[ ] SIP credentials NOT hardcoded in source (use secure config)
[ ] No English text leak in UI
[ ] README/CHANGELOG updated
```

### § for security

| Attack surface | Mitigation |
|---|---|
| Token theft | HTTPS everywhere + token expiry + refresh rotation |
| SIP credential exposure | Encrypt SIP credentials at rest (not in AsyncStorage plaintext) |
| Call history on device | Clear call history on logout (security hygiene) |
| Extension number enumeration | Protect directory endpoint — only accessible when authenticated |

---

## Agent Read Order (est. tokens)

| Agent | Sections | Est. tokens |
|---|---|---|
| ba | Scope, Scope boundary, Features, Rules, Ambiguities, §ba | ~3.5K |
| sa | Entities, Integrations, NFRs, §sa | ~2K |
| tech-lead | Features (Priority+Risk), §tech-lead | ~1.5K |
| dev (per task) | Feature subset, §dev | ~1K |
| qa | Rules, Screens, §qa | ~2K |
| reviewer | §reviewer DoD | ~0.5K |

## Canonical Reference
- Source of truth: `docs/intel/doc-brief.md`
- IF deep context needed → read canonical directly (§4 M1, §5 BR-INTEL-001..010, §7 screens, §8 integrations)
