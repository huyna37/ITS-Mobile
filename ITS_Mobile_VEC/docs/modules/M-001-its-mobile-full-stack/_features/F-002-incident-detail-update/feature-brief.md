---
id: F-002
name: "Incident Detail & Update"
slug: incident-detail-update
module-id: M-001
status: proposed
classification: local
priority: high
created: "2026-05-28T06:46:47Z"
last-updated: "2026-05-28T06:46:47Z"
locked-fields: []
consumed_by_modules: []
---

# Feature: Incident Detail & Update

## Description

Backend: IncidentsController add GET/{id} and PATCH/{id} (notes + attachments + status). Frontend: TaskDetailViewPanel calls real API, sends field notes + file metadata.

## Business Intent

IncidentsController only has GET /api/incidents list - no GET/{id} detail or PATCH/{id} update. Frontend calls api.getIncident(task.id) and api.updateIncident() but API returns 404. Need full incident CRUD flow with status logs and field notes.

## Flow Summary

[CẦN BỔ SUNG: tóm tắt luồng nghiệp vụ, ≥ 150 ký tự]

## Acceptance Criteria

- [CẦN BỔ SUNG: tiêu chí chấp nhận 1]
- [CẦN BỔ SUNG: tiêu chí chấp nhận 2]
- [CẦN BỔ SUNG: tiêu chí chấp nhận 3]

## In Scope

(populated by ba stage)

## Out of Scope

(populated by ba stage)

## Roles + Permissions

| Role | Level | Notes |
|---|---|---|

## Entities

(populated by ba/sa stage)

## Business Rules

| ID | Rule | Applies-to | Source |
|---|---|---|---|

## Testing Strategy

(populated by qa stage)
