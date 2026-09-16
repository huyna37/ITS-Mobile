---
id: F-006
name: "Profile & Preferences"
slug: profile-preferences
module-id: M-001
status: proposed
classification: local
priority: low
created: "2026-05-28T06:46:52Z"
last-updated: "2026-05-28T06:46:52Z"
locked-fields: []
consumed_by_modules: []
---

# Feature: Profile & Preferences

## Description

Backend: ProfileController GET/{username}, PATCH/{username}, GET /preferences, PATCH /preferences. Frontend: profile/me for login flow, preferences for theme.

## Business Intent

AuthController has GET /api/auth/profile but only accepts username query param - no me endpoint. Frontend needs real profile data from API to display on Profile tab. Need ProfileController with GET /api/profile/me, PATCH /api/profile, and preferences endpoints.

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
