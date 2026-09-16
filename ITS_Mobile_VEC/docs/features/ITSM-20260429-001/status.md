# Implementation Status — ITSM-20260429-001 (M1: Xác thực và Liên lạc)

**Produced by:** from-code (Tier 3 LLM analysis of src/App.jsx)
**Date:** 2026-04-30

## Feature Status Summary

| Feature | Name | UI Complete | API Connected | Status | Score |
|---|---|---|---|---|---|
| M1-F001 | Đăng nhập hệ thống | ✅ | ❌ mock | in-progress | 0.45 |
| M1-F002 | Đăng xuất hệ thống | ✅ | ❌ local only | in-progress | 0.50 |
| M1-F003 | Cuộc gọi nội bộ PBX | ✅ | ❌ mock | stubbed | 0.18 |
| M1-F004 | Gọi khẩn cấp SOS GSM | ✅ | ✅ tel: | in-progress | 0.65 |
| M1-F005 | Hiển thị thông tin cá nhân | ✅ | ❌ mock | in-progress | 0.55 |

## Evidence

### M1-F001 — Đăng nhập
- `src/App.jsx:514-543` — `handleLogin()`: form validation + mock JWT (window.setTimeout 450ms)
- `src/App.jsx:70-83` — `loadSession()`: localStorage.getItem(LS_SESSION)
- **Gap:** No real API call; mock token format `'jwt-' + Date.now()`

### M1-F002 — Đăng xuất
- `src/App.jsx:545-555` — `handleLogout()`: removeItem(LS_SESSION) + removeItem(LS_HISTORY)
- **Gap:** No server-side JWT invalidation

### M1-F003 — VoIP Call (STUBBED)
- `src/App.jsx:557-573` — `addMockCallHistory()`: writes call record to localStorage only
- `src/App.jsx:482-490` — `directory`: hardcoded useMemo with 4 contacts
- **No SIP SDK in package.json** — stub only
- **Gap:** No SIP/VoIP integration whatsoever; entire PBX interaction mocked

### M1-F004 — SOS (BEST IMPLEMENTED)
- `src/App.jsx:72` — `const SOS_TEL = import.meta.env?.VITE_SOS_TEL || '113'`
- `src/App.jsx:574-577` — `confirmSos()`: `window.location.href = \`tel:${SOS_TEL}\``
- `src/App.jsx:1047-1055` — SOS FAB button: `absolute right-6 bottom-28 z-50` (always visible)
- **Implementation complete for web prototype; needs Linking.openURL for React Native**

### M1-F005 — Profile (READ-ONLY)
- `src/App.jsx:1003-1033` — ProfileView: displays `profile.ten_nhan_vien`, `profile.chuc_vu`, `profile.extension`, `profile.don_vi`
- Data sourced from mock session in handleLogin
- **Gap:** Profile data fetched from mock; needs ITS API /profile endpoint

## Gaps to Production

1. **M1-F001:** Connect to real ITS Auth API; implement token refresh
2. **M1-F002:** Server-side JWT blacklist or short TTL
3. **M1-F003:** Full SIP/VoIP stack (highest risk, highest effort)
4. **M1-F004:** Port `tel:` to `Linking.openURL` for React Native
5. **All:** React Native port (currently React Web SPA)
