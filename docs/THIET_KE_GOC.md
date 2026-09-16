# BẢNG TẬP HỢP THIẾT KẾ GỐC — ITS MOBILE VEC (MF-MobiSuite)

> Trích xuất từ tài liệu: `05.Bản mô tả Ứng dụng di động cho nhân viên vận hành tuyến cao tốc (k code).docx`

---

## 1. Màn hình Đăng nhập (M1)
- **Tập tin ảnh:** `docs/designs/01-dang-nhap.png`
- **Mô tả nghiệp vụ:** Form đăng nhập tài khoản hệ thống kết hợp số extension PBX (bắt buộc đúng 4 chữ số) và mật khẩu. Tự động phục hồi phiên khi mở lại ứng dụng.
- **Task liên quan:** [TASK-005](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json) (`Tubh@etc.vn`)

![01-dang-nhap](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/01-dang-nhap.png)

---

## 2. Màn hình Thông tin cá nhân & Đăng xuất (M1)
- **Tập tin ảnh:** `docs/designs/02-thong-tin-ca-nhan-dang-xuat.png`
- **Mô tả nghiệp vụ:** Hiển thị thông tin nhân viên: Họ tên, chức vụ, extension PBX, đơn vị công tác (chỉ đọc). Nút "Đăng xuất hệ thống" xóa session và lịch sử cuộc gọi cục bộ.
- **Task liên quan:** [TASK-006](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json), [TASK-008](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json)

![02-thong-tin-ca-nhan-dang-xuat](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/02-thong-tin-ca-nhan-dang-xuat.png)

---

## 3. Màn hình Liên lạc & Danh bạ nội bộ PBX (M1)
- **Tập tin ảnh:** `docs/designs/03-danh-ba-lien-lac-pbx.png`
- **Mô tả nghiệp vụ:** Danh bạ nội bộ hiển thị danh sách đồng nghiệp và Trung tâm điều hành (TMC) kèm trạng thái Trực tuyến/Ngoại tuyến (Online/Offline). Thực hiện cuộc gọi nội bộ qua tổng đài PBX.
- **Task liên quan:** [TASK-009](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json), [TASK-010](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json), [TASK-019](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json)

![03-danh-ba-lien-lac-pbx](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/03-danh-ba-lien-lac-pbx.png)

---

## 4. Màn hình Gọi khẩn cấp SOS qua GSM (M1)
- **Tập tin ảnh:** `docs/designs/04-goi-khan-cap-sos.png`
- **Mô tả nghiệp vụ:** Nút đỏ floating SOS luôn hiển thị. Bấm hiển thị modal xác nhận và gọi đường dây nóng qua sóng di động GSM — **hoạt động ngay cả khi mất kết nối Internet**.
- **Task liên quan:** [TASK-007](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json) (`Toancv@etc.vn`)

![04-goi-khan-cap-sos](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/04-goi-khan-cap-sos.png)

---

## 5. Màn hình Danh sách công việc & Sự kiện trên tuyến (M2)
- **Tập tin ảnh:** `docs/designs/05-danh-sach-cong-viec-su-kien-tuyen.png`
- **Mô tả nghiệp vụ:** Danh sách nhiệm vụ do TMC phân công kèm thẻ sự cố (mã, loại, mức độ, Km, trạng thái). Phần dưới hiển thị sự kiện giao thông đang xảy ra trên tuyến (thi công, thời tiết, tai nạn).
- **Task liên quan:** [TASK-011](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json), [TASK-015](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json)

![05-danh-sach-cong-viec-su-kien-tuyen](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/05-danh-sach-cong-viec-su-kien-tuyen.png)

---

## 6. Màn hình Chi tiết công việc & Cập nhật trạng thái 3 bước (M2)
- **Tập tin ảnh:** `docs/designs/06-chi-tiet-cong-viec-trang-thai.png`
- **Mô tả nghiệp vụ:** Xem chi tiết phương án xử lý từ TMC. Cập nhật tiến độ tuần tự nghiêm ngặt 3 bước: `(1) Đã nhận` ➔ `(2) Đang xử lý` ➔ `(3) Hoàn thành` (không nhảy bước, không quay ngược).
- **Task liên quan:** [TASK-012](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json) (`Toancv@etc.vn`)

![06-chi-tiet-cong-viec-trang-thai](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/06-chi-tiet-cong-viec-trang-thai.png)

---

## 7. Màn hình Đính kèm ảnh / video hiện trường (M2)
- **Tập tin ảnh:** `docs/designs/07-dinh-kem-anh-video.png`
- **Mô tả nghiệp vụ:** Hỗ trợ 3 nguồn: (1) Chụp ảnh bằng camera, (2) Quay video ngắn bằng camera, (3) Chọn từ thư viện ảnh máy. Nén file trước khi gửi về TMC.
- **Task liên quan:** [TASK-013](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json), [TASK-014](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json) (`Tubh@etc.vn`)

![07-dinh-kem-anh-video](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/07-dinh-kem-anh-video.png)

---

## 8. Màn hình Push Notification & Hiển thị số lượng (M3)
- **Tập tin ảnh:** `docs/designs/08-thong-bao-push-badge.png`
- **Mô tả nghiệp vụ:** Nhận push thông báo từ TMC (FCM trên Android & APNs trên iOS). Hoạt động ở Foreground, Background và khi app tắt. Hiển thị badge số lượng thông báo chưa đọc trên tabbar.
- **Task liên quan:** [TASK-016](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json), [TASK-017](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json) (`Hautt@etc.vn`)

![08-thong-bao-push-badge](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/08-thong-bao-push-badge.png)

---

## 9. Màn hình Danh sách thông báo & Đánh dấu đã đọc/chưa đọc (M3)
- **Tập tin ảnh:** `docs/designs/09-danh-sach-thong-bao-doc-chua-doc.png`
- **Mô tả nghiệp vụ:** Sắp xếp mới nhất đến cũ nhất. Thông báo chưa đọc có nền xanh nhạt, đã đọc nền trắng. Chạm vào để chuyển đổi qua lại (toggle) giữa Đã đọc và Chưa đọc, cập nhật ngay badge số.
- **Task liên quan:** [TASK-018](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/tasks-assignment.json) (`Tubh@etc.vn`)

![09-danh-sach-thong-bao-doc-chua-doc](file:///c:/Users/huyna/Downloads/ITS_Mobile_Hung_Sua/ITS_Mobile_VEC/docs/designs/09-danh-sach-thong-bao-doc-chua-doc.png)
