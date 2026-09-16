# PM · BA · SA — Chốt phương án triển khai (ITS Mobile VEC)

**Ngày:** 2026-04-30  
**Phạm vi:** M1 (xác thực & liên lạc), M2 (sự cố & nhiệm vụ), M3 (thông báo) — **demo UI web** đồng bộ shell một app trước khi port React Native.

---

## 1. Vai trò & vai trò quyết định

| Chủ đề | BA | SA | PM |
|---|---|---|---|
| User story / AC / GAP | Đề xuất & ghi nhận assumption | Kiến trúc & ràng buộc kỹ thuật | Path pipeline (M), ưu tiên wave, unblock |
| Auth ITS + JWT | GAP-002 mở | **Bearer JWT** cho mọi ITS REST; login HTTPS | Chấp nhận MVP một token session |
| PBX SIP (GAP-001) | Option A (extension + password trùng login) | SIP REGISTER dùng credential đó; **vendor PBX phải xác nhận** trước prod | Không chặn dev; gắn cờ rủi ro |
| Lịch sử cuộc gọi `ten_nguoi_nhan` (GAP-NEW-001) | Bổ sung field hiển thị | **Điền sau cuộc gọi:** lookup Danh bạ theo extension → cache tên; fallback `so_dien_thoai`/extension | Forward SA, không chặn designer |
| M2 push vs pull (GAP-003) | Mở | MVP: **kéo danh sách** ITS + polling/long polling tùy ITS; push sau | Ưu tiên ship list + refresh |
| M3 FCM/APNs | — | **Cùng JWT/subscription topic** sau khi login; Chi tiết bundle RN sau | Sau M1 shell |

---

## 2. Quyết định đã chốt cho dev

1. **Đăng nhập:** `POST /auth/login` (HTTPS TLS 1.2+) body `{ tai_khoan, extension_pbx, mat_khau }` → `{ access_token, expires_in, profile }`. Demo UI: mock success khi extension đúng 4 chữ số và các field không rỗng.
2. **Session:** Lưu JWT + profile tối thiểu (AsyncStorage RN / `localStorage` web demo). Logout xóa token + **lịch sử cuộc gọi local**.
3. **SIP:** Stack native RN (không implement trong web demo). Web chỉ mock trạng thái UI “gọi”.
4. **ITS API (M2):** `Authorization: Bearer <JWT>`; upload ảnh presigned URL hoặc multipart theo spec ITS khi có tài liệu.
5. **Navigation sau login:** Theo AC M1 — **màn đầu sau đăng nhập: Liên lạc (Calls)**; tab Nhiệm vụ / Thông báo / Tôi giữ nguyên trong bottom nav.
6. **SOS:** Luôn hiển thị khi đã đăng nhập; xác nhận modal → `tel:` hotline cấu hình (demo: khuyến nghị 113 — cấu hình env sau).

---

## 3. Không thay đổi trong đợt demo UI

- Không tích hợp PBX/ITS thật; chỉ chỗ hook service layer (comment `// TODO: ITSClient`).
- RN project có thể tạo sau bằng cách copy layout & token flow từ web demo.
