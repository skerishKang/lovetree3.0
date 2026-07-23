# Authentication & Session Map

## Firebase Auth Flow

**Status: CONFIRMED**

Source: [modal_compute/auth.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/auth.py), [js/api/base-api-fetch.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/js/api/base-api-fetch.js)

### Server-Side (Modal)

1. Extract `Authorization: Bearer <JWT>` header
2. Decode JWT header → `kid`
3. Fetch Google public certificates (cached in-memory)
4. Verify: signature, `exp`, `iss` (`https://securetoken.google.com/<project>`), `aud`
5. Extract `uid` from `sub` claim
6. Query Firestore for user profile: `displayName`, `photoURL`, `tier`
7. Return authenticated user context

### Firebase Project

- `FIREBASE_PROJECT_ID` default: `relovetree`
- Firebase web config exists in `js/firebase-config.js` (project/auth purpose only; values not reproduced)
- **Status:** CONFIRMED (project ID default in source), UNKNOWN (production override)

## Client-Side Token Management (LoveBud Frontend)

**Status: CONFIRMED**

Source: [js/api/base-api-fetch.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/js/api/base-api-fetch.js)

### Storage

| Storage | Key | Content | Persistence |
|---|---|---|---|
| sessionStorage | `lovebud_auth_token` | `{uid, token, expiresAt}` | Tab-scoped |
| localStorage | `lovebud_auth_confirmed` | `"true"` | Durable |
| localStorage | `lovebud_auth_cache` | `{uid}` | Durable |

### Token Lifecycle

1. `getCachedTokenRecord()`: Read sessionStorage, reject if expired (30s buffer) or UID mismatch
2. `setCachedTokenRecord()`: Store `{uid, token, expiresAt}` after successful `getIdTokenResult()`
3. Legacy `localStorage` token record is actively removed (migration from old pattern)
4. UID mismatch → cache eviction (account switch safety)

### Auth Policy

Source: [js/api/auth-policy.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/js/api/auth-policy.js)

| Rule | Value |
|---|---|
| `AUTH_WAIT_MS` | 800ms (configurable via `__LOVEBUD_AUTH_WAIT_MS`) |
| `AUTH_POLL_INTERVAL_MS` | 100ms |
| Auth-exempt endpoints | `/community/*` prefix |
| Retry on 401 | 1 automatic retry with fresh token if confirmed session exists |
| Persistent 401 | Clear auth state → logout event |

### Token Refresh

- Firebase SDK handles token refresh internally
- Client polls `firebase.auth().currentUser.getIdTokenResult()` up to `maxAttempts`
- `forceLongWait` mode: extended polling for confirmed sessions
- **No explicit refresh-token endpoint** — Firebase SDK manages this transparently

## Plus Tier Gate

**Status: CONFIRMED**

Source: [modal_compute/auth.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/auth.py) — `require_plus_for_private_storage()`

- `visibility = "private"` requires `tier == "plus"` (from Firestore user profile)
- Applies to: tree create, tree update, memory create, memory update
- Non-plus + private → HTTP 403
- Public visibility: no tier restriction

## LoveTree 3.0 Integration Requirements

### Current State

- **No Firebase SDK** in LoveTree 3.0 dependencies
- **No auth state management** (no context, no hooks, no token storage)
- **No protected routes** (all routes publicly accessible)
- **Status:** NOT_IMPLEMENTED

### Required Implementation

1. Add Firebase Auth SDK (v9 modular recommended)
2. Implement token cache (sessionStorage pattern from LoveBud)
3. Create auth context/provider with `isAuthenticated`, `user`, `loading` state
4. Implement `apiFetch` wrapper with Bearer token injection
5. Add 401 retry logic (1 retry with fresh token)
6. Add auth-exempt route list (`/community/*`)
7. Implement logout on persistent 401
8. Add Plus tier awareness for private visibility UI

### Session Security Notes

- sessionStorage provides tab-scoped persistence (cleared on tab close)
- Reduces persistence scope and cross-tab exposure compared to localStorage
- XSS executing in the same document origin CAN read sessionStorage tokens
- sessionStorage is NOT an XSS defense mechanism itself
- UID binding prevents account-switch token reuse
- `lovebud_auth_confirmed` in localStorage is a UX hint only, not a security boundary
- Firebase ID tokens expire ~1 hour; SDK auto-refreshes

### LoveTree 3.0 Auth Token Persistence — PRODUCT/SECURITY DECISION REQUIRED

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
