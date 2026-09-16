# ITS Mobile VEC — demo UI (web)

Ứng dụng demo tích hợp luồng **M1** (đăng nhập, danh bạ / lịch sử, SOS), **M2** (nhiệm vụ + chi tiết), **M3** (thông báo). Stack: Vite + React + Tailwind.

## Chạy để test

```bash
npm install
npm run dev
```

Mở URL hiển thị trong terminal (thường `http://localhost:5173`).

### Giả lập Android (Android Studio)

Máy chủ dev đã bật `host: true`. Trong **Chrome trên emulator**, dùng:

- `http://10.0.2.2:5173` — cổng `10.0.2.2` trỏ về máy Windows chứa Vite.

Điện thoại thật cùng WiFi: mở `http://<IP-máy-tính-LAN>:5173` (Vite cũng in `Network` URL khi chạy `npm run dev`).

### Trình duyệt trên PC

Chrome → F12 → **Toggle device toolbar** (Ctrl+Shift+M) để xem giao diện mobile nhanh.

## Gợi ý kiểm thử

1. **Đăng nhập:** nhập tài khoản bất kỳ, extension đúng **4 chữ số**, mật khẩu bất kỳ → sau đăng nhập mặc định vào tab **Liên lạc** (đúng AC M1).
2. **Liên lạc:** tab **Danh bạ** / **Lịch sử** — bấm icon gọi để thêm dòng lịch sử cục bộ.
3. **SOS:** nút đỏ nổi → xác nhận → mở `tel:` (số mặc định `113`, đổi bằng biến `VITE_SOS_TEL` nếu cần).
4. **Đăng xuất:** tab **Tôi** → đăng xuất — xóa session và lịch sử cục bộ.

## Tài liệu quyết định BA / SA / PM

Xem `docs/features/_shared/PM-SA-BA-chot-phuong-an.md` và `docs/features/ITSM-20260429-001/sa/00-lean-architecture.md`.

## Wireframe gốc

`docs/source/UI.jsx` là bản trước Vite; mã chạy chính là `src/App.jsx`.
