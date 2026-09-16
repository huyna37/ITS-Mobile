# ITS Mobile VEC — Ứng dụng di động vận hành ITS

## Tổng quan hệ thống

**ITS Mobile VEC** là ứng dụng di động dành cho nhân viên vận hành hiện trường tuyến đường cao tốc Nội Bài – Lào Cai (VEC). Ứng dụng kết nối nhân viên tuần tra và cứu hộ với Trung tâm điều hành (TMC) và hệ thống ITS, cho phép nhận nhiệm vụ theo thời gian thực, liên lạc nội bộ qua VoIP và báo cáo tình trạng xử lý sự cố từ hiện trường.

## Vấn đề giải quyết

Nhân viên hiện trường trên tuyến Nội Bài – Lào Cai hiện thiếu công cụ di động để nhận phân công sự cố theo thời gian thực, liên lạc với TMC và cập nhật trạng thái xử lý từ hiện trường — dẫn đến điều phối thủ công qua điện thoại và phản ứng chậm khi xảy ra sự cố.

## Đối tượng sử dụng

| Người dùng | Loại | Phạm vi |
|---|---|---|
| Nhân viên vận hành hiện trường | Human — primary | Toàn bộ app |
| Điều hành viên TMC | Human — external | Hệ thống TMC riêng (không dùng app này) |
| Hệ thống ITS tuyến (TMS) | System | REST API provider |
| Tổng đài PBX/SIP | System | VoIP provider |

## Kiến trúc nhanh

```
[Nhân viên hiện trường] ←→ [ITS Mobile VEC App]
                                    │
                     ┌──────────────┼──────────────┐
                     ▼             ▼               ▼
              [ITS REST API] [PBX SIP Server] [FCM/APNs Push]
                     │
              [TMC Operator]
```

- **Frontend:** React Native (iOS + Android) — prototype: React 18 + Vite
- **Auth:** JWT session (dual credential: tài khoản + extension PBX)
- **Giao tiếp:** REST API + SIP/VoIP + FCM/APNs push + GSM SOS

## Tính năng chính

### Module M1 — Xác thực và Liên lạc (5 features)
- Đăng nhập bằng tài khoản hệ thống + extension PBX
- Gọi nội bộ VoIP qua tổng đài PBX
- Gọi khẩn cấp SOS qua GSM (hoạt động khi mất internet)
- Hiển thị thông tin cá nhân và đăng xuất

### Module M2 — Quản lý Sự cố và Nhiệm vụ (5 features)
- Xem danh sách nhiệm vụ được phân công
- Xem chi tiết sự cố + phương án xử lý từ ITS
- Cập nhật trạng thái xử lý (Đã nhận → Đang xử lý → Hoàn thành)
- Đính kèm ảnh/video hiện trường và gửi báo cáo về TMC
- Theo dõi sự cố/sự kiện trên tuyến theo thời gian thực

### Module M3 — Thông báo (3 features)
- Nhận push notification từ TMC (phân công, cảnh báo, hệ thống)
- Xem danh sách thông báo với badge chưa đọc
- Đánh dấu đã đọc / chưa đọc

## Tài liệu kỹ thuật

| Tài liệu | Đường dẫn |
|---|---|
| Kiến trúc hệ thống | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| Luồng nghiệp vụ | [docs/business-flows.md](business-flows.md) |
| Mô hình dữ liệu | [docs/data-model.md](data-model.md) |
| Bảo mật và phân quyền | [docs/security-overview.md](security-overview.md) |
| Feature M1 — Auth + Calls | [docs/features/ITSM-20260429-001/feature-brief.md](features/ITSM-20260429-001/feature-brief.md) |
| Feature M2 — Task Mgmt | [docs/features/ITSM-20260429-002/feature-brief.md](features/ITSM-20260429-002/feature-brief.md) |
| Feature M3 — Notifications | [docs/features/ITSM-20260429-003/feature-brief.md](features/ITSM-20260429-003/feature-brief.md) |

## Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| UI Prototype (React Web) | ✅ Hoàn chỉnh — 6 screens, 13 features UI |
| API Integration | ❌ Chưa kết nối — tất cả dữ liệu mock |
| SIP/VoIP | ❌ Chưa tích hợp — mock call history |
| FCM/APNs Push | ❌ Chưa tích hợp — mock notifications |
| React Native port | 📋 Kế hoạch — production target |
| Testing | ❌ Không có test files trong prototype |

## Yêu cầu môi trường (Prototype)

```bash
node >= 18
npm install
npm run dev    # localhost:5173
```

## Ngữ cảnh dự án

- **Khách hàng:** VEC (Tổng công ty đường cao tốc Việt Nam)
- **Tuyến vận hành:** Nội Bài – Lào Cai Expressway
- **Quy mô:** ~50-200 nhân viên hiện trường, ~10-50 sự cố/ngày
- **Nền tảng đích:** iOS + Android native app
