---
feature-id: ITS_Mobile_VEC
document: tech-brief
generated: 2026-04-29
confidence: Medium
---

# Tech Brief — ITS Mobile VEC (NB-LC Express)

## Workspace Configuration
| Item | Recommendation | Rationale |
|------|----------------|-----------|
| Repo type | mini | Single mobile app + single backend API — no microservice complexity warranted |
| Workspace name | its-mobile-vec | Matches feature-id convention |
| Package manager | pnpm | Standard for monorepo-capable JS/TS projects |
| Feature ID prefix | ITSM | 4-char prefix for ITS Mobile |

## Services
### service: mobile-app
| Property | Value |
|----------|-------|
| Type | app |
| Stack | react-native (Expo managed or bare workflow) |
| Path | src/apps/mobile |
| Port | N/A (mobile app) |
| Rationale | Cross-platform iOS + Android requirement (BR-INTEL-027); React Native matches JSX wireframe already provided; SIP/VoIP libraries available |
| Key dependencies | SIP/VoIP library, FCM/APNs, camera, async-storage |
| Modules served | M1, M2, M3 (all modules) |

### service: api-gateway
| Property | Value |
|----------|-------|
| Type | service |
| Stack | nestjs |
| Path | src/services/api |
| Port | 3000 |
| Rationale | Acts as BFF (backend-for-frontend) between mobile app and ITS backend; handles auth token management, push notification dispatch, file upload proxy |
| Key dependencies | PostgreSQL (local cache/queue), Redis (session store), FCM admin SDK |
| Modules served | M1 (auth), M2 (task proxy), M3 (notification dispatch) |

**NOTE**: The ITS backend (TMS) is an EXISTING external system. The api-gateway acts as a proxy/adapter layer — it does NOT replace ITS. If ITS API is directly consumable by mobile app, api-gateway may be simplified to auth-only service.

## Shared Infrastructure
| Infra | Include | Rationale |
|-------|---------|-----------|
| PostgreSQL | yes (optional) | Local cache for offline sync queue, push notification log; may be skipped if ITS backend handles all persistence |
| Redis | yes (optional) | Session token store, rate limiting; may use ITS backend session instead |
| MQTT | no | No IoT/real-time streaming needed; push notifications via FCM/APNs sufficient |

## Auth
| Item | Value |
|------|-------|
| Model | rbac (2 roles: field operator, TMC operator) |
| Provider | custom-jwt (dual credential: system account + PBX extension) |
| Multi-tenant | no (single expressway operation) |

## Scaffold Order
1. api-gateway (auth endpoints + ITS API proxy skeleton)
2. mobile-app (login + navigation shell)
3. VoIP spike (SIP library evaluation with PBX test environment)
4. Push notification setup (FCM + APNs certificates)
5. Feature implementation waves per priority

## Confidence Notes
- PBX vendor and SIP protocol details unknown — VoIP stack may change after SA confirms PBX model and capabilities (GAP-001)
- ITS API specification not provided — api-gateway proxy design depends on actual ITS API contract (GAP-008)
- Whether a BFF api-gateway is needed depends on ITS API capabilities — if ITS already provides auth + REST API suitable for mobile consumption, api-gateway scope reduces significantly
- Stack versions not validated via Context7 (unavailable) — use latest stable React Native (0.76+), NestJS (v10+), Expo SDK 52+
- stack-validated: false
