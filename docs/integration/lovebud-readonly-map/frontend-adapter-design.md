# Frontend Adapter Design

Design for connecting LoveTree 3.0 (React/TypeScript) to LoveBud backend.
LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.
LoveTree 3.0 base: `f321d9933ce5b470958f46e4ff2ccbcab314b11e`.

---

## Architecture

**Status: PROPOSED / NOT_IMPLEMENTED**

```
LoveTree 3.0 React App (src/components/**)
    |
    v
[API Client Layer] (src/api/) — TO BE IMPLEMENTED
    |  - Token injection
    |  - Error normalization (3 envelope shapes)
    |  - Idempotency key management
    |  - 401 retry (via AccessTokenProvider seam)
    v
[Same-Origin Proxy] (/api/*) — TO BE IMPLEMENTED (functions/api/**)
    |  fetch(LOVEBUD_API_BASE_URL + "/api/...")
    v
LoveBud public API origin (/api/**) — CONFIRMED (existing)
    |
    v
LoveBud Cloudflare Pages Functions — CONFIRMED (existing)
    |
    v
Modal FastAPI — CONFIRMED (existing)
```

Browser never calls LoveBud or Modal directly. Same-origin proxy pattern required.
LoveTree proxy calls LoveBud's public API origin, NOT Modal directly.

---

## API Client Foundation

### Core Module: `src/api/client.ts`

Responsibilities:
- Base URL configuration (same-origin `/api`)
- Token injection via `AccessTokenProvider` seam (see below)
- Error normalization (3 envelope shapes, see below)
- 401 retry (1 attempt via `AccessTokenProvider.getAccessToken({forceRefresh: true})`)
- Request ID generation (x-lovebud-request-id compatible)
- 128KB body guard

### AccessTokenProvider Seam (Issue 1)

Issue 1 defines ONLY this interface — no Firebase dependency:

```typescript
interface AccessTokenProvider {
  getAccessToken(options?: { forceRefresh?: boolean }): Promise<string | null>;
}
```

- Issue 1 uses a stub/null implementation (returns null)
- Issue 3 provides the Firebase-backed implementation
- 401 retry in Issue 1 calls `getAccessToken({forceRefresh: true})` — if null, propagate 401
- No persistent 401 logout in Issue 1 (that belongs to Issue 4)
- No Firebase `currentUser` dependency in Issue 1

### Error Envelopes (Confirmed)

**SocialWriteError** (social write endpoints):
```json
{"error": "human-readable message", "code": "ERROR_CODE", "retryAfterMs": 1000}
```
`retryAfterMs` is optional.

**FastAPI HTTP/validation error** (all Modal endpoints):
```json
{"detail": "message"}
```
May also be a structured detail object.

**Network/non-JSON error** (proxy failure, timeout, non-JSON response):
- Use: status, statusText, content-type, bounded text fallback
- Map to: NETWORK_ERROR code

Not all endpoints return `{code, message}`. The client must detect and handle all three shapes.

### Normalized ApiError

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

### Idempotency Key Semantics

**Same logical mutation retry** (timeout, connection drop, unclear response, user waiting for same submit):
- Reuse the SAME Idempotency-Key

**New logical mutation** (user explicitly starts a separate new action):
- Generate a NEW key

**React StrictMode / double-click:**
- One logical mutation = one key, shared across StrictMode double-invoke and rapid double-click

**409 IDEMPOTENCY_KEY_REUSED handling:**
1. Stop auto-retry immediately
2. Re-query authoritative state (GET the resource)
3. Reconcile optimistic UI with server state
4. Show conflict/reconfirmation state to user
5. Generate new key ONLY when user explicitly initiates a new action

Keys are never reused across distinct logical mutations.
The same logical mutation retry reuses its original key.

Pattern requirement: `^[A-Za-z0-9._:-]{8,128}$` (UUID v4 satisfies this).

---

## Adapter Methods

### Trees

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `getMyTrees()` | GET /api/trees | Bearer | Returns NormalizedTree[] |
| `createTree(payload)` | POST /api/trees | Bearer | Plus gate for private |
| `getTree(id)` | GET /api/trees/:id | Bearer | Owner path |
| `getPublicTree(id)` | GET /api/trees/:id | None | Public path (different Modal route) |
| `updateTree(id, payload)` | PUT /api/trees/:id | Bearer | Partial update |
| `deleteTree(id)` | DELETE /api/trees/:id | Bearer | Cascade deletes memories |
| `forkTree(id)` | POST /api/trees/:id/fork | Bearer | Source must be public |

### Memories

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `getMemories(treeId)` | GET /api/memories?treeId=X | Bearer | Tree ownership checked |
| `createMemory(payload)` | POST /api/memories | Bearer | treeId required |
| `getMemory(id)` | GET /api/memories/:id | Bearer | |
| `updateMemory(id, payload)` | PUT /api/memories/:id | Bearer | Partial; parentId null disconnects |
| `deleteMemory(id)` | DELETE /api/memories/:id | Bearer | Children parent_id nulled |

### Community (Public)

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `getCommunityTrees(limit)` | GET /api/community/trees?view=summary&limit=N | None | BrowseSnapshot[] |
| `getGrowingTrees(limit)` | GET /api/community/growing-trees?limit=N | None | |
| `getPublicMemories(treeId, limit)` | GET /api/community/memories?treeId=X | None | |

### Social

| Method | Endpoint | Auth | Idempotency | Notes |
|---|---|---|---|---|
| `getMemoryComments(treeId, memoryId)` | GET .../comments | Bearer | - | |
| `createMemoryComment(treeId, memoryId, body, key)` | POST .../comments | Bearer | Required | Rate limited |
| `deleteComment(id)` | DELETE /api/comments/:id | Bearer | - | Author or tree owner |
| `getTreeComments(treeId)` | GET /api/trees/:id/comments | None | - | Public |
| `createTreeComment(treeId, body, key)` | POST /api/trees/:id/comments | Bearer | Required | |
| `getMemoryReactions(treeId, memoryId)` | GET .../reactions | Bearer | - | |
| `toggleMemoryReaction(treeId, memoryId, type, key)` | POST .../reactions | Bearer | Required | type='like' only |
| `getTreeLikeStatus(treeId)` | GET /api/trees/:id/likes | Bearer | - | |
| `toggleTreeLike(treeId, key)` | POST /api/trees/:id/likes | Bearer | Required | |
| `recordTreeView(treeId, actorKey, actorKind, source)` | POST /api/trees/:id/views | Optional | - | Daily dedup |

### Hub Layout

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `getHubLayout(treeId)` | GET /api/trees/:id/hub-layout | Bearer | |
| `saveHubLayout(treeId, baseRevision, mode, positions)` | PUT /api/trees/:id/hub-layout | Bearer | OCC via baseRevision |

### Media

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `getYouTubeOEmbed(url)` | GET /api/youtube/oembed?url=X | None | Proxy |

---

## DTO Transform Layer

### BrowseSnapshot to CommunityTree

```typescript
function toCommunityTree(snap: BrowseSnapshot): CommunityTree {
  return {
    id: snap.id,
    title: snap.title,
    ownerName: 'anonymous',
    stage: snap.stage,
    tag: snap.emotionTags[0] ?? '',
    memoryCount: snap.memoryCount,
    likeCount: snap.likeCount,      // undefined if not provided by server
    viewCount: snap.viewCount,      // undefined if not provided by server
    thumbnailUrl: snap.representativeThumbnail,
  };
}
```

**Metrics rules:**
- likeCount: use server value if number; undefined if not provided; 0 ONLY if server explicitly returns 0
- viewCount: same rule
- Do NOT fabricate 0 for missing metrics
- UI must hide metric or show "no data" when undefined

**Endpoint metric availability:**

| Endpoint | likeCount | viewCount |
|---|---|---|
| GET /api/community/trees (BrowseSnapshot) | UNKNOWN (not confirmed in DTO) | UNKNOWN |
| GET /api/trees/:id/likes | CONFIRMED (likeCount in response) | N/A |
| POST /api/trees/:id/views | N/A | CONFIRMED (viewCount in response) |
| GET /api/trees/:id (public detail) | UNKNOWN | UNKNOWN |

### NormalizedTree to MyTree

```typescript
function toMyTree(t: NormalizedTree): MyTree {
  return {
    id: t.id,
    title: t.title,
    visibility: t.visibility,
    memoryCount: t.memoryCount,
    groupName: t.groupName,
    keywords: t.keywords,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
```

---

## Auth State Management

### Required State

```typescript
interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  tier: 'free' | 'plus' | null;
}
```

### Token Persistence — PRODUCT/SECURITY DECISION REQUIRED

Two options (not finalized in this mapping):

**Option A (Preferred baseline):**
- Firebase SDK-managed auth persistence
- `currentUser.getIdToken()` on demand
- Application state holds minimal user/session metadata
- Raw token long-term storage minimized

**Option B (Compatibility with LoveBud pattern):**
- sessionStorage token cache `{uid, token, expiresAt}`
- UID binding
- 30s expiry buffer
- Persistent 401 eviction
- Requires separate security justification and tests if chosen

This mapping does NOT finalize the choice. See open-questions.md Q37.

### Protected Route Wrapper

```typescript
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" />;
  return children;
}
```

---

## Zero-Network Test Migration

Current LoveTree 3.0 tests enforce zero-network (`globalThis.fetch` never called).

Migration strategy:
1. Introduce API client behind interface
2. Mock at adapter layer (not fetch level)
3. Update test assertions from "fetch never called" to "adapter returns mock data"
4. Integration tests (separate suite) can hit real endpoints

**Status: NOT_IMPLEMENTED** (requires Issue 1)

---

## Component Path Convention

All screens are in `src/components/**`:
- `src/components/AuthLoginPage.tsx`
- `src/components/HomePage.tsx`
- `src/components/CommunityPage.tsx`
- `src/components/TreeDetailPage.tsx`
- `src/components/MemoryConnectPage.tsx`
- `src/components/MyTreesPage.tsx`
- `src/components/MyTreesEmptyPage.tsx`
- `src/components/TreeEditorPage.tsx`
- `src/components/EmptyTreeEditorPage.tsx`
- `src/components/MemoryDetailPage.tsx`
- `src/components/MediaSearchPage.tsx`
- `src/components/VisibilitySettingsPage.tsx`

Do NOT create `src/pages/**`. Do NOT duplicate existing components. If architecture migration to `src/pages` is needed, it requires a separate Issue outside this plan.

---

## LoveBud Frontend Patterns (Reference)

| Pattern | Source | Adoption |
|---|---|---|
| 401 single retry | base-api-fetch.js | YES |
| Auth-exempt route list | auth-policy.js | YES |
| camelCase DTO normalization | public-tree-adapter.js | Already camelCase from Modal |
| YouTube videoId extraction | public-tree-adapter.js | YES (for media search) |
| UID mismatch eviction | base-api-fetch.js | CONDITIONAL (Option B only) |
| sessionStorage token cache | base-api-fetch.js | CONDITIONAL (Option B only, needs security justification) |
