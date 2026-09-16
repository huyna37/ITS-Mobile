---
name: its-mobile-rn
description: >-
  Bộ quy chuẩn kiến trúc, quy tắc phát triển và hướng dẫn thực thi chuẩn cho dự án
  ITS Mobile VEC (MF-MobiSuite) nền tảng React Native (TypeScript, React Navigation, Zustand, NativeWind).
  Kích hoạt khi phát triển màn hình, xử lý API, State Machine 3 bước (1->2->3), SOS GSM offline,
  Push Notification, nén ảnh/video hiện trường, và đóng gói Android/iOS cho tuyến cao tốc Nội Bài - Lào Cai.
---

# ITS Mobile VEC (MF-MobiSuite) — Quy Chuẩn Kỹ Thuật & Hướng Dẫn Phát Triển

Dự án **ITS Mobile VEC** (mã dự án Jira: `BXDITSNBLC`) là ứng dụng di động tác nghiệp hiện trường chuyên dụng cho nhân viên vận hành, tuần tra và cứu hộ tuyến cao tốc **Nội Bài – Lào Cai**, kết nối thời gian thực với Trung tâm Quản lý Điều hành Giao thông (TMC).

---

## 1. Kiến Trúc & Công Nghệ Cốt Lõi (Core Architecture)

| Thành phần | Công nghệ / Thư viện | Vai trò & Tiêu chuẩn |
|---|---|---|
| **Nền tảng** | React Native CLI (TypeScript v5) | Đa nền tảng Android (API 26–34) & iOS (15.0+) |
| **Styling** | NativeWind (Tailwind CSS v3.3+) | Bảng màu chuẩn VEC (`#0097f0`), utility-first responsive |
| **Điều hướng** | React Navigation v6 | Bottom Tabs + Native Stack, Deep Linking |
| **Quản lý State** | Zustand | Nhẹ, không boilerplate, tương thích React Suspense & Hooks |
| **API Client** | Axios + Interceptors | JWT auto-attach, refresh token, custom error handler |
| **Lưu trữ Offline** | MMKV / Keychain | Token an toàn trên Keychain, dữ liệu cache trên MMKV tốc độ cao |
| **Ngoại tuyến GSM** | Native Linking GSM | Nút SOS gọi khẩn cấp `tel:113` qua SIM viễn thông không cần 4G |
| **Media Hiện trường** | react-native-compressor | Nén ảnh `< 500KB`, video `720p` trước khi upload multipart |
| **Push Notification**| Firebase Messaging (FCM) & APNs | Nhận tin 3 trạng thái: Foreground, Background, Killed State |

---

## 2. Các Quy Tắc Bắt Buộc & Bất Biến (Strict Rules)

1. **Quy tắc ngày làm việc (Working Days Only)**:
   - Toàn bộ tiến độ và estimate **chỉ tính 12 ngày làm việc** (từ 17/09/2026 đến 02/10/2026, thứ 2 đến thứ 6).
   - **Tuyệt đối không xếp lịch hay deadline vào Thứ 7 và Chủ Nhật** (19/09, 20/09, 26/09, 27/09).
2. **Quy tắc chức danh nhân sự**:
   - Chỉ có 3 vai trò: **`Kiến trúc & Review`** (`huyna@etc.vn`), **`Dev`** (`hautt@etc.vn`, `toancv@etc.vn`), **`Tester`** (`hanhpth@etc.vn`).
   - **Tuyệt đối không sử dụng danh xưng `Lead`, `PM`, `Tech Lead`**.
3. **Quy tắc Single Source of Truth & Không fallback bừa bãi**:
   - **KHÔNG sử dụng fallback logic linh tinh** (toán tử `??`, `||`, ternary fallback) khi mapping DTO, tham số API hoặc thuộc tính dữ liệu.
   - Chỉ lấy chuẩn duy nhất 1 trường dữ liệu từ database / API theo thiết kế đã chốt.
4. **Quy tắc kiểm thử Playwright**:
   - **KHÔNG** chạy test dạng mở trình duyệt playwright, **KHÔNG** chạy dotnet run tự ý.

---

## 3. Quy Chuẩn 3 Phân Hệ Nghiệp Vụ Cốt Lõi (M1 – M2 – M3)

### Phân hệ M1: Xác thực, Danh bạ PBX & Nút khẩn cấp SOS

#### 1. Đăng nhập tài khoản kép & Lưu phiên
- **Màn hình**: `LoginScreen`
- **Fields bắt buộc**:
  - `username`: Tên đăng nhập
  - `extension`: Đúng **4 chữ số** tổng đài (validate regex `^\d{4}$`)
  - `password`: Mật khẩu
- **Cơ chế**: Khi thành công, lưu `token` vào Keychain. Mở app tự động kiểm tra token để Auto-login vào tab mặc định **Liên lạc**.
- **Example tài khoản kiểm thử chuẩn (Standard Test Credentials Example)**:
  - **Tài khoản hệ thống**: `van_hanh`
  - **Số Extension PBX**: `2011` (chuẩn 4 chữ số)
  - **Mật khẩu**: `123456`
  - **Dữ liệu mẫu JSON**:
    ```json
    {
      "username": "van_hanh",
      "extension": "2011",
      "password": "123456",
      "role": "Nhân viên Tuần tra - Vận hành hiện trường",
      "unit": "Đội tuần tra cơ động số 1 (Tuyến Nội Bài – Lào Cai)"
    }
    ```

#### 2. Nút SOS gọi khẩn cấp qua GSM (Bất tử khi mất mạng)
- **Component**: `FloatingSOS`
- **Vị trí**: Nút tròn đỏ nổi (`bg-red-600`), cố định góc phải bên dưới màn hình, hiển thị xuyên suốt mọi màn hình.
- **Nghiệp vụ**:
  ```ts
  import { Linking, Alert } from 'react-native';

  export function triggerSOSCall(hotline = '113') {
    Alert.alert(
      'GỌI KHẨN CẤP SOS',
      `Bạn có chắc chắn muốn gọi đến tổng đài cứu hộ khẩn cấp ${hotline} qua mạng viễn thông GSM không?`,
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Gọi ngay',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${hotline}`),
        },
      ]
    );
  }
  ```

#### 3. Danh bạ nội bộ PBX & Lịch sử cuộc gọi
- **Màn hình**: `ContactsScreen`
- Hiển thị danh sách nhân viên vận hành, TMC:
  - Avatar, họ tên, phòng ban, số extension 4 số.
  - Chấm trạng thái **Online** (xanh `#16a34a`) / **Offline** (xám `#9ca3af`).
  - Nút gọi PBX: Gọi nội bộ và tự động ghi log vào danh sách "Lịch sử cuộc gọi" cục bộ.

---

### Phân hệ M2: Quản lý Nhiệm vụ, Sự kiện tuyến & State Machine 3 Bước

#### 1. Danh sách nhiệm vụ & Thẻ công việc
- **Màn hình**: `TasksScreen`
- Phân loại: Sự cố giao thông, Cứu hộ, Tuần tra đường bộ, Bảo trì hạ tầng.
- Hiển thị vị trí lý trình chuẩn cao tốc: `Km [X] + [Y]m (Hướng [Hà Nội -> Lào Cai / Lào Cai -> Hà Nội])`.
- Kéo để làm mới (`Pull-to-refresh`).

#### 2. State Machine cập nhật tiến độ 3 bước tuần tự (Strict Sequence)
- **Quy tắc nghiêm ngặt**:
  $$\text{1. Đã nhận} \xrightarrow{\text{Nhận việc}} \text{2. Đang xử lý} \xrightarrow{\text{Báo cáo kết quả}} \text{3. Hoàn thành}$$
- **Ràng buộc**:
  - **KHÔNG ĐƯỢC NHẢY BƯỚC**: Từ `1. Đã nhận` không được phép nhảy thẳng lên `3. Hoàn thành`.
  - **KHÔNG ĐƯỢC LÙI BƯỚC**: Đã sang `2. Đang xử lý` không được quay về `1. Đã nhận`.
  - Khi hoàn thành bước 3, nút tác vụ bị vô hiệu hóa (Disabled) và hiển thị dấu tích xanh `Đã hoàn thành`.

```tsx
export type TaskStep = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED';

export function getNextStep(current: TaskStep): TaskStep | null {
  switch (current) {
    case 'RECEIVED': return 'IN_PROGRESS';
    case 'IN_PROGRESS': return 'COMPLETED';
    case 'COMPLETED': return null;
  }
}
```

#### 3. Chụp ảnh, Quay video & Nén Media Hiện trường
- Tích hợp `react-native-image-picker` hoặc `react-native-vision-camera`.
- **Giới hạn nén bắt buộc**:
  - Ảnh: Nén dung lượng `< 500 KB` (JPEG chất lượng 0.7 - 0.8).
  - Video: Nén độ phân giải tối đa `720p` (1280x720) để đảm bảo upload ổn định qua sóng 4G chập chờn trên cao tốc.
- Upload dưới dạng `multipart/form-data` kèm token xác thực.

---

### Phân hệ M3: Thông báo Realtime, Deep Linking & Release

#### 1. Xử lý Push Notification ở 3 trạng thái
1. **Foreground**: App đang mở -> Hiển thị thông báo Toast / In-App Banner trượt từ trên xuống.
2. **Background**: App đang ẩn dưới nền -> Xuất hiện notification trên thanh thông báo hệ thống của điện thoại.
3. **Killed State**: App đã bị tắt hoàn toàn -> Nhận notification hệ thống, khi bấm vào kích hoạt app mở lên.

#### 2. Deep Linking mở thẳng nhiệm vụ tương ứng
- Cấu hình URL Scheme: `itsmobile://tasks/:taskId` hoặc Universal Link.
- Khi người dùng chạm vào notification của sự cố `INC-2026-0901`, ứng dụng tự động mở thẳng màn hình `TaskDetailScreen` của sự cố đó thay vì về trang chủ.

#### 3. Danh sách thông báo & Badge số đếm
- Màn hình: `NotificationsScreen`.
- Phân biệt trực quan:
  - **Chưa đọc**: Nền xanh nhạt (`#f0f7ff`), viền trái màu xanh đậm (`#0097f0`).
  - **Đã đọc**: Nền trắng tinh (`#ffffff`).
- Chạm vào thông báo để chuyển trạng thái Đã đọc / Chưa đọc và cập nhật tức thời số đếm (Badge) trên icon chuông ở thanh Tabbar.

---

## 4. Cấu Trúc Thư Mục Chuẩn của Ứng Dụng (`mobile/src`)

```
mobile/
├── package.json
├── tsconfig.json
├── App.tsx
├── index.js
└── src/
    ├── api/                 # Axios client, interceptors & API services
    │   ├── client.ts        # Instance axios cấu hình token, base URL, timeout
    │   ├── authApi.ts       # Đăng nhập, đăng xuất, profile
    │   ├── tasksApi.ts      # Danh sách nhiệm vụ, chi tiết, cập nhật tiến độ
    │   ├── contactsApi.ts   # Danh bạ nội bộ, danh bạ PBX, trạng thái online
    │   ├── notificationsApi.ts # Danh sách thông báo, toggle đã đọc
    │   └── filesApi.ts      # Upload ảnh/video multipart nén
    ├── components/
    │   ├── common/          # UI Kit dùng chung (Button, Input, Badge, Header, Modal)
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Header.tsx
    │   │   ├── FloatingSOS.tsx   # Nút đỏ nổi gọi 113 toàn cục
    │   │   ├── ConfirmModal.tsx
    │   │   └── Toast.tsx
    │   └── modules/         # Component chuyên biệt theo nghiệp vụ
    │       ├── StateMachineBar.tsx   # Thanh 3 bước tuần tự 1->2->3
    │       ├── TaskCard.tsx          # Thẻ nhiệm vụ hiện trường
    │       └── ContactRow.tsx        # Hàng danh bạ kèm status online/offline
    ├── config/
    │   └── index.ts         # Đọc biến môi trường, hotline SOS, timeout
    ├── constants/
    │   ├── colors.ts        # Bảng màu VEC: primary #0097f0, danger #dc2626
    │   └── routes.ts        # Enum định danh route navigation
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   ├── MainTabNavigator.tsx  # 4 tabs: Liên lạc, Công việc, Thông báo, Tôi
    │   └── types.ts         # NavigationParamList TypeScript types
    ├── screens/
    │   ├── auth/LoginScreen.tsx
    │   ├── contacts/ContactsScreen.tsx
    │   ├── tasks/
    │   │   ├── TasksScreen.tsx
    │   │   └── TaskDetailScreen.tsx
    │   ├── notifications/NotificationsScreen.tsx
    │   └── profile/ProfileScreen.tsx
    ├── store/               # Zustand state stores
    │   ├── useAuthStore.ts
    │   ├── useTasksStore.ts
    │   ├── useContactsStore.ts
    │   └── useNotificationsStore.ts
    ├── types/               # Type definition toàn hệ thống
    │   ├── auth.ts
    │   ├── task.ts
    │   └── contact.ts
    └── utils/
        ├── formatting.ts    # Format Km+m, ngày giờ tiếng Việt
        ├── storage.ts       # MMKV & Keychain wrapper
        └── dialer.ts        # GSM Call trigger
```

---

## 5. Danh Mục Mã Màu Chuẩn VEC (Theme Tokens)

```ts
export const VEC_THEME = {
  primary: '#0097f0',       // Xanh dương chủ đạo VEC
  primaryDark: '#0070b8',   // Xanh đậm trạng thái active / pressed
  primaryLight: '#e6f4fe',  // Xanh rất nhạt cho item chưa đọc, badge
  danger: '#dc2626',        // Đỏ cờ cho nút SOS, trạng thái khẩn cấp
  dangerDark: '#b91c1c',    // Đỏ nhấn
  warning: '#f59e0b',       // Vàng cam cho cảnh báo sự cố, đang xử lý
  success: '#16a34a',       // Xanh lá hoàn thành, online
  grayBg: '#f8fafc',        // Nền màn hình tổng thể
  cardBg: '#ffffff',        // Nền card phẳng
  textPrimary: '#0f172a',   // Chữ tiêu đề đậm
  textSecondary: '#64748b', // Chữ ghi chú, phụ đề
  border: '#e2e8f0',        // Đường kẻ ngăn cách mỏng
};
```

---

## 6. Hướng Dẫn Kiểm Thử & Nghiệm Thu (QA Guidelines)

1. **Kiểm thử Offline / Mất mạng**:
   - Bật Airplane Mode -> Bấm nút SOS đỏ -> Hệ thống phải bật hộp thoại xác nhận và mở trình gọi điện thoại của máy gọi số `113` mà không báo lỗi.
   - Cache dữ liệu gần nhất vẫn xem được danh sách nhiệm vụ đã tải.
2. **Kiểm thử State Machine tuần tự**:
   - Kiểm tra task ở trạng thái `1. Đã nhận`: Không có cách nào bấm hoàn thành trực tiếp.
   - Bấm `Bắt đầu xử lý` -> Task chuyển sang `2. Đang xử lý`. Nút chuyển thành `Báo cáo & Hoàn thành`.
   - Bấm `Hoàn thành` -> Task chuyển sang `3. Hoàn thành`. Không còn nút thao tác chuyển tiếp.
3. **Kiểm thử Đa thiết bị**:
   - Thử nghiệm trên cả iOS Simulator (tai thỏ / Dynamic Island) và Android Emulator (API 34).
   - Kiểm tra vùng an toàn (Safe Area) ở mép trên và dưới màn hình không che mất nút hay nội dung.
