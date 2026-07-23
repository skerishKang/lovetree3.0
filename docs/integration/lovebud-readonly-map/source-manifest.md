# Source Manifest

All source files inspected during this analysis. LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

Permalink base: `https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/`

## Cloudflare Pages Functions (API Proxy Layer)

| Path | Role | Key Evidence | Classification |
|---|---|---|---|
| `functions/api/[[path]].js` | Catch-all proxy to Modal | Routes unmatched `/api/*` to `MODAL_BASE_URL`; adds `x-lovebud-request-id`, `x-lovebud-upstream` headers; 25s timeout | source |
| `functions/api/trees.js` | Tree list/create proxy | `GET/POST /api/trees` → `/modal/private/trees` | source |
| `functions/api/trees/[id].js` | Single tree CRUD + fork proxy | `GET/PUT/DELETE /api/trees/:id`, `POST /api/trees/:id/fork` | source |
| `functions/api/memories.js` | Memory list/create proxy | `GET/POST /api/memories` via memory-route-proxy | source |
| `functions/api/memories/[id].js` | Single memory CRUD proxy | `GET/PUT/DELETE /api/memories/:id` via memory-route-proxy | source |
| `functions/_shared/memory-route-proxy.js` | Memory route shared logic | 128KB write body limit; method routing; Modal fetch | source |
| `functions/_shared/legacy-key-guard.js` | Write payload validation | Rejects legacy snake_case keys in write payloads | source |

Permalink: [functions/api/[[path]].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/%5B%5Bpath%5D%5D.js)

## Modal Compute (FastAPI Backend)

| Path | Role | Key Evidence | Classification |
|---|---|---|---|
| `modal_compute/app.py` | FastAPI app, all route definitions | CORS config, auth middleware, route registration, error handlers | source |
| `modal_compute/config.py` | Configuration | `FIREBASE_PROJECT_ID` (default `relovetree`), `CORS_ALLOWED_ORIGINS` | config |
| `modal_compute/auth.py` | Firebase JWT verification | Google public certs, token decode, Firestore user profile, `require_plus_for_private_storage` | source |
| `modal_compute/db.py` | Database connection pool | psycopg3 `ConnectionPool`, `DATABASE_URL`, timeouts (statement=20s, connect=10s, acquire=15s) | source |
| `modal_compute/validation.py` | DTO normalization | `normalize_tree_row`, `normalize_memory_row`, `estimate_stage`, `parse_tags`, `_to_isoformat` | source |
| `modal_compute/public_reads.py` | Public read queries | `fetch_latest_public_tree_snapshots`, `fetch_growing_public_tree_snapshots`, `fetch_public_memories`, `fetch_public_memory`, `fetch_public_tree` | source |
| `modal_compute/owner_reads.py` | Owner read queries | `fetch_user_trees`, `fetch_owner_tree`, `fetch_owner_memories`; dynamic table/column detection | source |
| `modal_compute/owner_writes.py` | Write re-exports | Aggregates tree_writes + memory_writes | source |
| `modal_compute/tree_writes.py` | Tree CRUD + fork | `create_owner_tree`, `update_owner_tree`, `delete_owner_tree`, `fork_public_tree` | source |
| `modal_compute/memory_writes.py` | Memory CRUD | `create_owner_memory`, `update_owner_memory`, `delete_owner_memory`; source-ack convergence; cycle detection | source |
| `modal_compute/write_validation.py` | Ownership guards | `require_tree_owner`, `require_memory_owner`, `require_memory_visible_or_owner` | source |
| `modal_compute/owner_users.py` | User bootstrap | `ensure_owner_user_exists`; dynamic column detection for users table | source |
| `modal_compute/comments.py` | Memory-level comments | `create_comment`, `fetch_comments`, `fetch_public_comments`, `soft_delete_own_comment`, `hide_comment_by_tree_owner` | source |
| `modal_compute/tree_comments.py` | Tree-level comments | `create_tree_comment`, `fetch_tree_comments`; public DTO hides ownerId | source |
| `modal_compute/reactions.py` | Memory reactions | `toggle_reaction`, `fetch_reaction_summary`, `fetch_public_reaction_counts`; advisory lock | source |
| `modal_compute/tree_likes.py` | Tree likes | `toggle_tree_like`, `fetch_tree_like_summary`, `fetch_public_tree_like_count`; soft-delete pattern | source |
| `modal_compute/tree_views.py` | Tree view counting | `record_public_tree_view`, `fetch_public_tree_view_count`; daily dedup | source |
| `modal_compute/hub_layouts.py` | Editor positions | `save_hub_layout`, `fetch_hub_layout`; optimistic concurrency via baseRevision | source |
| `modal_compute/browse_latest.py` | Browse snapshots | `fetch_latest_public_tree_snapshots`; quality filter (3+ public memories) | source |
| `modal_compute/social_idempotency.py` | Idempotency infrastructure | Key pattern `^[A-Za-z0-9._:-]{8,128}$`; reserve/verify/complete lifecycle | source |
| `modal_compute/social_rate_limit.py` | Rate limiting | 10 comments/actor/min, 3 comments/actor-memory/min; 1-min window | source |
| `modal_compute/social_errors.py` | Error taxonomy | `SocialWriteError` class; `SOCIAL_ERROR_CODES` frozenset | source |
| `modal_compute/social_write_audit.py` | Audit logging | `record_audit`, `record_audit_target`; SAFE_ACTIONS whitelist | source |
| `modal_compute/api_response_helpers.py` | Request parsing | 128KB body limit, JSON parse, request-id header | source |

## Frontend JavaScript (LoveBud)

| Path | Role | Key Evidence | Classification |
|---|---|---|---|
| `js/api/base-api-fetch.js` | API fetch wrapper | `apiFetch()`; token cache (sessionStorage); 401 retry; auth state clearing | source |
| `js/api/auth-policy.js` | Auth decision policy | `endpointLikelyRequiresAuth`; `/community/*` exempt; poll intervals | source |
| `js/api/public-tree-adapter.js` | Browse DTO normalization | `normalizeBrowseTreeRecord`, `normalizeBrowseMemoryRecord`; YouTube URL canonicalization | source |
| `js/firebase-config.js` | Firebase web config | Project/auth configuration (values not reproduced here) | config |

## Scout AI (Cloudflare-only)

| Path | Role | Key Evidence | Classification |
|---|---|---|---|
| `functions/api/scout/suggest.js` | AI suggestion endpoint | Stub/live modes; 128KB limit; safety filters | source |
| `functions/api/scout/save-memory.js` | Memory intake endpoint | 202 gated persistence; forbidden field detection | source |

## Tests

| Path | Role | Classification |
|---|---|---|
| `tests/smoke/*.test.cjs` | Smoke tests | test |
| `tests/routes/*.test.cjs` | Route contract tests | test |
| `tests/contracts/*.test.cjs` | API contract tests | test |

Test command: `npm test` = `tests/smoke/*.test.cjs tests/routes/*.test.cjs tests/contracts/*.test.cjs`

## Migrations

| Path | Status |
|---|---|
| `db/migration-provenance/expected-schema-manifest.json` | `ADOPTION_REQUIRED`, `critical_objects: []` |
| `db/migration-provenance/canonical-migrations.json` | Empty canonical migration directory |

**No migration SQL files exist.** DB schema is inferred exclusively from application SQL (status: CONFIRMED_IN_SOURCE, PRODUCTION_STATUS_UNKNOWN).

## Configuration

| Path | Role | Classification |
|---|---|---|
| `modal_compute/requirements.txt` | Python dependencies | config |
| `package.json` | Node project (`lovebud-mvp`, type: module) | config |
| `vercel.json` | Deprecated Vercel routing (legacy) | config |
