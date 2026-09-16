# ITS Mobile VEC (MF-MobiSuite) — React Native App

Ứng dụng di động tác nghiệp hiện trường cho nhân viên vận hành tuyến cao tốc **Nội Bài – Lào Cai** (Kế hoạch rút gọn Fast-Track).

## 1. Công nghệ chính
- **Framework**: React Native CLI (TypeScript v5)
- **Điều hướng**: React Navigation v6 (Bottom Tabs + Native Stack)
- **Quản lý trạng thái**: Zustand
- **Kết nối API**: Axios với Interceptors JWT
- **Lưu trữ**: Token an toàn trên Keychain, Cache offline trên MMKV / local storage
- **Khẩn cấp ngoại tuyến**: Nút SOS gọi `113` qua GSM không cần kết nối mạng
- **Quy trình 3 bước**: State Machine tuần tự (1. Đã nhận ➔ 2. Đang xử lý ➔ 3. Hoàn thành)

## 2. Cấu trúc thư mục (`mobile/src`)
- `api/`: Các dịch vụ API kết nối Backend .NET 9 Web API
- `components/common/`: Bộ UI Kit dùng chung (Button, Input, Card, Badge, Header, FloatingSOS, v.v.)
- `components/modules/`: Component nghiệp vụ (StateMachineBar, TaskCard, ContactRow)
- `navigation/`: RootNavigator, AuthNavigator, MainTabNavigator
- `screens/`:
  - `auth/LoginScreen.tsx`: Đăng nhập tài khoản kép + Extension 4 số
  - `contacts/ContactsScreen.tsx`: Danh bạ nội bộ PBX & Lịch sử cuộc gọi
  - `tasks/TasksScreen.tsx`: Danh sách sự cố hiện trường & Cảnh báo tuyến
  - `tasks/TaskDetailScreen.tsx`: Chi tiết sự cố, State Machine 1-2-3, Chụp ảnh nén hiện trường
  - `notifications/NotificationsScreen.tsx`: Danh sách thông báo, toggle đã đọc, deep link
  - `profile/ProfileScreen.tsx`: Hồ sơ nhân viên, Extension, Đăng xuất
- `store/`: Zustand stores (`useAuthStore`, `useTasksStore`, `useContactsStore`, `useNotificationsStore`)
- `utils/`: Định dạng lý trình `Km+m`, định dạng ngày giờ, kích hoạt gọi GSM

## 3. Khởi chạy ứng dụng
```bash
# Cài đặt dependencies
cd mobile
npm install

# Khởi động Metro Bundler
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS (yêu cầu macOS & CocoaPods)
npm run ios
```
