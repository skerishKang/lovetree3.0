# Current Product Capability Ledger — LoveTree 3.0

**Status:** `SOURCE_TRUTH` — verified against `src/App.tsx`, `src/api/*`, `src/components/*`, and `src/context/*` at commit `4bf60f429d5f5f4ba0c1a1abb31d481a44b21b7d`.

**Generated:** 2026-07-29 by Product Truth & Missing Real Flow Auditor.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `VERIFIED_PRODUCTION` | Deployed and verified against public Cloudflare Pages site |
| `SOURCE_IMPLEMENTED` | Front-end component exists in source and renders |
| `DEMO_ONLY` | Route uses `-demo` suffix; not wired to real backend data |
| `API_CONTRACT_PRESENT` | API client module with typed request/response exists |
| `FIREBASE_CONNECTED` | Firebase Auth integration complete (email/password + Google) |
| `NOT_CONNECTED` | UI exists but makes no real API calls |
| `NOT_IMPLEMENTED` | No source found for this capability |
| `PRODUCTION_PENDING` | Source complete but Production verification not yet performed |

---

## Capability inventory

### 1. Home landing

| Field | Value |
|-------|-------|
| Route | `/` |
| Component | `HomePage` |
| Frontend status | `SOURCE_IMPLEMENTED` |
| API status | `NOT_CONNECTED` — uses mock data only |
| Auth required | No (public) |
| Production status | `PRODUCTION_PENDING` |

### 2. Community list

| Field | Value |
|-------|-------|
| Route | `/community` |
| Component | `CommunityPage` |
| Frontend status | `SOURCE_IMPLEMENTED` |
| API status | `API_CONTRACT_PRESENT` — `communityApi.fetchMain()` / `fetchGrowing()` exist but page does not call them |
| Auth required | No (public) |
| Production status | `PRODUCTION_PENDING` |
| Backend dependency | LoveBud `GET /api/community/trees`, `GET /api/community/growing-trees` |

### 3. Authentication (Email/Password + Google)

| Field | Value |
|-------|-------|
| Routes | `/login`, `/tree/new` (redirect to `/login`), `/my-trees` (redirect to `/login`) |
| Components | `AuthLoginPage`, `EmailAuthForm`, `SocialLoginButton`, `AuthSessionController`, `RequireAuth` |
| Frontend status | `SOURCE_IMPLEMENTED` |
| Auth provider | **Firebase Auth** — `signInWithEmail`, `signInWithPassword`, `signUpWithEmail`, `signInWithGoogle` |
| API status | `FIREBASE_CONNECTED` — `firebaseAccessTokenProvider` provides Bearer token to LoveBud API |
| Auth guard | `RequireAuth` component wraps `/my-trees`, `/tree/new` (redirects to `/login` with return path) |
| Session management | `AuthProvider` context with `onIdTokenChanged` subscription, `expireSession`, `signOut` |
| Production status | `PRODUCTION_PENDING` — requires `.env` config with Firebase keys; LoginPanel, AuthBrand, AuthLegalNotice implemented |
| Backend dependency | Firebase project must be configured with email/password and Google sign-in enabled |

### 4. Public tree detail

| Field | Value |
|-------|-------|
| Route | `/tree/:treeId` |
| Component | `TreeDetailPage`, `TreeDetailHeader`, `TimelineSection`, `TimelineCard`, `TreeSocialSidebar`, `CommentSection` |
| Frontend status | `SOURCE_IMPLEMENTED` |
| API status | `API_CONTRACT_PRESENT` — `publicTreeDetail.ts` with typed response |
| Auth required | No (public route; comment input activates after login) |
| Production status | `PRODUCTION_PENDING` |
| Backend dependency | LoveBud `GET /api/trees/:id`, `GET /api/trees/:id/memories`, `GET /api/trees/:id/comments`, `GET /api/trees/:id/likes` |

### 5. Memory detail

| Field | Value |
|-------|-------|
| Real route | `/tree/:treeId/memory/:memoryId` |
| Demo route | `/memory/detail-demo` |
| Component | `MemoryDetailPage` (same component for both routes) |
| Frontend status | `SOURCE_IMPLEMENTED` |
| API status | `API_CONTRACT_PRESENT` — `publicMemoryDetail.ts` with typed response |
| Auth required | No (public route) |
| Production status | `PRODUCTION_PENDING` |
| Backend dependency | LoveBud `GET /api/memories/:id`, `GET /api/memories/:id/related` |

### 6. My trees list

| Field | Value |
|-------|-------|
| Route | `/my-trees` |
| Component | `MyTreesPage` |
| Frontend status | `SOURCE_IMPLEMENTED` + `RequireAuth` guard |
| API status | `API_CONTRACT_PRESENT` — `myTreesApi.fetchTrees()` with full normalization |
| Auth required | **Yes** (redirects to `/login` if unauthenticated) |
| Production status | `PRODUCTION_PENDING` |
| Backend dependency | LoveBud `GET /api/trees?limit=100` with Bearer token |

### 7. Create real tree

| Field | Value |
|-------|-------|
| Route | `/tree/new` |
| Component | `CreateTreePage` |
| Frontend status | `SOURCE_IMPLEMENTED` + `RequireAuth` guard |
| API status | `API_CONTRACT_PRESENT` — `createTreeApi.createTree()` with input validation and idempotency |
| Auth required | **Yes** (redirects to `/login` if unauthenticated) |
| Production status | `PRODUCTION_PENDING` |
| Backend dependency | LoveBud `POST /api/trees` with Bearer token and Idempotency-Key |

### 8. Tree editor (canvas)

| Field | Value |
|-------|-------|
| Route | `/tree/edit-demo` |
| Component | `TreeEditorPage` |
| Frontend status | `DEMO_ONLY` — `RequireAuth` wrapped but no real API connection |
| API status | `NOT_CONNECTED` |
| Auth required | Yes |
| Backend dependency | LoveBud `PATCH /api/trees/:id`, `POST /api/trees/:id/memories`, `POST /api/trees/:id/connections` |

### 9. New tree demo flow

| Field | Value |
|-------|-------|
| Routes | `/tree/new-demo`, `/tree/new-demo/edit`, `/tree/new-demo/memory/new`, `/tree/new-demo/memory/:nodeId/edit`, `/tree/new-demo/preview` |
| Components | `EmptyTreeEditorPage`, `PublicDemoEditorPage`, `PublicDemoMemoryFormPage`, `PublicDemoPreviewPage` |
| Frontend status | `DEMO_ONLY` — wrapped in `PublicDemoEditorProvider` |
| API status | `NOT_CONNECTED` |
| Auth required | No (public demo routes) |

### 10. Memory connect

| Field | Value |
|-------|-------|
| Route | `/memory/connect-demo` |
| Component | `MemoryConnectPage` |
| Frontend status | `DEMO_ONLY` |
| API status | `NOT_CONNECTED` |
| Auth required | Yes (`RequireAuth`) |
| Backend dependency | LoveBud `POST /api/trees/:id/memories/:parentId/connect` |

### 11. Media search

| Field | Value |
|-------|-------|
| Route | `/media/search-demo` |
| Component | `MediaSearchPage` |
| Frontend status | `DEMO_ONLY` |
| API status | `NOT_CONNECTED` |
| Auth required | Yes (`RequireAuth`) |
| Backend dependency | LoveBud `GET /api/media/search` |

### 12. Visibility settings

| Field | Value |
|-------|-------|
| Route | `/settings/visibility-demo` |
| Component | `VisibilitySettingsPage` |
| Frontend status | `DEMO_ONLY` |
| API status | `NOT_CONNECTED` |
| Auth required | Yes (`RequireAuth`) |
| Backend dependency | LoveBud `PATCH /api/trees/:id`, `POST /api/trees/:id/share-link` |

### 13. My trees empty state

| Field | Value |
|-------|-------|
| Route | `/my-trees/empty-demo` |
| Component | `MyTreesEmptyPage` |
| Frontend status | `DEMO_ONLY` |
| API status | `NOT_CONNECTED` |
| Auth required | Yes (`RequireAuth`) |

### 14. Likes

| Field | Value |
|-------|-------|
| Frontend status | `NOT_IMPLEMENTED` |
| API status | `NOT_IMPLEMENTED` |
| Notes | TreeSocialSidebar likely has like icon, but no like API call exists |

### 15. Comments

| Field | Value |
|-------|-------|
| Component | `CommentSection` exists |
| Frontend status | `SOURCE_IMPLEMENTED` |
| API status | `NOT_CONNECTED` |
| Notes | CommentSection renders UI but no API call to submit/load comments |

### 16. Share

| Field | Value |
|-------|-------|
| Frontend status | `NOT_IMPLEMENTED` |
| API status | `NOT_IMPLEMENTED` |

### 17. Memory deletion

| Field | Value |
|-------|-------|
| Frontend status | `NOT_IMPLEMENTED` |
| API status | `NOT_IMPLEMENTED` |

---

## API client modules

| Module | File | Status | Test file |
|--------|------|--------|-----------|
| ApiClient core | `src/api/client.ts` | `SOURCE_IMPLEMENTED` | `client.test.ts` |
| Firebase Auth | `src/api/auth.ts` | `FIREBASE_CONNECTED` | `auth.test.ts` |
| Community | `src/api/community.ts` | `API_CONTRACT_PRESENT` | `community.test.ts` |
| Create Tree | `src/api/createTree.ts` | `API_CONTRACT_PRESENT` | `createTree.test.ts` |
| My Trees | `src/api/myTrees.ts` | `API_CONTRACT_PRESENT` | `myTrees.test.ts` |
| Public Tree Detail | `src/api/publicTreeDetail.ts` | `API_CONTRACT_PRESENT` | `publicTreeDetail.test.ts` |
| Public Memory Detail | `src/api/publicMemoryDetail.ts` | `API_CONTRACT_PRESENT` | `publicMemoryDetail.test.ts` |
| Idempotency | `src/api/idempotency.ts` | `SOURCE_IMPLEMENTED` | `idempotency.test.ts` |
| Errors | `src/api/errors.ts` | `SOURCE_IMPLEMENTED` | `errors.test.ts` |

---

## Test inventory

| Area | Count | Notes |
|------|-------|-------|
| API client tests | 9 test files | Cover auth, client, community, createTree, myTrees, publicTreeDetail, publicMemoryDetail, idempotency, errors |
| Component tests | ~20+ test files | Cover AuthPage, AuthSessionController, CommunityPage, CreateTreePage, etc. |

---

## Priority product gaps (real flow missing)

1. **CRITICAL: Create tree → add first real memory** — User creates tree at `/tree/new` and gets `CreatedTree` with ID, but there is no real `/tree/:treeId/memory/new` route. The only memory creation path is demo (`/tree/new-demo/memory/new`). Product chain breaks here.

2. **HIGH: Real tree editing** — No `/tree/:treeId/edit` route exists. Only `/tree/edit-demo`.

3. **HIGH: Real memory connect** — No `/tree/:treeId/memory/connect` route. Only `/memory/connect-demo`.

4. **HIGH: Memory deletion** — Not implemented at all.

5. **MEDIUM: Wire community API to CommunityPage** — API contract exists but page still uses mock data.

6. **MEDIUM: Real visibility update** — No `PATCH /api/trees/:id` call wired to UI. Only `/settings/visibility-demo`.

7. **MEDIUM: Like/Comment APIs** — UI components exist but no API calls.

---

## Next implementation recommendation

**Gap #1 — Create tree → add first real memory** is the highest priority because:

1. A user who completes `/tree/new` and receives a tree ID has no real path to add the first memory.
2. Existing LoveBud `POST /api/trees/:id/memories` contract is documented in the handoff.
3. The `PublicDemoMemoryFormPage` component can be adapted — the demo UI is already built.
4. No new backend design is needed; it's a bounded frontend slice: add `/tree/:treeId/memory/new` real route, wire `createTreeApi`-style memory creation API, redirect from tree creation.
5. Privacy risk is controllable (owner-scoped memory creation, same auth guard as tree creation).
