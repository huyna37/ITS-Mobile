# System Context Diagram — ITS Mobile VEC

## C4 Level 1: System Context

```mermaid
C4Context
  title System Context — ITS Mobile VEC (Ứng dụng vận hành hiện trường)

  Person(fieldOp, "Nhân viên hiện trường", "Nhân viên tuần tra/cứu hộ tuyến NB-LC. Sử dụng app để nhận nhiệm vụ, liên lạc, báo cáo sự cố.")
  Person(tmcOp, "Điều hành viên TMC", "Tạo và phân công nhiệm vụ xử lý sự cố. Sử dụng hệ thống TMC riêng (không dùng app này).")

  System(mobileApp, "ITS Mobile VEC", "Ứng dụng di động iOS/Android cho nhân viên hiện trường. Nhận nhiệm vụ, VoIP nội bộ, cập nhật trạng thái, báo cáo ảnh.")

  System_Ext(itsBackend, "ITS Backend (TMS)", "Hệ thống quản lý giao thông thông minh. Lưu trữ sự cố, cung cấp REST API, nhận cập nhật trạng thái.")
  System_Ext(pbxSystem, "Tổng đài PBX / SIP Server", "Hệ thống tổng đài nội bộ VEC. Định tuyến cuộc gọi VoIP/SIP, quản lý extension.")
  System_Ext(pushProvider, "FCM / APNs", "Firebase Cloud Messaging (Android) + Apple Push Notification Service (iOS). Gửi thông báo từ TMC đến thiết bị.")
  System_Ext(gsmNetwork, "Mạng GSM / Hotline khẩn cấp", "Mạng điện thoại di động cho cuộc gọi SOS (hoạt động không cần internet).")

  Rel(fieldOp, mobileApp, "Sử dụng", "iOS/Android")
  Rel(tmcOp, itsBackend, "Tạo nhiệm vụ, phân công, gửi thông báo", "Web UI/API")

  Rel(mobileApp, itsBackend, "Lấy danh sách/chi tiết nhiệm vụ, cập nhật trạng thái, upload ảnh", "HTTPS REST")
  Rel(itsBackend, mobileApp, "Push thông báo (gián tiếp qua FCM/APNs)", "FCM/APNs")
  Rel(mobileApp, pbxSystem, "Cuộc gọi VoIP nội bộ, xem danh bạ, trạng thái extension", "SIP/VoIP")
  Rel(pbxSystem, mobileApp, "Nhận cuộc gọi từ TMC/đồng nghiệp", "SIP/VoIP")
  Rel(pushProvider, mobileApp, "Push notification (phân công nhiệm vụ, cảnh báo)", "FCM/APNs")
  Rel(itsBackend, pushProvider, "Gửi push notification", "FCM HTTP v1 API")
  Rel(mobileApp, gsmNetwork, "Gọi SOS khẩn cấp (không cần internet)", "GSM tel: URI")
```

## System Actors Summary

| Actor | Role | Uses App? |
|---|---|---|
| Nhân viên hiện trường | Primary user — nhận nhiệm vụ, liên lạc, báo cáo | ✓ (this app) |
| Điều hành viên TMC | Tạo nhiệm vụ, giám sát | ✗ (TMC system) |
| ITS Backend | Cung cấp REST API, push notification trigger | System |
| PBX/SIP Server | Định tuyến VoIP | System |
| FCM/APNs | Delivery push notification | Infrastructure |
| Mạng GSM | SOS emergency call | Infrastructure |
