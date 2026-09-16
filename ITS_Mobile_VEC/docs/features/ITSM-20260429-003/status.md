# Implementation Status — ITSM-20260429-003 (M3: Thông báo)

**Produced by:** from-code (Tier 3 LLM analysis of src/App.jsx)
**Date:** 2026-04-30

## Feature Status Summary

| Feature | Name | UI Complete | API Connected | Status | Score |
|---|---|---|---|---|---|
| M3-F001 | Nhận Push Notification | ✅ UI | ❌ no FCM SDK | stubbed | 0.12 |
| M3-F002 | Xem danh sách thông báo | ✅ | ❌ mock | in-progress | 0.45 |
| M3-F003 | Đánh dấu đã đọc/chưa đọc | ⚠️ partial | ❌ | stubbed | 0.15 |

## Evidence

### M3-F001 — Push Notification (STUBBED)
- `package.json`: No `@react-native-firebase/messaging` or equivalent push SDK
- `src/App.jsx:450-475` — `notifications` useMemo: 3 hardcoded notifications
- No FCM registration, no push handler, no APNs certificate integration
- **Gap:** Entirely mocked; push infrastructure not started

### M3-F002 — Notification List
- `src/App.jsx:908-942` — `NotificationsView`: renders notification list
- Unread styling: `bg-blue-50 border-blue-100` for unread, `bg-white border-gray-100` for read
- Badge count: `src/App.jsx:477-479` — `unreadNotificationCount` useMemo computed from mock
- Reverse-chron order: mock data is static, no sort logic
- **Gap:** No API fetch; no reverse-chron enforcement; mock data only

### M3-F003 — Read/Unread Toggle (PARTIAL UI)
- `src/App.jsx:920-941` — `NotificationsView` notification buttons rendered
- **Missing:** No `onClick` handler to toggle `da_doc` state
- **Missing:** No state update for read/unread toggle
- **Gap:** Toggle not implemented even in prototype; only visual unread styling exists

## Gaps to Production

1. **M3-F001:** Full FCM setup (google-services.json, APNs cert), implement firebase messaging
2. **M3-F001:** Handle 3 lifecycle states (foreground/background/killed)
3. **M3-F001:** Deep-link from PhanCong notification → TaskDetailView
4. **M3-F002:** Fetch notification list from ITS/TMC API; implement reverse chronological sort
5. **M3-F003:** Implement toggle read/unread (tap handler + state update + API sync)
6. **All:** @react-native-firebase/messaging + @react-native-community/push-notification-ios
