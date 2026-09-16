# Validation Log — 2026-04-29

## Domain Analyst Lens
Findings:
- SuKienTuyenDuong entity exists only in wireframe mock data, not detailed in specification text. Wireframe shows "Bao tri" (maintenance) and "Thoi tiet" (weather) event types. Spec §4.6 covers "su co/su kien giao thong" but focuses on incidents. Events may be a subset of the same ITS feed or a separate data source.
Impact: Added SuKienTuyenDuong as separate entity in §6 with low confidence. Flagged in §11 as non-blocking (GAP-004 scope).

## Designer Lens
Findings:
- Spec §7 lists "Dashboard" as a required screen, but wireframe does not have a dedicated dashboard component — TaskListView serves as the de facto landing/home screen. No summary statistics or operational overview is shown.
- SOS floating button placement is well-defined in wireframe (bottom-right, always visible). This is a good safety UX pattern.
Impact: Noted Dashboard ambiguity in §11 (GAP-004). No section update needed — TaskListView as dashboard is reasonable.

## SA Lens
Findings:
- PBX SIP integration lacks authentication detail. Document mentions "Extension tổng đài PBX" as login credential but does not specify how SIP registration works (separate SIP realm? same credentials? certificate-based?). This is a blocking gap (GAP-001).
- ITS API authentication mechanism not specified. Document says "API kết nối hệ thống ITS" and "Token session" but does not clarify if the same token authenticates both app login and ITS API calls. Blocking gap (GAP-002).
- Real-time task delivery mechanism (push vs pull) not specified. Critical for architecture — WebSocket, SSE, or polling affects battery, latency, and complexity. Blocking gap (GAP-003).
Impact: 3 blocking gaps added to §11. SA stage marked as required in §12.

## Security Lens
Findings:
- No PII fields identified (field operators use system accounts, no personal data stored beyond name/unit/extension).
- Token session mentioned but no refresh/expiry strategy. Risk: long-lived tokens on mobile devices.
- SIP credentials stored on device for VoIP — needs encryption at rest.
- Photo uploads may contain EXIF geolocation — consider whether this is intentional (useful for incident location) or a privacy risk.
Impact: Security review stage added to §12. Token lifecycle and SIP credential storage flagged in §13.7.
