---
id: F-003
name: "Call History Record"
slug: call-history-record
module-id: M-001
status: proposed
classification: local
priority: medium
created: "2026-05-28T06:46:48Z"
last-updated: "2026-05-28T06:46:48Z"
locked-fields: []
consumed_by_modules: []
---

# Feature: Call History Record

## Description

Backend: CallsController add POST /api/calls/history (record call to CallHistory). Frontend: addMockCallHistory calls real API instead of local state.

## Business Intent

CallsController only has GET /api/calls/history - no POST to record calls. Frontend uses addMockCallHistory() which only appends to local state. Need POST endpoint that writes to CallHistory/AsteriskCDR table.

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
