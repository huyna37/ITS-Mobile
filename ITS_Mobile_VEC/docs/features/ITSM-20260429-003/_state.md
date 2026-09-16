---
feature-id: ITSM-20260429-003
feature-name: Thong bao (M3)
pipeline-type: sdlc
status: in-progress
depends-on: [ITSM-20260429-001, ITSM-20260429-002]
blocked-by: []
created: 2026-04-29
last-updated: 2026-04-30
current-stage: qa-wave-1
output-mode: lean
repo-type: mini
repo-path: "."
project: mobile-app
project-path: "."
docs-path: docs/features/ITSM-20260429-003
intel-path: docs/intel
stages-queue: [reviewer]
completed-stages:
  doc-intel:
    verdict: "Ready for BA"
    completed-at: "2026-04-29"
  ba:
    verdict: "Deferred — UI covered by shared shell"
    completed-at: "2026-04-30"
    artifact: "designer/screens.md + src/App.jsx (NotificationsView)"
  designer:
    verdict: "Aligned with wireframe"
    completed-at: "2026-04-30"
    artifact: "designer/screens.md"
  sa:
    verdict: "FCM/APNs post-login — doc cross-ref"
    completed-at: "2026-04-30"
    artifact: "docs/features/ITSM-20260429-001/sa/00-lean-architecture.md"
  tech-lead:
    verdict: "Same wave as M1"
    completed-at: "2026-04-30"
    artifact: "docs/features/ITSM-20260429-001/04-tech-lead-plan.md"
  dev-wave-1:
    verdict: "Notifications tab demo"
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
    blocking-gaps: 0
    total-modules: 1
    total-features: 3
  designer:
    screen-count: 1
  sa:
    integration-flags: [FCM-APNs]
figma-file-url: null
clarification-notes: ""
feature-req: |
  file:docs/features/ITSM-20260429-003/feature-brief.md
  canonical-fallback:docs/intel/doc-brief.md
  scope-modules: [M3]
  scope-features: [M3-F001, M3-F002, M3-F003]
  dev-unit: ETC
---

# Pipeline State: Thong bao (M3)

## Business Goal
Nhận và quản lý push notifications từ TMC và ITS — bao gồm phân công nhiệm vụ, cập nhật trạng thái, cảnh báo hệ thống — với trạng thái đã đọc/chưa đọc.

## Current Stage
**qa-wave-1** — Tab **Thông báo** trong `src/App.jsx` (demo đọc/chưa đọc).

## Next Action
Test UX tab Thông báo; tích hợp FCM/APNs sau khi có credential ITS.

## Escalation Log
| Date | Item | Decision |
|---|---|---|
| 2026-04-30 | Unblock M3 UI | Shell chung; push thật sau login RN. |
