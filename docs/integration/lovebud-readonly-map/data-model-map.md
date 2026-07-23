# Data Model Map

DB schema inferred from application SQL. No migration SQL files exist.
All tables: **CONFIRMED_IN_SOURCE**, **PRODUCTION_STATUS_UNKNOWN**.

LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## trees

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT/SELECT in tree_writes.py:51, owner_reads.py | CONFIRMED_IN_SOURCE |
| owner_id | TEXT | NOT NULL | INSERT tree_writes.py:51, WHERE owner_reads.py | CONFIRMED_IN_SOURCE |
| title | VARCHAR(200) | | INSERT tree_writes.py:51, validate_optional_string(200) | CONFIRMED_IN_SOURCE |
| visibility | TEXT | 'public'\|'private' | INSERT tree_writes.py:51, validate_visibility | CONFIRMED_IN_SOURCE |
| group_name | TEXT | nullable | INSERT tree_writes.py:51, normalize_group_name | CONFIRMED_IN_SOURCE |
| keywords | TEXT | nullable | INSERT tree_writes.py:51, normalize_keywords | CONFIRMED_IN_SOURCE |
| forked_from_tree_id | UUID | nullable | INSERT tree_writes.py:213, SELECT tree_writes.py:185 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW(), RETURNING | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW(), UPDATE SET NOW() | CONFIRMED_IN_SOURCE |
| is_public | BOOLEAN | nullable, legacy | Fallback check in tree_likes.py:114, tree_views.py:62 | CONFIRMED_IN_SOURCE (legacy) |

Source: [modal_compute/tree_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_writes.py)

---

## memories

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| tree_id | UUID | FK→trees.id | INSERT memory_writes.py:42, WHERE owner_reads.py | CONFIRMED_IN_SOURCE |
| parent_id | UUID | nullable, self-FK | INSERT memory_writes.py:42, UPDATE memory_writes.py:256 | CONFIRMED_IN_SOURCE |
| title | VARCHAR(200) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| memo | TEXT(5000) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| artist | VARCHAR(100) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| source | VARCHAR(200) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| source_url | VARCHAR(1000) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| source_type | VARCHAR(50) | default 'youtube' | INSERT memory_writes.py:42, _SOURCE_ACK_FIELDS | CONFIRMED_IN_SOURCE |
| thumbnail | VARCHAR(500) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| emotion_tags | JSONB | array, max 20 | INSERT memory_writes.py:42, parse_tags | CONFIRMED_IN_SOURCE |
| timestamp | VARCHAR(100) | | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| visibility | TEXT | 'public'\|'private' | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| channel_id | VARCHAR(100) | nullable | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| channel_name | VARCHAR(200) | nullable | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| channel_url | VARCHAR(1000) | nullable | INSERT memory_writes.py:42 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW(), UPDATE SET NOW() | CONFIRMED_IN_SOURCE |

Source: [modal_compute/memory_writes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/memory_writes.py)

---

## users

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | TEXT | PK (Firebase UID) | INSERT owner_users.py:82, ON CONFLICT (id) | CONFIRMED_IN_SOURCE |
| email | VARCHAR(320) | nullable | INSERT owner_users.py:62 (conditional) | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() (conditional) | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW(), DO UPDATE SET (conditional) | CONFIRMED_IN_SOURCE |

Note: `owner_users.py` dynamically detects columns via `information_schema`. Additional columns may exist but are not referenced by application code.

Source: [modal_compute/owner_users.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/owner_users.py)

---

## comments (memory-level)

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT comments.py:115 | CONFIRMED_IN_SOURCE |
| memory_id | UUID | FK→memories.id | INSERT comments.py:115, WHERE comments.py:163 | CONFIRMED_IN_SOURCE |
| owner_id | TEXT | FK→users.id | INSERT comments.py:115, WHERE comments.py:231 | CONFIRMED_IN_SOURCE |
| body | TEXT(5000) | | INSERT comments.py:115 | CONFIRMED_IN_SOURCE |
| status | TEXT | 'visible'\|'deleted'\|'hidden' | INSERT 'visible', UPDATE comments.py:243,302 | CONFIRMED_IN_SOURCE |
| deleted_at | TIMESTAMPTZ | nullable | UPDATE comments.py:243, WHERE IS NULL comments.py:166 | CONFIRMED_IN_SOURCE |
| deleted_by | TEXT | nullable | UPDATE comments.py:243 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW(), ORDER BY | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |

Source: [modal_compute/comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/comments.py)

---

## tree_comments (tree-level)

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT tree_comments.py:160 | CONFIRMED_IN_SOURCE |
| tree_id | UUID | FK→trees.id | INSERT tree_comments.py:160, WHERE tree_comments.py:70 | CONFIRMED_IN_SOURCE |
| owner_id | TEXT | FK→users.id | INSERT tree_comments.py:160 | CONFIRMED_IN_SOURCE |
| body | TEXT(5000) | | INSERT tree_comments.py:160 | CONFIRMED_IN_SOURCE |
| target_kind | TEXT | 'tree' | INSERT tree_comments.py:160 | CONFIRMED_IN_SOURCE |
| target_id | UUID | | INSERT tree_comments.py:160 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW(), ORDER BY | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |

Source: [modal_compute/tree_comments.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_comments.py)

---

## reactions (memory-level)

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT reactions.py:170 | CONFIRMED_IN_SOURCE |
| memory_id | UUID | FK→memories.id | INSERT reactions.py:170, WHERE reactions.py:134 | CONFIRMED_IN_SOURCE |
| owner_id | TEXT | FK→users.id | INSERT reactions.py:170, WHERE reactions.py:134 | CONFIRMED_IN_SOURCE |
| type | TEXT | 'like' only (ALLOWED_REACTION_TYPES) | INSERT reactions.py:170, GROUP BY reactions.py:33 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW(), ORDER BY | CONFIRMED_IN_SOURCE |

Source: [modal_compute/reactions.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/reactions.py)

---

## tree_likes

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT tree_likes.py:291 | CONFIRMED_IN_SOURCE |
| tree_id | UUID | FK→trees.id | INSERT tree_likes.py:291, WHERE tree_likes.py:178 | CONFIRMED_IN_SOURCE |
| owner_id | TEXT | FK→users.id | INSERT tree_likes.py:291, WHERE tree_likes.py:178 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |
| deleted_at | TIMESTAMPTZ | nullable (soft delete) | INSERT NULL, UPDATE SET NOW() tree_likes.py:271, WHERE IS NULL | CONFIRMED_IN_SOURCE |

Source: [modal_compute/tree_likes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_likes.py)

---

## tree_social_counts

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| tree_id | UUID | PK, FK→trees.id | INSERT ON CONFLICT tree_likes.py:78 | CONFIRMED_IN_SOURCE |
| like_count | INTEGER | default 0 | UPDATE tree_likes.py:281,298 | CONFIRMED_IN_SOURCE |
| view_count | INTEGER | default 0 | UPDATE tree_views.py:216 | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW(), UPDATE SET NOW() | CONFIRMED_IN_SOURCE |

Source: [modal_compute/tree_likes.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_likes.py), [modal_compute/tree_views.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_views.py)

---

## tree_view_dedup_events

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT tree_views.py:189 | CONFIRMED_IN_SOURCE |
| tree_id | UUID | FK→trees.id | INSERT tree_views.py:189 | CONFIRMED_IN_SOURCE |
| actor_key | VARCHAR(128) | | INSERT tree_views.py:189 | CONFIRMED_IN_SOURCE |
| actor_kind | TEXT | 'authenticated'\|'anonymous' | INSERT tree_views.py:189 | CONFIRMED_IN_SOURCE |
| counted_window_start | DATE | date_trunc('day', NOW()) | INSERT tree_views.py:189 | CONFIRMED_IN_SOURCE |
| source | TEXT | 'public_tree_detail'\|'public_tree_card_open' | INSERT tree_views.py:189 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |
| | | UNIQUE(tree_id, actor_key, counted_window_start) | ON CONFLICT DO NOTHING tree_views.py:207 | CONFIRMED_IN_SOURCE |

Source: [modal_compute/tree_views.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/tree_views.py)

---

## tree_hub_layouts

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT hub_layouts.py:199 | CONFIRMED_IN_SOURCE |
| tree_id | UUID | FK→trees.id | INSERT hub_layouts.py:199, WHERE hub_layouts.py:141 | CONFIRMED_IN_SOURCE |
| revision | INTEGER | | INSERT hub_layouts.py:199, ORDER BY DESC | CONFIRMED_IN_SOURCE |
| layout_mode | TEXT | 'manual'\|'auto' | INSERT hub_layouts.py:199 | CONFIRMED_IN_SOURCE |
| manual_positions | JSONB | `[{memoryId, position:{x,y}}]` max 500 | INSERT ::jsonb hub_layouts.py:199 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |
| updated_at | TIMESTAMPTZ | | INSERT NOW(), RETURNING | CONFIRMED_IN_SOURCE |

Source: [modal_compute/hub_layouts.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/hub_layouts.py)

---

## social_idempotency

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT social_idempotency.py:53 | CONFIRMED_IN_SOURCE |
| actor_id | TEXT | | INSERT social_idempotency.py:53 | CONFIRMED_IN_SOURCE |
| operation | TEXT | | INSERT social_idempotency.py:53 | CONFIRMED_IN_SOURCE |
| idempotency_key | VARCHAR(128) | pattern `^[A-Za-z0-9._:-]{8,128}$` | INSERT social_idempotency.py:53, KEY_PATTERN | CONFIRMED_IN_SOURCE |
| request_fingerprint | TEXT | SHA-256 of body JSON | INSERT social_idempotency.py:53 | CONFIRMED_IN_SOURCE |
| target_kind | TEXT | nullable ('tree') | INSERT social_idempotency.py:248 | CONFIRMED_IN_SOURCE |
| target_id | TEXT | nullable | INSERT social_idempotency.py:248 | CONFIRMED_IN_SOURCE |
| target_memory_id | UUID | nullable (legacy) | INSERT social_idempotency.py:53 | CONFIRMED_IN_SOURCE |
| result_id | UUID | nullable | INSERT/UPDATE social_idempotency.py | CONFIRMED_IN_SOURCE |
| result_state | TEXT | 'pending'\|'completed'\|'replayed'\|'failed' | INSERT 'pending', UPDATE complete_idempotency | CONFIRMED_IN_SOURCE |
| result_payload | JSONB | nullable | UPDATE social_idempotency.py:343 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |
| | | UNIQUE(actor_id, operation, idempotency_key) | ON CONFLICT social_idempotency.py:57 | CONFIRMED_IN_SOURCE |

Source: [modal_compute/social_idempotency.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_idempotency.py)

---

## social_rate_limits

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT social_rate_limit.py:29 | CONFIRMED_IN_SOURCE |
| scope | TEXT | 'comment:actor'\|'comment:actor-memory' | INSERT social_rate_limit.py:29 | CONFIRMED_IN_SOURCE |
| actor_id | TEXT | | INSERT social_rate_limit.py:29 | CONFIRMED_IN_SOURCE |
| memory_id | UUID | nullable | INSERT social_rate_limit.py:29 | CONFIRMED_IN_SOURCE |
| window_start | TIMESTAMPTZ | 1-min window | INSERT ::timestamptz social_rate_limit.py:29 | CONFIRMED_IN_SOURCE |
| request_count | INTEGER | | INSERT 1, DO UPDATE +1 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |
| | | UNIQUE(scope, actor_id, COALESCE(memory_id, '00000000-...'), window_start) | ON CONFLICT social_rate_limit.py:32 | CONFIRMED_IN_SOURCE |

Source: [modal_compute/social_rate_limit.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_rate_limit.py)

---

## social_audit_log

| Column | Type | Constraints | Evidence | Status |
|---|---|---|---|---|
| id | UUID | PK | INSERT social_write_audit.py:50 | CONFIRMED_IN_SOURCE |
| actor_id | TEXT | | INSERT social_write_audit.py:50 | CONFIRMED_IN_SOURCE |
| target_kind | TEXT | nullable | INSERT social_write_audit.py:83 | CONFIRMED_IN_SOURCE |
| target_id | TEXT | nullable | INSERT social_write_audit.py:83 | CONFIRMED_IN_SOURCE |
| memory_id | UUID | nullable | INSERT social_write_audit.py:50,83 | CONFIRMED_IN_SOURCE |
| action | TEXT | SAFE_ACTIONS whitelist | INSERT social_write_audit.py:50 | CONFIRMED_IN_SOURCE |
| outcome_code | TEXT | | INSERT social_write_audit.py:50 | CONFIRMED_IN_SOURCE |
| request_key_hash | TEXT | SHA-256 of idempotency key (NOT raw key) | INSERT social_write_audit.py:50 | CONFIRMED_IN_SOURCE |
| created_at | TIMESTAMPTZ | | INSERT NOW() | CONFIRMED_IN_SOURCE |

Source: [modal_compute/social_write_audit.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_write_audit.py)

---

## Migration Status

| Item | Status |
|---|---|
| `db/migration-provenance/expected-schema-manifest.json` | `ADOPTION_REQUIRED`, `critical_objects: []` |
| Canonical migration directory | Empty |
| Migration SQL files | None exist |
| Production schema verification | NOT POSSIBLE without runtime access |

**All schema above is CONFIRMED_IN_SOURCE only. Actual production Neon schema is PRODUCTION_STATUS_UNKNOWN.**
