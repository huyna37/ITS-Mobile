---
feature-id: ITSM-20260429-002
feature-name: Quan ly Su co va Nhiem vu (M2)
canonical-source: docs/intel/doc-brief.md
generated-at: 2026-04-29T00:00:00+07:00
scope:
  modules: [M2]
  features: [M2-F001, M2-F002, M2-F003, M2-F004, M2-F005]
  depends-on: [ITSM-20260429-001]
metrics:
  features-in-scope: 5
  rules-applied: 12
  entities-scoped: 3
  screens-scoped: 2
  integrations: 2
  ambiguities-total: 4
  blocking-gaps: 1
  priority-distribution:
    P0: 3
    P1: 2
    P2: 0
    P3: 0
  complexity-estimate: M
  risk-score: 4
---

# Feature Brief: Quan ly Su co va Nhiem vu (M2)

## Scope

| Dimension | Value |
|---|---|
| Modules | M2 — Quan ly Su co va Nhiem vu |
| Feature IDs | M2-F001, M2-F002, M2-F003, M2-F004, M2-F005 |
| Rules applied | 12: BR-INTEL-011..022, BR-INTEL-027 |
| Entities | NhiemVu, HoSoSuCo, AnhHienTruong (+ SuKienTuyenDuong) |
| Screens | 2: TaskListView, TaskDetailView |
| Integrations | 2: ITS Backend REST API (bidir), photo upload |
| Depends-on features | ITSM-20260429-001 (M1 auth required) |

## Scope boundary

| Type | Items |
|---|---|
| IN scope | Task list (assigned to current user), task detail, incident handling script, status update workflow (1→2→3), field photo attachment, incident/event feed from ITS |
| OUT scope | Task creation (TMC-side), incident detection (ITS system), task filtering/search, editing incident profile, video capture, photo annotation, task reassignment, analytics/reporting |
| Deferred | Task filtering/search, incident analytics |

## Features in scope

### M2-F001: Hien thi danh sach cong viec

| Property | Value |
|---|---|
| Type | CRUD (read) |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu |
| Screens | TaskListView |
| Workflow | Pull-to-refresh → fetch assigned tasks from ITS API → display list |
| Applied rules | BR-INTEL-011, BR-INTEL-012 |
| Source | explicit: "Hiển thị danh sách công việc" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| code | VARCHAR(20) | UNIQUE, NOT NULL | task code |
| loai_su_co | VARCHAR(100) | NOT NULL | incident type |
| muc_do | ENUM('Nhe','TrungBinh','NghiemTrong') | NOT NULL | severity |
| vi_tri_km | VARCHAR(20) | NOT NULL | km position |
| thoi_gian_phat_hien | TIMESTAMP | NOT NULL | detection time |
| trang_thai | ENUM('ChuaXuLy','DaNhan','DangXuLy','HoanThanh') | NOT NULL | |

**Validations:** Only show tasks assigned to current user (server-side filter); load < 3 seconds (BR-INTEL-012)
**Reports/Exports:** none

---

### M2-F002: Xem chi tiet cong viec

| Property | Value |
|---|---|
| Type | CRUD (read) |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu, HoSoSuCo |
| Screens | TaskDetailView |
| Workflow | Tap task in list → load full detail from ITS API → display incident profile + handling script |
| Applied rules | BR-INTEL-013, BR-INTEL-014 |
| Source | explicit: "Xem chi tiết công việc" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| phuong_an_xu_ly | TEXT | from ITS | handling script (scriptName) |
| huong | VARCHAR(50) | nullable | direction |
| ghi_chu_hien_truong | TEXT | nullable | field notes |
| hinh_anh_hien_truong | TEXT[] | nullable | photo URLs |

**Validations:** Must display handling script (BR-INTEL-013); display all 20+ ITS API fields (BR-INTEL-014)
**Reports/Exports:** none

---

### M2-F003: Cap nhat trang thai xu ly su co

| Property | Value |
|---|---|
| Type | Workflow |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu |
| Screens | TaskDetailView (status buttons + CAP NHAT KET QUA) |
| Workflow | Da nhan (1) → Dang xu ly (2) → Hoan thanh (3) — sequential only |
| Applied rules | BR-INTEL-015, BR-INTEL-016, BR-INTEL-017, BR-INTEL-018 |
| Source | explicit: "Đã nhận nhiệm vụ: 1 Đang xử lý: 2 Kết quả xử lý: 3" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| trang_thai | ENUM(ChuaXuLy,DaNhan,DangXuLy,HoanThanh) | required | strict sequence only |
| ghi_chu_hien_truong | TEXT | optional | field notes on update |
| thoi_gian_cap_nhat | TIMESTAMP | auto | update timestamp |

**Validations:** Transition must follow 1→2→3 sequence (no skip, no rollback — BR-INTEL-015, 016); sync to ITS backend in real-time (BR-INTEL-018)
**Reports/Exports:** none

---

### M2-F004: Dinh kem anh hien truong

| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | AnhHienTruong |
| Screens | TaskDetailView (Chup anh button) |
| Workflow | Tap camera → capture photo → upload multipart → attach to task |
| Applied rules | BR-INTEL-019, BR-INTEL-020 |
| Source | explicit: "Đính kèm ảnh hiện trường (nếu cần)" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| nhiem_vu_id | BIGINT | FK→NhiemVu, NOT NULL | |
| file_path | VARCHAR(500) | NOT NULL | server URL after upload |
| file_size | INT | nullable | bytes |
| uploaded_at | TIMESTAMP | auto | |

**Validations:** image files only (jpg, png); max size TBD (GAP open); retry on upload failure
**Reports/Exports:** none

---

### M2-F005: Hien thi su co/su kien giao thong

| Property | Value |
|---|---|
| Type | CRUD (read) |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | HoSoSuCo, SuKienTuyenDuong |
| Screens | TaskListView (Su kien tren tuyen section) |
| Workflow | Receive push updates from ITS → display in incident/event feed |
| Applied rules | BR-INTEL-021, BR-INTEL-022 |
| Source | explicit: "Ứng dụng nhận thông tin sự cố từ hệ thống ITS" |

**Key fields:**
| Field | Type | Constraints | Notes |
|---|---|---|---|
| typeEventName | VARCHAR(100) | NOT NULL | event type |
| level | ENUM('Nhe','TrungBinh','NghiemTrong') | NOT NULL | severity |
| positionKM | VARCHAR(20) | NOT NULL | km position |
| scriptName | VARCHAR(200) | nullable | handling script name |
| pathFile | VARCHAR(500) | nullable | associated media |

**Validations:** severity enum: Nhe/TrungBinh/NghiemTrong (BR-INTEL-022)
**Reports/Exports:** none

---

## Business Rules (scoped)

| ID | Rule | Type | Applies-to | Severity | Source |
|---|---|---|---|---|---|
| BR-INTEL-011 | Task list shows ONLY tasks assigned to current user | Authorization | M2-F001 | High | implied |
| BR-INTEL-012 | Task list must load within 3 seconds | Validation | M2-F001 | Medium | explicit |
| BR-INTEL-013 | Task detail must display incident handling script | Validation | M2-F002 | High | explicit |
| BR-INTEL-014 | Task detail must show all ITS API fields | Validation | M2-F002 | Medium | implied |
| BR-INTEL-015 | Status transitions: ChuaXuLy→DaNhan→DangXuLy→HoanThanh (strict sequence) | State-transition | M2-F003 | High | explicit |
| BR-INTEL-016 | No backward status transitions | State-transition | M2-F003 | High | implied |
| BR-INTEL-017 | Field notes can be added during status update | Validation | M2-F003 | Medium | explicit |
| BR-INTEL-018 | Status update must sync to ITS backend in real-time | Notification | M2-F003 | High | implied |
| BR-INTEL-019 | Field photos are optional attachment during task processing | Validation | M2-F004 | Medium | explicit |
| BR-INTEL-020 | Photos from device camera (wireframe: Chup anh) | Validation | M2-F004 | Low | implied wireframe |
| BR-INTEL-021 | Incident info received from ITS in real-time | Notification | M2-F005 | High | explicit |
| BR-INTEL-022 | Severity: 3 levels Nhe/TrungBinh/NghiemTrong | Validation | M2-F001..003, M2-F005 | Medium | explicit |
| BR-INTEL-027 | iOS + Android | Validation | M2-F001..005 | High | explicit |

## Entities + Relationships (scoped)

```yaml
entities:
  - name: NhiemVu
    key-fields: [id, code, name, loai_su_co, muc_do, vi_tri_km, trang_thai, ho_so_su_co_id]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      code: VARCHAR(20) UNIQUE
      loai_su_co: VARCHAR(100)
      muc_do: ENUM('Nhe','TrungBinh','NghiemTrong')
      vi_tri_km: VARCHAR(20)
      trang_thai: ENUM('ChuaXuLy','DaNhan','DangXuLy','HoanThanh')
      ghi_chu_hien_truong: TEXT
      ho_so_su_co_id: BIGINT FK

  - name: HoSoSuCo
    key-fields: [id, code, timeDetect, positionKM, level, status, typeEventName]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      code: VARCHAR(20) UNIQUE
      timeDetect: TIMESTAMP
      positionKM: VARCHAR(20)
      level: ENUM('Nhe','TrungBinh','NghiemTrong')
      scriptName: VARCHAR(200)
      pathFile: VARCHAR(500)

  - name: AnhHienTruong
    key-fields: [id, nhiem_vu_id, file_path, uploaded_at]
    pii-fields: []
    field-types:
      id: BIGINT PK AUTO
      nhiem_vu_id: BIGINT FK→NhiemVu
      file_path: VARCHAR(500)
      file_size: INT
      uploaded_at: TIMESTAMP

relationships:
  - from: HoSoSuCo
    to: NhiemVu
    cardinality: "1:N"
    fk: NhiemVu.ho_so_su_co_id

  - from: NhiemVu
    to: AnhHienTruong
    cardinality: "1:N"
    fk: AnhHienTruong.nhiem_vu_id

  - from: NguoiDung (M1)
    to: NhiemVu
    cardinality: "N:N"
    fk: junction table NhiemVu_NguoiDung

state-machines:
  - entity: NhiemVu
    states: [ChuaXuLy, DaNhan, DangXuLy, HoanThanh]
    transitions:
      - from: ChuaXuLy
        to: DaNhan
        trigger: "User taps 'Da nhan' (1)"
        guard: task assigned to current user
      - from: DaNhan
        to: DangXuLy
        trigger: "User taps 'Dang xu ly' (2)"
        guard: user is assigned
      - from: DangXuLy
        to: HoanThanh
        trigger: "User taps 'Hoan thanh' (3)"
        guard: user is assigned
```

## Screens (scoped)

| # | Screen | Type | Feature | Key fields | Actions | OCR src |
|---|---|---|---|---|---|---|
| 1 | Nhiem vu + Su kien tren tuyen | list | M2-F001, M2-F005 | code, type, level, location, time, status | Tap card → detail | UI.jsx#TaskListView |
| 2 | Chi tiet su co | detail | M2-F002, M2-F003, M2-F004 | level, id, type, location, direction, description, script | Da nhan, Dang xu ly, Hoan thanh, Chup anh, CAP NHAT KET QUA, PhoneCall | UI.jsx#TaskDetailView |

## Integrations (touching scope)

| From | To | Direction | Protocol | Data | Confidence |
|---|---|---|---|---|---|
| Mobile App | ITS Backend (TMS) | bidir | REST API (HTTPS) | Task list, task detail (20+ fields), status updates, photo uploads | High |
| Mobile App | ITS Backend | out | HTTPS multipart/form-data | Field photos (jpg/png) | High |

## NFRs Applicable

| Area | Requirement | Target | Source |
|---|---|---|---|
| Performance | Task list loading | < 3 seconds | explicit |
| Platform | iOS + Android | Both | explicit |
| Security | User can only see own tasks | Server-side filter enforced | implied |
| Reliability | Status update sync | Real-time (BR-INTEL-018) | implied |
| Extensibility | Photo upload | Retry on failure | implied field operations context |

## Ambiguities (blocking `ba` to resolve upfront)

| ID | Severity | Question | Options | Impact-if-wrong |
|---|---|---|---|---|
| GAP-002 | Blocking | ITS API authentication mechanism? | A: Same JWT from M1 login; B: Separate API key; C: OAuth2 | All M2 features broken if wrong |
| GAP-003 | Blocking | Task assignment push or pull? | A: REST polling; B: WebSocket push; C: Push notification triggers fetch | Core architecture decision |
| GAP-005 | Non-blocking | Photo — camera only or gallery too? | A: Camera only; B: Camera + gallery | Minor UX |
| GAP-007 | Non-blocking | Offline task cache? | A: No cache; B: Cache last-fetched list | Expressway coverage gaps |
| GAP-008 | Unresolvable | Full ITS API specification not provided | Requires external artifact | Cannot implement M2 without API spec |

---

## § Agent Hints (Opus-precomputed)

### § for ba

| Hint | Value |
|---|---|
| Complexity class | Medium |
| Classify rationale | 5 features, 13 rules, external ITS API dependency, state machine |
| Implicit user stories to infer | "As field op, I want status update to work offline and sync later, so connectivity gaps don't block reporting" |
| Compliance mappings | Status update audit trail recommended (operational safety) |
| Blocking clarifications to prepare | GAP-002 (ITS API auth), GAP-003 (push/pull model) — must resolve with SA before M2-F001 spec |

### § for sa

| Hint | Value |
|---|---|
| Recommended pattern | Push notification triggers fetch (Option C for GAP-003) — battery-efficient, reliable |
| Pattern rationale | Polling drains battery; WebSocket complex for mobile background; silent push + on-demand fetch is standard |
| Anti-pattern risks | N+1 on task detail (fetch full HoSoSuCo for each list item) — use list summary + detail API |
| Scalability bottleneck | Task status update endpoint during rush hour incidents |
| Similar-system reference | Field service management apps (ServiceMax, Salesforce Field Service) |

### § for tech-lead

| Feature | Complexity | Risk | Rationale | Parallel-safe with |
|---|---|---|---|---|
| M2-F001 | M | 4 | ITS API spec missing (GAP-008); list performance < 3s | M1-F003 |
| M2-F002 | M | 4 | 20+ field display from unknown ITS API contract | after M2-F001 |
| M2-F003 | M | 3 | State machine + offline sync + real-time ITS update | after M2-F002 |
| M2-F004 | S | 2 | Standard camera capture + multipart upload | M2-F003 |
| M2-F005 | S | 3 | ITS push integration — depends on GAP-003 resolution | M2-F001 (shared list view) |

**Tasks likely needed:**
- ITS API contract clarification + mock setup (external dependency)
- Offline queue for status updates (optimistic UI + background sync)
- Photo upload progress indicator + retry logic

### § for dev

| Hint | Value |
|---|---|
| Stack library | react-native-camera (photo), axios with retry (API), XState or simple reducer (status machine) |
| Optimistic UI | Update local status immediately, sync in background — show error if sync fails |
| Photo upload | multipart/form-data with progress; exponential backoff retry on 3G |
| Charset | utf8mb4 for Vietnamese text (loai_su_co, mo_ta, phuong_an_xu_ly) |
| Timezone | ICT (UTC+7) for all TIMESTAMP fields |

### § for qa

| Hint | Value |
|---|---|
| Test ratios | unit 50 / integration 35 / e2e 15 |
| Critical edge cases | Status update offline then sync conflict; task reassigned by TMC while field op updating; photo upload on 3G timeout; status transition skip attempt (should be blocked); list with 0 tasks (empty state) |
| Performance SLA | Task list load < 3s on 3G; status update sync < 2s |
| Test data | see docs/intel/test-data-hints.md |

### § for reviewer — Feature-specific DoD

```
[ ] All ACs from ba spec implemented and tested
[ ] BR-INTEL-011..022 + BR-INTEL-027 unit tests present
[ ] Task list filter: server-side — never client-side only
[ ] Status machine: ChuaXuLy→DaNhan→DangXuLy→HoanThanh strictly enforced (no skip, no rollback)
[ ] Status update syncs to ITS backend (verify in integration test)
[ ] Photo upload: image only, retry on failure
[ ] Task list loads < 3 seconds (verified on 3G simulator)
[ ] Handling script displayed in task detail
[ ] Vietnamese error messages, no English leak
[ ] iOS + Android both tested
[ ] No ITS API credentials hardcoded
[ ] README/CHANGELOG updated
```

### § for security

| Attack surface | Mitigation |
|---|---|
| Unauthorized task status update | Validate user-task assignment server-side before accepting status change |
| Mass task access | Server enforces per-user filter — no bypass via client params |
| Photo EXIF data | Decision: strip EXIF or preserve; document intentionally |
| Large payload injection | Validate/sanitize ghi_chu_hien_truong input |

---

## Agent Read Order (est. tokens)

| Agent | Sections | Est. tokens |
|---|---|---|
| ba | Scope, Features, Rules, Ambiguities, §ba | ~4K |
| sa | Entities, Integrations, §sa | ~2.5K |
| tech-lead | Features (Priority+Risk), §tech-lead | ~1.5K |
| dev | Entities, §dev | ~1K |
| qa | Rules, §qa | ~2K |
| reviewer | §reviewer DoD | ~0.5K |

## Canonical Reference
- Source of truth: `docs/intel/doc-brief.md`
- Key sections: §4 M2 features, §5 BR-INTEL-011..022, §6 NhiemVu/HoSoSuCo entities, §7 TaskListView/TaskDetailView, §8 ITS API integration
