# Implementation Status — ITSM-20260429-002 (M2: Quản lý Sự cố và Nhiệm vụ)

**Produced by:** from-code (Tier 3 LLM analysis of src/App.jsx)
**Date:** 2026-04-30

## Feature Status Summary

| Feature | Name | UI Complete | API Connected | Status | Score |
|---|---|---|---|---|---|
| M2-F001 | Hiển thị danh sách công việc | ✅ | ❌ mock | in-progress | 0.40 |
| M2-F002 | Xem chi tiết công việc | ✅ | ❌ mock | in-progress | 0.45 |
| M2-F003 | Cập nhật trạng thái xử lý | ✅ | ❌ local only | in-progress | 0.45 |
| M2-F004 | Đính kèm ảnh hiện trường | ✅ | ❌ local blob | in-progress | 0.40 |
| M2-F005 | Hiển thị sự cố/sự kiện | ✅ | ❌ mock | in-progress | 0.35 |

## Evidence

### M2-F001 — Task List
- `src/App.jsx:390-418` — `tasks` useMemo: 2 hardcoded tasks (NB-2024-001, NB-2024-002)
- `src/App.jsx:649-816` — `TaskListView`: renders task cards + events + recent completed
- **Gap:** No GET /tasks API call; useMemo replaces server fetch

### M2-F002 — Task Detail
- `src/App.jsx:107-348` — `TaskDetailViewPanel`: full detail view component
- Props: `{task, operatorName, onBack}` — task data passed from list, not fetched
- Displays: level badge, task ID, type, location, direction, description, `script` (phuong_an_xu_ly)
- **Gap:** No GET /tasks/:id API; detail data from hardcoded task object

### M2-F003 — Status Update
- `src/App.jsx:160-165` — `applyStatus()`: sets local detailStatus state
- `src/App.jsx:126-131` — `pushStatusLog()`: builds timestamp + updates statusLog (local only)
- `src/App.jsx:244-263` — Status buttons UI: 3 buttons (1/2/3) with active highlighting
- **Gap:** No PATCH /tasks/:id/status API call; status change is UI-only; no sequence validation

### M2-F004 — Field Media Attachment
- `src/App.jsx:133-148` — `addFilesFromInput()`: createObjectURL for preview
- `src/App.jsx:281-310` — 3 file inputs: camera image, camera video, gallery
- `src/App.jsx:108` — `urlsRef.current` for cleanup (correct memory management ✓)
- **Gap:** No multipart upload to ITS API; URLs are createObjectURL (in-memory only)

### M2-F005 — Road Events Feed
- `src/App.jsx:493-512` — `events` useMemo: 2 mock events (construction, weather)
- `src/App.jsx:420-448` — `recentCompletedTasks` useMemo: 3 mock completed tasks
- **Gap:** No ITS push/poll integration; hardcoded events

## Gaps to Production

1. **All M2 features:** Resolve GAP-008 (ITS API spec required from VEC)
2. **M2-F001:** Implement GET /tasks with user filter; resolve GAP-002 (ITS auth) + GAP-003 (push/pull)
3. **M2-F003:** Enforce status machine server-side; implement optimistic UI + offline queue
4. **M2-F004:** Implement multipart upload with progress + exponential backoff retry
5. **M2-F005:** Real-time event feed from ITS (FCM trigger → fetch or WebSocket)
