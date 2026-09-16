# Business Flows — ITS Mobile VEC

## BF-001: Xử lý sự cố từ đầu đến cuối

**Mô tả:** Luồng chính từ khi TMC phát hiện sự cố đến khi nhân viên hiện trường hoàn thành xử lý.

**Tác nhân:** Nhân viên hiện trường, Điều hành viên TMC, Hệ thống ITS, PBX

### Luồng chính

```
1. [ITS Backend] Phát hiện sự cố → tạo HoSoSuCo
2. [TMC Operator] Xem sự cố → tạo NhiemVu → phân công cho nhân viên
3. [ITS Backend] Kích hoạt FCM/APNs → push notification đến thiết bị nhân viên
4. [Field Op] Nhận thông báo → mở app
5. [App] Tải danh sách nhiệm vụ (GET /tasks)
6. [Field Op] Xem chi tiết sự cố + phương án xử lý
7. [Field Op] Tap "Đã nhận (1)" → trạng thái: DaNhan
8. [App] PATCH /tasks/:id/status {status: 1} → ITS Backend
9. [Field Op] Di chuyển đến hiện trường
10. [Field Op] Tap "Đang xử lý (2)"
11. [App] PATCH /tasks/:id/status {status: 2}
12. [Field Op] Chụp ảnh hiện trường → đính kèm
13. [App] POST /tasks/:id/media (multipart)
14. [Field Op] Nhập ghi chú hiện trường
15. [Field Op] Tap "Hoàn thành (3)" + "Gửi báo cáo về TMC"
16. [App] PATCH /tasks/:id/status {status: 3} + POST /tasks/:id/report
17. [ITS Backend] Cập nhật dashboard TMC → nhiệm vụ hoàn thành
```

**Business rules:** BR-INTEL-011, 012, 015, 016, 017, 018, 019, 020
**Status machine:** ChuaXuLy → DaNhan(1) → DangXuLy(2) → HoanThanh(3) — không bỏ bước, không lùi

---

## BF-002: Đăng nhập và khởi động ứng dụng

**Mô tả:** Nhân viên hiện trường xác thực vào hệ thống với tài khoản kép (account + extension PBX).

### Luồng chính

```
1. [Field Op] Mở app
2. [App] Kiểm tra session trong AsyncStorage
3a. [Session tồn tại] → Khôi phục session → vào tab Liên lạc (default)
3b. [Không có session] → Hiển thị LoginView
4. [Field Op] Nhập: Tài khoản nội bộ + Extension PBX (4 số) + Mật khẩu
5. [App] Validate client-side: required fields + extension = 4 chữ số
6. [App] POST /auth/login → ITS Backend
7. [ITS Backend] Xác thực → trả JWT token + profile
8. [App] Lưu session vào AsyncStorage (its_session_v1)
9. [App] Navigate đến tab Liên lạc (Danh bạ)
10. [SIP Client] REGISTER extension với PBX server
```

**Business rules:** BR-INTEL-001, 002, 003
**Open:** GAP-001 (SIP credential strategy)

---

## BF-003: Thực hiện cuộc gọi nội bộ VoIP

**Mô tả:** Nhân viên gọi nội bộ cho đồng nghiệp hoặc TMC qua tổng đài PBX.

### Luồng chính

```
1. [Field Op] Mở tab Liên lạc → sub-tab Danh bạ
2. [App] Tải danh bạ từ PBX (tên, extension, online/offline status)
3. [Field Op] Xem online status → chọn contact → tap icon Gọi
4. [App / SIP Client] SIP INVITE → PBX
5. [PBX] Forward INVITE đến extension người nhận → 180 Ringing
6. [Field Op] Nghe chuông chờ kết nối
7a. [Người nhận bắt máy] → RTP audio stream → cuộc gọi kết nối
7b. [Người nhận không bắt máy] → 408 Timeout → trạng thái missed
8. [Field Op] Kết thúc cuộc gọi
9. [SIP Client] SIP BYE
10. [App] Ghi lịch sử cuộc gọi (extension, tên, thời gian, trạng thái)
```

**Business rules:** BR-INTEL-005, 006, 007
**Open:** GAP-001 (SIP auth), GAP-006 (call history: local vs PBX sync)

---

## BF-004: Gọi khẩn cấp SOS

**Mô tả:** Nhân viên gọi đường dây khẩn cấp qua mạng GSM — hoạt động ngay cả khi không có internet.

### Luồng chính

```
1. [Field Op] Tap nút SOS đỏ (floating button — luôn hiển thị)
2. [App] Hiển thị dialog xác nhận
3. [Field Op] Tap "Xác nhận gọi"
4. [App] Mở native dialer với số SOS_TEL (VITE_SOS_TEL hoặc mặc định 113)
5. [OS] Thực hiện cuộc gọi GSM (không qua internet)
```

**Business rules:** BR-INTEL-008 (no internet needed), BR-INTEL-009 (always visible)
**NFR:** SOS button phải hiển thị trên MỌI màn hình trong app (Z-50, absolute position)

---

## BF-005: Nhận và xem thông báo push

**Mô tả:** Nhân viên nhận thông báo từ TMC về nhiệm vụ mới, cảnh báo, hệ thống.

### Luồng chính

```
1. [ITS/TMC Backend] Sự kiện trigger → gọi FCM/APNs API
2. [FCM/APNs] Gửi push đến thiết bị nhân viên
3a. [App đang foreground] → Push handler → cập nhật notification list
3b. [App ở background] → System notification → tap → mở app → deep-link đến TaskDetailView (nếu PhanCong type)
3c. [App bị killed] → Cold start từ notification → mở app → deep-link
4. [Field Op] Mở tab Thông báo → xem danh sách (mới nhất trước)
5. [Field Op] Tap thông báo → auto-mark đã đọc
6. [Field Op] Đánh dấu thủ công đã đọc / chưa đọc
```

**Business rules:** BR-INTEL-023, 024, 025, 026
**4 loại notification:** PhanCong (phân công nhiệm vụ), CapNhatTrangThai (cập nhật trạng thái), HeThong (hệ thống), TMC (điều hành gửi)

---

## BF-006: Theo dõi sự kiện trên tuyến

**Mô tả:** Nhân viên xem các sự cố và sự kiện đang diễn ra trên tuyến (bảo trì, thời tiết, tắc đường).

### Luồng chính

```
1. [Field Op] Mở tab Công việc
2. [App] Tải dữ liệu nhiệm vụ + sự kiện từ ITS API
3. [App] Hiển thị section "Sự kiện trên tuyến" (Construction, CloudRain, etc.)
4. [Field Op] Xem danh sách sự kiện: tiêu đề, vị trí, thời gian, tag
```

**Data source:** ITS Backend (real-time push or polling — GAP-003)
**Business rules:** BR-INTEL-021, 022
