# API Route Map

Complete endpoint contract table. LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

## Legend

- **Auth:** `Bearer` = Firebase ID token required; `None` = public; `Optional` = works with or without
- **Idem:** `Required` = Idempotency-Key header mandatory; `—` = not applicable
- **Status:** CONFIRMED / INFERRED / UNKNOWN / NOT_IMPLEMENTED

---

## Trees (Owner)

### GET /api/trees

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees` |
| Modal path | `/modal/private/trees` |
| Auth | Bearer |
| Owner check | Yes (returns only caller's trees) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{trees: NormalizedTree[]}` |
| Error shape | 401 `{detail}` |
| Side effect | None |
| DB entities | trees, memories (count) |
| Source | [functions/api/trees.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/trees.js), [modal_compute/owner_reads.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/owner_reads.py) |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getMyTrees()` |

### POST /api/trees

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees` |
| Modal path | `/modal/private/trees` |
| Auth | Bearer |
| Owner check | Yes (owner_id = authenticated uid) |
| Idempotency-Key | — |
| Query/Body | `{title?: string(200), visibility?: "public"\|"private", groupName?: string, keywords?: string}` |
| Success shape | `NormalizedTree` |
| Error shape | 401, 403 (plus gate) |
| Side effect | INSERT trees, INSERT/UPDATE users (bootstrap) |
| DB entities | trees, users |
| Source | [modal_compute/tree_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_writes.py) `create_owner_tree` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `createTree(payload)` |

### GET /api/trees/:id

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees/:id` |
| Modal path | `/modal/private/trees/:id` (owner) or `/modal/trees/:id` (public) |
| Auth | Bearer (owner path); None (public path) |
| Owner check | Yes (owner path); visibility=public gate (public path) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `NormalizedTree` (owner) or `PublicTree` (public) |
| Error shape | 401, 403, 404 |
| Side effect | None (public: Cache API 30s TTL) |
| DB entities | trees, memories (count) |
| Source | [functions/api/trees/[id].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/trees/%5Bid%5D.js), [modal_compute/public_reads.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/public_reads.py) |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getTree(id)` / `getPublicTree(id)` |

### PUT /api/trees/:id

| Field | Value |
|---|---|
| Method | PUT |
| Public path | `/api/trees/:id` |
| Modal path | `/modal/private/trees/:id` |
| Auth | Bearer |
| Owner check | Yes (`require_tree_owner`) |
| Idempotency-Key | — |
| Query/Body | `{title?: string(200), visibility?: "public"\|"private", groupName?: string, keywords?: string}` |
| Success shape | `NormalizedTree` |
| Error shape | 401, 403 (owner/plus), 404 |
| Side effect | UPDATE trees |
| DB entities | trees |
| Source | [modal_compute/tree_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_writes.py) `update_owner_tree` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `updateTree(id, payload)` |

### DELETE /api/trees/:id

| Field | Value |
|---|---|
| Method | DELETE |
| Public path | `/api/trees/:id` |
| Modal path | `/modal/private/trees/:id` |
| Auth | Bearer |
| Owner check | Yes (`require_tree_owner`) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{deleted: true, id: string}` |
| Error shape | 401, 403, 404 |
| Side effect | DELETE memories (cascade), UPDATE memories.parent_id=NULL, DELETE trees |
| DB entities | trees, memories |
| Source | [modal_compute/tree_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_writes.py) `delete_owner_tree` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `deleteTree(id)` |

### POST /api/trees/:id/fork

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees/:id/fork` |
| Modal path | `/modal/private/trees/:id/fork` |
| Auth | Bearer |
| Owner check | Source tree must be public |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `NormalizedTree + {forked: bool, duplicate: bool, forkedFromTreeId: string}` |
| Error shape | 401, 403 (source not public), 404 |
| Side effect | INSERT trees, INSERT memories (copy, max 200, parent_id remapped) |
| DB entities | trees, memories |
| Source | [modal_compute/tree_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_writes.py) `fork_public_tree` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `forkTree(id)` |

### GET /api/private/trees/:id/capability

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/private/trees/:id/capability` |
| Modal path | `/modal/private/trees/:id/capability` |
| Auth | Bearer |
| Owner check | Yes |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | Capability object (exact shape: INFERRED from route registration) |
| Error shape | 401, 403, 404 |
| Side effect | None |
| DB entities | trees |
| Source | [modal_compute/app.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/app.py) |
| Test | tests/routes/ |
| Status | INFERRED |
| LT3 adapter | `getTreeCapability(id)` |

---

## Memories (Owner)

### GET /api/memories?treeId=X

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/memories` |
| Modal path | `/modal/private/memories` |
| Auth | Bearer |
| Owner check | Yes (tree ownership) |
| Idempotency-Key | — |
| Query/Body | `treeId` (required) |
| Success shape | `{memories: NormalizedMemory[]}` |
| Error shape | 401, 403 |
| Side effect | None |
| DB entities | memories, trees |
| Source | [functions/api/memories.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/memories.js), [modal_compute/owner_reads.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/owner_reads.py) |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getMemories(treeId)` |

### POST /api/memories

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/memories` |
| Modal path | `/modal/private/memories` |
| Auth | Bearer |
| Owner check | Yes (tree ownership) |
| Idempotency-Key | — |
| Query/Body | `{treeId, parentId?, title?(200), memo?(5000), artist?(100), source?(200), sourceUrl?(1000), sourceType?(50), thumbnail?(500), emotionTags?(string[]≤20), timestamp?(100), visibility?, channelId?(100), channelName?(200), channelUrl?(1000)}` |
| Success shape | `NormalizedMemory` |
| Error shape | 401, 403 (owner/plus), 400 |
| Side effect | INSERT memories |
| DB entities | memories, trees |
| Source | [modal_compute/memory_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/memory_writes.py) `create_owner_memory` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `createMemory(payload)` |

### GET /api/memories/:id

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/memories/:id` |
| Modal path | `/modal/private/memories/:id` |
| Auth | Bearer |
| Owner check | Yes (tree ownership) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `NormalizedMemory` |
| Error shape | 401, 403, 404 |
| Side effect | None |
| DB entities | memories, trees |
| Source | [functions/api/memories/[id].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/memories/%5Bid%5D.js) |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getMemory(id)` |

### PUT /api/memories/:id

| Field | Value |
|---|---|
| Method | PUT |
| Public path | `/api/memories/:id` |
| Modal path | `/modal/private/memories/:id` |
| Auth | Bearer |
| Owner check | Yes (tree ownership via JOIN) |
| Idempotency-Key | — |
| Query/Body | Same fields as POST (all optional); `parentId` supports null/""→disconnect |
| Success shape | `NormalizedMemory` |
| Error shape | 400 (`UNSUPPORTED_MEMORY_UPDATE_FIELDS`, `EMPTY_MEMORY_UPDATE`, `INVALID_PARENT_ID`, `PARENT_MEMORY_TREE_MISMATCH`, `PARENT_CYCLE`), 401, 403, 404, 409 (`SOURCE_WRITE_ACK_DIVERGENCE`) |
| Side effect | UPDATE memories |
| DB entities | memories, trees |
| Source | [modal_compute/memory_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/memory_writes.py) `update_owner_memory` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `updateMemory(id, payload)` |

### DELETE /api/memories/:id

| Field | Value |
|---|---|
| Method | DELETE |
| Public path | `/api/memories/:id` |
| Modal path | `/modal/private/memories/:id` |
| Auth | Bearer |
| Owner check | Yes (tree ownership via JOIN) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{deleted: true, id: string, treeId: string}` |
| Error shape | 401, 403, 404 |
| Side effect | UPDATE children parent_id=NULL, DELETE memories |
| DB entities | memories, trees |
| Source | [modal_compute/memory_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/memory_writes.py) `delete_owner_memory` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `deleteMemory(id)` |

---

## Community / Browse (Public)

### GET /api/community/trees

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/community/trees?view=summary&sort=X&limit=N` |
| Modal path | `/modal/browse/latest` |
| Auth | None |
| Owner check | None |
| Idempotency-Key | — |
| Query/Body | `view=summary`, `sort` (INFERRED), `limit` (default 3) |
| Success shape | `BrowseSnapshot[]` |
| Error shape | 500 |
| Side effect | None (CF Cache 420s + 120s SWR) |
| DB entities | trees, memories (JOIN, quality filter ≥3 public) |
| Source | [functions/api/[[path]].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/%5B%5Bpath%5D%5D.js), [modal_compute/browse_latest.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/browse_latest.py) |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getCommunityTrees(limit)` |

### GET /api/community/growing-trees

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/community/growing-trees?limit=N` |
| Modal path | `/modal/browse/growing` |
| Auth | None |
| Owner check | None |
| Idempotency-Key | — |
| Query/Body | `limit` |
| Success shape | `BrowseSnapshot[]` |
| Error shape | 500 |
| Side effect | None |
| DB entities | trees, memories |
| Source | [modal_compute/public_reads.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/public_reads.py) `fetch_growing_public_tree_snapshots` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getGrowingTrees(limit)` |

### GET /api/community/memories

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/community/memories?treeId=X&limit=N` |
| Modal path | `/modal/community/memories` |
| Auth | None |
| Owner check | None (public memories only) |
| Idempotency-Key | — |
| Query/Body | `treeId`, `limit` |
| Success shape | `{memories: PublicMemory[]}` |
| Error shape | 404, 500 |
| Side effect | None |
| DB entities | memories, trees (visibility gate) |
| Source | [modal_compute/public_reads.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/public_reads.py) `fetch_public_memories` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getPublicMemories(treeId, limit)` |

---

## Social: Memory Comments

### GET /api/trees/:tid/memories/:mid/comments

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees/:tree_id/memories/:memory_id/comments` |
| Modal path | `/modal/private/trees/:tree_id/memories/:memory_id/comments` |
| Auth | Bearer |
| Owner check | Memory visible or owner |
| Idempotency-Key | — |
| Query/Body | `limit` (max 200) |
| Success shape | `NormalizedComment[]` |
| Error shape | 401, 404 |
| Side effect | None |
| DB entities | comments, memories, trees |
| Source | [modal_compute/comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/comments.py) `fetch_comments` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getMemoryComments(treeId, memoryId)` |

### POST /api/trees/:tid/memories/:mid/comments

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees/:tree_id/memories/:memory_id/comments` |
| Modal path | `/modal/private/trees/:tree_id/memories/:memory_id/comments` |
| Auth | Bearer |
| Owner check | Memory visible or owner |
| Idempotency-Key | **Required** |
| Query/Body | `{body: string(5000)}` |
| Success shape | `NormalizedComment` |
| Error shape | 400 (`IDEMPOTENCY_KEY_REQUIRED`, `SOCIAL_WRITE_UNAVAILABLE`), 401, 404, 409 (`IDEMPOTENCY_KEY_REUSED`), 410 (`IDEMPOTENCY_RESULT_UNAVAILABLE`), 429 (`RATE_LIMITED`, `RATE_LIMITED_MEMORY`), 500, 503 |
| Side effect | INSERT comments, INSERT social_idempotency, INSERT social_rate_limits, INSERT social_audit_log |
| DB entities | comments, social_idempotency, social_rate_limits, social_audit_log |
| Source | [modal_compute/comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/comments.py) `create_comment` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `createMemoryComment(treeId, memoryId, body, idempotencyKey)` |

### DELETE /api/comments/:id

| Field | Value |
|---|---|
| Method | DELETE |
| Public path | `/api/comments/:id` |
| Modal path | `/modal/private/comments/:id` |
| Auth | Bearer |
| Owner check | Comment author only (soft delete); tree owner (hide) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{id: string, status: "deleted"\|"hidden"}` |
| Error shape | 401, 403, 404 |
| Side effect | UPDATE comments (status, deleted_at, deleted_by), INSERT social_audit_log |
| DB entities | comments, social_audit_log |
| Source | [modal_compute/comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/comments.py) `soft_delete_own_comment`, `hide_comment_by_tree_owner` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `deleteComment(id)` |

---

## Social: Tree Comments

### GET /api/trees/:id/comments

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees/:tree_id/comments` |
| Modal path | `/modal/trees/:tree_id/comments` |
| Auth | None |
| Owner check | Tree must be public |
| Idempotency-Key | — |
| Query/Body | `limit` (max 50) |
| Success shape | `{comments: PublicTreeComment[]}` |
| Error shape | 404 |
| Side effect | None |
| DB entities | tree_comments, trees |
| Source | [modal_compute/tree_comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_comments.py) `fetch_tree_comments` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getTreeComments(treeId)` |

### POST /api/trees/:id/comments

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees/:tree_id/comments` |
| Modal path | `/modal/trees/:tree_id/comments` |
| Auth | Bearer |
| Owner check | Tree must be public |
| Idempotency-Key | **Required** |
| Query/Body | `{body: string(5000)}` |
| Success shape | `TreeComment {id, treeId, ownerId, body, createdAt, updatedAt}` |
| Error shape | 400, 401, 404, 409, 410, 500 |
| Side effect | INSERT tree_comments, INSERT social_idempotency, INSERT social_audit_log |
| DB entities | tree_comments, social_idempotency, social_audit_log |
| Source | [modal_compute/tree_comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_comments.py) `create_tree_comment` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `createTreeComment(treeId, body, idempotencyKey)` |

---

## Social: Memory Reactions

### GET /api/trees/:tid/memories/:mid/reactions

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees/:tree_id/memories/:memory_id/reactions` |
| Modal path | `/modal/private/trees/:tree_id/memories/:memory_id/reactions` |
| Auth | Bearer |
| Owner check | Memory visible or owner |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{counts: {like: number}, userReactions: {like: boolean}}` |
| Error shape | 401, 404 |
| Side effect | None |
| DB entities | reactions, memories, trees |
| Source | [modal_compute/reactions.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/reactions.py) `fetch_reaction_summary` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getMemoryReactions(treeId, memoryId)` |

### POST /api/trees/:tid/memories/:mid/reactions

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees/:tree_id/memories/:memory_id/reactions` |
| Modal path | `/modal/private/trees/:tree_id/memories/:memory_id/reactions` |
| Auth | Bearer |
| Owner check | Memory visible or owner |
| Idempotency-Key | **Required** |
| Query/Body | `{type: "like"}` |
| Success shape | `{type: string, active: boolean, counts: {like: number}, total: number}` |
| Error shape | 400 (`REACTION_TYPE_INVALID`, `IDEMPOTENCY_KEY_REQUIRED`), 401, 404, 409, 500 |
| Side effect | INSERT/DELETE reactions, UPDATE social_idempotency, INSERT social_audit_log; pg_advisory_xact_lock |
| DB entities | reactions, social_idempotency, social_audit_log |
| Source | [modal_compute/reactions.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/reactions.py) `toggle_reaction` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `toggleMemoryReaction(treeId, memoryId, type, idempotencyKey)` |

---

## Social: Tree Likes

### GET /api/trees/:id/likes

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees/:tree_id/likes` |
| Modal path | `/modal/trees/:tree_id/likes` |
| Auth | Bearer |
| Owner check | Tree must be public |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{treeId: string, active: boolean, likeCount: number}` |
| Error shape | 401, 404 |
| Side effect | INSERT tree_social_counts (ensure row) |
| DB entities | tree_likes, tree_social_counts, trees |
| Source | [modal_compute/tree_likes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_likes.py) `fetch_tree_like_summary` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getTreeLikeStatus(treeId)` |

### POST /api/trees/:id/likes

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees/:tree_id/likes` |
| Modal path | `/modal/trees/:tree_id/likes` |
| Auth | Bearer |
| Owner check | Tree must be public |
| Idempotency-Key | **Required** |
| Query/Body | None |
| Success shape | `{treeId: string, active: boolean, likeCount: number}` |
| Error shape | 400 (`IDEMPOTENCY_KEY_REQUIRED`), 401, 404, 409, 500 |
| Side effect | INSERT/UPDATE tree_likes (soft-delete toggle), UPDATE tree_social_counts.like_count, INSERT social_idempotency, INSERT social_audit_log; pg_advisory_xact_lock |
| DB entities | tree_likes, tree_social_counts, social_idempotency, social_audit_log |
| Source | [modal_compute/tree_likes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_likes.py) `toggle_tree_like` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `toggleTreeLike(treeId, idempotencyKey)` |

---

## Social: Tree Views

### POST /api/trees/:id/views

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/trees/:tree_id/views` |
| Modal path | `/modal/trees/:tree_id/views` |
| Auth | Optional |
| Owner check | Tree must be public |
| Idempotency-Key | — |
| Query/Body | `{actorKey: string(128), actorKind?: "authenticated"\|"anonymous", source?: "public_tree_detail"\|"public_tree_card_open"}` |
| Success shape | `{treeId: string, counted: boolean, viewCount: number}` |
| Error shape | 400, 404 |
| Side effect | INSERT tree_view_dedup_events (ON CONFLICT DO NOTHING), UPDATE tree_social_counts.view_count |
| DB entities | tree_view_dedup_events, tree_social_counts, trees |
| Source | [modal_compute/tree_views.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_views.py) `record_public_tree_view` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `recordTreeView(treeId, actorKey, actorKind, source)` |

---

## Hub Layouts

### GET /api/trees/:id/hub-layout

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/trees/:id/hub-layout` (INFERRED path) |
| Modal path | `/modal/private/trees/:id/hub-layout` |
| Auth | Bearer |
| Owner check | Yes (`require_tree_owner`) |
| Idempotency-Key | — |
| Query/Body | None |
| Success shape | `{revision: number, layoutMode: "manual"\|"auto", positions: [{memoryId, position:{x,y}}], updatedAt: ISO}` |
| Error shape | 401, 403, 404 (`HUB_LAYOUT_NOT_FOUND`) |
| Side effect | None |
| DB entities | tree_hub_layouts, trees |
| Source | [modal_compute/hub_layouts.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/hub_layouts.py) `fetch_hub_layout` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getHubLayout(treeId)` |

### PUT /api/trees/:id/hub-layout

| Field | Value |
|---|---|
| Method | PUT |
| Public path | `/api/trees/:id/hub-layout` (INFERRED path) |
| Modal path | `/modal/private/trees/:id/hub-layout` |
| Auth | Bearer |
| Owner check | Yes (`require_tree_owner`) |
| Idempotency-Key | — |
| Query/Body | `{baseRevision: number, layoutMode: "manual"\|"auto", manualPositions: [{memoryId: string, position: {x: number, y: number}}]}` |
| Success shape | `{revision: number, updatedAt: ISO, positions: [...]}` |
| Error shape | 400 (validation), 401, 403, 409 (baseRevision mismatch) |
| Side effect | INSERT tree_hub_layouts (new revision) |
| DB entities | tree_hub_layouts, trees |
| Source | [modal_compute/hub_layouts.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/hub_layouts.py) `save_hub_layout` |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `saveHubLayout(treeId, baseRevision, layoutMode, positions)` |

---

## Scout AI

### POST /api/scout/suggest

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/scout/suggest` |
| Modal path | None (Cloudflare-only) |
| Auth | None (stub); Bearer (live) |
| Owner check | None |
| Idempotency-Key | — |
| Query/Body | `{excerpt(5000), sourceUrl?(2048), summary?(5000), memo?(5000), requestedLanguage?, desiredTone?, maxOutputLength?}` |
| Success shape | `{ok: true, providerMode, suggestion: {titleSuggestion, summarySuggestion, translationSuggestion, emotionTags[1-4], memoSuggestion, safetyNote}}` |
| Error shape | `{ok: false, error: {code, message}}` |
| Side effect | None (stub); LLM call (live) |
| DB entities | None |
| Source | [functions/api/scout/suggest.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/scout/suggest.js) |
| Test | tests/routes/ |
| Status | CONFIRMED (stub), NOT_IMPLEMENTED (live persistence) |
| LT3 adapter | `getScoutSuggestion(excerpt, options)` |

### POST /api/scout/save-memory

| Field | Value |
|---|---|
| Method | POST |
| Public path | `/api/scout/save-memory` |
| Modal path | None (Cloudflare-only) |
| Auth | None |
| Owner check | None |
| Idempotency-Key | — |
| Query/Body | `{reviewed: {sourceLink, sourceLabel, memoryDraft, summary?, translatedSummary?, fanContext?, emotionTags?}}` |
| Success shape | 202 `{ok: true, status: "intake_accepted", persistence: "gated", reviewed: {...}}` |
| Error shape | 400, 405, 413, 422 |
| Side effect | None (persistence gated) |
| DB entities | None |
| Source | [functions/api/scout/save-memory.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/scout/save-memory.js) |
| Test | tests/routes/ |
| Status | CONFIRMED (intake), NOT_IMPLEMENTED (persistence) |
| LT3 adapter | `saveScoutMemory(reviewed)` |

---

## YouTube oEmbed

### GET /api/youtube/oembed

| Field | Value |
|---|---|
| Method | GET |
| Public path | `/api/youtube/oembed` |
| Modal path | None (Cloudflare proxy) |
| Auth | None |
| Owner check | None |
| Idempotency-Key | — |
| Query/Body | `url` (YouTube URL) |
| Success shape | YouTube oEmbed JSON (title, thumbnail_url, html, etc.) |
| Error shape | 400, 404, 502 |
| Side effect | None |
| DB entities | None |
| Source | [functions/api/youtube/oembed.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/youtube/oembed.js) |
| Test | tests/routes/ |
| Status | CONFIRMED |
| LT3 adapter | `getYouTubeOEmbed(url)` |

---

## Normalized DTO Shapes

### NormalizedTree (camelCase) — Status: CONFIRMED

```json
{
  "id": "uuid",
  "ownerId": "firebase-uid",
  "title": "string",
  "visibility": "public|private",
  "groupName": "string|null",
  "keywords": "string|null",
  "memoryCount": 0,
  "stage": "empty|입덕|성장|최애",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

Source: [modal_compute/validation.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/validation.py) `normalize_tree_row`

### NormalizedMemory (camelCase) — Status: CONFIRMED

```json
{
  "id": "uuid",
  "treeId": "uuid",
  "parentId": "uuid|null",
  "title": "string",
  "memo": "string",
  "artist": "string",
  "source": "string",
  "sourceUrl": "string",
  "sourceType": "youtube",
  "thumbnail": "string",
  "emotionTags": ["string"],
  "timestamp": "string",
  "visibility": "public|private",
  "channelId": "string|null",
  "channelName": "string|null",
  "channelUrl": "string|null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

Source: [modal_compute/validation.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/validation.py) `normalize_memory_row`

### BrowseSnapshot — Status: CONFIRMED

```json
{
  "id": "uuid",
  "title": "string",
  "visibility": "public",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "representativeThumbnail": "url",
  "memoryCount": 3,
  "emotionTags": ["tag1"],
  "stage": "입덕|성장|최애",
  "theme": "LoveTree",
  "timeRange": "",
  "representativeMemorySourceUrl": "url"
}
```

Source: [modal_compute/browse_latest.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/browse_latest.py) `normalize_row`

### NormalizedComment — Status: CONFIRMED

```json
{"id": "uuid", "memoryId": "uuid", "ownerId": "uid", "body": "string", "createdAt": "ISO", "updatedAt": "ISO"}
```

### PublicTreeComment — Status: CONFIRMED

```json
{"id": "uuid", "treeId": "uuid", "body": "string", "createdAt": "ISO", "updatedAt": "ISO", "authorDisplayLabel": "anonymous"}
```

### camelCase Scope Note

- Canonical tree DTO: **CONFIRMED** camelCase (normalize_tree_row)
- Canonical memory DTO: **CONFIRMED** camelCase (normalize_memory_row)
- Browse snapshot DTO: **CONFIRMED** camelCase (browse_latest.normalize_row)
- Comment DTOs: **CONFIRMED** camelCase (normalize_comment_row, normalize_tree_comment_row)
- Reaction/like/view DTOs: **CONFIRMED** camelCase (inline construction in source)
- All remaining endpoint DTOs: verify individually before relying on camelCase
