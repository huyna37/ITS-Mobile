---
id: F-005
name: "File Upload Attachments"
slug: file-upload
module-id: M-001
status: proposed
classification: local
priority: high
created: "2026-05-28T06:46:51Z"
last-updated: "2026-05-28T06:46:51Z"
locked-fields: []
consumed_by_modules: []
---

# Feature: File Upload Attachments

## Description

Backend: FilesController add POST /upload (multipart, save to FilesOfIncident). Frontend: upload images/videos to server.

## Business Intent

TaskDetailViewPanel allows photo/video/attachment but API has no upload endpoint. Data only stored client-side as object URLs. Need FilesController with POST /api/files/upload that stores to FilesOfIncident table and returns server URL.

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
