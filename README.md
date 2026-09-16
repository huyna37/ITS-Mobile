# ITS Mobile - Tuyến Cao tốc Nội Bài – Lào Cai (VEC)

> Phân hệ ứng dụng di động tác nghiệp hiện trường thuộc Hệ thống Quản lý Điều hành Giao thông Thông minh (ITS / TMC).

---

## 📁 Cấu trúc Project

```text
its-mobile/
├── ITS-MOBILE/             # Ứng dụng di động React Native (TypeScript, Zustand, React Navigation)
│   ├── src/
│   │   ├── api/            # Tầng giao tiếp HTTP / REST API
│   │   ├── components/     # UI Components dùng chung & theo module
│   │   ├── config/         # Cấu hình runtime ứng dụng
│   │   ├── constants/      # Màu sắc chuẩn VEC, tuyến đường, routes
│   │   ├── navigation/     # Luồng điều hướng (Auth & Main Tab Stack)
│   │   ├── screens/        # Màn hình: Đăng nhập, Tác nghiệp, PBX, Thông báo, Hồ sơ
│   │   ├── store/          # Quản lý State bằng Zustand
│   │   ├── types/          # Định nghĩa TypeScript Models & DTOs
│   │   └── utils/          # Bộ nhớ đệm, định dạng, quay số GSM/PBX
│   └── package.json
│
├── ITS-MOBILE-API/         # Backend API ASP.NET Core (.NET 9)
│   ├── Controllers/        # AuthController, TaskController, CallController, etc.
│   ├── Services/           # Nghiệp vụ xác thực PBX/ABP, xử lý dữ liệu hiện trường
│   ├── Data/               # Entity Framework Core Context kết nối CSDL ITS_MOBILE_VEC
│   └── appsettings.json
│
├── docs/                   # Tài liệu BA, bảng phân công nhiệm vụ, kế hoạch triển khai Excel
│   ├── designs/            # Hình ảnh mockup giao diện chi tiết từng chức năng
│   └── KE_HOACH_TRIEN_KHAI_ITS_MOBILE_VEC.xlsx
│
└── .agents/skills/         # Bộ quy chuẩn Antigravity Skill dành cho dự án ITS Mobile
```

---

## 🚀 Hướng dẫn Chạy Ứng dụng

### 1. Ứng dụng React Native Mobile (`ITS-MOBILE/`)
```bash
cd ITS-MOBILE
npm install
npm run start       # Khởi động Metro Bundler
# Hoặc chạy trực tiếp trên thiết bị/giả lập:
npm run android
npm run ios
```

### 2. Bản Web Preview Nhanh trên Trình duyệt (`ITS-MOBILE/`)
```bash
# Chạy trực tiếp từ thư mục gốc hoặc trong ITS-MOBILE:
npm run web         # Mặc định chạy tại http://localhost:5173
```

### 3. Backend API (`ITS-MOBILE-API/`)
```bash
cd ITS-MOBILE-API
dotnet build
dotnet run          # Khởi động API trên cổng 5000
```



---

## 🔐 Tài khoản Đăng nhập Thử nghiệm

| Tài khoản (`Username`) | Extension PBX (4 số) | Mật khẩu | Vai trò | Đơn vị |
| :--- | :---: | :---: | :--- | :--- |
| **`van_hanh`** | `2011` | `123456` | Nhân viên Tuần tra - Vận hành | Đội Tuần tra cơ động số 1 |
| **`trien_khai`** | `1001` | `123456` | Đội Kỹ thuật Hiện trường | Đội Triển khai & Xử lý sự cố |
| **`admin`** | `9901` | `123456` | Quản trị viên / Điều hành | Trung tâm Điều hành ITS (TMC) |

---

## 🛡️ Đặc tả Nghiệp vụ Cốt lõi
1. **Xác thực kép**: Yêu cầu đồng thời tài khoản hệ thống + Extension PBX 4 chữ số để định danh liên lạc nội bộ trên tuyến.
2. **Quy trình State Machine 3 bước**:
   - `1`: Đã tiếp nhận sự cố
   - `2`: Đang xử lý tại hiện trường (bắt buộc đính kèm ảnh/video)
   - `3`: Hoàn thành & chuyển về TMC
3. **Cơ chế SOS Offline GSM**: Khi mất kết nối Internet trên cao tốc, ứng dụng tự động kích hoạt quay số GSM viễn thông trực tiếp đến đầu số khẩn cấp.
