# Intel Snapshot (compressed — Tier 1 only)

> **Generated:** 2026-04-30T07:30:25Z
> **Generator:** `~/.cursor/skills/intel-snapshot/generate.py`
> **Sources (Tier 1 per OUTLINE_COVERAGE.md § 8.4):** `actor-registry.json`, `permission-matrix.json`, `sitemap.json`, `feature-catalog.json`, `code-facts.json`, `system-inventory.json`
>
> ⚠ **Base-tier agents (dev/qa/reviewer/ba/sa): use this for orientation only.** For deep decisions (security review, ADR, role design, schema migration) read the full canonical JSON files. Pro-tier agents (`*-pro`, `tech-lead`, `security`, `devops`, `data-governance`, `sre-observability`) MUST read full JSON.
>
> **Tier 2 (data-model, api-spec, architecture, integrations) NOT in snapshot — pro-tier reads canonical directly.**
> **Tier 3 (business-context, nfr-catalog, security-design, infrastructure, cost-estimate, project-plan, handover-plan) is doc-only — SDLC ignores entirely.**
>
> Staleness: see `_snapshot.meta.json` — re-run generator if canonical files changed.

## Roles & RBAC

**RBAC mode:** `rbac` | **Auth:** `unknown`

| Slug | Display | Confidence |
|---|---|---|
| `nhan-vien-hien-truong` | Nhân viên vận hành hiện trường | n/a |
| `nhan-vien-tmc` | Nhân viên Trung tâm điều hành | n/a |
| `its-backend` | Hệ thống ITS tuyến (TMS) | n/a |
| `pbx-system` | Hệ thống tổng đài nội bộ PBX | n/a |


## Permissions (compact)

_(no permissions defined)_


## Routes & Sitemap

| Path | Auth? | Feature | Confidence |
|---|---|---|---|
| `/login` | no | `-` | n/a |
| `/calls` | no | `-` | n/a |
| `/tasks` | no | `-` | n/a |
| `/tasks/:id` | no | `-` | n/a |
| `/alerts` | no | `-` | n/a |
| `/profile` | no | `-` | n/a |


## Features

| ID | Name | Status | ACs | Roles | Confidence |
|---|---|---|---|---|---|
| `M1-F001` | Đăng nhập hệ thống | in-progress | 0 | {'nhan-vien-hien-truong': 'execute'} | n/a |
| `M1-F002` | Đăng xuất hệ thống | in-progress | 0 | {'nhan-vien-hien-truong': 'execute'} | n/a |
| `M1-F003` | Thực hiện cuộc gọi nội bộ PBX | stubbed | 0 | {'nhan-vien-hien-truong': 'execute'} | n/a |
| `M1-F004` | Gọi khẩn cấp SOS qua GSM | in-progress | 0 | {'nhan-vien-hien-truong': 'execute'} | n/a |
| `M1-F005` | Hiển thị thông tin cá nhân | in-progress | 0 | {'nhan-vien-hien-truong': 'view'} | n/a |
| `M2-F001` | Hiển thị danh sách công việc | in-progress | 0 | {'nhan-vien-hien-truong': 'view'} | n/a |
| `M2-F002` | Xem chi tiết công việc | in-progress | 0 | {'nhan-vien-hien-truong': 'view'} | n/a |
| `M2-F003` | Cập nhật trạng thái xử lý sự cố | in-progress | 0 | {'nhan-vien-hien-truong': 'update'} | n/a |
| `M2-F004` | Đính kèm ảnh/video hiện trường | in-progress | 0 | {'nhan-vien-hien-truong': 'create'} | n/a |
| `M2-F005` | Hiển thị sự cố/sự kiện giao thông | in-progress | 0 | {'nhan-vien-hien-truong': 'view'} | n/a |
| `M3-F001` | Nhận Push Notification | stubbed | 0 | {'nhan-vien-hien-truong': 'receive'} | n/a |
| `M3-F002` | Xem danh sách thông báo | in-progress | 0 | {'nhan-vien-hien-truong': 'view'} | n/a |
| `M3-F003` | Đánh dấu đã đọc / chưa đọc | stubbed | 0 | {'nhan-vien-hien-truong': 'update'} | n/a |
| `ITSM-20260429-001` | Pipeline dossier — Xác thực và Liên lạc (M1) wave 1 demo | implemented | 0 | nhan-vien-hien-truong | n/a |


## Code Facts (aggregate)

**Services:** 0 | **Routes:** 0 | **Entities:** 0 | **Integrations:** 0 | **Test files:** 0



## System Inventory (CPĐT 4.0 layered)

**IPv6 readiness:** `unknown` | **Services:** 1 | **Tech stack:** 0 entries

| Service | Kind | Tech refs |
|---|---|---|
| `mobile-app` | ? | - |


---

**For full detail (canonical sources):**
- Roles auth schemes / claim mappings → `actor-registry.json`
- Permission rationale + evidence → `permission-matrix.json`
- Workflow variants + Playwright hints → `sitemap.json`
- AC text, business intent, flow summary, error cases → `feature-catalog.json`
- Per-route handler symbol + entities_touched + auth_scope → `code-facts.json`
- Tech license + EOL + vulnerability counts → `system-inventory.json`

**Tier 2 (when work touches the area):**
- Schema columns + ERD + data dictionary → `data-model.json`
- Endpoint request/response schema + examples → `api-spec.json`
- 4 cpdt_layers + components + 3 architecture models → `architecture.json`
- LGSP/NGSP/CSDLQG metadata + auth methods → `integrations.json`
