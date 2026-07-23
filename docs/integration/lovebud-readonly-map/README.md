# LoveBud Integration Contract Mapping

Read-only technical contract analysis of LoveBud backend for LoveTree 3.0 frontend integration.

## Scope

This directory contains structured documentation mapping LoveBud's existing API contracts,
data models, and infrastructure to LoveTree 3.0's 12 UI screens.

**LoveBud analysis pinned to:** `b1f977fa9aec559597cf2afbadf0600f090f41e7`
**LoveTree 3.0 base:** `562cb177379d4b61d664f7a0d8bcba1428602805`

## Status Legend

| Status | Meaning |
|---|---|
| CONFIRMED | Verified in source code at pinned SHA |
| INFERRED | Logically derived from source but not explicitly stated |
| UNKNOWN | Cannot determine without runtime/production access |
| NOT_IMPLEMENTED | No source evidence of implementation |
| OUT_OF_SCOPE | Exists in LoveBud but not relevant to LoveTree 3.0 |

### DB Schema Status

| Status | Meaning |
|---|---|
| CONFIRMED_IN_SOURCE | Column/table referenced in application SQL |
| CONFIRMED_IN_MIGRATION | Present in migration SQL file |
| CONFIRMED_BY_TEST | Referenced in test fixtures/assertions |
| PRODUCTION_STATUS_UNKNOWN | Cannot verify actual Neon production schema without runtime access |

## Documents

| File | Purpose |
|---|---|
| [source-manifest.md](source-manifest.md) | All inspected source files with SHA permalinks |
| [architecture-overview.md](architecture-overview.md) | System architecture and request flow |
| [authentication-session-map.md](authentication-session-map.md) | Firebase auth flow and session management |
| [api-route-map.md](api-route-map.md) | Complete endpoint contract table |
| [data-model-map.md](data-model-map.md) | DB schema and DTO shapes |
| [authorization-visibility-map.md](authorization-visibility-map.md) | Access control and visibility rules |
| [media-storage-map.md](media-storage-map.md) | Media/thumbnail handling |
| [route-to-backend-matrix.md](route-to-backend-matrix.md) | 12-screen frontend-to-backend mapping |
| [environment-deployment-map.md](environment-deployment-map.md) | Environment variables and deployment topology |
| [frontend-adapter-design.md](frontend-adapter-design.md) | Adapter layer design for LoveTree 3.0 |
| [security-risk-register.md](security-risk-register.md) | Security considerations and risks |
| [implementation-issue-plan.md](implementation-issue-plan.md) | Phased Issue candidates for implementation |
| [open-questions.md](open-questions.md) | Unresolved questions requiring runtime/CTO input |

## Constraints

- LoveBud is strictly read-only — no writes, no DB access, no secrets
- No application code changes in this branch
- GitHub Actions not used (billing issue)
- This is a Draft PR — DO NOT MERGE until backend contract review is complete
