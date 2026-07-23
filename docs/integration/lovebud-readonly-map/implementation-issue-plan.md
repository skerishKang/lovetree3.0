# Implementation Issue Plan

Phased Issue candidates for LoveTree 3.0 integration with LoveBud backend.
Each Issue is scoped to allowed paths only.

---

## Global Constraints (All Issues)

**Allowed paths:**
- `src/api/**`
- `src/hooks/**`
- `src/context/**`
- `src/types/api.ts`
- `src/components/**` (UI connection only)
- `src/pages/**` (data fetching only)
- `src/__tests__/**`
- `vite.config.ts` (proxy config only)

**Forbidden paths:**
- `docs/audits/**`
- `docs/evidence/**`
- `docs/reference/**`
- `docs/integration/lovebud-readonly-map/**` (this mapping is frozen)
- `.github/**`
- `package-lock.json` (except when adding deps)

**Security acceptance (all Issues):**
- No secrets in source
- No dangerouslySetInnerHTML for UGC
- Token in sessionStorage only
- Idempotency keys via crypto.randomUUID()

---

## Issue 1: Integration Client and Error Foundation

**Title:** `feat: add API client foundation with error normalization`

**Allowed paths:** `src/api/client.ts`, `src/api/errors.ts`, `src/api/idempotency.ts`, `src/types/api.ts`, `src/__tests__/api/**`

**Forbidden paths:** `src/components/**`, `src/pages/**`, `docs/**`

**Backend contract:**
- Base URL: same-origin `/api` (configurable)
- Headers: `Authorization: Bearer <token>`, `Idempotency-Key` (writes), `x-lovebud-request-id`
- Body limit: 128KB
- Error shape: `{detail: string}` or `{code: string, message: string}`

**Deliverables:**
- Typed API client with fetch wrapper
- Error normalization (HTTP status + code to ApiError)
- Idempotency key generator
- Request ID generator
- 401 single-retry logic (placeholder, no Firebase yet)

**Tests:** Unit tests for error mapping, idempotency key format, request ID format

**Security acceptance:** No token logging, no secrets, 128KB body guard

---

## Issue 2: Firebase Auth Bootstrap

**Title:** `feat: add Firebase Auth SDK and token management`

**Allowed paths:** `src/api/auth.ts`, `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts`, `src/types/auth.ts`, `src/__tests__/auth/**`, `package.json` (add firebase dep)

**Forbidden paths:** `src/components/**`, `src/pages/**`, `docs/**`

**Backend contract:**
- Firebase project: configured via env (not hardcoded)
- Token: `user.getIdTokenResult()` → JWT
- Storage: sessionStorage `lovetree_auth_token` = `{uid, token, expiresAt}`
- Expiry buffer: 30s
- UID mismatch: evict cache

**Deliverables:**
- Firebase App initialization (env-based config)
- AuthContext with `{user, token, loading, tier}`
- Token cache (sessionStorage, UID-bound)
- `getToken()` with auto-refresh
- `signOut()` with cache clear
- Auth-exempt route list (`/community/*`, `/login`)

**Tests:** Token cache lifecycle, UID mismatch eviction, expiry buffer

**Security acceptance:** No localStorage token, no Firebase service account keys, config via env only

---

## Issue 3: Login/Session/Logout UI Connection

**Title:** `feat: connect login page to Firebase Auth`

**Allowed paths:** `src/pages/LoginPage.tsx`, `src/components/auth/**`, `src/App.tsx` (route guards), `src/__tests__/pages/login/**`

**Forbidden paths:** `src/api/**`, `docs/**`

**Backend contract:**
- Google OAuth via Firebase `signInWithPopup(GoogleAuthProvider)`
- Post-login: cache token, redirect to `/my-trees`
- Logout: clear cache, redirect to `/login`

**Deliverables:**
- Login page with Google sign-in button
- RequireAuth wrapper component
- Post-login redirect logic
- Logout button in app shell
- Loading/error states for OAuth flow

**Tests:** Mock Firebase auth, test redirect logic, test RequireAuth gating

**Security acceptance:** No token in URL params, no popup bypass

---

## Issue 4: Public Community Tree List

**Title:** `feat: connect community page to browse API`

**Allowed paths:** `src/pages/CommunityPage.tsx`, `src/pages/HomePage.tsx`, `src/api/community.ts`, `src/hooks/useCommunityTrees.ts`, `src/__tests__/pages/community/**`

**Forbidden paths:** `docs/**`, `src/context/**`

**Backend contract:**
- GET /api/community/trees?view=summary&limit=N → BrowseSnapshot[]
- GET /api/community/growing-trees?limit=N → BrowseSnapshot[]
- No auth required
- Cache: CF 420s + 120s SWR (transparent to client)

**Deliverables:**
- `getCommunityTrees(limit)` adapter
- `getGrowingTrees(limit)` adapter
- BrowseSnapshot → CommunityTree transform
- Loading skeleton, empty state, error retry
- Remove mock data import

**Tests:** Transform tests, loading/empty/error states, zero-network test update

**Security acceptance:** No auth header on public endpoints

---

## Issue 5: Public Tree Detail

**Title:** `feat: connect tree detail page to public APIs`

**Allowed paths:** `src/pages/TreeDetailPage.tsx`, `src/api/trees.ts`, `src/hooks/usePublicTree.ts`, `src/__tests__/pages/tree-detail/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- GET /api/trees/:id (public path, no auth) → PublicTree
- GET /api/community/memories?treeId=X → {memories: PublicMemory[]}
- GET /api/trees/:id/comments → {comments: PublicTreeComment[]}
- POST /api/trees/:id/views → {counted, viewCount}

**Deliverables:**
- Parallel fetch (tree + memories + comments)
- View count recording (fire-and-forget, non-blocking)
- 404 handling ("Tree not found or is private")
- DTO transforms
- Remove mock data

**Tests:** Parallel fetch, 404 state, view count non-blocking

**Security acceptance:** View POST is fire-and-forget (no user data leakage)

---

## Issue 6: Public Memory Detail

**Title:** `feat: connect memory detail to public/auth APIs`

**Allowed paths:** `src/pages/MemoryDetailPage.tsx`, `src/api/memories.ts`, `src/api/social.ts`, `src/hooks/useMemoryDetail.ts`, `src/__tests__/pages/memory-detail/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- GET /api/memories/:id (auth) or public memory read
- GET /api/trees/:tid/memories/:mid/reactions → {counts, userReactions}
- GET /api/trees/:tid/memories/:mid/comments → NormalizedComment[]

**Deliverables:**
- Memory detail fetch with reactions + comments
- Like button (optimistic UI)
- Comment list display
- 404 handling
- Remove mock data

**Tests:** Reaction toggle, comment display, 404 state

**Security acceptance:** No UGC rendered via dangerouslySetInnerHTML

---

## Issue 7: Authenticated My-Trees List

**Title:** `feat: connect my-trees to authenticated API`

**Allowed paths:** `src/pages/MyTreesPage.tsx`, `src/api/trees.ts`, `src/hooks/useMyTrees.ts`, `src/__tests__/pages/my-trees/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- GET /api/trees (Bearer) → {trees: NormalizedTree[]}
- 401 → redirect to login

**Deliverables:**
- Authenticated tree list fetch
- NormalizedTree → MyTree transform
- Empty state ("Create your first tree")
- 401 redirect
- Remove mock data

**Tests:** Auth gating, empty state, 401 redirect

**Security acceptance:** Token injected, 401 handled

---

## Issue 8: Tree Create

**Title:** `feat: add tree creation flow`

**Allowed paths:** `src/pages/TreeCreatePage.tsx`, `src/api/trees.ts`, `src/hooks/useCreateTree.ts`, `src/__tests__/pages/tree-create/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- POST /api/trees {title?, visibility?, groupName?, keywords?}
- 403 if private + non-plus
- Response: NormalizedTree → navigate to editor

**Deliverables:**
- Create form (title, visibility toggle, group, keywords)
- Plus tier awareness (disable private if non-plus)
- Success → navigate to /tree/edit/:id
- Error handling (403, network)

**Tests:** Form validation, 403 handling, navigation

**Security acceptance:** No XSS in title/keywords input

---

## Issue 9: Tree Update/Delete

**Title:** `feat: add tree edit and delete`

**Allowed paths:** `src/pages/TreeEditPage.tsx`, `src/api/trees.ts`, `src/hooks/useTreeEditor.ts`, `src/__tests__/pages/tree-edit/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- PUT /api/trees/:id {title?, visibility?, groupName?, keywords?}
- DELETE /api/trees/:id → {deleted: true}
- PUT /api/trees/:id/hub-layout {baseRevision, layoutMode, manualPositions}
- 409 on hub-layout revision mismatch

**Deliverables:**
- Tree metadata editing
- Delete with confirmation dialog
- Hub layout save (OCC with baseRevision)
- 409 conflict → reload and retry
- Position drag-and-drop → manualPositions

**Tests:** OCC conflict handling, delete confirmation, metadata update

**Security acceptance:** Confirm before destructive delete

---

## Issue 10: Memory Create/Update/Delete

**Title:** `feat: add memory CRUD operations`

**Allowed paths:** `src/pages/MemoryConnectPage.tsx`, `src/api/memories.ts`, `src/hooks/useMemoryCrud.ts`, `src/__tests__/pages/memory-connect/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- POST /api/memories {treeId, title?, memo?, artist?, source?, sourceUrl?, sourceType?, thumbnail?, emotionTags?, ...}
- PUT /api/memories/:id (partial update, parentId null disconnects)
- DELETE /api/memories/:id → {deleted, id, treeId}
- Error codes: UNSUPPORTED_MEMORY_UPDATE_FIELDS, EMPTY_MEMORY_UPDATE, INVALID_PARENT_ID, PARENT_MEMORY_TREE_MISMATCH, PARENT_CYCLE, SOURCE_WRITE_ACK_DIVERGENCE

**Deliverables:**
- Memory create form (with YouTube oEmbed preview)
- Memory edit (partial fields)
- Memory delete with confirmation
- Error code handling (especially 409 SOURCE_WRITE_ACK_DIVERGENCE)
- Parent memory selection (tree hierarchy)

**Tests:** Create flow, edit partial, delete, error codes

**Security acceptance:** URL validation, no arbitrary HTML in memo

---

## Issue 11: Comments/Reactions/Tree-Like

**Title:** `feat: add social interactions (comments, reactions, likes)`

**Allowed paths:** `src/components/social/**`, `src/api/social.ts`, `src/hooks/useSocial.ts`, `src/__tests__/components/social/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- POST comments: Idempotency-Key required, rate limited (10/min actor, 3/min memory)
- POST reactions: Idempotency-Key required, type='like' only, toggle
- POST tree likes: Idempotency-Key required, toggle, public trees only
- 429 RATE_LIMITED / RATE_LIMITED_MEMORY
- 409 IDEMPOTENCY_KEY_REUSED

**Deliverables:**
- Comment compose + list (memory-level and tree-level)
- Like button (memory reaction + tree like)
- Idempotency key per action (crypto.randomUUID())
- Rate limit handling (429 → "Please wait")
- Optimistic UI for likes
- Comment delete (author) / hide (tree owner)

**Tests:** Idempotency key generation, rate limit UI, toggle behavior, delete permissions

**Security acceptance:** No UGC via dangerouslySetInnerHTML, idempotency keys never reused

---

## Issue 12: Visibility Settings

**Title:** `feat: connect visibility settings to tree API`

**Allowed paths:** `src/pages/VisibilitySettingsPage.tsx`, `src/api/trees.ts`, `src/hooks/useVisibility.ts`, `src/__tests__/pages/visibility/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- GET /api/trees → list with visibility
- PUT /api/trees/:id {visibility} per tree
- 403 if setting private without plus

**Deliverables:**
- Per-tree visibility toggle
- Plus tier gate UI (lock icon, upgrade prompt)
- Optimistic toggle with rollback on failure
- Batch save (sequential PUT per tree)

**Tests:** Toggle behavior, 403 handling, rollback on failure

**Security acceptance:** Plus gate enforced client-side (server also enforces)

---

## Issue 13: Media Search Gap Handling

**Title:** `feat: media search via YouTube oEmbed with gap documentation`

**Allowed paths:** `src/pages/MediaSearchPage.tsx`, `src/api/media.ts`, `src/hooks/useMediaSearch.ts`, `src/__tests__/pages/media-search/**`

**Forbidden paths:** `docs/**`

**Backend contract:**
- GET /api/youtube/oembed?url=X → oEmbed JSON
- No keyword search API exists
- No multi-platform support

**Deliverables:**
- URL-based YouTube lookup (paste URL → preview)
- Clear UX messaging: "URL lookup only, keyword search not available"
- oEmbed → MediaSearchResult transform
- Save-to-memory flow (POST /api/memories)
- Gap documentation in UI ("Search by URL only")

**Tests:** URL validation, oEmbed transform, save flow, error states

**Security acceptance:** URL validation (only youtube.com/youtu.be), no arbitrary URL fetch

---

## Dependency Graph

```
Issue 1 (client foundation)
  └─→ Issue 2 (Firebase auth)
        └─→ Issue 3 (login UI)
              └─→ Issue 7 (my-trees)
                    └─→ Issue 8 (tree create)
                    └─→ Issue 9 (tree update/delete)
                    └─→ Issue 10 (memory CRUD)
                    └─→ Issue 12 (visibility)
  └─→ Issue 4 (community list) [no auth dep]
        └─→ Issue 5 (tree detail)
              └─→ Issue 6 (memory detail)
                    └─→ Issue 11 (social)
  └─→ Issue 13 (media search) [depends on Issue 10 for save]
```

**Critical path:** 1 → 2 → 3 → 7 → 8/9/10
**Parallel track:** 1 → 4 → 5 → 6 → 11
