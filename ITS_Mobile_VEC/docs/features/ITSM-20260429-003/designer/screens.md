# Designer Spec — M3: Thông báo
> Scope: NotificationsView
> Canonical design: `docs/intel/design-system.md`
> Source wireframe: `docs/source/UI.jsx`

---

## Screen 1: NotificationsView (Thông báo)

### Purpose
Hiển thị danh sách thông báo từ hệ thống ITS và TMC. Đánh dấu đã đọc / chưa đọc.

### Layout

```
┌─────────────────────────────────────────────┐
│  [Header: NB-LC / Search / Avatar]          │
│─────────────────────────────────────────────│
│                                             │
│  Thông báo                                  │  ← displayLarge
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ [🔔]  Phân công nhiệm vụ mới  10 ph │  │  ← UNREAD card (blue bg)
│  │       Có sự cố Km 45+200 h/Hà Nội   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ [🔔]  Cập nhật hệ thống    2 giờ tr │  │  ← read card (white bg)
│  │       Hệ thống Camera IC12 h.trở lại │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  [Empty area — more notifs scroll here]    │
│                                             │
│                          [SOS FAB]         │
└─────────────────────────────────────────────┘
│              [Bottom Navigation Bar]        │
└─────────────────────────────────────────────┘
```

### Specs

| Element | Value |
|---|---|
| Screen bg | `background` (#F9FAFB) |
| Screen padding | 16dp horizontal |
| Title | `displayLarge` (24/900), `textPrimary`, margin-bottom 16 |
| Card gap | 12dp |

#### Unread Notification Card
| Property | Value |
|---|---|
| Background | `primaryLight` (#E6F5FE) |
| Border | 1dp, `#BFDBFE` (blue-200) |
| Border radius | 24dp |
| Shadow | card shadow |
| Padding | 16dp |
| Icon container | 36×36, bg `primary` (#0097F0), radius 12, Bell icon 20dp white |

#### Read Notification Card
| Property | Value |
|---|---|
| Background | `surface` (#FFFFFF) |
| Border | 1dp, `border` (#F3F4F6) |
| Border radius | 24dp |
| Shadow | none |
| Padding | 16dp |
| Icon container | 36×36, bg `surfaceAlt` (#F3F4F6), radius 12, Bell icon 20dp `textMuted` |

#### Card Content (shared)
| Element | Value |
|---|---|
| Title | `titleSmall` (14/700), `textPrimary`, leading tight, max 1 line |
| Timestamp | `micro` (9/900), `textMuted`, right-aligned, whitespace nowrap |
| Description | `bodySmall` (13/400), `textSecondary`, margin-top 4 |

### Notification Type → Icon / Color Mapping

| Type (loai) | Icon | Unread icon bg | Read icon bg | Badge label |
|---|---|---|---|---|
| PhanCong | ClipboardList | `primary` | `surfaceAlt` | "Nhiệm vụ mới" |
| CapNhatTrangThai | CheckCircle2 | blue-600 | `surfaceAlt` | "Cập nhật" |
| HeThong | Info | gray-600 | `surfaceAlt` | "Hệ thống" |
| TMC | ShieldAlert | `primary` | `surfaceAlt` | "TMC" |

> Differentiated icons help field staff quickly scan notification type without reading text.

### Unread Badge (Bottom Navigation Alert Tab)
```
Position: absolute, top -2, right -2 of Bell icon in tab bar
Size: 8×8 circle
Color: #EF4444 (red-500)
Border: 1dp white
Visibility: show when unreadCount > 0
Badge number (future): if unreadCount > 9, show "9+" pill instead of dot
```

### Read/Unread Interaction

```
User taps notification card:
  → Mark as read (da_doc = true)
  → Card transitions from unread style → read style (200ms bg fade)
  → If type == PhanCong or CapNhatTrangThai AND nhiem_vu_id present:
      → Navigate to TaskDetailView for that task (deep link)
  → Unread badge count decrements by 1
  → If unreadCount == 0: remove red dot from nav tab

Long-press notification card (future — not in v1):
  → Context menu: "Đánh dấu chưa đọc" | "Xóa" (out of scope v1)
```

### Empty State
```
┌──────────────────────────────┐
│          [🔔 icon 64dp]      │
│                               │
│  Không có thông báo nào      │  ← titleLarge, textPrimary
│  Bạn đã đọc hết rồi!         │  ← bodyMedium, textSecondary
└──────────────────────────────┘
```

### Push Notification (System Tray — when app in background)

iOS / Android system notification appearance:
```
┌─────────────────────────────────────────────┐
│  [🧭] NB-LC Express                  Now    │
│  Phân công nhiệm vụ mới                     │
│  Có sự cố Km 45+200 hướng Hà Nội           │
└─────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| App icon | Navigation icon, `primary` bg |
| Title | Notification `title` field (Vietnamese, max 50 chars) |
| Body | Notification `description` field (max 100 chars) |
| Tap behavior | Open app → navigate to notification screen; if PhanCong type → deep link to task |
| iOS badge | Shows unread count on app icon |

---

## Component: Notification Type Badge (optional — future enhancement)

```
Pill badge in top-right of notification content area:
  "Nhiệm vụ mới" — bg primaryLight, text primary
  "Cập nhật"     — bg blue-50, text blue-600
  "Hệ thống"    — bg gray-100, text gray-600
  "TMC"          — bg primaryLight, text primary

Font: micro (9/900), uppercase
Radius: full
Padding: px 6, py 2
```

---

## Responsive Considerations

| Device | Adjustment |
|---|---|
| Small screen | Card padding reduces to 12dp; timestamp may wrap — allow 2 lines for title |
| Large screen | Cards expand full width within 16dp margin |

## Handoff Checklist

```
[ ] NotificationsView: FlatList with inverse-chron ordering (newest first)
[ ] Unread → read transition: smooth bg color change (Animated.Value)
[ ] Tap on PhanCong/CapNhatTrangThai: deep link to TaskDetailView
[ ] Unread count: stored in app state (Context/Redux), decrements on tap
[ ] Nav tab bell: unread dot visibility bound to unreadCount > 0
[ ] Push notification tap (cold start): navigate to notifications then deep link
[ ] FCM payload: map loai field to notification type icon/color
[ ] Badge (iOS): set via react-native-notifications or Firebase
[ ] SOS FAB visible on this screen
[ ] Vietnamese text: title/desc from server — ensure utf8mb4 rendering
```
