---
feature-id: ITSM-20260429-003
feature-name: Thong bao (M3)
canonical-source: docs/intel/doc-brief.md
generated-at: 2026-04-29T00:00:00+07:00
scope:
  modules: [M3]
  features: [M3-F001, M3-F002, M3-F003]
  depends-on: [ITSM-20260429-001, ITSM-20260429-002]
metrics:
  features-in-scope: 3
  rules-applied: 5
  entities-scoped: 1
  screens-scoped: 1
  integrations: 1
  ambiguities-total: 0
  blocking-gaps: 0
  priority-distribution:
    P0: 1
    P1: 1
    P2: 1
    P3: 0
  complexity-estimate: S
  risk-score: 2
---

# Feature Brief: Thong bao (M3)

## Scope

| Dimension | Value |
|---|---|
| Modules | M3 — Thong bao |
| Feature IDs | M3-F001, M3-F002, M3-F003 |
| Rules applied | 5: BR-INTEL-023, BR-INTEL-024, BR-INTEL-025, BR-INTEL-026, BR-INTEL-027 |
| Entities | ThongBao |
| Screens | 1: NotificationsView |
| Integrations | 1: FCM/APNs push notification service |
| Depends-on features | ITSM-20260429-001 (auth), ITSM-20260429-002 (NhiemVu entity for task ref) |

## Scope boundary

| Type | Items |
|---|---|
| IN scope | Receive push notifications (4 types), view notification list (reverse-chron + unread badge), toggle read/unread per notification |
| OUT scope | Notification sending (TMC-side only), notification preferences/settings, notification deletion, notification search, mark-all-as-read, batch operations, in-app notification sound settings |
| Deferred | Notification preferences (future) |

## Features in scope

### M3-F001: Nhan Push Notification

| Property | Value |
|---|---|
| Type | Integration |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | ThongBao |
| Screens | NotificationsView (+ system notification tray) |
| Workflow | ITS/TMC pushes FCM/APNs → device receives → display in notification center + app badge → tap navigates to relevant screen |
| Applied rules | BR-INTEL-023, BR-INTEL-024 |
| Source | explicit: "Push Notification" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| title | VARCHAR(200) | NOT NULL | |
| description | TEXT | nullable | |
| thoi_gian | TIMESTAMP | NOT NULL | server time |
| loai | ENUM('PhanCong','CapNhatTrangThai','HeThong','TMC') | NOT NULL | notification type |
| da_doc | BOOLEAN | DEFAULT false | |
| nhiem_vu_id | BIGINT | FK→NhiemVu NULLABLE | for PhanCong/CapNhatTrangThai types |

**Validations:** Must work when app is in background/killed (BR-INTEL-024); 4 notification types supported (BR-INTEL-023)
**Reports/Exports:** none

---

### M3-F002: Xem danh sach thong bao

| Property | Value |
|---|---|
| Type | CRUD (read) |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | ThongBao |
| Screens | NotificationsView |
| Workflow | Open notification screen → display list sorted by thoi_gian DESC → unread indicator |
| Applied rules | BR-INTEL-025 |
| Source | explicit: "Xem danh sách thông báo" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| title | VARCHAR(200) | NOT NULL | |
| thoi_gian | TIMESTAMP | ORDER BY DESC | |
| da_doc | BOOLEAN | for badge | |
| loai | ENUM | for type icon | |

**Validations:** Reverse chronological order; unread badge count in app navigation
**Reports/Exports:** none

---

### M3-F003: Danh dau da doc / chua doc

| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P2 |
| Actors | Nhan vien van hanh hien truong |
| Entities | ThongBao |
| Screens | NotificationsView |
| Workflow | Tap notification → auto-mark as read; or toggle read/unread via UI action |
| Applied rules | BR-INTEL-026 |
| Source | explicit: "Đánh dấu: Đã đọc Chưa đọc" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| da_doc | BOOLEAN | mutable | toggled by user action |

**Validations:** none
**Reports/Exports:** none

---

## Business Rules (scoped)

| ID | Rule | Type | Applies-to | Severity | Source |
|---|---|---|---|---|---|
| BR-INTEL-023 | Push notifications for 4 types: PhanCong, CapNhatTrangThai, HeThong, TMC | Notification | M3-F001 | High | explicit |
| BR-INTEL-024 | Push must work when app is in background | Notification | M3-F001 | High | implied |
| BR-INTEL-025 | Notifications in reverse chronological order with unread badge | Validation | M3-F002 | Low | implied wireframe |
| BR-INTEL-026 | User can toggle read/unread status | State-transition | M3-F003 | Low | explicit |
| BR-INTEL-027 | iOS + Android | Validation | M3-F001..003 | High | explicit |

## Entities + Relationships (scoped)

```yaml
entities:
  - name: ThongBao
    key-fields: [id, title, description, thoi_gian, loai, da_doc, nguoi_nhan_id, nhiem_vu_id]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      title: VARCHAR(200)
      description: TEXT
      thoi_gian: TIMESTAMP
      loai: ENUM('PhanCong','CapNhatTrangThai','HeThong','TMC')
      da_doc: BOOLEAN DEFAULT false
      nguoi_nhan_id: BIGINT FK→NguoiDung
      nhiem_vu_id: BIGINT FK→NhiemVu NULLABLE

relationships:
  - from: NguoiDung (M1)
    to: ThongBao
    cardinality: "1:N"
    fk: ThongBao.nguoi_nhan_id

  - from: NhiemVu (M2)
    to: ThongBao
    cardinality: "1:N"
    fk: ThongBao.nhiem_vu_id
    note: nullable — only for PhanCong/CapNhatTrangThai types

state-machines:
  - entity: ThongBao
    states: [unread, read]
    transitions:
      - from: unread
        to: read
        trigger: tap notification or explicit toggle
      - from: read
        to: unread
        trigger: explicit toggle (BR-INTEL-026)
```

## Screens (scoped)

| # | Screen | Type | Feature | Key fields | Actions | OCR src |
|---|---|---|---|---|---|---|
| 1 | Thong bao | list | M3-F001, M3-F002, M3-F003 | title, description, thoi_gian, loai, da_doc | Tap notification, toggle read/unread | UI.jsx#NotificationsView |

## Integrations (touching scope)

| From | To | Direction | Protocol | Data | Confidence |
|---|---|---|---|---|---|
| TMC/ITS Backend | Mobile App | in | FCM (Android) / APNs (iOS) | Notification payload (title, desc, type, nhiem_vu_id) | High |

## NFRs Applicable

| Area | Requirement | Target | Source |
|---|---|---|---|
| Platform | iOS + Android | Both required | explicit |
| Reliability | Background push delivery | < 10 seconds from TMC action | implied §13.5 |
| Performance | Notification list render | < 1 second | implied |

## Ambiguities

None — M3 has 0 blocking gaps. All requirements explicit.

---

## § Agent Hints (Opus-precomputed)

### § for ba

| Hint | Value |
|---|---|
| Complexity class | Simple |
| Classify rationale | 3 features, 5 rules, standard push + CRUD — no complex business logic |
| Implicit user stories to infer | "As field op, I want a badge count on notification icon, so I know immediately when new tasks arrive without opening the app" |
| Compliance mappings | None specific to M3 |
| Blocking clarifications to prepare | None — 0 blocking gaps |

**Inferred implicit stories:**
- As a field operator, I want a badge count on the notification icon, so I know when new assignments arrive without opening the app. [source: standard mobile UX for incident response apps]
- As a field operator, I want task-related notifications to deep-link directly to the task detail, so I can act immediately on assignment. [source: inferred from M3-F001 loai PhanCong + nhiem_vu_id FK]

### § for sa

| Hint | Value |
|---|---|
| Recommended pattern | FCM data message (silent push) → app fetches ThongBao from backend → displays |
| Pattern rationale | Notification payload stored server-side; FCM notification message limited to 4KB; data message triggers local DB sync |
| Anti-pattern risks | Don't embed full notification in FCM payload — use it as trigger, fetch from API |
| Scalability bottleneck | Broadcast notifications to all 200 users simultaneously during major incident |
| Similar-system reference | OpsGenie, PagerDuty mobile notification patterns |

### § for tech-lead

| Feature | Complexity | Risk | Rationale | Parallel-safe with |
|---|---|---|---|---|
| M3-F001 | M | 2 | FCM+APNs setup + background handling; iOS foreground/background/killed states | after M1-F001 (auth) |
| M3-F002 | S | 1 | Simple list with unread indicator | after M3-F001 |
| M3-F003 | S | 1 | Toggle boolean — straightforward | M3-F002 |

**Tasks likely needed:**
- FCM project setup + google-services.json / GoogleService-Info.plist
- APNs certificate (Production + Development) for iOS
- Push notification certificate management in CI/CD

### § for dev

| Hint | Value |
|---|---|
| Stack library | @react-native-firebase/messaging (FCM), react-native-push-notification |
| iOS background | Background Modes: "Remote notifications" must be enabled in Xcode |
| Android | FCM foreground service for notification handling when app active |
| Deep linking | notification tap → navigate to TaskDetailView for PhanCong type (nhiem_vu_id present) |
| Badge count | react-native-notifications or native module for badge management |
| Charset | utf8mb4 for Vietnamese title/description |

### § for qa

| Hint | Value |
|---|---|
| Test ratios | unit 60 / integration 30 / e2e 10 |
| Critical edge cases | Notification received when app killed (cold start from notification); multiple simultaneous notifications; notification for deleted task (nhiem_vu_id FK invalid); deep link while app in foreground vs background |
| Performance SLA | Notification delivery < 10 seconds from TMC action; list render < 1 second |
| Test data | see docs/intel/test-data-hints.md |

### § for reviewer — Feature-specific DoD

```
[ ] All ACs from ba spec implemented and tested
[ ] BR-INTEL-023..026 + BR-INTEL-027 unit tests present
[ ] Push notification works in: foreground, background, AND killed (cold start)
[ ] All 4 notification types (PhanCong, CapNhatTrangThai, HeThong, TMC) tested
[ ] NotificationsView sorted newest-first with unread badge
[ ] Toggle read/unread persists (server-side or local + sync)
[ ] Task-type notifications deep-link to TaskDetailView (M2-F002)
[ ] iOS APNs certificates configured for both Dev and Prod
[ ] Android FCM setup verified with physical device
[ ] Vietnamese notification text (title/description) renders correctly
[ ] Badge count updates on notification receive and on read
[ ] No push credentials hardcoded in source
[ ] README/CHANGELOG updated
```

### § for security

| Attack surface | Mitigation |
|---|---|
| Notification spoofing | Validate FCM/APNs sender identity server-side |
| Notification payload exposure | No sensitive data in FCM payload — use data message + fetch pattern |
| nhiem_vu_id IDOR | Validate user is authorized to view linked task before deep-link navigate |

---

## Agent Read Order (est. tokens)

| Agent | Sections | Est. tokens |
|---|---|---|
| ba | Scope, Features, Rules, §ba | ~2K |
| sa | Entities, Integrations, §sa | ~1.5K |
| tech-lead | Features, §tech-lead | ~1K |
| dev | §dev | ~0.8K |
| qa | Rules, §qa | ~1.5K |
| reviewer | §reviewer DoD | ~0.5K |

## Canonical Reference
- Source of truth: `docs/intel/doc-brief.md`
- Key sections: §4 M3 features, §5 BR-INTEL-023..026, §6 ThongBao entity, §7 NotificationsView, §8 FCM/APNs integration
