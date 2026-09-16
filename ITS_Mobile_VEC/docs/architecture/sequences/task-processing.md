# Sequence Diagram — Xử lý sự cố (Task Processing Flow)

## Journey: Field Op nhận và xử lý nhiệm vụ sự cố

```mermaid
sequenceDiagram
  participant TMC as TMC Operator
  participant ITS as ITS Backend (TMS)
  participant FCM as FCM/APNs
  participant App as ITS Mobile VEC App
  participant FieldOp as Nhân viên hiện trường

  TMC->>ITS: Tạo nhiệm vụ xử lý sự cố (POST /incidents/:id/tasks)
  ITS->>FCM: Gửi push notification (title: "Phân công nhiệm vụ mới")
  FCM-->>App: Push notification đến thiết bị
  App-->>FieldOp: Hiển thị notification + badge trên icon Thông báo

  FieldOp->>App: Mở app / tap notification
  App->>ITS: GET /tasks?assigned_to=me
  ITS-->>App: Danh sách nhiệm vụ (JSON)
  App-->>FieldOp: Hiển thị TaskListView với task mới

  FieldOp->>App: Tap task card → mở chi tiết
  App->>ITS: GET /tasks/:id
  ITS-->>App: Chi tiết sự cố + phuong_an_xu_ly
  App-->>FieldOp: Hiển thị TaskDetailViewPanel

  FieldOp->>App: Tap "Đã nhận (1)"
  App->>ITS: PATCH /tasks/:id/status {status: 1, timestamp}
  ITS-->>App: 200 OK
  App-->>FieldOp: Cập nhật trạng thái + lịch sử timeline

  Note over FieldOp,App: [Nhân viên di chuyển đến hiện trường]

  FieldOp->>App: Tap "Đang xử lý (2)" + ghi chú hiện trường
  App->>ITS: PATCH /tasks/:id/status {status: 2, ghi_chu}
  ITS-->>App: 200 OK

  FieldOp->>App: Chụp ảnh hiện trường
  App->>ITS: POST /tasks/:id/media (multipart/form-data)
  ITS-->>App: {media_url}

  FieldOp->>App: Tap "Hoàn thành (3)" + "Gửi báo cáo về TMC"
  App->>ITS: PATCH /tasks/:id/status {status: 3}
  App->>ITS: POST /tasks/:id/report {notes, media_refs[]}
  ITS-->>App: 200 OK
  ITS->>TMC: Cập nhật dashboard nhiệm vụ hoàn thành
  App-->>FieldOp: Xác nhận "Đã gửi thông tin về TMC"
```

## Notes

- **Status machine (strict):** ChuaXuLy → DaNhan(1) → DangXuLy(2) → HoanThanh(3). No backward transitions.
- **Offline resilience:** Status updates should use optimistic UI + background sync queue for expressway coverage gaps.
- **SOS interrupt:** SOS FAB is accessible at any point in this flow (Z-50, fixed position).
