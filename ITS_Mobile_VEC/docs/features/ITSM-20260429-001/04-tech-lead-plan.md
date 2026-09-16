---
feature-id: ITSM-20260429-001
last-updated: 2026-04-30
---

# Tech Lead — Kế hoạch thực thi (Lean)

## Waves

| Wave | Agent | Nội dung | Artifact |
|---|---|---|---|
| 1 | fe-dev | Shell Vite + React + Tailwind; routing tab; theme `#0097F0` | `src/App.jsx` |
| 1 | dev | Auth mock + `localStorage` session; logout clear history | cùng |
| 2 | fe-dev | CallsView: tab Danh bạ / Lịch sử; mock presence | cùng |
| 2 | fe-dev | SOS FAB + modal xác nhận; z-index trên nav | cùng |
| 3 | fe-dev | Task list/detail (M2), Notifications (M3) — đã có wireframe, đồng bộ AC | cùng |

## Guardrails

- Không nhúng secret; URL ITS/PBX qua env sau.
- Giữ string tiếng Việt theo designer.

## Verification

- `npm install && npm run dev` — đăng nhập mock → vào tab Liên lạc; SOS mở modal; đăng xuất xóa session.
