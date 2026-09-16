---
feature-id: ITSM-20260429-002
feature-name: Quan ly Su co va Nhiem vu (M2)
pipeline-type: sdlc
status: in-progress
depends-on: [ITSM-20260429-001]
blocked-by: []
created: 2026-04-29
last-updated: 2026-04-30
current-stage: qa-wave-1
output-mode: lean
repo-type: mini
repo-path: "."
project: mobile-app
project-path: "."
docs-path: docs/features/ITSM-20260429-002
intel-path: docs/intel
stages-queue: [reviewer]
completed-stages:
  doc-intel:
    verdict: "Ready for BA"
    completed-at: "2026-04-29"
  ba:
    verdict: "Deferred — UI covered by shared shell"
    completed-at: "2026-04-30"
    artifact: "designer/screens.md + src/App.jsx (TaskList/TaskDetail)"
  designer:
    verdict: "Aligned with docs/source wireframe"
    completed-at: "2026-04-30"
    artifact: "designer/screens.md"
  sa:
    verdict: "ITS REST Bearer per shared doc"
    completed-at: "2026-04-30"
    artifact: "docs/features/_shared/PM-SA-BA-chot-phuong-an.md"
  tech-lead:
    verdict: "Same wave as M1 shell"
    completed-at: "2026-04-30"
    artifact: "docs/features/ITSM-20260429-001/04-tech-lead-plan.md"
  dev-wave-1:
    verdict: "Task list/detail in demo"
    completed-at: "2026-04-30"
    artifact: "src/App.jsx"
  fe-dev-wave-1:
    verdict: "Integrated"
    completed-at: "2026-04-30"
    artifact: "src/App.jsx"
kpi:
  tokens-total: 0
  cycle-time-start: "2026-04-29"
  tokens-by-stage: {}
rework-count: {}
source-type: Functional Specification
agent-flags:
  ba:
    source-type: Functional Specification
    blocking-gaps: 1
    total-modules: 1
    total-features: 5
  designer:
    screen-count: 2
  sa:
    integration-flags: [ITS-API-REST, ITS-Photo-Upload]
figma-file-url: null
clarification-notes: ""
feature-req: |
  file:docs/features/ITSM-20260429-002/feature-brief.md
  canonical-fallback:docs/intel/doc-brief.md
  scope-modules: [M2]
  scope-features: [M2-F001, M2-F002, M2-F003, M2-F004, M2-F005]
  dev-unit: ETC
---

# Pipeline State: Quan ly Su co va Nhiem vu (M2)

## Business Goal
Cho phép nhân viên hiện trường nhận danh sách nhiệm vụ từ ITS, xem chi tiết sự cố, cập nhật trạng thái xử lý theo workflow 1→2→3, và đính kèm ảnh hiện trường.

## Current Stage
**qa-wave-1** — Luồng **Nhiệm vụ** + chi tiết có trong `src/App.jsx` (demo). Phụ thuộc M1 đã mở khóa (JWT/chốt trong `PM-SA-BA-chot-phuong-an.md`).

## Next Action
Test tab **Công việc** sau đăng nhập; API ITS thật nối sau khi có endpoint.

## Active Blockers (ngoài demo)
- GAP-008: tài liệu endpoint ITS — không chặn UI demo.

## Escalation Log
| Date | Item | Decision |
|---|---|---|
| 2026-04-30 | Unblock M2 UI | Dùng shell chung ITSM-001; M2 màn hình theo `designer/screens.md`. |
