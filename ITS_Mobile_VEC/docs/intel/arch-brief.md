---
producer: from-code
produced_at: 2026-04-30
confidence: high
source:
  - src/App.jsx
  - docs/intel/doc-brief.md
  - docs/features/ITSM-20260429-001..003/feature-brief.md
---

# Architecture Brief — ITS Mobile VEC

## System Overview

Ứng dụng di động **ITS Mobile VEC** là công cụ tác nghiệp thực địa cho nhân viên vận hành tuyến đường cao tốc Nội Bài – Lào Cai (VEC). Hệ thống cho phép nhân viên hiện trường nhận nhiệm vụ xử lý sự cố từ Trung tâm điều hành (TMC), thực hiện liên lạc nội bộ qua tổng đài PBX VoIP, cập nhật trạng thái xử lý và báo cáo ảnh/video về TMC.

## Architecture Style

| Property | Value |
|---|---|
| App type | Mobile SPA (prototype: React/Vite; production: React Native) |
| Pattern | Event-driven + API-pull hybrid |
| State management | Local component state (React useState) + localStorage session |
| Auth | JWT token, dual credentials (system account + PBX extension) |
| Communication | REST (ITS API) + SIP/VoIP (PBX) + FCM/APNs (push) + GSM (SOS) |

## C4 Context (Level 1)

```
┌─────────────────────────────────────────────────────────┐
│  VEC Highway Operations System                          │
│                                                         │
│  [Nhân viên hiện trường]                                │
│        │                                                │
│        ▼                                                │
│  ┌─────────────┐     REST API    ┌─────────────────┐   │
│  │ ITS Mobile  │◄───────────────►│  ITS Backend     │   │
│  │ VEC App     │                 │  (TMS)           │   │
│  │             │  SIP/VoIP       ├─────────────────┤   │
│  │ (React      │◄───────────────►│  PBX / SIP       │   │
│  │  prototype) │                 │  Server          │   │
│  │             │  FCM/APNs       ├─────────────────┤   │
│  │             │◄───────────────►│  TMC Operations  │   │
│  │             │                 │  Center          │   │
│  │             │  GSM tel:       ├─────────────────┤   │
│  │             │────────────────►│  Emergency Hotline│  │
│  └─────────────┘                 └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Containers (Level 2)

| Container | Technology | Purpose |
|---|---|---|
| Mobile App (prototype) | React 18 + Vite + Tailwind | UI SPA prototype — all data mocked |
| Mobile App (production target) | React Native (iOS + Android) | Production mobile app |
| Session Store | localStorage / AsyncStorage | JWT session persistence |
| ITS REST API | External (VEC TMS) | Task data, status updates, media upload |
| PBX/SIP Server | External (VEC PBX) | VoIP call routing, presence, history |
| Push Notification | FCM (Android) + APNs (iOS) | Task assignments + alerts from TMC |

## Key Flows

### 1. Login (M1-F001)
```
Field Op → [Enter tai_khoan + extension_pbx + mat_khau]
  → App validates (client-side: extension = 4 digits)
  → POST /auth/login (ITS API) [not yet connected in prototype]
  → JWT stored in localStorage
  → Navigate to /calls (default tab)
```

### 2. Task Assignment + Processing (M2-F001..F003)
```
ITS Backend → [detects incident] → TMC Operator assigns task
  → FCM/APNs push to field op device
  → Field op opens app → GET /tasks (own tasks) → list displays
  → Tap task → GET /tasks/:id → detail view
  → Tap "Đã nhận (1)" → PATCH /tasks/:id/status {status: 1}
  → Work on scene → PATCH /tasks/:id/status {status: 2}
  → POST /tasks/:id/media (multipart photo/video)
  → Tap "Hoàn thành (3)" → PATCH /tasks/:id/status {status: 3}
  → Submit to TMC → POST /tasks/:id/report {notes, media_refs}
```

### 3. VoIP Call (M1-F003)
```
Field Op → [Opens Liên lạc tab] → GET /directory (from PBX)
  → See online/offline status → tap call button
  → SIP INVITE to PBX server [not yet connected in prototype]
  → PBX routes call → ringing → connected/missed → ended
  → Call logged in history
```

### 4. SOS Emergency (M1-F004)
```
Field Op → [Tap SOS FAB (always visible)] → Confirm dialog
  → window.location.href = tel:{SOS_TEL}
  → Native GSM dialer opens → call placed (works offline)
```

## Integration Map

| Integration | Direction | Protocol | Status |
|---|---|---|---|
| ITS REST API | bidir | HTTPS REST | Planned (not in prototype) |
| PBX SIP Server | bidir | SIP/VoIP over UDP/TCP | Planned (not in prototype) |
| FCM (Android push) | inbound | FCM data message | Planned (not in prototype) |
| APNs (iOS push) | inbound | APNs notification | Planned (not in prototype) |
| GSM Emergency Dial | outbound | Native `tel:` scheme | Implemented (in prototype) |

## Data Storage

| Store | Technology | Data | Scope |
|---|---|---|---|
| Session | localStorage (its_session_v1) | JWT + profile | Per device, cleared on logout |
| Call History | localStorage (its_call_history_v1) | Call log | Per device, cleared on logout |
| Task Data | ITS Backend API | All task/incident data | Server-side |
| Notification List | ITS/TMC Backend | All notifications | Server-side |

## NFRs (Architecture-relevant)

| NFR | Target | Constraint |
|---|---|---|
| Platform | iOS + Android | Both required (BR-INTEL-027) |
| SOS offline | 100% GSM | Must work without internet (BR-INTEL-008) |
| Task load | < 3 seconds | On 3G connection (BR-INTEL-012) |
| VoIP | Mobile SIP | NAT traversal: STUN/TURN required |
| Auth | HTTPS + JWT | Token rotation + refresh (BR-INTEL-003) |
| Push | Background delivery | iOS PushKit + Android FCM foreground service |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| ITS API spec not provided (GAP-008) | High | Requires API contract from VEC before M2 dev |
| SIP auth mechanism unclear (GAP-001) | High | Must choose SIP credential strategy before M1-F003 dev |
| VoIP NAT traversal on mobile | High | Need STUN/TURN server; test on 4G/3G |
| 3G/4G coverage gaps on expressway | Medium | Offline status queue + sync on reconnect |
| Concurrent SIP registrations (~200 users) | Medium | Verify PBX capacity |
