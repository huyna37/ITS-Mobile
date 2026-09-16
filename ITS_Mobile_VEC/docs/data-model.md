# Data Model — ITS Mobile VEC

## Entity Relationship Diagram

```mermaid
erDiagram
  NguoiDung {
    BIGINT id PK
    VARCHAR tai_khoan UK "50 chars, unique"
    VARCHAR extension_pbx UK "10 chars, 4 digits"
    VARCHAR mat_khau "bcrypt hashed"
    VARCHAR ten_nhan_vien "100 chars"
    VARCHAR don_vi "100 chars"
    VARCHAR chuc_vu "50 chars"
  }

  PhienDangNhap {
    BIGINT id PK
    BIGINT nguoi_dung_id FK
    VARCHAR token UK "500 chars, JWT"
    TIMESTAMP thoi_gian_tao
    TIMESTAMP thoi_gian_het_han
    ENUM trang_thai "active | expired"
  }

  DanhBaNguoiDung {
    BIGINT id PK
    VARCHAR ten "100 chars"
    VARCHAR extension UK "10 chars"
    BOOLEAN online_status "DEFAULT false"
    VARCHAR don_vi "100 chars"
  }

  LichSuCuocGoi {
    BIGINT id PK
    VARCHAR extension_nguoi_goi "10 chars"
    VARCHAR extension_nguoi_nhan "10 chars"
    VARCHAR ten_nguoi_goi "100 chars"
    VARCHAR ten_nguoi_nhan "100 chars"
    TIMESTAMP thoi_gian_goi
    INT thoi_luong "seconds, nullable"
    ENUM trang_thai "ringing | connected | ended | missed"
  }

  HoSoSuCo {
    BIGINT id PK
    VARCHAR code UK "20 chars"
    TIMESTAMP timeDetect
    VARCHAR positionKM "20 chars"
    ENUM level "Nhe | TrungBinh | NghiemTrong"
    ENUM status
    VARCHAR typeEventName "100 chars"
    VARCHAR scriptName "200 chars"
    VARCHAR pathFile "500 chars, nullable"
  }

  NhiemVu {
    BIGINT id PK
    VARCHAR code UK "20 chars"
    VARCHAR loai_su_co "100 chars"
    ENUM muc_do "Nhe | TrungBinh | NghiemTrong"
    VARCHAR vi_tri_km "20 chars"
    VARCHAR huong "50 chars, nullable"
    TIMESTAMP thoi_gian_phat_hien
    ENUM trang_thai "ChuaXuLy | DaNhan | DangXuLy | HoanThanh"
    TEXT ghi_chu_hien_truong "nullable"
    BIGINT ho_so_su_co_id FK
  }

  AnhHienTruong {
    BIGINT id PK
    BIGINT nhiem_vu_id FK
    VARCHAR file_path "500 chars"
    INT file_size "bytes, nullable"
    TIMESTAMP uploaded_at
    ENUM media_type "image | video"
  }

  ThongBao {
    BIGINT id PK
    VARCHAR title "200 chars"
    TEXT description "nullable"
    TIMESTAMP thoi_gian
    ENUM loai "PhanCong | CapNhatTrangThai | HeThong | TMC"
    BOOLEAN da_doc "DEFAULT false"
    BIGINT nguoi_nhan_id FK
    BIGINT nhiem_vu_id FK "nullable"
  }

  SuKienTuyenDuong {
    BIGINT id PK
    VARCHAR title "200 chars"
    VARCHAR location "100 chars"
    VARCHAR time_range "100 chars"
    ENUM tag "BaoTri | ThoiTiet | SuCo | CapNhat"
    ENUM status "DangDienRa | SapXayRa | DaKetThuc"
  }

  NguoiDung ||--o{ PhienDangNhap : "has sessions"
  NguoiDung ||--o{ LichSuCuocGoi : "makes calls (nguoi_goi)"
  HoSoSuCo ||--o{ NhiemVu : "generates tasks"
  NguoiDung }o--o{ NhiemVu : "assigned to (junction)"
  NhiemVu ||--o{ AnhHienTruong : "has field photos"
  NguoiDung ||--o{ ThongBao : "receives notifications"
  NhiemVu ||--o{ ThongBao : "referenced by notifications"
```

## Entity Catalog

### NguoiDung (User Account)
Tài khoản nhân viên hiện trường. Lưu tại ITS Backend.

| Field | Type | Constraint | Notes |
|---|---|---|---|
| tai_khoan | VARCHAR(50) | UNIQUE, NOT NULL | System username |
| extension_pbx | VARCHAR(10) | UNIQUE, NOT NULL | 4-digit PBX extension |
| mat_khau | VARCHAR(255) | NOT NULL | bcrypt hashed |
| ten_nhan_vien | VARCHAR(100) | | Full Vietnamese name |
| don_vi | VARCHAR(100) | | Work unit/team |
| chuc_vu | VARCHAR(50) | | Job title |

### PhienDangNhap (Session)
JWT session. Lưu in localStorage/AsyncStorage và server-side.

| Field | Type | Constraint | Notes |
|---|---|---|---|
| token | VARCHAR(500) | UNIQUE | JWT |
| trang_thai | ENUM | active/expired | State machine |

**State machine:** `active` → `expired` (logout hoặc TTL hết hạn)

### NhiemVu (Task/Assignment)
Nhiệm vụ xử lý sự cố được phân công. Lưu tại ITS Backend.

| Field | Type | Constraint | Notes |
|---|---|---|---|
| code | VARCHAR(20) | UNIQUE | e.g. TASK-8821 |
| loai_su_co | VARCHAR(100) | NOT NULL | Incident type |
| muc_do | ENUM | Nhe/TrungBinh/NghiemTrong | Severity |
| trang_thai | ENUM | ChuaXuLy/DaNhan/DangXuLy/HoanThanh | Status |

**State machine:**
```
ChuaXuLy → DaNhan(1) → DangXuLy(2) → HoanThanh(3)
(strict forward only, no skip, no rollback — BR-INTEL-015, 016)
```

### HoSoSuCo (Incident Profile)
Hồ sơ sự cố từ hệ thống ITS. Nguồn: ITS Backend API.

### AnhHienTruong (Field Media)
Ảnh/video do nhân viên chụp tại hiện trường. Upload lên ITS Backend.

### ThongBao (Notification)
Thông báo push. 4 loại: PhanCong, CapNhatTrangThai, HeThong, TMC.

### DanhBaNguoiDung (Directory)
Danh bạ nội bộ từ PBX. Online/offline status realtime.

### LichSuCuocGoi (Call History)
Lịch sử cuộc gọi VoIP. Source: PBX server (hoặc local device).

### SuKienTuyenDuong (Road Events)
Sự kiện trên tuyến (bảo trì, thời tiết). Nguồn: ITS Backend realtime.

## Client-side Storage

| Key | Type | Contents | Cleared |
|---|---|---|---|
| `its_session_v1` | localStorage/AsyncStorage | `{token, profile}` | On logout |
| `its_call_history_v1` | localStorage/AsyncStorage | `LichSuCuocGoi[]` | On logout |

## Data Classification

| Entity | PII fields | Sensitivity | Notes |
|---|---|---|---|
| NguoiDung | ten_nhan_vien, don_vi | Internal | No public PII |
| LichSuCuocGoi | ten_nguoi_goi/nhan, extension | Internal | Communications metadata |
| AnhHienTruong | file_path | Operational | May contain scene imagery |
| ThongBao | title, description | Operational | May contain incident details |

PII count: 0 public PII fields (no CCCD/CMND, no personal contact info).
All data is operational/internal to VEC highway operations.
