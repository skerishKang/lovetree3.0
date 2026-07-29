# Issue Draft: Create tree → Add first real memory

**Status:** `DRAFT` — not yet created in GitHub Issues.

---

## Objective

Connect the authenticated tree creation flow (`/tree/new` → `POST /api/trees` → receives `CreatedTree` with `id`) to a real memory creation flow (`/tree/:treeId/memory/new` → `POST /api/trees/:treeId/memories` → adds first memory record). Currently, tree creation succeeds but the user hits a dead end — the only memory creation path is the demo route (`/tree/new-demo/memory/new`).

---

## Exact starting main

`4bf60f429d5f5f4ba0c1a1abb31d481a44b21b7d`

---

## Current real source authority

| Item | Value |
|------|-------|
| Tree creation route | `/tree/new` with `RequireAuth` |
| Tree creation component | `CreateTreePage` (`src/components/CreateTreePage.tsx`) |
| Tree creation API | `createTreeApi.createTree()` (`src/api/createTree.ts`) — validated `CreateTreeInput` → `CreatedTree` with `id` |
| Auth guard | `RequireAuth` — redirects to `/login` with return path |
| Root route for new memory | `/tree/new-demo/memory/new` (demo only) |
| Demo memory form | `PublicDemoMemoryFormPage` (`src/components/PublicDemoMemoryFormPage.tsx`) |
| LoveBud memory endpoint (confirmed) | `POST /api/memories` — body contains `treeId` (required), `parentId` (optional), `title` (required), `memo`, `artist`, `source`, `sourceUrl`, `sourceType`, `thumbnail`, `emotionTags`, `timestamp`, `visibility` |
| LoveBud memory connect endpoint (expected) | `POST /api/memories` with `parentId` set to parent memory ID |

---

## Existing backend contract

Confirmed from `docs/handoff/LoveTree3_LoveBud_기술인수인계_2026-07-20.md` (section 2.3.B, 2.5):

- **`POST /api/memories`** — Creates a new memory. Request body contains `treeId` (required UUID), `parentId` (optional UUID), `title` (required, max 200 chars), `memo` (max 5,000 chars), `artist`, `source`, `sourceUrl` (max 1,000 chars), `sourceType` (default `"youtube"`), `thumbnail` (max 500 chars), `emotionTags` (max 20), `timestamp`, `visibility` (defaults to tree visibility).
- **`PUT /api/memories/:memoryId`** — Edits an existing memory. Allowlist: `title`, `memo`, `artist`, `source`, `sourceUrl`, `sourceType`, `thumbnail`, `emotionTags`, `timestamp`, `visibility`, `channelId`, `channelName`, `channelUrl`, `parentId`.
- **`DELETE /api/memories/:memoryId`** — Deletes a memory. Children's `parent_id` set to NULL. Hard delete, no restore.
- Memory must belong to a tree the user is authorized to write to.
- `parentId` must reference a memory in the same tree; self-referencing and cycles are forbidden.
- Visibility: tree-level and memory-level are independent; both `public` for public read.
- `private` requires Plus entitlement.
- Error responses: FastAPI `{ "detail": "..." }` or Cloudflare gateway `{ "error": "..." }` — both handled by existing `ApiClient` and `normalizeError()`.

---

## Permitted files

```
src/components/CreateTreePage.tsx          # Add redirect to /tree/:treeId/memory/new after creation
src/components/MemoryCreatePage.tsx         # NEW — adapt from PublicDemoMemoryFormPage
src/App.tsx                                 # Add real route /tree/:treeId/memory/new with RequireAuth
src/api/createMemory.ts                     # NEW — API client for POST /api/trees/:treeId/memories
src/api/index.ts                            # Export new module
src/types/createMemory.ts                   # NEW — types for CreateMemoryInput, CreatedMemory
docs/operations/CURRENT_PRODUCT_CAPABILITY_LEDGER.md  # Update status
```

## Forbidden files

```
src/components/PublicDemoEditorPage.tsx     # Keep demo-only; do not modify
src/components/PublicDemoMemoryFormPage.tsx  # Keep demo-only; do not modify
src/components/PublicDemoPreviewPage.tsx     # Keep demo-only; do not modify
wrangler.toml                               # Do not change deployment config
functions/**                                # Do not modify Cloudflare Functions
src/context/PublicDemoEditorContext.tsx      # Keep demo-only context
```

## Write boundary

- The real memory create page may reuse visual patterns from `PublicDemoMemoryFormPage` but must be a **new component** with a distinct file name.
- New component must use `RequireAuth` guard.
- No new npm dependencies.
- No changes to existing demo-only components or demo context.
- API client follows existing patterns in `src/api/` (class-based, `ApiClient`, `firebaseAccessTokenProvider`, idempotency, normalization, error handling).
- All new API types go into `src/types/`.

## Tests

| Test | Requirement |
|------|------------|
| `createMemory.test.ts` | API client: valid input, invalid input, response normalization, network error |
| `MemoryCreatePage.test.tsx` | Component: renders form, validates input, calls API on submit |
| `CreateTreePage.test.tsx` | Update: verify redirect to `/tree/:treeId/memory/new` after successful creation |
| `App.test.tsx` or route test | Verify `/tree/:treeId/memory/new` exists and has RequireAuth |

All tests must pass with `npm run test` before merge.

## Preview verification

1. Start dev server: `npm run dev`
2. Navigate to `/login` and sign in (requires Firebase `.env` config)
3. Navigate to `/tree/new` and create a tree
4. Verify redirect to `/tree/:treeId/memory/new`
5. Fill in memory form and submit
6. Verify success message and redirect to `/tree/:treeId` showing the new memory
7. Verify `*-demo` routes remain unchanged

## Production acceptance

After merge to `main` and Cloudflare Pages auto-deploy:

1. Verify live app at `https://lovetree3-0.pages.dev/tree/new` requires login
2. Complete tree creation flow
3. Complete memory creation flow
4. Verify no console errors
5. Verify no failed network requests (4xx/5xx)
6. Verify `POST /api/trees/:treeId/memories` reaches LoveBud backend

## Completion criteria

- [ ] Real route `/tree/:treeId/memory/new` exists with `RequireAuth`
- [ ] `src/api/createMemory.ts` has full typed API client with tests
- [ ] `CreateTreePage` redirects to new memory creation after success
- [ ] Memory form validates required fields before API call
- [ ] All existing tests pass (`npm run test`)
- [ ] All demo routes remain intact and unchanged
- [ ] No new dependencies added
- [ ] `docs/operations/CURRENT_PRODUCT_CAPABILITY_LEDGER.md` updated
