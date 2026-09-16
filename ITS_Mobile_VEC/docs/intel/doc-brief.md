---
feature-id: ITS_Mobile_VEC
document: doc-brief
source-files:
  - d:\Etc\ITS_Mobile_VEC\docs\source\Yêu cầu ứng dụng di động vận hành.docx
  - d:\Etc\ITS_Mobile_VEC\docs\source\UI.jsx
source-type: Functional Specification
generated: 2026-04-29
ba-confidence: Medium
metrics:
  modules: 3
  features: 13
  rules: 27
  entities: 7
  screens: 7
  integrations: 4
  ambiguities-blocking: 3
  ambiguities-nonblocking: 5
  pii-fields-count: 0
  actors-count: 4
---

# ITS Mobile VEC — Intelligence Brief
# Ung dung di dong van hanh ITS (NB-LC Express)

## 1. Executive Summary (structured)

| Field | Value |
|---|---|
| What the system does | Mobile app for ITS field operations staff to receive incident tasks, communicate via PBX, update incident status from the field, and receive notifications from TMC |
| Domain | transportation / highway operations (ITS - Intelligent Transportation System) |
| Business problem solved | Field personnel on the Noi Bai - Lao Cai expressway lack a mobile tool to receive real-time incident assignments, communicate with TMC, and report field status — forcing manual phone coordination and delayed incident response |
| Estimated scale | ~50-200 field staff (patrol teams, rescue crews across expressway stations); ~10-50 incidents/day |
| Target stakeholders | VEC (Vietnam Expressway Corporation), TMC operators, field patrol/rescue teams |

## 2. Document Analysis

| Item | Finding |
|---|---|
| Document type | Functional Specification |
| Completeness | actors: explicit, rules: implied, flows: explicit, data: partial (API fields listed), NFR: partial, integration: explicit |
| Analysis strategy | Single-pass extraction from requirement doc + JSX wireframe cross-reference |
| OCR images processed | 0 of 0 (no embedded images; JSX wireframe analyzed as code) |
| Confidence | Medium — API field schemas provided but business rules mostly implied; PBX/SIP integration details sparse |

## 3. Actors (canonicalized, scoped to this system)

| Role | Type | Responsibilities | Permissions hint | Source |
|---|---|---|---|---|
| Nhan vien van hanh hien truong (aliases: Field Operator, Nhan vien tuan tra, OP) | human | Patrol routes, receive incident tasks, update task status, upload field photos, make/receive PBX calls, trigger SOS | View own tasks, update task status, make calls, receive notifications | explicit §3 |
| Nhan vien Trung tam dieu hanh (aliases: TMC Operator, Dispatcher) | human | Create incident tasks, assign to field staff, monitor task progress, send notifications | Create tasks, assign tasks, broadcast notifications, monitor all incidents | explicit §3 |
| He thong ITS tuyen (aliases: ITS Backend, TMS) | system | Detect/receive incident information, store incident profiles, push incident data to mobile app via API | Full incident CRUD, task lifecycle management | explicit §2.2 |
| He thong tong dai noi bo PBX (aliases: PBX System, SIP Server) | system | Route internal VoIP calls, manage extensions, provide call history | Call routing, extension auth, presence status | explicit §2.1 |

## 4. Module & Feature Inventory

### Module: Xac thuc va Lien lac [id: M1]
| Property | Value |
|---|---|
| Purpose | Authentication via internal account + PBX extension, internal VoIP calling, and emergency SOS calling |
| Scope | Login/logout, session management, PBX-based internal calls, GSM-based SOS emergency calls |
| Out of scope | User management/registration (handled by ITS backend), PBX server administration |
| Dependencies | none (foundational module) |

**Features in this module:**

#### M1-F001: Dang nhap he thong
| Property | Value |
|---|---|
| Type | Auth |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NguoiDung, PhienDangNhap |
| Key fields | tai_khoan VARCHAR(50), extension_pbx VARCHAR(10), mat_khau VARCHAR(255), ten_nhan_vien VARCHAR(100), don_vi VARCHAR(100), trang_thai_phien ENUM('active','expired') |
| Applied rules | BR-INTEL-001, BR-INTEL-002, BR-INTEL-003 |
| Screens | wireframe:UI.jsx#LoginView |
| Workflow | simple Auth: enter credentials -> validate -> create session |
| Validations | required: [tai_khoan, extension_pbx, mat_khau]; format: extension_pbx numeric 4 digits |
| Reports/Exports | none |
| In scope | Login with system account + PBX extension, session persistence, logout |
| Out of scope | Password reset, account creation, SSO |
| Source | explicit: "Đăng nhập bằng: Tài khoản hệ thống Extension tổng đài PBX" |

#### M1-F002: Dang xuat he thong
| Property | Value |
|---|---|
| Type | Auth |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NguoiDung, PhienDangNhap |
| Key fields | session_token, logout_time TIMESTAMP |
| Applied rules | BR-INTEL-004 |
| Screens | wireframe:UI.jsx#ProfileView |
| Workflow | simple: tap logout -> confirm -> clear session -> redirect to login |
| Validations | none |
| Reports/Exports | none |
| In scope | Logout and session cleanup |
| Out of scope | Force logout from admin |
| Source | explicit: "Đăng xuất" |

#### M1-F003: Thuc hien cuoc goi noi bo (PBX)
| Property | Value |
|---|---|
| Type | Integration |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong, Nhan vien Trung tam dieu hanh |
| Entities | DanhBaNguoiDung, LichSuCuocGoi |
| Key fields | extension_nguoi_goi VARCHAR(10), extension_nguoi_nhan VARCHAR(10), ten_nguoi_goi VARCHAR(100), thoi_gian_goi TIMESTAMP, thoi_luong INT, trang_thai_cuoc_goi ENUM('ringing','connected','ended','missed'), online_status BOOLEAN |
| Applied rules | BR-INTEL-005, BR-INTEL-006, BR-INTEL-007 |
| Screens | wireframe:UI.jsx#CallsView |
| Workflow | Select contact -> initiate SIP call -> ringing -> connected/missed -> call ended -> log to history |
| Validations | required: [extension_nguoi_nhan]; contact must exist in directory |
| Reports/Exports | none |
| In scope | Make/receive VoIP calls via PBX, view internal directory with online status, view call history |
| Out of scope | Conference calls, call recording, voicemail |
| Source | explicit: "Gọi nội bộ giữa các nhân viên Nhận cuộc gọi từ Trung tâm điều hành" |

#### M1-F004: Goi khan cap SOS qua GSM
| Property | Value |
|---|---|
| Type | Integration |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | none (direct GSM dial) |
| Key fields | sos_hotline_number VARCHAR(15) |
| Applied rules | BR-INTEL-008, BR-INTEL-009 |
| Screens | SOS floating button (always visible) |
| Workflow | Tap SOS button -> confirm -> initiate GSM call to preconfigured hotline |
| Validations | none (must work offline) |
| Reports/Exports | none |
| In scope | One-tap SOS call via GSM, works without internet |
| Out of scope | SMS fallback, GPS location sharing on SOS |
| Source | explicit: "Nút gọi nhanh SOS Hotline Thực hiện cuộc gọi GSM trực tiếp Hoạt động khi không có internet" |

#### M1-F005: Hien thi thong tin ca nhan
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P2 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NguoiDung |
| Key fields | ten_nhan_vien VARCHAR(100), chuc_vu VARCHAR(50), extension VARCHAR(10), don_vi VARCHAR(100) |
| Applied rules | BR-INTEL-010 |
| Screens | wireframe:UI.jsx#ProfileView |
| Workflow | simple CRUD (read-only profile display) |
| Validations | none |
| Reports/Exports | none |
| In scope | Display user profile info: name, role, extension, unit |
| Out of scope | Profile editing (managed in ITS backend) |
| Source | implied: §4.1 "Dữ liệu hiển thị: Tên nhân viên Đơn vị công tác Extension nội bộ" + wireframe ProfileView |

### Module: Quan ly Su co va Nhiem vu [id: M2]
| Property | Value |
|---|---|
| Purpose | Receive, view, and manage incident tasks assigned from TMC; view incident/event information from ITS |
| Scope | Task list, task detail, status updates, field photo upload, incident/event information display |
| Out of scope | Task creation (TMC-side only), incident detection (ITS system), analytics/reporting |
| Dependencies | M1 (requires authentication), M3 (task assignment triggers notification) |

**Features in this module:**

#### M2-F001: Hien thi danh sach cong viec
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu |
| Key fields | code VARCHAR(20), name VARCHAR(200), loai_su_co VARCHAR(100), muc_do ENUM('Nhe','TrungBinh','NghiemTrong'), vi_tri_km VARCHAR(20), thoi_gian_phat_hien TIMESTAMP, trang_thai ENUM('ChuaXuLy','DangXuLy','HoanThanh'), mo_ta TEXT |
| Applied rules | BR-INTEL-011, BR-INTEL-012 |
| Screens | wireframe:UI.jsx#TaskListView |
| Workflow | simple CRUD — pull-to-refresh list of assigned tasks |
| Validations | none (read-only list) |
| Reports/Exports | none |
| In scope | Display list of tasks assigned to current user with key info (code, type, severity, location, time, status) |
| Out of scope | Task filtering/search, task creation |
| Source | explicit: "Hiển thị danh sách công việc" |

#### M2-F002: Xem chi tiet cong viec
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu, HoSoSuCo |
| Key fields | code, loai_su_co, vi_tri_km, huong VARCHAR(50), thoi_gian_phat_hien, mo_ta TEXT, phuong_an_xu_ly TEXT (script), muc_do, trang_thai, ghi_chu_hien_truong TEXT, hinh_anh_hien_truong TEXT[] |
| Applied rules | BR-INTEL-013, BR-INTEL-014 |
| Screens | wireframe:UI.jsx#TaskDetailView |
| Workflow | Tap task -> load full detail from ITS API -> display incident profile + handling script |
| Validations | none (read view) |
| Reports/Exports | none |
| In scope | Full task detail view including incident profile, handling script, field photos |
| Out of scope | Editing incident profile data (ITS backend managed) |
| Source | explicit: "Xem chi tiết công việc" |

#### M2-F003: Cap nhat trang thai xu ly su co
| Property | Value |
|---|---|
| Type | Workflow |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu |
| Key fields | trang_thai ENUM(1,2,3), ghi_chu_hien_truong TEXT, thoi_gian_cap_nhat TIMESTAMP |
| Applied rules | BR-INTEL-015, BR-INTEL-016, BR-INTEL-017, BR-INTEL-018 |
| Screens | wireframe:UI.jsx#TaskDetailView (status buttons + CẬP NHẬT KẾT QUẢ) |
| Workflow | Da nhan nhiem vu (1) -> Dang xu ly (2) -> Hoan thanh (3); sequential, no skip allowed |
| Validations | required: [trang_thai]; status transition must follow sequence 1->2->3 |
| Reports/Exports | none |
| In scope | Update task status (received/processing/completed), add field notes |
| Out of scope | Reopening completed tasks, status rollback |
| Source | explicit: "Đã nhận nhiệm vụ: 1 Đang xử lý: 2 Kết quả xử lý: 3" |

#### M2-F004: Dinh kem anh hien truong
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | NhiemVu, AnhHienTruong |
| Key fields | nhiem_vu_id FK, file_path VARCHAR(500), uploaded_at TIMESTAMP, file_size INT |
| Applied rules | BR-INTEL-019, BR-INTEL-020 |
| Screens | wireframe:UI.jsx#TaskDetailView (Chụp ảnh button) |
| Workflow | Tap camera button -> capture/select photo -> upload to server -> attach to task |
| Validations | file type: image only (jpg, png); max size TBD |
| Reports/Exports | none |
| In scope | Capture photos from camera, attach to task, upload to ITS backend |
| Out of scope | Video capture, photo editing/annotation |
| Source | explicit: "Đính kèm ảnh hiện trường (nếu cần)" |

#### M2-F005: Hien thi su co/su kien giao thong
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | HoSoSuCo, SuKienTuyenDuong |
| Key fields | code, timeDetect TIMESTAMP, direction VARCHAR(50), positionKM VARCHAR(20), positionM VARCHAR(10), description TEXT, status VARCHAR(20), typeEventName VARCHAR(100), source VARCHAR(100), level ENUM('Nhe','TrungBinh','NghiemTrong'), pathFile VARCHAR(500), scriptName VARCHAR(200), beginInfomation TEXT, reason TEXT, damage TEXT |
| Applied rules | BR-INTEL-021, BR-INTEL-022 |
| Screens | wireframe:UI.jsx#TaskListView (Su kien tren tuyen section) |
| Workflow | simple CRUD — receive push updates of incidents/events from ITS, display in feed |
| Validations | none (read-only) |
| Reports/Exports | none |
| In scope | Display real-time incident/event info from ITS including images, video links, severity, handling script |
| Out of scope | Creating/editing incidents (ITS backend), incident analytics |
| Source | explicit: "Ứng dụng nhận thông tin sự cố từ hệ thống ITS" |

### Module: Thong bao [id: M3]
| Property | Value |
|---|---|
| Purpose | Receive and manage push notifications from TMC and ITS system |
| Scope | Push notification reception, notification list display, read/unread management |
| Out of scope | Notification sending (TMC-side), notification preferences/settings |
| Dependencies | M1 (requires authentication), M2 (task-related notifications) |

**Features in this module:**

#### M3-F001: Nhan Push Notification
| Property | Value |
|---|---|
| Type | Integration |
| Priority | P0 |
| Actors | Nhan vien van hanh hien truong |
| Entities | ThongBao |
| Key fields | title VARCHAR(200), description TEXT, thoi_gian TIMESTAMP, loai ENUM('PhanCong','CapNhatTrangThai','HeThong','TMC'), da_doc BOOLEAN DEFAULT false, nhiem_vu_id FK (nullable) |
| Applied rules | BR-INTEL-023, BR-INTEL-024 |
| Screens | wireframe:UI.jsx#NotificationsView |
| Workflow | ITS/TMC pushes notification -> device receives -> display in notification center + app badge |
| Validations | none |
| Reports/Exports | none |
| In scope | Receive push notifications for: task assignment, task status update, system alerts, TMC broadcasts |
| Out of scope | In-app notification sound settings, notification scheduling |
| Source | explicit: "Push Notification" |

#### M3-F002: Xem danh sach thong bao
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P1 |
| Actors | Nhan vien van hanh hien truong |
| Entities | ThongBao |
| Key fields | title, description, thoi_gian, loai, da_doc |
| Applied rules | BR-INTEL-025 |
| Screens | wireframe:UI.jsx#NotificationsView |
| Workflow | simple CRUD — list notifications sorted by time descending |
| Validations | none (read-only) |
| Reports/Exports | none |
| In scope | View notification list with unread indicator, timestamp |
| Out of scope | Notification deletion, notification search |
| Source | explicit: "Xem danh sách thông báo" |

#### M3-F003: Danh dau da doc / chua doc
| Property | Value |
|---|---|
| Type | CRUD |
| Priority | P2 |
| Actors | Nhan vien van hanh hien truong |
| Entities | ThongBao |
| Key fields | da_doc BOOLEAN |
| Applied rules | BR-INTEL-026 |
| Screens | wireframe:UI.jsx#NotificationsView |
| Workflow | simple: tap notification -> mark as read; or toggle read/unread |
| Validations | none |
| Reports/Exports | none |
| In scope | Toggle notification read/unread status |
| Out of scope | Mark all as read, batch operations |
| Source | explicit: "Đánh dấu: Đã đọc Chưa đọc" |

## 5. Business Rules

| ID | Rule | Type | Applies-to-features | Severity | Scope | Source |
|---|---|---|---|---|---|---|
| BR-INTEL-001 | Login requires both system account AND PBX extension (dual-credential authentication) | Authorization | [M1-F001] | High | single-feature | explicit: "Đăng nhập bằng: Tài khoản hệ thống Extension tổng đài PBX" |
| BR-INTEL-002 | Login session must be persisted across app restarts (no re-login on app reopen) | State-transition | [M1-F001] | Medium | single-feature | explicit: "Lưu phiên đăng nhập" |
| BR-INTEL-003 | Authentication must use HTTPS with token-based session | Authorization | [M1-F001] | High | cross-cutting | explicit: "Xác thực người dùng HTTPS Token session" |
| BR-INTEL-004 | Logout must clear local session and require fresh login | State-transition | [M1-F002] | Medium | single-feature | implied: §4.1 "Đăng xuất" — standard session cleanup |
| BR-INTEL-005 | Internal calls use SIP/VoIP protocol through PBX system | Validation | [M1-F003] | High | single-feature | explicit: "SIP / VoIP kết nối PBX" |
| BR-INTEL-006 | Contact directory must show online/offline status for each extension | Validation | [M1-F003] | Medium | single-feature | implied: wireframe CallsView shows green dot "online" indicator per contact |
| BR-INTEL-007 | Call history must be recorded and viewable | State-transition | [M1-F003] | Medium | single-feature | explicit: "Lịch sử cuộc gọi" |
| BR-INTEL-008 | SOS call must work WITHOUT internet connection (GSM direct dial) | Validation | [M1-F004] | High | single-feature | explicit: "Hoạt động khi không có internet" |
| BR-INTEL-009 | SOS button must be always visible on every screen inside the app | Validation | [M1-F004] | High | cross-cutting | implied: wireframe shows SOS FAB as "Luôn hiển thị ở mọi màn hình bên trong App" |
| BR-INTEL-010 | Profile displays read-only user info: name, unit, extension, role | Validation | [M1-F005] | Low | single-feature | explicit: "Tên nhân viên Đơn vị công tác Extension nội bộ" |
| BR-INTEL-011 | Task list shows only tasks assigned to the currently logged-in user | Authorization | [M2-F001] | High | single-feature | implied: §4.4 "Nhận các nhiệm vụ xử lý sự cố" — user receives own assignments |
| BR-INTEL-012 | Task list must load within 3 seconds | Validation | [M2-F001] | Medium | single-feature | explicit: "Tải danh sách công việc < 3 giây" |
| BR-INTEL-013 | Task detail must display incident handling script (phuong an xu ly) provided by TMC | Validation | [M2-F002] | High | single-feature | explicit: "scriptName Phương án xử lý" |
| BR-INTEL-014 | Task detail must show all incident profile fields from ITS API | Validation | [M2-F002] | Medium | single-feature | implied: §5 Incident Profile API fields table (20+ fields) |
| BR-INTEL-015 | Task status transitions must follow strict sequence: 1 (Da nhan) -> 2 (Dang xu ly) -> 3 (Hoan thanh) | State-transition | [M2-F003] | High | single-feature | explicit: "Đã nhận nhiệm vụ: 1 Đang xử lý: 2 Kết quả xử lý: 3" |
| BR-INTEL-016 | Status cannot be reverted once advanced (no backward transitions) | State-transition | [M2-F003] | High | single-feature | implied: §4.4+§5 status update is unidirectional (no mention of rollback) |
| BR-INTEL-017 | Field notes (ghi chu hien truong) can be added during status update | Validation | [M2-F003] | Medium | single-feature | explicit: "Ghi chú hiện trường" |
| BR-INTEL-018 | Status update must sync to ITS backend in real-time | Notification | [M2-F003] | High | single-feature | implied: §5 step 6 "Trung tâm điều hành theo dõi tiến độ xử lý trên hệ thống ITS" |
| BR-INTEL-019 | Field photos can optionally be attached during task processing | Validation | [M2-F004] | Medium | single-feature | explicit: "Đính kèm ảnh hiện trường (nếu cần)" |
| BR-INTEL-020 | Photos must be captured from device camera (not gallery selection implied by wireframe camera button) | Validation | [M2-F004] | Low | single-feature | implied: wireframe TaskDetailView shows camera icon with "Chụp ảnh" label |
| BR-INTEL-021 | Incident/event info is received from ITS system in real-time (push or polling) | Notification | [M2-F005] | High | single-feature | explicit: "Ứng dụng nhận thông tin sự cố từ hệ thống ITS" |
| BR-INTEL-022 | Incident severity has 3 levels: Nhe, Trung binh, Nghiem trong | Validation | [M2-F005, M2-F001, M2-F002] | Medium | cross-cutting | explicit: "Nhẹ / Trung bình / Nghiêm trọng" |
| BR-INTEL-023 | Push notifications must be delivered for 4 event types: task assignment, task status change, system alerts, TMC broadcasts | Notification | [M3-F001] | High | single-feature | explicit: "Phân công công việc Cập nhật trạng thái công việc Thông báo hệ thống Thông báo từ Trung tâm điều hành" |
| BR-INTEL-024 | Push notification must work even when app is in background | Notification | [M3-F001] | High | single-feature | implied: standard push notification behavior for mobile incident response app |
| BR-INTEL-025 | Notifications displayed in reverse chronological order with unread badge | Validation | [M3-F002] | Low | single-feature | implied: wireframe NotificationsView shows time ordering + unread visual indicator |
| BR-INTEL-026 | User can toggle notification read/unread status | State-transition | [M3-F003] | Low | single-feature | explicit: "Đánh dấu: Đã đọc Chưa đọc" |
| BR-INTEL-027 | Application must support both iOS and Android platforms | Validation | [M1-F001, M1-F003, M1-F004, M2-F001, M2-F003, M3-F001] | High | cross-cutting | explicit: "Ứng dụng được phát triển cho hai nền tảng iOS và Android" |

## 6. Entity Model

```yaml
entities:
  - name: NguoiDung
    key-fields: [id, tai_khoan, extension_pbx, ten_nhan_vien, don_vi, chuc_vu]
    field-types:
      id: BIGINT PK AUTO
      tai_khoan: VARCHAR(50) UNIQUE
      extension_pbx: VARCHAR(10) UNIQUE
      mat_khau: VARCHAR(255)
      ten_nhan_vien: VARCHAR(100)
      don_vi: VARCHAR(100)
      chuc_vu: VARCHAR(50)
    pii-fields: []
    source: explicit §3 + §4.1

  - name: PhienDangNhap
    key-fields: [id, nguoi_dung_id, token, thoi_gian_tao, trang_thai]
    field-types:
      id: BIGINT PK AUTO
      nguoi_dung_id: BIGINT FK
      token: VARCHAR(500) UNIQUE
      thoi_gian_tao: TIMESTAMP
      thoi_gian_het_han: TIMESTAMP
      trang_thai: "ENUM('active','expired')"
    pii-fields: []
    source: implied §4.1 "Lưu phiên đăng nhập" + §6 "Token session"

  - name: NhiemVu
    key-fields: [id, code, name, loai_su_co, muc_do, vi_tri_km, trang_thai, ho_so_su_co_id]
    field-types:
      id: BIGINT PK AUTO
      code: VARCHAR(20) UNIQUE
      name: VARCHAR(200)
      description: TEXT
      loai_su_co: VARCHAR(100)
      muc_do: "ENUM('Nhe','TrungBinh','NghiemTrong')"
      vi_tri_km: VARCHAR(20)
      huong: VARCHAR(50)
      thoi_gian_phat_hien: TIMESTAMP
      trang_thai: "ENUM('ChuaXuLy','DaNhan','DangXuLy','HoanThanh')"
      mo_ta: TEXT
      ghi_chu_hien_truong: TEXT
      ho_so_su_co_id: BIGINT FK
      organization_id: BIGINT FK
      order_number: INT
      start_date: TIMESTAMP
      end_date: TIMESTAMP
      plan_end_date: TIMESTAMP
    pii-fields: []
    source: explicit §4.4 task fields table + §4.5 API fields table

  - name: HoSoSuCo
    key-fields: [id, code, timeDetect, direction, positionKM, positionM, status, typeEventName, level]
    field-types:
      id: BIGINT PK AUTO
      code: VARCHAR(20) UNIQUE
      timeDetect: TIMESTAMP
      direction: VARCHAR(50)
      positionKM: VARCHAR(20)
      positionM: VARCHAR(10)
      description: TEXT
      status: VARCHAR(20)
      typeEventName: VARCHAR(100)
      source: VARCHAR(100)
      pathFile: VARCHAR(500)
      creationTime: TIMESTAMP
      scriptId: BIGINT FK
      beginInfomation: TEXT
      level: "ENUM('Nhe','TrungBinh','NghiemTrong')"
      reason: TEXT
      resultPolice: TEXT
      damage: TEXT
      startProcessTime: TIMESTAMP
      endProcessTime: TIMESTAMP
      scriptName: VARCHAR(200)
    pii-fields: []
    source: explicit §5 Incident Profile API fields

  - name: SuKienTuyenDuong
    key-fields: [id, title, location, time, tag]
    field-types:
      id: BIGINT PK AUTO
      title: VARCHAR(200)
      location: VARCHAR(100)
      time: VARCHAR(50)
      tag: VARCHAR(50)
    pii-fields: []
    source: implied wireframe UI.jsx events mock data

  - name: AnhHienTruong
    key-fields: [id, nhiem_vu_id, file_path, uploaded_at]
    field-types:
      id: BIGINT PK AUTO
      nhiem_vu_id: BIGINT FK
      file_path: VARCHAR(500)
      file_size: INT
      uploaded_at: TIMESTAMP
    pii-fields: []
    source: explicit §4.4 "Đính kèm ảnh hiện trường"

  - name: ThongBao
    key-fields: [id, title, description, thoi_gian, loai, da_doc, nguoi_nhan_id]
    field-types:
      id: BIGINT PK AUTO
      title: VARCHAR(200)
      description: TEXT
      thoi_gian: TIMESTAMP
      loai: "ENUM('PhanCong','CapNhatTrangThai','HeThong','TMC')"
      da_doc: BOOLEAN DEFAULT false
      nguoi_nhan_id: BIGINT FK
      nhiem_vu_id: BIGINT FK NULLABLE
    pii-fields: []
    source: explicit §4.5 notification types + API fields

relationships:
  - from: NguoiDung
    to: PhienDangNhap
    cardinality: "1:N"
    fk: PhienDangNhap.nguoi_dung_id
    source: implied §4.1 session management

  - from: NguoiDung
    to: NhiemVu
    cardinality: "N:N"
    fk: NhiemVu.users (junction table NhiemVu_NguoiDung)
    source: explicit §4.5 "users Người thực hiện"

  - from: HoSoSuCo
    to: NhiemVu
    cardinality: "1:N"
    fk: NhiemVu.ho_so_su_co_id
    source: implied §5 — task is created from incident profile

  - from: NhiemVu
    to: AnhHienTruong
    cardinality: "1:N"
    fk: AnhHienTruong.nhiem_vu_id
    source: explicit §4.4 "Đính kèm ảnh hiện trường"

  - from: NguoiDung
    to: ThongBao
    cardinality: "1:N"
    fk: ThongBao.nguoi_nhan_id
    source: implied §4.5 notifications sent to specific user

  - from: NhiemVu
    to: ThongBao
    cardinality: "1:N"
    fk: ThongBao.nhiem_vu_id
    source: implied §4.5 "Phân công công việc" notification links to task

state-machines:
  - entity: NhiemVu
    states: [ChuaXuLy, DaNhan, DangXuLy, HoanThanh]
    transitions:
      - ChuaXuLy->DaNhan: "User taps 'Da nhan' (1)" [guard: task assigned to current user]
      - DaNhan->DangXuLy: "User taps 'Dang xu ly' (2)" [guard: user is assigned]
      - DangXuLy->HoanThanh: "User taps 'Hoan thanh' (3)" [guard: user is assigned]
```

## 7. UI Screen Inventory

| # | Path | Title | Type | Module | Feature | Key fields | Actions | OCR confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | wireframe:UI.jsx#LoginView | Dang nhap he thong | auth | M1 | M1-F001 | tai_khoan, extension_pbx, mat_khau | DANG NHAP | high |
| 2 | wireframe:UI.jsx#TaskListView | Nhiem vu + Su kien tren tuyen | list | M2 | M2-F001, M2-F005 | code, type, level, location, time, status | Tap card -> detail | high |
| 3 | wireframe:UI.jsx#TaskDetailView | Chi tiet su co | detail | M2 | M2-F002, M2-F003, M2-F004 | level, id, type, location, direction, description, script | Da nhan, Dang xu ly, Hoan thanh, Chup anh, CAP NHAT KET QUA, PhoneCall | high |
| 4 | wireframe:UI.jsx#CallsView | Lien lac PBX | list | M1 | M1-F003 | name, extension, online_status | Goi (phone), Xem tat ca | high |
| 5 | wireframe:UI.jsx#NotificationsView | Thong bao | list | M3 | M3-F001, M3-F002, M3-F003 | title, desc, time, unread | Tap notification | high |
| 6 | wireframe:UI.jsx#ProfileView | Ca nhan | settings | M1 | M1-F002, M1-F005 | ten_nhan_vien, chuc_vu, extension, don_vi | Dang xuat he thong | high |
| 7 | wireframe:SOS_FAB | SOS Hotline | modal-form | M1 | M1-F004 | sos_hotline_number | SOS call trigger | high |

## 8. Integration & Technical Flags

| From (module/actor) | To | Direction | Protocol | Data exchanged | Confidence | Flag-for-sa |
|---|---|---|---|---|---|---|
| Mobile App (M1) | He thong tong dai PBX | bidir | SIP/VoIP | Call signaling, extension auth, presence status, call history | High | async |
| Mobile App (M2) | He thong ITS tuyen (TMS) | bidir | REST API (HTTPS) | Incident profiles (20+ fields), task list, task status updates, photo uploads | High | none |
| Mobile App (M3) | Push Notification Service | in | FCM/APNs | Notification payloads (title, desc, type, task ref) | High | async |
| Mobile App (M1-F004) | GSM Network | out | GSM (native dialer) | SOS call to preconfigured hotline number | High | none |

## 9. NFR Signals

| Area | Requirement | Target | Source |
|---|---|---|---|
| Performance | Task list loading time | < 3 seconds | explicit: "Tải danh sách công việc < 3 giây" |
| Offline | SOS call capability without internet | Must work on GSM only | explicit: "Cho phép gọi SOS khi mất internet" |
| Security | Authentication model | Internal accounts with HTTPS + token session | explicit: "Xác thực người dùng HTTPS Token session" |
| Platform | Cross-platform support | iOS + Android | explicit: "iOS Android" |
| Extensibility | Future camera/GPS integration | Planned but not in current scope | explicit: "Tích hợp thêm camera / GPS" |
| UI | Primary brand color | #0097F0 | explicit: "Mong muốn màu sắc chủ đạo của ứng dụng là màu #0097F0" |

## 10. Validation Findings (4-lens self-check)

| Lens | Issues found | Impact | Sections updated |
|---|---|---|---|
| Domain Analyst | 1 — Event entity (SuKienTuyenDuong) only in wireframe, not detailed in spec | Low — need to confirm if events feed is separate from incidents | §6 |
| Designer | 1 — Dashboard screen mentioned in §7 but not detailed in spec or wireframe (TaskListView serves as de facto dashboard) | Low — clarify if separate dashboard needed | §7, §11 |
| SA | 2 — PBX SIP integration lacks auth details (how extension auth works); ITS API auth mechanism not specified | Medium — SA needs to design PBX SIP auth flow | §8, §11 |
| Security | 1 — Token session mentioned but no token refresh/expiry strategy defined | Medium — need to define token lifecycle | §5, §11 |

## 11. Ambiguities

| ID | Severity | Description | Question | Options | Impact-if-wrong | Needs |
|---|---|---|---|---|---|---|
| GAP-001 | Blocking | PBX SIP authentication mechanism undefined | How does the mobile app authenticate with PBX for VoIP calls? Is Extension+password sufficient or does it need SIP credentials? | A: Extension+password from login; B: Separate SIP credentials; C: Token-based SIP auth | Wrong auth model = redesign VoIP integration | SA + PBX vendor |
| GAP-002 | Blocking | ITS API authentication and base URL not specified | What is the ITS API authentication mechanism? OAuth2, API key, or same user token? | A: Same token from login; B: Separate API key; C: OAuth2 | Wrong API auth = all M2 features broken | SA + ITS team |
| GAP-003 | Blocking | Task assignment model unclear — push or pull | Does the mobile app poll for new tasks or does ITS push via WebSocket/SSE? | A: REST polling; B: WebSocket push; C: Push notification triggers fetch | Affects real-time responsiveness and architecture | SA |
| GAP-004 | Non-blocking | Dashboard screen vs TaskListView | Spec §7 lists "Dashboard" as separate screen but wireframe uses TaskListView as landing screen. Are these the same? | A: TaskListView IS the dashboard; B: Separate dashboard with summary stats needed | Minor — TaskListView as dashboard is reasonable default | PO |
| GAP-005 | Non-blocking | Photo upload — camera only or gallery too? | Wireframe shows camera button. Can user also select from photo gallery? | A: Camera only; B: Camera + gallery | Minor UX difference | PO |
| GAP-006 | Non-blocking | Call history scope — local or synced | Is call history stored locally on device or synced from PBX server? | A: Local device only; B: Synced from PBX | Affects data model and offline behavior | SA + PBX vendor |
| GAP-007 | Non-blocking | Offline data caching — tasks viewable offline? | Can field staff view previously loaded tasks when offline? | A: No offline cache; B: Cache last-fetched task list | Could affect field operations in poor coverage areas | PO |
| GAP-008 | Unresolvable | ITS API endpoint documentation | Full API specification for ITS backend integration is needed | N/A | Cannot implement M2 features without API spec | artifact: ITS API documentation |

## 12. Recommended Pipeline Configuration

```yaml
recommended-path: M
rationale: "Mobile app with VoIP/SIP integration and real-time incident management needs SA for integration design; 7 screens need designer"
risk-score: 3
conditional-stages:
  designer: true   # 7 screens with brand color requirement + mobile UX
  sa: true         # PBX SIP + ITS API + push notification integrations
  security-design: false  # no PII, internal-only app
  security-review: true   # auth + token session needs review
  devops: false    # standard mobile app deployment
  data-governance: false  # no PII, no cross-system data sharing
output-mode: lean
```

## 13. SDLC Agent Insights (Opus-powered analysis)

### 13.1 For Analyst
- **Implicit user stories**:
  - "As a field operator, I want to see which tasks are urgent vs routine, so I can prioritize my response" — inferred from severity levels (Nhe/TrungBinh/NghiemTrong) showing in task list
  - "As a TMC operator, I want to know when a field operator has received my task, so I can escalate if no response within SLA" — inferred from status tracking flow
  - "As a field operator, I want my app to reconnect and sync after returning from a dead zone, so I do not lose status updates" — inferred from offline SOS requirement + expressway coverage gaps
- **Risk-sensitive features**:
  - M2-F003 (status update) — core operational feature; wrong status = TMC makes wrong decisions
  - M1-F004 (SOS) — safety-critical; must work 100% without internet

### 13.2 For SA
- **Recommended architectural patterns**:
  - SIP.js or react-native-voip for PBX integration (WebRTC + SIP in mobile)
  - Optimistic UI for status updates with background sync (field may have intermittent connectivity)
  - FCM/APNs for push notifications with silent push to trigger task list refresh
- **Anti-pattern warnings**:
  - Risk: Polling ITS API on timer drains mobile battery; prefer push notification + on-demand fetch
  - Risk: Large incident profile payload (20+ fields) on slow 3G; implement field-selective API or pagination
  - Risk: SIP registration on mobile is fragile (NAT traversal, keep-alive); need SRTP + ICE/STUN/TURN
- **Scalability predictions**:
  - Bottleneck: concurrent SIP registrations if 200 users online; PBX must support this capacity
  - Hot endpoint: task status update during peak incident hours (rush hour accidents)

### 13.3 For Tech-lead
- **Complexity hints per feature**:
  - M1-F003: complexity=HIGH — SIP/VoIP integration on mobile is notoriously hard (NAT, codec, connectivity)
  - M1-F004: complexity=MEDIUM — GSM dial is native but need iOS/Android permission handling
  - M2-F003: complexity=MEDIUM — state machine with sync; need conflict resolution for offline updates
  - M2-F004: complexity=LOW — standard camera capture + file upload
  - M3-F001: complexity=MEDIUM — FCM/APNs setup + background notification handling
- **Risk per feature**:
  - M1-F003: risk=HIGH — PBX vendor compatibility unknown (GAP-001)
  - M2-F001, M2-F002: risk=HIGH — ITS API spec missing (GAP-008)
- **Parallelization hints**:
  - M1-F001 (auth) must be first — all other features depend on it
  - M1-F003 (VoIP) and M2-F001 (task list) are independent — parallel wave safe
  - M3-F001 (push) depends on M2 entities (task reference in notifications)
- **Tasks likely missed**:
  - SIP/VoIP library evaluation and spike (2-3 days before dev starts)
  - Push notification certificate setup (APNs) + FCM project config
  - PBX vendor coordination for SIP credentials and testing environment
  - Offline queue mechanism for status updates made without connectivity

### 13.4 For Dev
- **Code patterns to use**:
  - React Native: use `react-native-callkeep` for VoIP call management (call screen when app backgrounded)
  - Use `@react-native-firebase/messaging` for FCM push notifications
  - State machine for task status: use XState or simple reducer with guard conditions
  - Image upload: use multipart/form-data with progress indicator for field photos
- **Library recommendations**:
  - `react-native-sip` or `JsSIP` for SIP/VoIP (evaluate both during spike)
  - `react-native-camera` for photo capture
  - `@react-native-async-storage/async-storage` for session persistence
  - `react-native-permissions` for camera, microphone, phone call permissions
- **Common pitfalls for this feature type**:
  - VoIP on iOS: must use PushKit + CallKit for incoming calls to work in background
  - VoIP on Android: need foreground service for SIP registration keep-alive
  - GSM SOS call: iOS restricts programmatic dialing — must use `tel:` URL scheme with user confirmation
  - Photo upload on slow 3G: implement retry with exponential backoff
  - Vietnamese text in API responses: ensure UTF-8 encoding throughout

### 13.5 For QA
- **Test strategy ratios**:
  - Path M: unit 50% / integration 35% / e2e 15%
  - VoIP calls: heavy integration testing with PBX sandbox
  - SOS offline: dedicated device testing (airplane mode + GSM only)
- **Test data**: see `test-data-hints.md`
- **Critical edge cases**:
  - SOS call while VoIP call is active (call interruption handling)
  - Status update submitted offline, then sync when back online (conflict with TMC update)
  - Push notification received while app is killed (cold start from notification)
  - Multiple tasks assigned simultaneously (notification flood)
  - PBX connection lost mid-call (reconnection behavior)
  - Login with wrong extension but correct system account (partial auth)
  - Task status update on a task that TMC has already reassigned to another user
- **Performance test hints**:
  - SLA: task list load < 3 seconds on 3G connection
  - VoIP call setup latency < 5 seconds
  - Push notification delivery < 10 seconds from TMC action

### 13.6 For Reviewer — Definition of Done (per feature)

```
[ ] All ACs from BA spec implemented and tested
[ ] All business rules in applied-rules list have unit tests
[ ] Entity matches SA ER design (cardinality respected)
[ ] Validations match doc-brief field constraints
[ ] Priority respected in delivery order
[ ] Out-of-scope items NOT implemented (check against explicit list)
[ ] API responses < SLA suggested in 13.5
[ ] Error messages in Vietnamese, no English leaks
[ ] Both iOS and Android tested (BR-INTEL-027)
[ ] Offline SOS tested on physical device
[ ] Permission prompts handled gracefully (camera, microphone, phone)
[ ] No secrets in code/config (SIP credentials, API keys)
[ ] README/CHANGELOG updated
```

### 13.7 For Security
- **Threat model (inferred attack surface)**:
  - Token theft: if token intercepted, attacker can update task status — enforce HTTPS everywhere + token expiry
  - SIP credential exposure: SIP auth stored on device — encrypt at rest
  - Unauthorized task status update: validate user-task assignment server-side before accepting status change
  - Push notification spoofing: validate FCM/APNs sender identity
- **Exposure risks**:
  - Extension numbers in directory could be used for social engineering
  - Photo uploads may contain location EXIF data — strip or preserve intentionally
  - Call history on device — clear on logout

### 13.8 Confidence notes on insights

These insights are Opus INFERENCES, not explicit requirements. Agents should:
- Treat as starting points, verify against source before adopting
- Flag [OPUS-HINT] when using, so reviewer knows provenance
- Reject if conflicts with explicit BA spec
- VoIP/SIP recommendations are particularly uncertain — require spike with actual PBX hardware
