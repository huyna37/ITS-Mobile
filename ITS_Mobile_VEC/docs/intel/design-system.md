# Design System — ITS Mobile VEC (NB-LC Express)
> Extracted from UI.jsx wireframe. React Native implementation target.

---

## 1. Design Tokens

### Colors

```ts
export const colors = {
  // Brand
  primary:        '#0097F0',   // main brand — buttons, active tabs, focus rings
  primaryLight:   '#E6F5FE',   // bg-blue-50 — cards, chips, unread bg
  primaryDark:    '#0078C2',   // pressed state

  // Semantic — Severity
  critical:       '#EF4444',   // red-500 — Nghiêm trọng badge (filled)
  criticalBg:     '#FEF2F2',   // red-50 — icon bg for critical tasks
  warning:        '#F59E0B',   // amber-500 — Trung bình badge
  warningBg:      '#FFFBEB',   // amber-50 — icon bg for medium tasks
  success:        '#22C55E',   // green-500 — Hoàn thành badge
  successBg:      '#F0FDF4',   // green-50
  info:           '#3B82F6',   // blue-500 — Đang xử lý badge

  // Status badges (text/bg pairs)
  status1Bg:      '#FEF3C7',   // amber-100
  status1Text:    '#B45309',   // amber-700 — Đã tiếp nhận
  status2Bg:      '#DBEAFE',   // blue-100
  status2Text:    '#1D4ED8',   // blue-700 — Đang xử lý
  status3Bg:      '#DCFCE7',   // green-100
  status3Text:    '#15803D',   // green-700 — Hoàn thành

  // Neutral
  background:     '#F9FAFB',   // gray-50 — app background
  surface:        '#FFFFFF',   // card / sheet surfaces
  surfaceAlt:     '#F3F4F6',   // gray-100 — input bg, avatar bg
  border:         '#F3F4F6',   // gray-100 — card borders
  borderMedium:   '#E5E7EB',   // gray-200 — dividers
  textPrimary:    '#1F2937',   // gray-800 — headings
  textSecondary:  '#6B7280',   // gray-500 — body text
  textMuted:      '#9CA3AF',   // gray-400 — labels, timestamps
  textDisabled:   '#D1D5DB',   // gray-300 — inactive icons

  // Danger
  danger:         '#EF4444',   // red-500 — SOS button, logout
  dangerBg:       '#FEF2F2',   // red-50 — logout button bg
  dangerActive:   '#DC2626',   // red-600 — SOS FAB bg

  // Background gradient (header decoration)
  gradientStart:  '#0097F0',
  gradientEnd:    '#00D2FF',
}
```

### Typography

```ts
export const typography = {
  // Font: system default (San Francisco on iOS, Roboto on Android)
  // All sizes in sp (scale-independent pixels)

  displayLarge:   { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },  // screen titles
  displayMedium:  { fontSize: 20, fontWeight: '900' },                        // section headers
  titleLarge:     { fontSize: 18, fontWeight: '700', lineHeight: 24 },        // task type heading
  titleMedium:    { fontSize: 16, fontWeight: '700' },                        // sub-section headers
  titleSmall:     { fontSize: 14, fontWeight: '700' },                        // contact names
  bodyMedium:     { fontSize: 14, fontWeight: '400', lineHeight: 20 },        // descriptions
  bodySmall:      { fontSize: 13, fontWeight: '400' },                        // meta text
  labelLarge:     { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },   // buttons
  labelSmall:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
                    textTransform: 'uppercase' },                             // field labels, badges
  micro:          { fontSize: 9,  fontWeight: '900', letterSpacing: 1 },      // tiny tags
}
```

### Spacing & Layout

```ts
export const spacing = {
  // Base unit: 4dp
  xs:   4,   // tight gaps
  sm:   8,   // compact gaps
  md:   12,  // standard gaps
  lg:   16,  // section padding
  xl:   20,  // card padding
  xxl:  24,  // large gaps
  xxxl: 32,  // section spacing
}

export const layout = {
  screenPaddingH:   16,   // horizontal screen padding (p-4)
  cardPaddingH:     20,   // card internal padding (p-5)
  bottomNavHeight:  80,   // nav bar height (approx, includes safe area)
  headerHeight:     88,   // header with status bar
  fabSize:          56,   // SOS FAB diameter
  fabBottomOffset:  112,  // bottom-28 = 112dp from bottom
}
```

### Border Radius

```ts
export const radius = {
  sm:     8,   // rounded-xl — small chips, code badges
  md:     16,  // rounded-2xl — buttons, inputs, action chips
  lg:     24,  // rounded-3xl — task cards, notification cards
  xl:     32,  // rounded-[32px] — profile avatar
  full:   9999, // pill badges, online dot
  nav:    40,  // rounded-t-[40px] — bottom nav top corners
}
```

### Shadows

```ts
// React Native shadow (iOS) + elevation (Android)
export const shadows = {
  card:    { shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4, elevation:2 },
  button:  { shadowColor:'#0097F0', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:6 },
  fab:     { shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.25, shadowRadius:16, elevation:12 },
  nav:     { shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.06, shadowRadius:12, elevation:8 },
  header:  { shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:8, elevation:3 },
}
```

---

## 2. Component Library

### 2.1 TaskCard

```
┌──────────────────────────────────────────────┐
│ ┌──────┐  TASK-8821          [Đã tiếp nhận] │
│ │ 🔴   │  Tai nạn giao thông               │
│ │ icon │  📍 Km 24+500   🕐 14:20 25/05   │
│ └──────┘                                 ›  │
└──────────────────────────────────────────────┘
```
- Bg: `surface` | Border: `border` | Radius: `lg` (24)
- Icon bg: `criticalBg` (red) or `warningBg` (amber) based on level
- Status badge: `status1Bg/Text`, `status2Bg/Text`, `status3Bg/Text`
- Code: `labelSmall`, `textMuted`
- Type: `titleLarge`, `textPrimary`
- Meta row: `bodySmall`, `textSecondary`, icon size 12
- Chevron: `textDisabled`
- Press: `scale(0.98)` with 150ms ease

### 2.2 SeverityBadge (filled)
```
Rounded pill, white text, filled:
  Nghiêm trọng → bg: critical (#EF4444)
  Trung bình   → bg: warning (#F59E0B)
  Nhẹ          → bg: success (#22C55E)
```
- Padding: horizontal 12, vertical 4
- Radius: `full`
- `labelSmall` font, white text

### 2.3 StatusButton (3-state row)
```
[Đã nhận (1)] [Đang xử lý (2)] [Hoàn thành (3)]
  active: colored bg + white text
  inactive: white bg + gray text + gray border
```
- Grid: 3 columns, gap 8
- Radius: `md` (16)
- Border: 1dp
- Active colors: amber-500, blue-500, green-500

### 2.4 PrimaryButton
```
Full-width, height 56, radius md (16)
Background: primary (#0097F0)
Text: white, labelLarge, uppercase
Shadow: button shadow
Active: scale(0.97)
```

### 2.5 TextInput
```
Background: surfaceAlt (#F3F4F6)
Border: none (unless focus: primary ring)
Radius: md (16)
Padding: 16 all sides
Font: bodyMedium
Label above: labelSmall, textMuted, uppercase
Focus ring: 2dp, primary color
```

### 2.6 ContactRow
```
┌──────────────────────────────────────────────┐
│ ┌──────┐                       ┌──────────┐ │
│ │  T   │  Tên liên lạc         │  📞      │ │
│ │ 🟢   │  Extension: 9901      └──────────┘ │
│ └──────┘                                    │
└──────────────────────────────────────────────┘
```
- Avatar: 48x48, radius 16, `surfaceAlt`, first-letter initial
- Online dot: 12x12, `success` green, position absolute top-right, border 2 white
- Call button: 40x40 approx, `primaryLight` bg, `primary` icon, radius 12
- Separator: 1dp `border` between rows

### 2.7 NotificationCard
```
Unread: bg primaryLight, border blue-100, shadow sm
Read:   bg surface, border border
Icon: Bell, 20dp, bg primary/gray, radius 12
Title: titleSmall, textPrimary
Desc: bodySmall, textSecondary
Time: micro, textMuted, right-aligned
```

### 2.8 EventCard
```
Glass effect: bg white/60, backdrop blur, border gray-200/50
Icon container: 48x48, surface bg, shadow sm, radius 16
Title: titleSmall, truncated
Tag: micro, primary color, right
Meta: bodySmall, textMuted
```

### 2.9 SOS FAB
```
Position: absolute, right 24, bottom fabBottomOffset (112)
Size: 56x56, radius full
Background: dangerActive (#DC2626)
Icon: PhoneCall, 24dp, white
Border: 4dp white
Shadow: fab shadow
Z-index: 50 (above all content)
Animation: subtle bounce (attention-grabbing)
Active: scale(0.90)
```

### 2.10 Bottom Navigation Bar
```
Height: ~80dp + safe area inset
Background: white/90 (blurred)
Border top: 1dp border
Top radius: 40dp (pill nav effect)
Shadow: nav shadow

Tab item:
  - Icon: 26dp
  - Label: labelSmall, only shown when active
  - Active: icon primary color, label visible, scale 1.1
  - Inactive: icon textDisabled, label hidden (opacity 0)
  - Transition: scale + opacity 150ms
  - Badge (alerts tab): 8x8 red dot, absolute top-right of icon
```

---

## 3. Screen Inventory

| # | Screen ID | Module | Route/Tab | Purpose |
|---|---|---|---|---|
| 1 | LoginView | M1 | Initial (no auth) | Dual-credential login |
| 2 | TaskListView | M2 | tab: tasks | Task list + events feed |
| 3 | TaskDetailView | M2 | pushed from TaskListView | Task detail + status update + photos |
| 4 | CallsView | M1 | tab: calls | PBX directory + call history |
| 5 | NotificationsView | M3 | tab: alerts | Notification list |
| 6 | ProfileView | M1 | tab: profile | User info + logout |
| 7 | SOS_FAB | M1 | persistent overlay | Emergency SOS call |

---

## 4. Navigation Architecture

```
(App Root)
├── AuthStack
│   └── LoginScreen              ← no auth
└── MainStack (authenticated)
    ├── BottomTabNavigator
    │   ├── tasks  → TaskListScreen    [default]
    │   ├── calls  → CallsScreen
    │   ├── alerts → NotificationsScreen
    │   └── profile → ProfileScreen
    ├── TaskDetailScreen          ← pushed on top of tabs (full screen)
    └── [SOS FAB]                 ← absolute overlay on all authenticated screens
```

**Navigation library:** React Navigation v6
- `createNativeStackNavigator` for root
- `createBottomTabNavigator` for tabs
- SOS FAB: rendered in root layout (outside navigator), always visible

---

## 5. Global Overlays

### Header (list view only)
```
┌─────────────────────────────────────────────┐
│  [🧭]  NB-LC           [🔍]  [OP1 avatar]   │
│        Vận hành ITS                          │
└─────────────────────────────────────────────┘
```
- Logo: 48x48, radius 16, `primary` bg, white Navigation icon
- Title: 18dp, font-black, uppercase, `primary` color
- Subtitle: labelSmall, `textMuted`, uppercase, letter-spacing wide
- Search: 40x40, white/80 bg blur, radius 16, shadow sm
- Avatar: 48x48, radius 16, blue-100 bg, blue-600 text

### Background Decoration (subtle, list view)
- Gradient strip: top, 320dp height, 10% opacity, `gradientStart`→`gradientEnd`, bottom radius 100
- Blur circle: top-right, 256x256, 10% opacity, `primary`, blur 48

---

## 6. Transitions & Motion

| Interaction | Animation |
|---|---|
| Task card tap | scale 0.98, 150ms ease |
| Tab switch | fade + slight slide (React Navigation default) |
| Detail push | slide left (iOS native stack) |
| SOS button press | scale 0.90, 150ms |
| Primary button press | scale 0.97, 150ms |
| SOS FAB idle | subtle bounce (attention) |
| Status button select | bg color transition 200ms |

---

## 7. Accessibility

- Minimum touch target: 44x44dp (all interactive elements)
- SOS FAB: announce "Nút gọi khẩn cấp SOS" via AccessibilityLabel
- Status buttons: state announced ("Đang xử lý, đã chọn")
- Color not the only status indicator: status labels always shown alongside color
- Online dot: AccessibilityLabel on avatar ("Trực tuyến" / "Ngoại tuyến")
