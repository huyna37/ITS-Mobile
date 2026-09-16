# Designer Spec — M2: Quản lý Sự cố & Nhiệm vụ
> Scope: TaskListView · TaskDetailView
> Canonical design: `docs/intel/design-system.md`
> Source wireframe: `docs/source/UI.jsx`

---

## Screen 1: TaskListView (Nhiệm vụ + Sự kiện trên tuyến)

### Purpose
Màn hình chính sau đăng nhập. Hiển thị danh sách nhiệm vụ được giao + sự kiện giao thông tuyến đường để theo dõi.

### Layout

```
┌─────────────────────────────────────────────┐
│  [Header: NB-LC / Search / Avatar]         │  ← sticky header (list view only)
│─────────────────────────────────────────────│
│                                             │
│  Nhiệm vụ              [2 Việc cần làm]    │  ← displayLarge + counter chip
│  Hôm nay, 25 Tháng 05                      │  ← labelSmall, textMuted
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ [🔴]  TASK-8821    [Đã tiếp nhận]  │  │  ← TaskCard (critical)
│  │       Tai nạn giao thông            │  │
│  │       📍 Km 24+500  🕐 14:20 25/05 │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ [🟡]  TASK-8825    [Đang xử lý]    │  │  ← TaskCard (medium)
│  │       Xe hỏng hóc                   │  │
│  │       📍 Km 158+200  🕐 15:10       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Sự kiện trên tuyến         [Theo dõi]     │  ← displayMedium
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ [🔨] Sơn kẻ đường định kỳ  [Bảo trì]│  │  ← EventCard
│  │      📍 Km 40-45  🕐 08:00-17:00    │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ [🌧] Mưa lớn, tầm nhìn h/c [Thời t.]│  │  ← EventCard
│  │      📍 Khu vực Yên Bái  Đang d/ra   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│                                             │
│  [SOS FAB]                                 │
└─────────────────────────────────────────────┘
│         [Bottom Navigation Bar]            │
└─────────────────────────────────────────────┘
```

### Specs

| Element | Value |
|---|---|
| Screen bg | `background` (#F9FAFB) |
| Horizontal padding | 16dp |
| Section gap | 32dp between Nhiệm vụ and Sự kiện sections |
| Section title | `displayLarge` (24/900), `textPrimary` |
| Date subtitle | `labelSmall` (10/700), `textMuted` |
| Counter chip | `primaryLight` bg, `primary` text, `micro` font, radius full, border 1dp blue-100, px 12 py 4 |
| TaskCard: icon size | 24dp |
| TaskCard: icon container | 48×48, radius 16 |
| TaskCard: icon bg (critical) | `criticalBg` (#FEF2F2) with red icon |
| TaskCard: icon bg (medium) | `warningBg` (#FFFBEB) with amber icon |
| EventCard: icon container | 48×48, bg `surface`, shadow card, radius 16, border 1dp `border` |
| EventCard bg | white/60, backdrop blur, border gray-200/50, radius 24 |
| "Theo dõi" tag | bg `surfaceAlt`, text `textMuted`, `micro`, radius full |

### Empty State (no tasks)
```
┌──────────────────────────────┐
│         [✓ icon large]       │
│   Không có nhiệm vụ nào      │
│   Hôm nay bạn đã hoàn thành  │
│   tất cả công việc!          │
└──────────────────────────────┘
```
- Icon: CheckCircle2, 64dp, `success` color
- Title: `titleLarge`, `textPrimary`
- Subtitle: `bodyMedium`, `textSecondary`

### Pull-to-Refresh
- RefreshControl, tint color `primary`
- Calls task list API (BR-INTEL-011, BR-INTEL-012: < 3s)

---

## Screen 2: TaskDetailView (Chi tiết sự cố)

### Purpose
Xem đầy đủ thông tin sự cố, phương án xử lý, cập nhật trạng thái, đính kèm ảnh hiện trường.

### Layout

```
┌─────────────────────────────────────────────┐
│  ← Chi tiết sự cố                    [📞]  │  ← sticky header
│─────────────────────────────────────────────│  ← border-b
│                                             │  ↕ scrollable
│  ┌──────────────────────────────────────┐  │
│  │ [Nghiêm trọng]            Mã: NB-... │  │  ← SeverityBadge + code
│  │ Tai nạn giao thông                  │  │  ← displayLarge
│  │                                      │  │
│  │  Vị trí         Hướng               │  │  ← 2-col grid
│  │  Km 24+500      Hướng Lào Cai        │  │
│  │─────────────────────────────────────│  │
│  │  Mô tả hiện trường                  │  │
│  │  ┌───────────────────────────────┐  │  │
│  │  │ Va chạm giữa 2 xe con...     │  │  │  ← gray-50 bg box
│  │  └───────────────────────────────┘  │  │
│  │                                      │  │
│  │  Phương án xử lý (Script)            │  │
│  │  ┌───────────────────────────────┐  │  │
│  │  │ Phân luồng từ xa, xe cứu hộ  │  │  │  ← blue-50 bg, blue-700 text
│  │  └───────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Cập nhật trạng thái                       │
│  ┌───────────┬─────────────┬────────────┐  │
│  │ Đã nhận  │ Đang xử lý │ Hoàn thành │  │  ← StatusButton row
│  │  (1) 🟡  │   (2) 🔵   │  (3) 🟢   │  │
│  └───────────┴─────────────┴────────────┘  │
│                                             │
│  Hình ảnh hiện trường                      │
│  ┌──────┐ ┌──────┐ ┌──────┐              │
│  │[cam] │ │ img1 │ │ img2 │ ...          │  ← photo grid
│  └──────┘ └──────┘ └──────┘              │
│                                             │
│                                [SOS FAB]   │
│─────────────────────────────────────────────│  ← sticky bottom
│  ┌─────────────────────────────────────┐   │
│  │        CẬP NHẬT KẾT QUẢ           │   │  ← PrimaryButton
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Specs

| Element | Value |
|---|---|
| Header | height 56, bg `surface`, border-b 1dp `border`, sticky (position fixed top) |
| Back button | 40×40 touch area, ChevronRight rotated 180°, `textPrimary` |
| Header title | `titleMedium` (16/700), `textPrimary`, centered |
| Call header button | 40×40, PhoneCall icon 20dp, `primary` — quick-dial from task |
| Info card | bg `surface`, radius 24, border `border`, shadow card, padding 20 |
| Severity badge | filled pill — red/amber, white text, `labelSmall`, px 12 py 4 |
| Task ID code | `labelSmall` (10/700), `textMuted` |
| Task type | `displayLarge` (24/900), `textPrimary` |
| Info grid | 2 columns, gap 16, padding-top 8, border-top 1dp gray-50 |
| Grid label | `labelSmall`, `textMuted`, uppercase |
| Grid value | `titleSmall` (14/700), `textPrimary` |
| Description box | bg `surfaceAlt`, radius 12, padding 12, `bodyMedium` (14/400), `textSecondary` |
| Script box | bg `primaryLight` (#E6F5FE), radius 12, padding 12, `titleSmall` (14/700), blue-700 |
| Status buttons | 3-col grid, height 48, radius 16, border 1dp |
| Status 1 active | bg amber-500, white text |
| Status 2 active | bg blue-500, white text |
| Status 3 active | bg green-500, white text |
| Status inactive | bg `surface`, text `textMuted`, border `border` |
| Photo grid | 3 columns, gap 8 |
| Camera button | aspect-square (approx 100×100), bg `surfaceAlt`, radius 16, border 2dp dashed `borderMedium`, Camera icon 24dp `textMuted` |
| Captured photo | aspect-square, radius 16, Image fill |
| Bottom bar | bg `surface`, border-top 1dp `border`, padding 16, sticky bottom |
| CTA button | `PrimaryButton` — full width, height 56 |

### Status Update UX Detail
```
Current status highlighted:
  status=1 → Đã nhận (1) button is amber-filled, others white
  status=2 → Đang xử lý (2) button is blue-filled
  status=3 → Hoàn thành (3) button is green-filled

User taps next status button:
  → Optimistic UI: update button highlight immediately
  → Call API in background
  → On error: revert highlight, show toast "Cập nhật thất bại. Thử lại."
  → Forward-only (cannot go backwards — BR-INTEL-016)
```

### "Cập nhật kết quả" Modal (on CTA tap)
```
┌──────────────────────────────────────┐
│  Cập nhật kết quả xử lý             │  ← sheet title
│                                      │
│  Trạng thái mới:  [Đang xử lý →]   │  ← read-only, shows next status
│                                      │
│  Ghi chú hiện trường (tuỳ chọn)    │
│  ┌────────────────────────────────┐ │
│  │  Nhập ghi chú...               │ │  ← TextInput multiline
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │     XÁC NHẬN CẬP NHẬT         │ │  ← PrimaryButton
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │     Hủy                        │ │  ← ghost button
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Photo Section Detail
- First cell always = camera button (add new)
- Captured photos append to grid after camera button
- Tap existing photo: full-screen viewer
- Long-press photo: delete option
- Max photos: TBD (BA to define) — show remaining count if limited

---

## Responsive Considerations

| Device | Adjustment |
|---|---|
| Small screen (360×640) | Reduce info card padding to 16; status button text may truncate — use abbreviation "Đã nhận / Xử lý / Xong" |
| Large screen (414×896) | Info card fills width naturally; photo grid may show 4 columns |

## Handoff Checklist

```
[ ] TaskListView: FlatList with sections (Nhiệm vụ + Sự kiện = 2 sections)
[ ] TaskListView: RefreshControl for pull-to-refresh (BR-INTEL-012: < 3s)
[ ] TaskDetailView: KeyboardAvoidingView for ghi-chu input in modal
[ ] Status buttons: disabled state for completed tasks (status=3, all gray)
[ ] CTA button: disabled when status=3 (Hoàn thành — no further updates)
[ ] Photo grid: ImagePicker with camera-first (BR-INTEL-020)
[ ] Script box: selectable text (field staff may need to copy location)
[ ] Header call button: PhoneCall links to CallsView with contact pre-selected
[ ] SOS FAB visible on this screen
```
