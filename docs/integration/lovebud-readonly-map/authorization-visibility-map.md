# Authorization & Visibility Map

LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## Authorization Model

### Authentication

All authenticated endpoints require `Authorization: Bearer <Firebase ID Token>`.

Token verification (Modal `auth.py`):
1. Decode JWT header to get `kid`
2. Fetch Google public certs (cached)
3. Verify signature, `exp`, `iss`, `aud`
4. Extract `uid` from `sub` claim

**Status: CONFIRMED**

### Ownership Checks

| Guard | Logic | Source | Status |
|---|---|---|---|
| `require_tree_owner(tree_id, owner_id)` | trees.owner_id == authenticated uid | [write_validation.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/write_validation.py) | CONFIRMED |
| `require_memory_owner(memory_id, owner_id)` | memories JOIN trees, trees.owner_id == uid | [write_validation.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/write_validation.py) | CONFIRMED |
| `require_memory_visible_or_owner(memory_id, uid)` | Owner: always. Non-owner: tree+memory both public | [write_validation.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/write_validation.py) | CONFIRMED |
| `require_public_tree_for_like(tree_id)` | trees.visibility == public (or legacy is_public) | [tree_likes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_likes.py) | CONFIRMED |

### Leak-Safe 404

Non-owner access to private resources returns **404** (not 403) to prevent existence leakage.

**Status: CONFIRMED**

---

## Visibility Rules

### Tree Visibility

| Value | Meaning | Access |
|---|---|---|
| `public` | Visible in community/browse | Anyone can read; social writes allowed |
| `private` | Owner-only | Only owner can read/write; requires Plus tier |

### Memory Visibility

| Value | Meaning | Access |
|---|---|---|
| `public` | Visible when tree is public | Non-owner social writes allowed (if tree also public) |
| `private` | Owner-only | Only owner can access |

### Compound Visibility Gate

For non-owner social writes (comments, reactions):
- tree.visibility MUST be `public`
- memory.visibility MUST be `public`
- If either is private, returns 404 (leak-safe)

**Status: CONFIRMED**

---

## Plus Tier Gate

| Action | Requirement | Source |
|---|---|---|
| Create tree with visibility=private | tier == "plus" | auth.py `require_plus_for_private_storage` |
| Update tree visibility to private | tier == "plus" | tree_writes.py |
| Create memory with visibility=private | tier == "plus" | memory_writes.py |
| Update memory visibility to private | tier == "plus" | memory_writes.py |

Non-plus + private request returns HTTP 403.

**Status: CONFIRMED**

Tier source: Firestore user profile document.

---

## Endpoint Authorization Matrix

| Endpoint | Auth | Owner Check | Visibility Gate | Plus Gate |
|---|---|---|---|---|
| GET /api/trees | Bearer | Returns only own trees | - | - |
| POST /api/trees | Bearer | owner_id = uid | - | private requires plus |
| GET /api/trees/:id (owner) | Bearer | require_tree_owner | - | - |
| GET /api/trees/:id (public) | None | - | visibility=public | - |
| PUT /api/trees/:id | Bearer | require_tree_owner | - | private requires plus |
| DELETE /api/trees/:id | Bearer | require_tree_owner | - | - |
| POST /api/trees/:id/fork | Bearer | - | source must be public | - |
| GET /api/memories | Bearer | tree ownership | - | - |
| POST /api/memories | Bearer | tree ownership | - | private requires plus |
| PUT /api/memories/:id | Bearer | tree ownership (JOIN) | - | private requires plus |
| DELETE /api/memories/:id | Bearer | tree ownership (JOIN) | - | - |
| GET /api/community/trees | None | - | public only | - |
| GET /api/community/memories | None | - | public only | - |
| GET comments (memory) | Bearer | visible_or_owner | compound gate | - |
| POST comments (memory) | Bearer | visible_or_owner | compound gate | - |
| DELETE /api/comments/:id | Bearer | author or tree owner | - | - |
| GET tree comments | None | - | tree must be public | - |
| POST tree comments | Bearer | - | tree must be public | - |
| GET reactions | Bearer | visible_or_owner | compound gate | - |
| POST reactions | Bearer | visible_or_owner | compound gate | - |
| GET tree likes | Bearer | - | tree must be public | - |
| POST tree likes | Bearer | - | tree must be public | - |
| POST tree views | Optional | - | tree must be public | - |
| GET hub-layout | Bearer | require_tree_owner | - | - |
| PUT hub-layout | Bearer | require_tree_owner | - | - |

---

## Social Write Idempotency Protocol

**Status: CONFIRMED**

Source: [modal_compute/social_idempotency.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_idempotency.py)

| Rule | Value |
|---|---|
| Header | `Idempotency-Key` (required for all social writes) |
| Pattern | `^[A-Za-z0-9._:-]{8,128}$` |
| Missing key | 400 `IDEMPOTENCY_KEY_REQUIRED` |
| Invalid key | 400 `IDEMPOTENCY_KEY_INVALID` |
| Reuse with different target/payload | 409 `IDEMPOTENCY_KEY_REUSED` |
| Reuse with same payload (replay) | Returns cached result (200) |
| Result unavailable | 410 `IDEMPOTENCY_RESULT_UNAVAILABLE` |

### Lifecycle

1. Client generates unique key (UUID recommended)
2. `reserve_and_verify_idempotency()`: INSERT with state=pending; ON CONFLICT check fingerprint
3. Business logic executes
4. `complete_idempotency()`: UPDATE state=completed, store result_payload
5. Replay: SELECT cached result_payload, return as-is

### Fingerprint

SHA-256 of canonicalized request body JSON. Used to detect key reuse with different payload.

---

## Rate Limiting

**Status: CONFIRMED**

Source: [modal_compute/social_rate_limit.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_rate_limit.py)

| Scope | Limit | Window |
|---|---|---|
| `comment:actor` | 10 requests | 1 minute |
| `comment:actor-memory` | 3 requests | 1 minute |

Exceeded returns 429 `RATE_LIMITED` or `RATE_LIMITED_MEMORY`.

Rate limit unavailable (DB error) returns 503 `RATE_LIMIT_UNAVAILABLE` (fail-closed).

---

## Audit Logging

**Status: CONFIRMED**

Source: [modal_compute/social_write_audit.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_write_audit.py)

- Records: actor_id, action, outcome_code, request_key_hash (SHA-256 of idempotency key)
- Does NOT record: body content, token, IP address, raw idempotency key
- SAFE_ACTIONS whitelist enforced
- Best-effort (audit failure does not block write)
