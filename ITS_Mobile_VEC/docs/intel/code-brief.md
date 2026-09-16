---
producer: from-code
produced_at: 2026-04-30
confidence: high
source: src/App.jsx (1154 lines), package.json
---

# Code Brief — ITS Mobile VEC

## Implementation Status

Đây là **prototype React SPA** (Web) minh họa toàn bộ luồng UI của ứng dụng di động ITS Mobile VEC. Tất cả dữ liệu đều được mock cứng trong component. Không có kết nối API thực.

**Mục tiêu sản xuất:** React Native (iOS + Android native app).

## Code Structure

```
src/
├── main.jsx           — React 18 entry point (ReactDOM.createRoot)
├── index.css          — Tailwind CSS directives + base styles
└── App.jsx (1154 LOC) — Full application (single file, SPA prototype)
    ├── Constants       — PRIMARY color, HIGHWAY_TITLE, VI_WEEKDAYS
    ├── Utils           — vietnameseWorkScreenDateLine, initialStatusHistory, getTaskStatusInfo
    ├── Session utils   — loadSession, loadHistory (localStorage)
    ├── Components:
    │   ├── TaskDetailViewPanel  (exported, named component)
    │   ├── LoginView            (inline function component)
    │   ├── TaskListView         (inline function component)
    │   ├── CallsView            (inline function component)
    │   ├── NotificationsView    (inline function component)
    │   └── ProfileView          (inline JSX in App return)
    └── App (default export) — root with nav/routing/SOS
```

## Key Patterns

### Navigation (SPA routing via state)
```javascript
const [activeTab, setActiveTab] = useState('calls');   // bottom tab
const [currentView, setCurrentView] = useState('list'); // list | detail
const [selectedTask, setSelectedTask] = useState(null);
```
No react-router — navigation via state machine. `activeTab` controls which tab renders; `currentView` toggles list/detail.

### Session Management
```javascript
const LS_SESSION = 'its_session_v1';
const LS_HISTORY = 'its_call_history_v1';
// Login: localStorage.setItem(LS_SESSION, JSON.stringify({token, profile}))
// Logout: localStorage.removeItem(LS_SESSION)
// Guard: isLoggedIn = !!session
```

### Status Machine (NhiemVu)
```javascript
// applyStatus in TaskDetailViewPanel
// States: 0 (ChuaXuLy) → 1 (DaNhan) → 2 (DangXuLy) → 3 (HoanThanh)
const applyStatus = (s) => {
  if (s === detailStatus) return;  // no-op if same state
  setDetailStatus(s);              // local state only — no API call
  pushStatusLog(`Chuyển trạng thái: ${label}`, operatorName);
};
```
**Gap:** Transition validation (no backward jumps) is visual-only. Production needs server enforcement.

### File Attachment (Media upload)
```javascript
// 3 file inputs: camera capture (image), camera capture (video), gallery
// createObjectURL for preview → stored in attachments state
// No multipart upload implemented — URLs are object URLs only
```

### SOS Integration
```javascript
const SOS_TEL = import.meta.env?.VITE_SOS_TEL || '113';
const confirmSos = () => {
  setSosOpen(false);
  window.location.href = `tel:${SOS_TEL}`;  // native GSM dial
};
```

## Mock Data Patterns

All data hardcoded in `useMemo` (tasks, events, recentCompletedTasks, notifications, directory). Production will replace with API calls.

```javascript
// Example — tasks mock
const tasks = useMemo(() => [
  { id: 'NB-2024-001', code: 'TASK-8821', type: 'Tai nạn giao thông', level: 'Nghiêm trọng', ... },
  { id: 'NB-2024-002', code: 'TASK-8825', type: 'Xe hỏng hóc', level: 'Trung bình', ... },
], []);
```

## Production Migration Notes (React Native)

| Web (Prototype) | React Native (Production) |
|---|---|
| `localStorage` | `@react-native-async-storage/async-storage` |
| `window.location.href = tel:...` | `Linking.openURL('tel:...')` |
| `<input type="file" capture>` | `react-native-camera` or `launchCamera` |
| CSS/Tailwind | `StyleSheet` or `NativeWind` |
| SPA state routing | `react-navigation` |
| `fetch/axios` | `axios` + retry interceptor |
| No VoIP | `react-native-callkeep` + SIP.js |
| No push | `@react-native-firebase/messaging` + `react-native-push-notification` |

## Code Quality Notes

- Single 1154-line component file — acceptable for prototype, must be split for production
- No TypeScript — production should migrate to TypeScript
- No error boundaries — needed for production
- No accessibility attributes except `aria-label` on SOS button — needs audit
- URL.revokeObjectURL cleanup in TaskDetailViewPanel — correct memory management pattern ✓
- Vietnamese text rendered directly in JSX — confirm font support on target devices
