---
feature-id: ITSM-20260429-001
stage: designer
agent: designer
verdict: Ready for SA
last-updated: 2026-04-30
figma_file_url: null
figma_frame_ids: []
---

# Screen Specifications — M1 (Lean)

| Item | Value |
|---|---|
| Brand | Primary `#0097F0` |
| Language | Vietnamese (all user-facing strings) |
| Platform | React Native — iOS + Android |
| Kit vocabulary | No `docs/ui-library/component-catalog.md` (RN app). Use primitives below. |

---

## Metronic vs RN (this delivery)

| Area | Kit source | Notes |
|---|---|---|
| Vocabulary | RN patterns (project) | `View`, `Text`, `TextInput`, `TouchableOpacity` / `Pressable`, `FlatList`, `Modal`, `SafeAreaView`, `ActivityIndicator`, `KeyboardAvoidingView` |
| Categories | Layout, Forms, Lists, Feedback, Overlay | — |
| Screen compositions | See per-screen tables | — |

---

## Reuse map (cross-screen)

| Component / pattern | Used in |
|---|---|
| `SafeAreaView` + app header row | CallsView, ProfileView |
| `PrimaryButton` pattern (Touchable + brand fill) | LoginView |
| `ContactRow` (avatar initial, name, ext, presence dot, call action) | CallsView directory tab |
| `HistoryRow` (ext, display name fallback, time, duration, status chip) | CallsView history tab |
| `SosFab` + `SosConfirmModal` | Root authenticated layer (not LoginView when unauthenticated) |
| `ConfirmModal` pattern | SOS, logout |
| Inline `Text` error below field | LoginView |

---

## 1. LoginView

**Purpose:** Dual-credential authentication (`tai_khoan`, `extension_pbx`, `mat_khau`) → JWT; NFR login under 2 s perceived (show loading on submit).

**Layout:** Vertical stack — optional logo/branding → three labeled fields → primary CTA `ĐĂNG NHẬP`. `KeyboardAvoidingView` + scroll if needed.

**Components:** `SafeAreaView`, `KeyboardAvoidingView`, `ScrollView` (optional), `View`, `Text`, `TextInput` ×3, `TouchableOpacity` (submit), `ActivityIndicator` (submitting).

**Navigation triggers**

| Action | Next |
|---|---|
| Successful login | Replace/navigate to **CallsView** (authenticated stack) |
| Expired session from deep link (if any) | Stay; show generic error |

**States**

| State | UI |
|---|---|
| Default | Empty fields; button enabled |
| Submitting | Primary button disabled; inline or button-embedded `ActivityIndicator` |
| Field-level error | Red text under field(s); preserve other inputs |
| Form-level error | e.g. network: banner or single message above button (Vietnamese) |
| Success | Immediate transition (no toast required for MVP) |

**Validations (inline, Vietnamese)**

| Rule | When | Message pattern |
|---|---|---|
| Required | Submit with blank | Indicate which field(s) missing |
| `extension_pbx` exactly 4 digits | Submit | e.g. Extension phải gồm đúng 4 chữ số |
| Server rejects credentials | API 401/403 | Không đăng nhập được — không leak which factor failed |

**SOS FAB:** **Hidden** while user is **not** authenticated (aligns with “authenticated screens only”; resolves ambiguity vs AC-008.1 wording).

---

## 2. CallsView

**Purpose:** Internal PBX directory with presence; initiate VoIP calls; browse **local** call history; entry to Profile.

**Layout:** Top title **Liên lạc** (or **Liên lạc PBX**) → **segmented control / Material tabs** — **Danh bạ** | **Lịch sử** → content area → FAB stack sits above (see SOS).

**Components:** `SafeAreaView`, `View`, tab control (`Pressable` pair or `@react-navigation/material-top-tabs` if adopted), two `FlatList` panels (lazy mount per tab OK), row cells as below.

### 2a. Tab — Danh bạ (directory)

**Row content**

| Column | Source | Notes |
|---|---|---|
| Name | Directory API | Primary label |
| Extension | Directory | Secondary muted |
| Presence | PBX presence | **Online:** green dot · **Offline:** grey dot (not absent dot) |
| Action | Tap phone icon | Initiates SIP dial |

**States**

| State | UI |
|---|---|
| Loading | Skeleton rows or centered spinner |
| Empty | Illustration/text **Chưa có danh bạ** + retry if pull failed |
| Error | Inline message + **Thử lại** |
| Success | List |

### 2b. Tab — Lịch sử

**Row fields (display)**

| Field | Binding | Fallback |
|---|---|---|
| Extension | `extension_nguoi_nhan` (or paired field per SA model) | — |
| Name | `ten_nguoi_nhan` | If null → **`so_dien_thoai`** (per product constraint) |
| Time | `thoi_gian_goi` | Locale-formatted |
| Duration | `thoi_luong` (seconds) | If null → **—** or **Không có** for missed |
| Status | enum | Chips align SA/dev with states — e.g. Đổ chuông / Đã kết nối / Đã kết thúc / Gọi nhỡ |

**States:** Loading / empty (**Chưa có cuộc gọi**) / normal list.

### 2c. VoIP session overlay (not a fourth route ID — UX surface on Calls stack)

**Must cover AC:** ringing → connected → ended / missed.

| Phase | User-visible UI |
|---|---|
| Ringing | Banner or full-screen sheet: callee id/name, **Đang đổ chuông…**, cancel/end |
| Connected | Timer optional; **Kết thúc** primary |
| Ended | Brief toast/snackbar optional; overlay dismiss → history tab updates |
| Missed | Same overlay dismiss; history shows **Nhỡ** |

**SA-impact UX decisions**

| Topic | Recommendation |
|---|---|
| Overlay strategy | Modal-group overlay above tabs **or** dedicated full-screen route pushed on stack — either acceptable if SOS FAB remains above overlay layer (`zIndex` > overlay) |
| SOS vs call controls | FAB remains tappable during ringing/connected (AC-008.1); avoid FAB overlapping sole primary hang-up control — FAB bottom-end, hang-up centered |

**Navigation triggers**

| Action | Next |
|---|---|
| Header/profile affordance | `ProfileView` |
| Tap call on row | VoIP overlay ringing |

---

## 3. ProfileView

**Purpose:** Read-only identity — **tên nhân viên**, **đơn vị**, **extension**, **chức vụ** (role); logout.

**Layout:** Header **Cá nhân** → card with avatar initial → lines for fields → destructive **Đăng xuất hệ thống**.

**Components:** `SafeAreaView`, `View`, `Text`, avatar `View`, logout `TouchableOpacity`.

**Fields (read-only, no `TextInput`)**

| Label (VN) | Field key |
|---|---|
| Họ và tên | `ten_nhan_vien` |
| Đơn vị | `don_vi` |
| Extension | `extension` or session mirror of `extension_pbx` |
| Chức vụ | `chuc_vu` |

**States**

| State | UI |
|---|---|
| Loading | Spinner/skeleton on card |
| Error | Retry |
| Success | Static display |

**Logout:** Tap → **confirmation Modal** → on confirm: clear JWT + local history (AC-003.1) → **reset navigation** to LoginView (AC-003.2 — no back to authenticated screens).

---

## 4. SOS_FAB (global authenticated overlay)

**Purpose:** One-tap emergency GSM via `tel:`; works **without internet** (AC-007.2); visible on **all authenticated screens** including **active VoIP overlay** (AC-008.1).

**Implementation placement:** Root navigator layer **above** scene content and **above** VoIP overlay (`zIndex` / elevation highest practical).

**Visual (hints)** — circular FAB, red fill distinct from brand blue; white icon; safe margin from bottom/right (~24dp).

**Components:** `View`/`Pressable` positioned absolute; icon library Phone; `Modal` for confirmation.

**Interaction**

| Step | Behavior |
|---|---|
| Tap FAB | Open **Modal** (or bottom sheet) — Vietnamese copy: warning + hotline display |
| Confirm | `Linking.openURL('tel:+…')` per configured number |
| Cancel | Close modal |

**States**

| State | UI |
|---|---|
| Idle | FAB visible |
| Modal open | FAB still visible underneath OR obscured — either OK; **confirm/cancel** clear |

**Accessibility:** `accessibilityLabel` Vietnamese; `accessibilityRole="button"`; confirm button labeled distinctly.

---

## Design findings (severity)

| ID | Sev | What user sees | Why it matters | Evidence | Improvement |
|---|---|---|---|---|---|
| DF-001 | High | FAB vs BA AC “every screen” list including LoginView post-auth | Wrong FAB on login confuses emergency entry | AC-008.1 vs stakeholder rule “authenticated only” | Implement FAB **only when `isAuthenticated`** |
| DF-002 | Medium | VoIP overlay + FAB overlap | Miss tap or SOS accidental | CallsView + overlay spec | Offset FAB; large touch targets |
| DF-003 | Medium | History **ten_nguoi_nhan** nullable | Blank rows confuse | BA GAP-NEW-001 | Fallback chain to `so_dien_thoai` in UI |

---

## Flow issues

| ID | Issue |
|---|---|
| FI-001 | Navigation after logout must reset stack — hardware back must not reopen Profile/Calls |
| FI-002 | Session expiry while on CallsView → LoginView without leaking prior screen |

---

## Consistency

| Topic | Rule |
|---|---|
| Errors | Login: inline Vietnamese; network: short Vietnamese |
| Presence | Online green / offline grey dot always |

---

## Accessibility (baseline)

| Item | Expectation |
|---|---|
| Focus order | Login fields top-to-bottom; FAB last in SR order on screen or landmark |
| Errors | Announce field error on submit |
| FAB | Named **Gọi SOS khẩn cấp** |

---

## Assumptions / SA verification

| Item | Owner |
|---|---|
| Exact SOS confirmation strings | Copy review |
| VoIP UI as modal vs stack screen | SA picks; FAB layering invariant |
| `so_dien_thoai` field presence on history row model | SA schema |

---

## UX decisions impacting SA architecture

| ID | Decision | Impact |
|---|---|---|
| UX-SA-001 | SOS FAB at root above VoIP overlay | Navigator layering / portal |
| UX-SA-002 | Logout → stack reset | Navigation container reset API |
| UX-SA-003 | Session restore bypasses LoginView | Single gate on app bootstrap |
| UX-SA-004 | Local-only history after calls | SQLite/AsyncStorage; no sync |

---

```json
{
  "agent": "designer",
  "stage": "designer",
  "verdict": "Ready for SA",
  "screens_completed": ["LoginView", "CallsView", "ProfileView", "SOS_FAB"],
  "flows_completed": true,
  "ux_decisions_for_sa": [
    "SOS FAB rendered only when authenticated; highest z-index above VoIP overlay",
    "VoIP ringing/connected/missed as overlay or dedicated route — FAB must remain accessible",
    "Logout resets navigation stack to LoginView; block back to authenticated routes",
    "CallsView uses tabs: Danh bạ (presence dots) + Lịch sử (local storage)",
    "Call history display fallback: ten_nguoi_nhan → so_dien_thoai",
    "Offline presence: grey dot (not invisible)"
  ],
  "risk_score": 3,
  "token_usage": {
    "this_agent": "~6200",
    "pipeline_total": "~14700"
  }
}
```
