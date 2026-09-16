# Test Data Hints — ITS Mobile VEC

## NguoiDung (User)

### Happy path (from wireframe mock + synthesized)
| tai_khoan | extension_pbx | ten_nhan_vien | don_vi | chuc_vu |
|---|---|---|---|---|
| op001 | 8011 | Nguyen Van Van Hanh | Doi so 2 | Nhan vien tuan tra hien truong |
| op002 | 8012 | Tran Thi Binh | Doi so 2 | Nhan vien cuu ho |
| op003 | 8021 | Le Van Cuong | Doi tuan tra IC3 | Truong doi |
| tmc001 | 9901 | Pham Thi Dung | Trung tam dieu hanh (TMC) | Nhan vien dieu hanh |
| tmc002 | 9902 | Hoang Van Em | Trung tam dieu hanh (TMC) | Truong ca |

### Edge cases
- Vietnamese tonal marks in ten_nhan_vien: "Nguyễn Văn Vận Hành" (full diacritics)
- Maximum extension: 9999 (4 digits)
- Minimum extension: 1000
- Empty don_vi: should be rejected or show default

### Negative cases (should reject)
- Duplicate tai_khoan: "op001" already exists
- Invalid extension_pbx: "ABC" (non-numeric)
- Invalid extension_pbx: "12345" (5 digits, exceeds 4)
- Empty mat_khau
- Empty tai_khoan
- SQL injection in tai_khoan: "' OR 1=1 --"

## NhiemVu (Task/Incident)

### Happy path (from wireframe mock + spec)
| code | loai_su_co | muc_do | vi_tri_km | huong | trang_thai | mo_ta |
|---|---|---|---|---|---|---|
| TASK-8821 | Tai nan giao thong | NghiemTrong | Km 24+500 | Huong Lao Cai | DaNhan | Va cham giua 2 xe con, gay un tac nhe lane ngoai. |
| TASK-8825 | Xe hong hoc | TrungBinh | Km 158+200 | Huong Ha Noi | DangXuLy | Xe tai no lop, dung tai lan khan cap. |
| TASK-8830 | Vat can tren duong | Nhe | Km 45+100 | Huong Lao Cai | ChuaXuLy | Co vat roi tren lan 2. |
| TASK-8831 | Tai nan giao thong | NghiemTrong | Km 100+800 | Huong Ha Noi | HoanThanh | Lat xe tai, chiem 2 lan duong. |
| TASK-8832 | Su co ky thuat | TrungBinh | Km 67+300 | Huong Lao Cai | DangXuLy | Bien bao bi do, can thay the. |

### Edge cases
- Boundary vi_tri_km: "Km 0+000" (start of expressway)
- Boundary vi_tri_km: "Km 264+000" (approximate end NB-LC)
- Long mo_ta: 2000 chars (TEXT field, verify no truncation)
- Unicode in mo_ta: "Va chạm tại đoạn đường cong nguy hiểm 🚨" (with emoji)
- Task with no phuong_an_xu_ly (script null)

### Negative cases
- Invalid status transition: ChuaXuLy -> HoanThanh (skip DaNhan, DangXuLy)
- Invalid status transition: HoanThanh -> DangXuLy (backward)
- Status update on task not assigned to current user
- Duplicate code: "TASK-8821"

## HoSoSuCo (Incident Profile)

### Happy path (from spec API fields)
| code | typeEventName | level | direction | positionKM | positionM | status | scriptName |
|---|---|---|---|---|---|---|---|
| SC-2026-001 | Tai nan giao thong | NghiemTrong | Huong Lao Cai | 24 | 500 | DangXuLy | Phan luong tu xa, xe cuu ho IC3 xuat phat. |
| SC-2026-002 | Xe hong hoc | TrungBinh | Huong Ha Noi | 158 | 200 | DaNhan | Ho tro thay lop hoac keo ve tram dung nghi. |
| SC-2026-003 | Thoi tiet xau | Nhe | Ca hai huong | 40 | 0 | ChuaXuLy | Canh bao tai xe, giam toc do. |

## ThongBao (Notification)

### Happy path
| title | loai | da_doc | thoi_gian |
|---|---|---|---|
| Phan cong nhiem vu moi | PhanCong | false | 2026-04-29T14:20:00+07:00 |
| Cap nhat he thong | HeThong | true | 2026-04-29T12:00:00+07:00 |
| Su co Km 45+200 huong Ha Noi | TMC | false | 2026-04-29T14:10:00+07:00 |
| TASK-8821 da duoc xu ly | CapNhatTrangThai | true | 2026-04-29T13:00:00+07:00 |

## DanhBaNguoiDung (Contact Directory)

### Happy path (from wireframe mock)
| name | ext | online |
|---|---|---|
| Trung tam dieu hanh (TMC) | 9901 | true |
| Doi tuan tra IC3 | 8021 | true |
| Tram thu phi IC12 | 8501 | false |
| Ho tro ky thuat ITS | 8000 | true |

## Performance test fixtures
- Seed: 50 users across 5 units (10 users/unit)
- Task load: 100 active tasks across all users (average 2 per user)
- Notification volume: 500 notifications per user (pagination test)
- Stress: simultaneous status update from 20 users (concurrency test)
- Call volume: 10 concurrent SIP registrations (PBX capacity test)
