---
id: F-001
name: "Auth and JWT"
slug: auth-jwt
module-id: M-001
status: proposed
classification: local
priority: critical
created: "2026-05-28T06:46:43Z"
last-updated: "2026-05-28T06:46:43Z"
locked-fields: []
consumed_by_modules: []
---

# Feature: Auth and JWT

## Description

Backend: JWT auth middleware, Logout real, ChangePassword validate hash. Frontend: use src/api/client instead of inline apiFetch.

## Business Intent

ITS Mobile has no JWT auth on API - token is generated but not verified. Need JWT Bearer middleware, validate token on protected routes, complete Logout and ChangePassword.

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
