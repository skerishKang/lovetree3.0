# Frontend Adapter Design

Design for connecting LoveTree 3.0 (React/TypeScript) to LoveBud backend.
LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## Architecture

```
LoveTree 3.0 React App
    |
    v
[API Client Layer] (src/api/)
    |  - Token injection
    |  - Error normalization
    |  - Idempotency key generation
    |  - Retry logic
    v
[Same-Origin Proxy] (/api/*)
    |
    v
LoveBud Cloudflare Pages Functions
    |
    v
Modal FastAPI
```

**Recommended:** Same-origin proxy pattern. Browser never calls Modal directly.

---

## API Client Foundation

### Core Module: `src/api/client.ts`

Responsibilities:
- Base URL configuration (same-origin `/api` or configurable)
- Firebase ID token injection (Authorization: Bearer)
- Request/response interceptors
- Error normalization (map HTTP status + error code to typed errors)
- 401 retry (1 attempt with fresh token)
- Request ID generation (x-lovebud-request-id compatible)

### Error Types: `src/api/errors.ts`

```typescript
type ApiErrorCode =
  | 'IDEMPOTENCY_KEY_REQUIRED'
  | 'IDEMPOTENCY_KEY_INVALID'
  | 'IDEMPOTENCY_KEY_REUSED'
  | 'IDEMPOTENCY_RESULT_UNAVAILABLE'
  | 'REACTION_TYPE_INVALID'
  | 'RATE_LIMITED'
  | 'RATE_LIMITED_MEMORY'
  | 'RATE_LIMIT_UNAVAILABLE'
  | 'SOCIAL_WRITE_UNAVAILABLE'
  | 'PLUS_REQUIRED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

interface ApiError {
  status: number;
  code: ApiErrorCode;
  message: string;
  retryable: boolean;
}
```

### Idempotency Helper: `src/api/idempotency.ts`

```typescript
function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
```

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
| `getMemoryComments(treeId, memoryId)` | GET /api/trees/:tid/memories/:mid/comments | Bearer | - | |
| `createMemoryComment(treeId, memoryId, body, key)` | POST ... | Bearer | Required | Rate limited |
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
    likeCount: 0,
    viewCount: 0,
    thumbnailUrl: snap.representativeThumbnail,
  };
}
```

Note: `likeCount`/`viewCount` not in BrowseSnapshot. Would require additional query or DTO extension. Status: **UNKNOWN** whether browse includes social counts.

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
  token: string | null;
  loading: boolean;
  tier: 'free' | 'plus' | null;
}
```

### Token Cache (sessionStorage)

Follow LoveBud pattern:
- Key: `lovetree_auth_token`
- Value: `{uid, token, expiresAt}`
- 30s expiry buffer
- UID mismatch detection

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

**Status: NOT_IMPLEMENTED** (requires implementation phase 1)

---

## LoveBud Frontend Patterns to Adopt

| Pattern | Source | Adoption |
|---|---|---|
| sessionStorage token cache | base-api-fetch.js | YES |
| UID mismatch eviction | base-api-fetch.js | YES |
| 401 single retry | base-api-fetch.js | YES |
| Auth-exempt route list | auth-policy.js | YES |
| camelCase DTO normalization | public-tree-adapter.js | Already camelCase from Modal |
| YouTube videoId extraction | public-tree-adapter.js | YES (for media search) |
