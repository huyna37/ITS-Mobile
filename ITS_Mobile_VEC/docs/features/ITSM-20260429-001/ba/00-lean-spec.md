---
feature-id: ITSM-20260429-001
document: lean-spec
output-mode: lean
last-updated: 2026-04-30
---

# BA Lean Spec: Xac thuc va Lien lac (M1)

## Summary

Field operators need a secure, offline-capable mobile app to log in with dual credentials (system account + PBX extension), make internal VoIP calls through a PBX, and trigger GSM SOS emergency calls without internet. This module delivers authentication, session management, internal communication via SIP/VoIP, emergency SOS via GSM, and read-only profile display. Success is measured by: login < 2 s, VoIP setup < 5 s, SOS reachable at 100 % without internet, running on both iOS and Android.

---

## Scope

| | Items |
|---|---|
| In scope | Dual-credential login (account + extension + password), JWT session persistence, logout + session clear, internal VoIP calls via PBX SIP, contact directory with online/offline status, call history (local), GSM SOS one-tap (no internet), read-only profile display |
| Out of scope | Password reset, account creation, SSO, conference calls, call recording, voicemail, force-logout from admin console, profile editing, camera/GPS integration |
| Assumptions | GAP-001: SIP auth uses extension + password from login credentials (Option A) — flagged TBD, SA must validate. GAP-006: Call history stored locally on device only (no PBX sync). |

---

## User Stories

| US-ID | Actor | Goal | Value | Priority | Feature |
|---|---|---|---|---|---|
| US-001 | Nhan vien van hanh hien truong | Log in with system account + PBX extension + password | Access app securely with dual-factor identity | P0 | M1-F001 |
| US-002 | Nhan vien van hanh hien truong | Have session auto-restore when reopening app | Avoid re-login mid-patrol or after dead-zone reconnect | P0 | M1-F001 (implicit) |
| US-003 | Nhan vien van hanh hien truong | Log out and clear session + call history | Secure account before handing over device | P1 | M1-F002 |
| US-004 | Nhan vien van hanh / Nhan vien TMC | Initiate and receive VoIP calls via PBX internal directory | Communicate in real time during field operations | P0 | M1-F003 |
| US-005 | Nhan vien van hanh hien truong | See online/offline status of each contact before calling | Avoid wasting time calling unavailable colleagues | P0 | M1-F003 (implicit) |
| US-006 | Nhan vien van hanh hien truong | View call history for recent calls | Track communications during an incident | P0 | M1-F003 |
| US-007 | Nhan vien van hanh hien truong | Tap SOS button to call GSM emergency hotline without internet | Get emergency help even in no-coverage/no-data zones | P0 | M1-F004 |
| US-008 | Nhan vien van hanh hien truong | Access SOS button with one tap even while on a VoIP call | Escalate a safety emergency without ending active call first | P0 | M1-F004 (implicit) |
| US-009 | Nhan vien van hanh hien truong | View personal profile (name, unit, extension, role) read-only | Verify own account details displayed in app | P2 | M1-F005 |

---

## Acceptance Criteria

| AC-ID | US-ref | Scenario | Given / When / Then | Constraints / Notes |
|---|---|---|---|---|
| AC-001.1 | US-001 | Login success — valid dual credentials | Given valid tai_khoan + 4-digit extension_pbx + mat_khau; When user taps DANG NHAP; Then JWT session created, user lands on CallsView within 2 s | **P0** |
| AC-001.2 | US-001 | Login fail — missing or invalid field | Given any required field blank OR extension not exactly 4 digits; When user taps DANG NHAP; Then inline error in Vietnamese shown, no session created | — |
| AC-001.3 | US-001 | HTTPS enforced | Given any login attempt; When credentials transmitted; Then transport must be HTTPS (TLS 1.2+), plaintext rejected | BR-INTEL-003 |
| AC-002.1 | US-002 | Session persists across app kill / reopen | Given active session exists in AsyncStorage; When app is killed and reopened; Then user is directed to CallsView without re-login prompt | **P0**; BR-INTEL-002 |
| AC-002.2 | US-002 | Expired session redirects to login | Given session token is expired; When app reopens; Then user is redirected to LoginView; session cleared from storage | — |
| AC-003.1 | US-003 | Logout clears session and call history | Given authenticated user on ProfileView; When user taps "Dang xuat he thong" and confirms; Then JWT invalidated locally, call history cleared, redirected to LoginView | **P0**; BR-INTEL-004 |
| AC-003.2 | US-003 | Back navigation blocked after logout | Given logout completed; When user presses device Back; Then remains on LoginView; no protected screen accessible without re-login | — |
| AC-004.1 | US-004 | Initiate SIP call from directory | Given authenticated user on CallsView; When user taps phone icon on a contact; Then SIP call initiated to that extension via PBX; state transitions: ringing → connected → ended | **P0**; BR-INTEL-005; GAP-001 assumption applies |
| AC-004.2 | US-004 | Call state: missed | Given outgoing call in ringing state; When callee does not answer within PBX timeout; Then call state recorded as "missed" in history | — |
| AC-004.3 | US-004 | SIP auth (GAP-001 assumed Option A) | Given user logs in with extension + password; When SIP registration occurs; Then extension + password reused for SIP authentication with PBX **[TBD — SA must validate]** | Non-blocking assumption |
| AC-005.1 | US-005 | Directory shows online/offline per extension | Given authenticated user on CallsView; When directory loads; Then each contact entry shows online (green) or offline (grey) based on PBX presence data | **P0**; BR-INTEL-006 |
| AC-006.1 | US-006 | Call logged in history after completion | Given any call (connected or missed); When call ends; Then entry added to local call history list (extension, name, time, duration, status) | **P0**; BR-INTEL-007; GAP-006: local storage only |
| AC-006.2 | US-006 | Call history cleared on logout | Given call history exists; When logout completes; Then call history list is empty (cleared from local storage) | Security hygiene |
| AC-007.1 | US-007 | SOS tap → confirm → GSM dial | Given user is anywhere inside app with SOS FAB visible; When user taps SOS; Then confirmation dialog shown (Vietnamese text); When confirmed, native GSM dialer opened with preconfigured hotline via tel: scheme | **P0**; BR-INTEL-008 |
| AC-007.2 | US-007 | SOS works without internet (airplane mode + GSM) | Given device in airplane mode with GSM enabled; When SOS called; Then GSM call connects to hotline; no internet required | **P0**; BR-INTEL-008 |
| AC-008.1 | US-008 | SOS FAB visible on all screens including active VoIP call | Given user is on any screen: CallsView, ProfileView, LoginView (post-auth), active call overlay; Then SOS FAB is rendered and tappable at all times | **P0**; BR-INTEL-009 |
| AC-009.1 | US-009 | Profile displays correct read-only data | Given authenticated user on ProfileView; When profile loads; Then ten_nhan_vien, chuc_vu, extension, don_vi shown from session; all fields non-editable | BR-INTEL-010 |

---

## Business Rules (cross-check)

| BR-ID | Rule summary | AC-ref | Status |
|---|---|---|---|
| BR-INTEL-001 | Login requires BOTH system account AND PBX extension | AC-001.1, AC-001.2 | ✓ Covered |
| BR-INTEL-002 | Session persists across app restarts | AC-002.1, AC-002.2 | ✓ Covered |
| BR-INTEL-003 | Auth must use HTTPS + token session | AC-001.3 | ✓ Covered |
| BR-INTEL-004 | Logout must clear local session, require fresh login | AC-003.1, AC-003.2 | ✓ Covered |
| BR-INTEL-005 | Internal calls use SIP/VoIP through PBX | AC-004.1, AC-004.3 | ✓ Covered (GAP-001 assumed) |
| BR-INTEL-006 | Directory shows online/offline status per extension | AC-005.1 | ✓ Covered |
| BR-INTEL-007 | Call history recorded and viewable | AC-006.1 | ✓ Covered |
| BR-INTEL-008 | SOS call works WITHOUT internet (GSM) | AC-007.1, AC-007.2 | ✓ Covered |
| BR-INTEL-009 | SOS button always visible on every screen | AC-008.1 | ✓ Covered |
| BR-INTEL-010 | Profile shows read-only: name, unit, extension, role | AC-009.1 | ✓ Covered |
| BR-INTEL-027 | Must support iOS AND Android | NFR — Platform row | ✓ Covered |

---

## Data Model (lean)

| Entity | Key fields | Notes |
|---|---|---|
| NguoiDung | id PK, tai_khoan UNIQUE, extension_pbx UNIQUE (4-digit), mat_khau (bcrypt), ten_nhan_vien, don_vi, chuc_vu | Source of auth identity |
| PhienDangNhap | id PK, nguoi_dung_id FK, token UNIQUE (JWT, VARCHAR 500), thoi_gian_tao, thoi_gian_het_han, trang_thai ENUM(active/expired) | States: active → expired (logout or expiry) |
| DanhBaNguoiDung | id PK, ten, extension UNIQUE, online_status BOOLEAN, don_vi | online_status sourced from PBX presence; read from PBX, not owned by app DB |
| LichSuCuocGoi | id PK, extension_nguoi_goi, extension_nguoi_nhan, ten_nguoi_goi, thoi_gian_goi, thoi_luong (nullable INT seconds), trang_thai_cuoc_goi ENUM(ringing/connected/ended/missed) | **Local storage only** (GAP-006 assumed); cleared on logout |

**BA-discovered gap:** `LichSuCuocGoi` needs `ten_nguoi_nhan` field (symmetry with `ten_nguoi_goi`) for display in call history list. SA to confirm.

---

## GAP Analysis

| GAP-ID | Severity | Description | Assumption adopted | Owner |
|---|---|---|---|---|
| GAP-001 | Non-blocking (pipeline proceeds) | SIP auth mechanism unknown: does app use login credentials for SIP registration, or separate SIP credentials, or token-based? | **Option A assumed:** extension + password from login credentials reused for SIP auth with PBX. Flagged **[TBD]** in AC-004.3. | SA must validate; anti-pattern risk noted in §sa hints |
| GAP-006 | Non-blocking | Call history scope: local device only vs. synced from PBX? | **Local-only assumed:** simpler, avoids PBX history API dependency. SA may upgrade to PBX-synced if operational requirement emerges. | SA confirm |
| GAP-NEW-001 | Non-blocking | `LichSuCuocGoi` entity missing `ten_nguoi_nhan` field for call history display | Add field to entity model | SA/dev confirm |

---

## Out-of-scope (confirmed)

| Item | Reason |
|---|---|
| Password reset | Explicit exclusion; separate admin flow |
| Account creation / SSO | Not in MVP; requires identity provider |
| Conference calls, call recording, voicemail | Explicit exclusion from M1 |
| Force-logout from admin console | Admin module — different domain |
| Profile editing | Read-only per BR-INTEL-010 |
| Camera / GPS integration | Deferred to future scope (explicit in source) |
| Call history sync from PBX | Deferred per GAP-006 assumption |

---

## NFR Checklist

| Area | Requirement | Target | Source |
|---|---|---|---|
| Performance | Login response time | < 2 s | §qa hints |
| Performance | VoIP call setup time | < 5 s | §qa hints |
| Security | HTTPS (TLS 1.2+) enforced on all API calls | 100 % | BR-INTEL-003 |
| Security | JWT cleared on logout; SIP credentials NOT in AsyncStorage plaintext | Mandatory | §security hints |
| Security | Directory endpoint accessible only when authenticated | Mandatory | §security hints |
| Reliability | SOS GSM call works without internet (airplane mode + GSM) | 100 % | BR-INTEL-008 |
| Reliability | Session auto-restore after app kill/reconnect | 100 % (within token TTL) | BR-INTEL-002 |
| Reliability | SOS FAB rendered and tappable on every screen | 100 % | BR-INTEL-009 |
| Audit / Logging | All call events (initiated, missed, ended) logged in local call history | Per-call | BR-INTEL-007 |
| Operability | iOS + Android both supported | Both required | BR-INTEL-027 |
| Operability | UI primary color #0097F0 applied; all UI text in Vietnamese | All screens | explicit brand spec |

---

## Pipeline Triage

| Question | Answer | Rationale |
|---|---|---|
| Domain model affected? (new aggregates/events/BCs?) | No | All entities (NguoiDung, PhienDangNhap, DanhBaNguoiDung, LichSuCuocGoi) pre-defined; state machine for PhienDangNhap already modeled; no new bounded contexts |
| Architecture affected? (new service boundaries, integrations, NFRs?) | **Yes** | PBX SIP/VoIP integration is new external system boundary; GSM dialer via `tel:` scheme is second integration; GAP-001 SIP auth mechanism unresolved; iOS CallKit / PushKit + Android foreground service = architectural decisions |
| Implementation clear from existing architecture? | No | SIP library choice, SIP credential flow (GAP-001), NAT traversal, PushKit/CallKit integration — all require SA decisions |
| **Verdict** | `Ready for solution architecture` | Q1=No, Q2=Yes → SA required; Phase 2 (domain analysis) not needed |

---

## BA → Handoff Summary

**Verdict:** Ready for solution architecture
**Phases completed:** BA only (Phase 2 domain analysis skipped — no new bounded contexts)
**Triage rationale:** All entities are pre-modeled; however, PBX SIP/VoIP integration introduces new external boundaries and unresolved auth mechanism (GAP-001) requiring SA-level architectural decisions before tech-lead can plan.
**Business goal:** Enable field operators to securely authenticate, make internal VoIP calls, and trigger offline-capable SOS emergency calls on a single mobile app (iOS + Android).
**Scope in:**
- Dual-credential login (account + extension + password) with JWT session
- Session persistence across app restarts
- Logout with full session + call history clear
- Internal VoIP calls via PBX SIP with directory + online status
- GSM SOS emergency call (offline-capable, one-tap FAB on all screens)
- Read-only personal profile display

**Key business rules:** BR-INTEL-001 (dual-auth mandatory), BR-INTEL-003 (HTTPS/JWT), BR-INTEL-008+009 (SOS offline + always visible), BR-INTEL-004 (logout clears everything)
**Actors:** Nhan vien van hanh hien truong (primary), Nhan vien TMC (receives calls)
**UI/UX impact:** Yes — designer required (4 screens: LoginView, CallsView, ProfileView, SOS_FAB; SOS FAB z-index/overlay design decision affects all screens)
**Screen types:** LoginView (auth form), CallsView (contact list + call history), ProfileView (settings + profile), SOS_FAB (floating action button overlay, global)
**Open items (non-blocking):** GAP-001 (SIP auth Option A assumed — SA validates), GAP-006 (local call history assumed — SA confirms), GAP-NEW-001 (ten_nguoi_nhan field missing)

---

```json
{
  "agent": "ba",
  "stage": "ba",
  "verdict": "Ready for solution architecture",
  "next_owner": "sa",
  "designer_required": true,
  "phases_completed": ["ba"],
  "risk_score": 3,
  "risk_level": "medium",
  "missing_artifacts": [],
  "blockers": [],
  "gaps_resolved": ["GAP-001-assumed", "GAP-006-assumed"],
  "gaps_blocking": [],
  "user_stories_count": 9,
  "acs_count": 17,
  "evidence_refs": ["docs/features/ITSM-20260429-001/ba/"],
  "token_usage": {
    "input": "~5000",
    "output": "~3500",
    "this_agent": "~8500",
    "pipeline_total": "~8500"
  },
  "notes": "GAP-001 assumed Option A (extension+password reused for SIP auth) — SA must validate; anti-pattern risk noted in §sa hints. GAP-006 assumed local-only call history. New gap GAP-NEW-001: LichSuCuocGoi missing ten_nguoi_nhan field. Designer required: 4 screens with SOS FAB overlay affecting all views."
}
```
