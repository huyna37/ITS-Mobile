# Raw Extract — ITS_Mobile_VEC
Generated: 2026-04-29 | Files: Yêu cầu ứng dụng di động vận hành.docx, UI.jsx

## File: Yêu cầu ứng dụng di động vận hành.docx
### Text Content

TÀI LIỆU YÊU CẦU CHỨC NĂNG
Ứng dụng di động cho nhân viên vận hành ITS

1. Mục tiêu
Ứng dụng di động được xây dựng nhằm hỗ trợ nhân viên vận hành và nhân viên xử lý sự cố trên tuyến đường trong việc:
- Liên lạc với Trung tâm điều hành thông qua hệ thống tổng đài nội bộ.
- Nhận thông tin sự cố giao thông và nhiệm vụ được phân công từ hệ thống ITS.
- Cập nhật trạng thái xử lý sự cố trực tiếp từ hiện trường.
- Nhận thông báo từ Trung tâm điều hành.
- Đảm bảo liên lạc trong trường hợp mất kết nối internet.
- Ứng dụng được phát triển cho hai nền tảng iOS và Android.

2. Phạm vi tích hợp hệ thống
Ứng dụng di động sẽ tích hợp với các hệ thống hiện có:

2.1 Hệ thống tổng đài nội bộ (PBX)
- Cho phép nhân viên đăng nhập bằng Extension nội bộ.
- Thực hiện cuộc gọi nội bộ giữa các nhân viên.
- Nhận cuộc gọi từ Trung tâm điều hành (TMC).
- Hỗ trợ gọi đường dây nóng SOS.

2.2 Hệ thống ITS tuyến
Ứng dụng kết nối với hệ thống ITS để:
- Nhận thông tin sự cố giao thông trên tuyến.
- Nhận nhiệm vụ xử lý sự cố từ Trung tâm điều hành.
- Cập nhật trạng thái xử lý sự cố tại hiện trường.

3. Đối tượng sử dụng

| Nhóm người dùng | Mô tả |
|---|---|
| Nhân viên vận hành hiện trường | Nhân viên tuần tra, cứu hộ, xử lý sự cố trên tuyến |
| Nhân viên Trung tâm điều hành | Người phân công nhiệm vụ và theo dõi xử lý |

4. Chức năng chính của ứng dụng

4.1 Đăng nhập hệ thống
Mô tả: Cho phép nhân viên đăng nhập vào ứng dụng bằng tài khoản nội bộ.
Chức năng:
- Đăng nhập bằng: Tài khoản hệ thống, Extension tổng đài PBX
- Lưu phiên đăng nhập
- Đăng xuất
Dữ liệu hiển thị: Tên nhân viên, Đơn vị công tác, Extension nội bộ

4.2 Thực hiện cuộc gọi nội bộ
Mô tả: Ứng dụng cho phép nhân viên thực hiện cuộc gọi nội bộ thông qua tổng đài PBX.
Chức năng:
- Gọi nội bộ giữa các nhân viên
- Nhận cuộc gọi từ Trung tâm điều hành
- Hiển thị: Tên người gọi, Extension, Lịch sử cuộc gọi

4.3 Gọi khẩn cấp SOS qua GSM
Mô tả: Trong trường hợp không có kết nối internet, nhân viên có thể thực hiện cuộc gọi tới đường dây nóng SOS bằng mạng GSM.
Chức năng:
- Nút gọi nhanh SOS Hotline
- Thực hiện cuộc gọi GSM trực tiếp
- Hoạt động khi không có internet

4.4 Nhận và quản lý công việc được phân công
Mô tả: Nhân viên nhận các nhiệm vụ xử lý sự cố từ Trung tâm điều hành.
Chức năng:
- Hiển thị danh sách công việc
- Xem chi tiết công việc
- Cập nhật trạng thái xử lý

Thông tin hiển thị:

| Trường thông tin | Mô tả |
|---|---|
| Mã công việc | ID sự cố |
| Loại sự cố | Tai nạn, hỏng xe, vật cản… |
| Vị trí | Km tuyến đường |
| Thời gian phát hiện | Thời điểm ghi nhận sự cố |
| Mô tả | Thông tin chi tiết |
| Trạng thái | Chưa xử lý / Đang xử lý / Hoàn thành |

Cập nhật trạng thái:
Nhân viên có thể cập nhật:
- Đã nhận nhiệm vụ
- Đang xử lý
- Đã xử lý xong
- Ghi chú hiện trường
- Đính kèm ảnh hiện trường (nếu cần)

4.5 Nhận thông báo từ Trung tâm điều hành
Mô tả: Ứng dụng gửi thông báo khi có sự kiện mới.
Các loại thông báo:
- Phân công công việc
- Cập nhật trạng thái công việc
- Thông báo hệ thống
- Thông báo từ Trung tâm điều hành

Thông tin nhiệm vụ (API fields):

| Trường | Nội dung |
|---|---|
| code | Mã nhiệm vụ |
| name | Tên nhiệm vụ |
| description | Mô tả |
| status | Trạng thái nhiệm vụ |
| startDate | Ngày bắt đầu |
| endDate | Ngày kết thúc |
| planEndDate | Ngày dự kiến |
| incidentProfileId | Mã hồ sơ |
| organizationId | Đội thực hiện |
| orderNumber | Thứ tự thực hiện |
| users | Người thực hiện |

Chức năng:
- Push Notification
- Xem danh sách thông báo
- Đánh dấu: Đã đọc / Chưa đọc

4.6 Nhận thông tin sự cố/sự kiện giao thông
Mô tả: Ứng dụng nhận thông tin sự cố từ hệ thống ITS.
Thông tin hiển thị:

| Trường | Nội dung |
|---|---|
| Tên | Hiển thị tên sự cố từ TMS |
| Vị trí | Km tuyến |
| Thời gian | Thời điểm xảy ra |
| Mức độ | Nhẹ / Trung bình / Nghiêm trọng |
| Mô tả | Thông tin chi tiết |
| Hình ảnh | Hình ảnh ghi nhận |
| Video | Video ghi nhận |

5. Luồng nghiệp vụ chính
Bước 1: Hệ thống ITS phát hiện hoặc tiếp nhận thông tin sự cố.
Bước 2: Nhân viên Trung tâm điều hành tạo nhiệm vụ xử lý sự cố.
Bước 3: Nhiệm vụ được gửi tới ứng dụng di động của nhân viên hiện trường.
Bước 4: Nhân viên:
- Nhận thông báo
- Xem thông tin sự cố

Incident Profile API fields:

| Trường | Nội dung |
|---|---|
| code | Mã hồ sơ |
| timeDetect | Thời gian ghi nhận |
| direction | Hướng |
| positionKM | Vị trí KM |
| positionM | Vị trí M |
| description | Ghi chú |
| status | Trạng thái |
| typeEventName | Loại sự kiện |
| source | Nguồn |
| pathFile | Đường dẫn file |
| creationTime | Thời gian tạo |
| scriptId | ID phương án |
| beginInfomation | Thông tin ban đầu |
| level | Mức độ nghiêm trọng |
| reason | Nguyên nhân |
| resultPolice | Kết luận bên phía công an |
| damage | Thiệt hại |
| startProcessTime | Thời gian bắt đầu |
| endProcessTime | Thời gian hoàn thành |
| scriptName | Phương án xử lý |
| id | ID hồ sơ |

Bước 5: Nhân viên cập nhật:
- Đã nhận nhiệm vụ: 1
- Đang xử lý: 2
- Kết quả xử lý: 3
Bước 6: Trung tâm điều hành theo dõi tiến độ xử lý trên hệ thống ITS.

6. Yêu cầu kỹ thuật
- Nền tảng: iOS, Android
- Kết nối: API kết nối hệ thống ITS, SIP / VoIP kết nối PBX
- Thông báo: Push Notification
- Bảo mật: Xác thực người dùng, HTTPS, Token session

7. Yêu cầu UI/UX
Ứng dụng cần có các màn hình chính:
- Login
- Dashboard
- Danh sách công việc
- Chi tiết sự cố
- Thông báo
- Cuộc gọi nội bộ
- SOS Hotline

8. Các yêu cầu phi chức năng

| Yêu cầu | Mô tả |
|---|---|
| Hiệu năng | Tải danh sách công việc < 3 giây |
| Offline | Cho phép gọi SOS khi mất internet |
| Bảo mật | Tài khoản nội bộ |
| Khả năng mở rộng | Tích hợp thêm camera / GPS |

Mong muốn màu sắc chủ đạo của ứng dụng là màu #0097F0

### Images Found: 0
(No embedded images in DOCX)

## File: UI.jsx (Wireframe/Mockup — React component)
### Analysis

The UI.jsx file is a React component that serves as a wireframe for the mobile application. It contains:
- System name: "NB-LC Express" (Nội Bài - Lào Cai Express)
- Subtitle: "Hệ thống điều hành ITS"
- Primary color: #0097f0

Screens defined in JSX:
1. LoginView — username, Extension PBX, password fields
2. TaskListView — task list + events on route
3. TaskDetailView — incident detail with status update, photo upload
4. CallsView — PBX internal directory
5. NotificationsView — notification list
6. ProfileView — user profile with Extension and unit info

Navigation tabs: Công việc (tasks), Liên lạc (calls), Thông báo (alerts), Tôi (profile)
Floating SOS button — always visible

Mock data entities:
- Task/Incident: id, code, type, level, location, direction, time, status (1=Đã nhận, 2=Đang xử lý, 3=Hoàn thành), description, script
- Event: id, title, location, time, icon, tag (Bảo trì, Thời tiết)
- Contact: name, ext, online status

## External References
(No external references requiring WebSearch)
