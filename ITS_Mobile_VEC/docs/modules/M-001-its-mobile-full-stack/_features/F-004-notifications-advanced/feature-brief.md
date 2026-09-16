---
id: F-004
name: "Advanced Notifications"
slug: notifications-advanced
module-id: M-001
status: proposed
classification: local
priority: medium
created: "2026-05-28T06:46:49Z"
last-updated: "2026-05-28T06:46:49Z"
locked-fields: []
consumed_by_modules: []
---

# Feature: Advanced Notifications

## Description

Backend: Notifications add PATCH/{id}/read, DELETE/{id}, POST /push-token. Frontend: mark read, delete notifications UI.

## Business Intent

NotificationsController only has GET /api/notifications - no mark as read, delete, or push token. Frontend can only view list. Need full notification lifecycle: read/unread, delete, push registration.

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
