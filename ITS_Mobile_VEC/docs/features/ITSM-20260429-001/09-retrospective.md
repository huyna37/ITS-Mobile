---
feature-id: ITSM-20260429-001
closed-at: 2026-04-30
---

# Retrospective — M1 wave 1 (demo)

## Đã làm tốt

- Path M lean: BA → designer → SA → tech-lead → dev/fe-dev song song, QA Playwright 5/5.
- UI demo Vite khớp quyết định JWT Bearer / SIP Option A (ghi trong SA); mock rõ ràng, không giả VoIP thật.

## Cần cải thiện

- Id testcase Playwright (`M1-F001`..) trùng nhãn feature brief nhưng khác ngữ nghĩa từng dòng — cần bảng map khi audit.
- Workspace không có git: `implementation_evidence.commits` rỗng; nên khởi tạo repo trước feature sau.

## Hành động (wave 2+)

- Đóng GAP-001/002 trước go-live; thay mock bằng ITS + SIP theo SA.

## Số liệu (từ _state.md)

- `rework-count`: rỗng
- `kpi.tokens-total`: 14700 (tham chiếu state; không đo lại tại close)
