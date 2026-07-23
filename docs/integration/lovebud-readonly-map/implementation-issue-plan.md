# Implementation Issue Plan

Phased Issue candidates for LoveTree 3.0 integration with LoveBud backend.
LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.
LoveTree 3.0 base: `f321d9933ce5b470958f46e4ff2ccbcab314b11e`.

---

## Global Constraints (All Issues)

**Allowed paths (vary per Issue):**
- `src/api/**`
- `src/hooks/**`
- `src/context/**`
- `src/types/api.ts`
- `src/components/**` (UI connection only, existing components)
- `functions/api/**` (proxy Issue only)
- `functions/_shared/**` (proxy Issue only)
- Colocated `*.test.tsx` / `*.test.ts` (existing pattern)
- `vite.config.ts` (dev proxy config only)

**Forbidden paths (all Issues):**
- `docs/audits/**`
- `docs/evidence/**`
- `docs/reference/**`
- `docs/integration/lovebud-readonly-map/**` (this mapping is frozen)
- `.github/**`
- `package-lock.json` (except when adding deps)
- LoveBud repository (any file)

**Component path convention:**
All screens live in `src/components/**`. Do NOT create `src/pages/**`. Do NOT duplicate existing page components. If a `src/pages` architecture migration is needed, it requires a separate architecture migration Issue outside this plan.

**Test convention:**
Use colocated `*.test.tsx` pattern (e.g., `src/components/MyTreesPage.test.tsx`). Do NOT establish `src/__tests__/**` as a new standard.

**Security acceptance (all Issues):**
- No secrets in source
- No dangerouslySetInnerHTML for UGC
- Idempotency keys via crypto.randomUUID()
- No raw response body or token logging

---

## Issue Order (14 candidates)

1. Typed API client and normalized errors
2. Same-origin Cloudflare Pages Function proxy foundation
3. Firebase SDK and auth bootstrap
4. Login/session/logout UI connection
5. Public community tree list
6. Public tree detail
7. Public memory detail
8. Authenticated my-trees list
9. Tree create
10. Tree update/delete
11. Memory CRUD/connect
12. Comments/reactions/tree-like
13. Visibility settings
14. Media search gap handling

---

## Issue 1: Typed API Client and Normalized Errors

**Title:** `feat: add typed API client with error normalization`

**Allowed paths:** `src/api/client.ts`, `src/api/errors.ts`, `src/api/idempotency.ts`, `src/types/api.ts`, colocated tests

**Forbidden paths:** `src/components/**`, `functions/**`, `docs/**`

**Backend contract:**
- Base URL: same-origin `/api` (configurable)
- Headers: `Authorization: Bearer <token>`, `Idempotency-Key` (social writes), `x-lovebud-request-id`
- Body limit: 128KB

**Error envelopes (confirmed):**

SocialWriteError:
```json
{"error": "human-readable message", "code": "ERROR_CODE", "retryAfterMs": 1000}
```
`retryAfterMs` is optional.

FastAPI HTTP/validation error:
```json
{"detail": "message"}
```
May also be a structured detail object.

Network/non-JSON error:
- Use status, statusText, content-type, bounded text fallback
- Map to NETWORK_ERROR code

Not all endpoints return `{code, message}`. The client must handle all three envelope shapes.

**Normalized ApiError:**
```typescript
interface ApiError {
  status: number;
  code: ApiErrorCode;
  message: string;
  retryAfterMs?: number;
  retryable: boolean;
  rawCategory: 'social' | 'fastapi' | 'network' | 'unknown';
}
```

Do NOT log raw response body or tokens.

**Idempotency key semantics:**
- Same logical mutation retry (timeout, connection drop, unclear response): reuse same key
- New logical mutation (user explicitly starts new action): generate new key
- React StrictMode / double-click: share one key per logical mutation
- 409 IDEMPOTENCY_KEY_REUSED: stop auto-retry, re-query authoritative state, reconcile optimistic UI, show conflict to user. Do NOT auto-generate new key and re-send.

**Deliverables:**
- Typed fetch wrapper with envelope detection
- Error normalization (3 envelope shapes)
- Idempotency key generator + retry semantics
- Request ID generator
- 401 single-retry logic (placeholder until Firebase)

**Tests:** Colocated unit tests for error mapping, idempotency semantics, request ID format

---

## Issue 2: Same-Origin Cloudflare Pages Function Proxy Foundation

**Title:** `feat: add same-origin Cloudflare API proxy foundation`

**Allowed paths:** `functions/api/**`, `functions/_shared/**`, proxy contract tests, required Cloudflare configuration files (investigate before proposing)

**Forbidden paths:** `src/components/**`, LoveBud, DB, business logic, secret values, direct Modal URL in browser bundle

**Position:** After Issue 1 (typed client), before Issue 3 (Firebase auth).

**Required contract:**

| Requirement | Detail |
|---|---|
| Same-origin | All requests via `/api/**` |
| Upstream allowlist | Explicit route allowlist (no open proxy, no arbitrary upstream URL) |
| Method forwarding | Forward HTTP method as-is |
| Authorization forwarding | Pass `Authorization` header to upstream |
| Idempotency-Key forwarding | Pass `Idempotency-Key` header to upstream |
| Content-Type forwarding | Pass `Content-Type` header to upstream |
| Request ID | Generate or forward `x-lovebud-request-id` |
| Body limit | 128KB write body limit (reject 413 before upstream) |
| Upstream timeout | Configurable timeout (reference: LoveBud uses 25s) |
| Non-JSON upstream error | Handle non-JSON upstream responses gracefully |
| Abort/cancellation | Support request abort |
| No open proxy | Reject requests not matching allowlist |
| No arbitrary upstream | Upstream URL from server env only |
| No business logic | Pure forwarding, no transformation |
| No response-body logging | Do not log response bodies |
| Env vars | Name only in source; production secrets in Cloudflare server environment only |

**Vite dev proxy:** `vite.config.ts` server.proxy is for local development only. It does NOT replace this production proxy.

**Deliverables:**
- `functions/api/[[path]].js` (or equivalent catch-all)
- Route allowlist configuration
- Header forwarding logic
- Body size guard
- Timeout handling
- Contract tests for proxy behavior

**Tests:** Proxy contract tests (method forwarding, header forwarding, 413 on oversized body, 404 on non-allowlisted route, timeout behavior)

**Security acceptance:** No upstream URL in client bundle, no response body logging, no open proxy

---

## Issue 3: Firebase SDK and Auth Bootstrap

**Title:** `feat: add Firebase Auth SDK and token management`

**Allowed paths:** `src/api/auth.ts`, `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts`, `src/types/auth.ts`, colocated tests, `package.json` (add firebase dep)

**Forbidden paths:** `src/components/**`, `functions/**`, `docs/**`

**Backend contract:**
- Firebase project: configured via env (not hardcoded)
- Token: `user.getIdTokenResult()` -> JWT
- Auth-exempt routes: `/community/*`, `/login`

**Auth token persistence — PRODUCT/SECURITY DECISION REQUIRED:**

Two options (not resolved in this mapping):

Option A (Preferred baseline):
- Firebase SDK-managed auth persistence
- `currentUser.getIdToken()` on demand
- Application state holds minimal user/session metadata
- Raw token long-term storage minimized

Option B (Compatibility with LoveBud pattern):
- sessionStorage token cache `{uid, token, expiresAt}`
- UID binding
- 30s expiry buffer
- Persistent 401 eviction
- Requires separate security justification and tests if chosen

This mapping does NOT finalize the choice. Mark as PRODUCT/SECURITY DECISION.

**Deliverables:**
- Firebase App initialization (env-based config)
- AuthContext with `{user, loading, tier}`
- Token acquisition mechanism (per chosen option)
- `signOut()` with state clear
- Auth-exempt route list

**Tests:** Token lifecycle, auth state transitions, exempt route logic

---

## Issue 4: Login/Session/Logout UI Connection

**Title:** `feat: connect login page to Firebase Auth`

**Allowed paths:** `src/components/AuthLoginPage.tsx`, `src/components/AuthLoginPage.test.tsx`, `src/App.tsx` (route guards), colocated tests

**Forbidden paths:** `src/api/**`, `functions/**`, `docs/**`

**Backend contract:**
- Google OAuth via Firebase `signInWithPopup(GoogleAuthProvider)`
- Post-login: redirect to `/my-trees`
- Logout: clear state, redirect to `/login`

**Deliverables:**
- Connect existing AuthLoginPage to Firebase Auth
- RequireAuth wrapper component
- Post-login redirect logic
- Logout button in app shell
- Loading/error states

**Tests:** Colocated tests for redirect logic, RequireAuth gating

---

## Issue 5: Public Community Tree List

**Title:** `feat: connect community page to browse API`

**Allowed paths:** `src/components/CommunityPage.tsx`, `src/components/HomePage.tsx`, `src/api/community.ts`, `src/hooks/useCommunityTrees.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`, `src/context/**`

**Backend contract:**
- GET /api/community/trees?view=summary&limit=N -> BrowseSnapshot[]
- GET /api/community/growing-trees?limit=N -> BrowseSnapshot[]
- No auth required

**Metrics (likeCount/viewCount):**
- BrowseSnapshot does NOT confirm likeCount/viewCount fields
- likeCount: CONDITIONAL (may be provided by server; if absent, use undefined, NOT 0)
- viewCount: CONDITIONAL (same rule)
- UI must hide metric or show "no data" when undefined; do NOT fabricate 0

**Deliverables:**
- `getCommunityTrees(limit)` adapter
- BrowseSnapshot -> CommunityTree transform (undefined for missing metrics)
- Loading skeleton, empty state, error retry
- Remove mock data import

**Tests:** Transform tests (including undefined metrics), loading/empty/error states

---

## Issue 6: Public Tree Detail

**Title:** `feat: connect tree detail page to public APIs`

**Allowed paths:** `src/components/TreeDetailPage.tsx`, `src/api/trees.ts`, `src/hooks/usePublicTree.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- GET /api/trees/:id (public path, no auth) -> PublicTree
- GET /api/community/memories?treeId=X -> {memories: PublicMemory[]}
- GET /api/trees/:id/comments -> {comments: PublicTreeComment[]}
- POST /api/trees/:id/views -> {counted, viewCount}

**Metrics:**
- likeCount: available via GET /api/trees/:id/likes (auth required) — CONDITIONAL for public view
- viewCount: available via POST /api/trees/:id/views response — CONFIRMED
- If auth not available, likeCount is undefined (do NOT show 0)

**Deliverables:**
- Parallel fetch (tree + memories + comments)
- View count recording (fire-and-forget, non-blocking)
- 404 handling ("Tree not found or is private")
- Remove mock data

**Tests:** Parallel fetch, 404 state, view count non-blocking

---

## Issue 7: Public Memory Detail

**Title:** `feat: connect memory detail to public/auth APIs`

**Allowed paths:** `src/components/MemoryDetailPage.tsx`, `src/api/memories.ts`, `src/api/social.ts`, `src/hooks/useMemoryDetail.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- GET /api/memories/:id (auth) or public memory read
- GET reactions -> {counts, userReactions}
- GET comments -> NormalizedComment[]

**Gaps:**
- relatedMemories: NOT_CONFIRMED (no endpoint). UI field exists as mock. Do NOT fabricate.

**Deliverables:**
- Memory detail fetch with reactions + comments
- Like button (optimistic UI with idempotency key)
- Comment list display
- 404 handling
- Remove mock data

**Tests:** Reaction toggle (idempotency semantics), comment display, 404 state

---

## Issue 8: Authenticated My-Trees List

**Title:** `feat: connect my-trees to authenticated API`

**Allowed paths:** `src/components/MyTreesPage.tsx`, `src/components/MyTreesEmptyPage.tsx`, `src/api/trees.ts`, `src/hooks/useMyTrees.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- GET /api/trees (Bearer) -> {trees: NormalizedTree[]}
- 401 -> redirect to login

**Deliverables:**
- Authenticated tree list fetch
- NormalizedTree -> MyTree transform
- Empty state ("Create your first tree")
- 401 redirect
- Remove mock data

**Tests:** Auth gating, empty state, 401 redirect

---

## Issue 9: Tree Create

**Title:** `feat: add tree creation flow`

**Allowed paths:** `src/components/TreeEditorPage.tsx` (or create flow component), `src/api/trees.ts`, `src/hooks/useCreateTree.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- POST /api/trees {title?, visibility?, groupName?, keywords?}
- 403 if private + non-plus
- Response: NormalizedTree -> navigate to editor

**Deliverables:**
- Create form (title, visibility toggle, group, keywords)
- Plus tier awareness (disable private if non-plus)
- Success -> navigate to editor route
- Error handling (403, network)

**Tests:** Form validation, 403 handling, navigation

---

## Issue 10: Tree Update/Delete

**Title:** `feat: add tree edit and delete`

**Allowed paths:** `src/components/TreeEditorPage.tsx`, `src/components/EmptyTreeEditorPage.tsx`, `src/api/trees.ts`, `src/hooks/useTreeEditor.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- PUT /api/trees/:id {title?, visibility?, groupName?, keywords?}
- DELETE /api/trees/:id -> {deleted: true}
- PUT /api/trees/:id/hub-layout {baseRevision, layoutMode, manualPositions}
- 409 on hub-layout revision mismatch

**Deliverables:**
- Tree metadata editing
- Delete with confirmation dialog
- Hub layout save (OCC with baseRevision)
- 409 conflict -> reload and retry
- Position drag-and-drop -> manualPositions

**Tests:** OCC conflict handling, delete confirmation, metadata update

---

## Issue 11: Memory CRUD/Connect

**Title:** `feat: add memory CRUD operations`

**Allowed paths:** `src/components/MemoryConnectPage.tsx`, `src/api/memories.ts`, `src/hooks/useMemoryCrud.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- POST /api/memories {treeId, title?, memo?, artist?, source?, sourceUrl?, sourceType?, thumbnail?, emotionTags?, ...}
- PUT /api/memories/:id (partial update, parentId null disconnects)
- DELETE /api/memories/:id -> {deleted, id, treeId}
- Error codes: UNSUPPORTED_MEMORY_UPDATE_FIELDS, EMPTY_MEMORY_UPDATE, INVALID_PARENT_ID, PARENT_MEMORY_TREE_MISMATCH, PARENT_CYCLE, SOURCE_WRITE_ACK_DIVERGENCE

**Deliverables:**
- Memory create form (with YouTube oEmbed preview)
- Memory edit (partial fields)
- Memory delete with confirmation
- Error code handling (especially 409 SOURCE_WRITE_ACK_DIVERGENCE)
- Parent memory selection (tree hierarchy)

**Tests:** Create flow, edit partial, delete, error codes

---

## Issue 12: Comments/Reactions/Tree-Like

**Title:** `feat: add social interactions (comments, reactions, likes)`

**Allowed paths:** `src/components/CommentSection.tsx`, `src/components/TreeSocialSidebar.tsx`, `src/api/social.ts`, `src/hooks/useSocial.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- POST comments: Idempotency-Key required, rate limited (10/min actor, 3/min memory)
- POST reactions: Idempotency-Key required, type='like' only, toggle
- POST tree likes: Idempotency-Key required, toggle, public trees only
- 429 RATE_LIMITED / RATE_LIMITED_MEMORY
- 409 IDEMPOTENCY_KEY_REUSED

**Idempotency semantics (critical):**
- Same logical mutation retry: reuse same key
- New logical mutation: new key only when user explicitly starts new action
- React StrictMode / double-click: one key per logical mutation
- 409 handling: stop auto-retry, re-query state, reconcile, show conflict to user
- Keys are never reused across distinct logical mutations
- The same logical mutation retry reuses its original key

**Deliverables:**
- Comment compose + list (memory-level and tree-level)
- Like button (memory reaction + tree like)
- Idempotency key per logical mutation
- Rate limit handling (429 -> "Please wait", respect retryAfterMs)
- Optimistic UI for likes (with reconciliation on failure)
- Comment delete (author) / hide (tree owner)

**Tests:** Idempotency key semantics (retry vs new), rate limit UI, toggle behavior, 409 handling

---

## Issue 13: Visibility Settings

**Title:** `feat: connect visibility settings to tree API`

**Allowed paths:** `src/components/VisibilitySettingsPage.tsx`, `src/api/trees.ts`, `src/hooks/useVisibility.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Status: PARTIALLY BLOCKED — Q19b product decision required**

**Backend contract (confirmed):**
- GET /api/trees -> list with visibility (public | private)
- PUT /api/trees/:id {visibility} per tree
- 403 if setting private without plus

**UI/Backend mismatch (BLOCKING):**
- UI has 3 options: private, link, community
- Backend supports 2: public, private
- "link" has NO backend contract. Do NOT map it to public or private arbitrarily.
- This Issue is BLOCKED until Q19b is resolved.

**Additional UI settings (NO backend contract confirmed):**

| Setting | UI Status | API DTO | DB Persistence | Mutation Endpoint | Read Endpoint | Authorization | Default |
|---|---|---|---|---|---|---|---|
| allow-comments | UI_PRESENT / MOCK_ONLY | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | PRODUCT_DECISION_REQUIRED |
| allow-likes | UI_PRESENT / MOCK_ONLY | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | PRODUCT_DECISION_REQUIRED |
| show-profile-name | UI_PRESENT / MOCK_ONLY | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | BACKEND_CONTRACT_NOT_CONFIRMED | PRODUCT_DECISION_REQUIRED |

Do NOT implement these settings as if they persist. They are mock-only until backend contracts are confirmed.

**Deliverables (unblocked portion):**
- Per-tree visibility toggle (public/private only)
- Plus tier gate UI
- Optimistic toggle with rollback on failure
- "link" option: disabled/hidden until Q19b resolved
- Additional settings: display-only (no persistence) until contracts confirmed

**Tests:** Toggle behavior (public/private), 403 handling, rollback, "link" disabled state

---

## Issue 14: Media Search Gap Handling

**Title:** `feat: media search via YouTube oEmbed with gap documentation`

**Allowed paths:** `src/components/MediaSearchPage.tsx`, `src/api/media.ts`, `src/hooks/useMediaSearch.ts`, colocated tests

**Forbidden paths:** `functions/**`, `docs/**`

**Backend contract:**
- GET /api/youtube/oembed?url=X -> oEmbed JSON
- No keyword search API exists
- No multi-platform support

**Deliverables:**
- URL-based YouTube lookup (paste URL -> preview)
- Clear UX messaging: "URL lookup only, keyword search not available"
- oEmbed -> MediaSearchResult transform
- Save-to-memory flow (POST /api/memories)
- Gap documentation in UI

**Tests:** URL validation, oEmbed transform, save flow, error states

---

## Dependency Graph

```
Issue 1 (typed client)
  └─> Issue 2 (proxy foundation)
        └─> Issue 3 (Firebase auth)
              └─> Issue 4 (login UI)
                    └─> Issue 8 (my-trees)
                          └─> Issue 9 (tree create)
                          └─> Issue 10 (tree update/delete)
                          └─> Issue 11 (memory CRUD)
                          └─> Issue 13 (visibility) [PARTIALLY BLOCKED]
  └─> Issue 5 (community list) [no auth dep, needs proxy]
        └─> Issue 6 (tree detail)
              └─> Issue 7 (memory detail)
                    └─> Issue 12 (social)
  └─> Issue 14 (media search) [depends on Issue 11 for save]
```

**Critical path:** 1 -> 2 -> 3 -> 4 -> 8 -> 9/10/11
**Parallel track:** 1 -> 2 -> 5 -> 6 -> 7 -> 12

**Blocked:** Issue 13 partially blocked on Q19b (link visibility product decision)
