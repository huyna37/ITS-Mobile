---
feature-id: ITSM-20260429-001
feature-name: Xac thuc va Lien lac (M1)
pipeline-type: sdlc
status: done
depends-on: []
blocked-by: []
created: 2026-04-29
last-updated: 2026-04-30
current-stage: closed
closed-by: close-feature
closed-at: 2026-04-30
output-mode: lean
repo-type: mini
repo-path: "."
project: mobile-app
project-path: "."
docs-path: docs/features/ITSM-20260429-001
intel-path: docs/intel
pipeline-path: M
stages-queue: []
completed-stages:
  doc-intel:
    verdict: "Ready for BA"
    completed-at: "2026-04-29"
  ba:
    verdict: "Ready for solution architecture"
    completed-at: "2026-04-30"
    artifact: "ba/00-lean-spec.md"
  designer:
    verdict: "Ready for SA"
    completed-at: "2026-04-30"
    artifact: "designer/screens.md"
  sa:
    verdict: "Architecture documented"
    completed-at: "2026-04-30"
    artifact: "sa/00-lean-architecture.md"
  tech-lead:
    verdict: "Plan approved"
    completed-at: "2026-04-30"
    artifact: "04-tech-lead-plan.md"
  dev-wave-1:
    verdict: "Demo hooks + session mock"
    completed-at: "2026-04-30"
    artifact: "src/App.jsx (repo root)"
  fe-dev-wave-1:
    verdict: "Web shell M1 integrated"
    completed-at: "2026-04-30"
    artifact: "src/App.jsx"
  qa-wave-1:
    verdict: "Pass — Playwright M1-F001..F005 (5/5), screenshots x10"
    completed-at: "2026-04-30"
    artifact: "playwright/ITSM-20260429-001.spec.ts; docs/intel/test-evidence + docs/intel/screenshots"
  reviewer:
    verdict: "Pass — M1 demo web; xem 08-review-report.md"
    completed-at: "2026-04-30"
    artifact: "08-review-report.md"
kpi:
  tokens-total: 14700
  cycle-time-start: "2026-04-29"
  tokens-by-stage:
    designer: 6200
rework-count: {}
source-type: Functional Specification
agent-flags:
  ba:
    source-type: Functional Specification
    blocking-gaps: 2
    total-modules: 1
    total-features: 5
  designer:
    screen-count: 4
  sa:
    integration-flags: [PBX-SIP, GSM]
figma-file-url: null
clarification-notes: ""
feature-req: |
  file:docs/features/ITSM-20260429-001/feature-brief.md
  canonical-fallback:docs/intel/doc-brief.md
  scope-modules: [M1]
  scope-features: [M1-F001, M1-F002, M1-F003, M1-F004, M1-F005]
  dev-unit: ETC
---

# Pipeline State: Xac thuc va Lien lac (M1)

## Business Goal
Cung cấp khả năng xác thực nhân viên hiện trường qua tài khoản hệ thống + extension PBX, gọi nội bộ VoIP, và gọi khẩn cấp SOS qua GSM — là nền tảng bắt buộc cho tất cả module khác.

## Stage Progress
| # | Stage | Agent | Verdict | Artifact | Date |
|---|---|---|---|---|---|
| 1 | Intake | — | Done | — | 2026-04-29 |
| 2 | Analysis | ba | Ready for SA | ba/00-lean-spec.md | 2026-04-30 |
| 3 | Design | designer | Ready for SA | designer/screens.md + designer/flows.md | 2026-04-30 |
| 4 | Architecture | sa | Done | sa/00-lean-architecture.md | 2026-04-30 |
| 5 | Execution Planning | tech-lead | Done | 04-tech-lead-plan.md | 2026-04-30 |
| 6 | Development | dev/fe-dev | Demo UI | src/App.jsx | 2026-04-30 |
| 7 | QA | qa | Pass (Playwright) | playwright + test-evidence | 2026-04-30 |
| 8 | Review | reviewer | Pass | 08-review-report.md | 2026-04-30 |
| — | Pipeline Closed | — | Done | 2026-04-30 | — |

## Current Stage
**closed** — Pipeline đã niêm phong (`close-feature` 2026-04-30).

## Next Action
Mở feature mới: `/new-feature` hoặc tiếp tục `ITSM-20260429-002`.

## Active Blockers
- GAP-001 / PBX: vẫn cần xác nhận vendor trước prod (đã chốt Option A trong SA).
- GAP-002: JWT ITS — đã chốt Bearer; chi tiết endpoint M2 khi có tài liệu ITS.

## Wave Tracker
| Wave | Tasks | Dev Status | QA Status |
|---|---|---|---|
| 1 | Shell + M1/M2/M3 tabs | Done (demo) | Pass E2E |

## Escalation Log
| Date | Item | Decision |
|---|---|---|
| 2026-04-30 | Post-BA path selection (risk=3, designer_required=true) | **Path M** confirmed. Queue: designer → sa → tech-lead → dev/fe-dev (parallel wave-1) → qa → reviewer. No extended roles (security/devops/data-gov not triggered). |
| 2026-04-30 | New gap GAP-NEW-001 (LichSuCuocGoi.ten_nguoi_nhan) | Forwarded to SA for data model decision; not blocking designer (display field only, UI shows fallback to so_dien_thoai if null). |
| 2026-04-30 | PM/BA/SA chốt cho dev | `docs/features/_shared/PM-SA-BA-chot-phuong-an.md` — JWT Bearer, SIP Option A (vendor gate), sau login vào tab Liên lạc. |
