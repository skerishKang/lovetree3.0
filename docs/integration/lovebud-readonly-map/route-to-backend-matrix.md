# Route-to-Backend Matrix (12 Screens)

LoveTree 3.0 routes mapped to LoveBud backend contracts.
LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.
LoveTree 3.0 base: `f321d9933ce5b470958f46e4ff2ccbcab314b11e`.

All screens are in `src/components/**`. Do NOT create `src/pages/**`.

---

## 1. `/` (HomePage)

| Aspect | Detail |
|---|---|
| Component | `src/components/HomePage.tsx` |
| Current mock source | `src/data/mockCommunityTrees.ts` |
| Auth requirement | None |
| Required API | GET /api/community/trees?view=summary&limit=N |
| Confirmed available | YES — browse_latest.py `fetch_latest_public_tree_snapshots` |
| Missing API/field | `shareCount` (UI_PRESENT/MOCK_ONLY, NOT_CONFIRMED), `isSaved` (UI_PRESENT/MOCK_ONLY, NOT_CONFIRMED) |
| Request sequence | Single GET, no auth header |
| DTO transform | BrowseSnapshot → CommunityTree (stage, tag, memoryCount, thumbnailUrl); likeCount/viewCount: use server value if provided, undefined if absent (do NOT fabricate 0) |
| Loading | Skeleton cards |
| Empty | "No trees yet" state |
| 401 | N/A (public) |
| 403 | N/A (public) |
| 404 | N/A (list endpoint) |
| 409 | N/A (read-only) |
| Network failure | Retry button + cached fallback |
| Implementation Issue | Issue 5 (public community tree list) |
| Risk | LOW — confirmed contract, simple transform |

---

## 2. `/community`

| Aspect | Detail |
|---|---|
| Component | `src/components/CommunityPage.tsx` |
| Current mock source | `src/data/mockCommunityTrees.ts` |
| Auth requirement | None |
| Required API | GET /api/community/trees?view=summary&limit=N, GET /api/community/growing-trees?limit=N |
| Confirmed available | YES — both endpoints confirmed |
| Missing API/field | `shareCount` (UI_PRESENT/MOCK_ONLY), `isSaved` (UI_PRESENT/MOCK_ONLY), sort/filter params (INFERRED only) |
| Request sequence | Parallel GET (latest + growing) |
| DTO transform | BrowseSnapshot → CommunityTree; likeCount/viewCount: undefined if not provided by server |
| Loading | Skeleton grid |
| Empty | "Community is empty" state |
| 401 | N/A (public) |
| 403 | N/A (public) |
| 404 | N/A (list) |
| 409 | N/A |
| Network failure | Partial render (show whichever succeeded) |
| Implementation Issue | Issue 5 |
| Risk | LOW |

---

## 3. `/login`

| Aspect | Detail |
|---|---|
| Component | `src/components/AuthLoginPage.tsx` |
| Current mock source | `src/data/mockAuth.ts` (AuthLoginData) |
| Auth requirement | None (this IS the auth entry) |
| Required API | Firebase Auth SDK (Google OAuth popup/redirect) |
| Confirmed available | Firebase Auth exists in LoveBud; NOT in LoveTree 3.0 deps |
| Missing API/field | Firebase SDK integration, token cache, session management |
| Request sequence | Firebase signInWithPopup → getIdTokenResult → cache token → redirect |
| DTO transform | Firebase User → app auth state |
| Loading | Spinner during OAuth flow |
| Empty | N/A |
| 401 | N/A (pre-auth) |
| 403 | N/A |
| 404 | N/A |
| 409 | N/A |
| Network failure | "Sign-in failed, try again" |
| Implementation Issue | Issue 3-4 (Firebase auth bootstrap + login UI) |
| Risk | MEDIUM — new dependency, OAuth config needed |

---

## 4. `/tree/community-demo` (Public Tree Detail)

| Aspect | Detail |
|---|---|
| Component | `src/components/TreeDetailPage.tsx` |
| Current mock source | `src/data/mockTreeDetail.ts` |
| Auth requirement | None (public tree) |
| Required API | GET /api/trees/:id (public), GET /api/community/memories?treeId=X, GET /api/trees/:id/comments, POST /api/trees/:id/views |
| Confirmed available | YES — all four endpoints confirmed |
| Missing API/field | `relatedMemories` (UI_PRESENT/MOCK_ONLY, NOT_CONFIRMED), `shareCount` (UI_PRESENT/MOCK_ONLY, NOT_CONFIRMED) |
| Request sequence | 1) GET tree (public) 2) Parallel: GET memories + GET comments + POST view |
| DTO transform | PublicTree → TreeDetail; PublicMemory → MemoryItem; PublicTreeComment → comment; likeCount/viewCount: use server value if provided, undefined if absent |
| Loading | Tree header skeleton + memory grid skeleton |
| Empty | "No memories in this tree" |
| 401 | N/A (public reads); POST comment requires auth → redirect to login |
| 403 | N/A (public) |
| 404 | "Tree not found or is private" |
| 409 | Idempotency conflict on comment — stop retry, re-query state, reconcile, show conflict to user |
| Network failure | Retry; show partial data |
| Component | `src/components/TreeDetailPage.tsx` |
| Implementation phase | Issue 6 (public tree detail) |
| Risk | LOW-MEDIUM — multiple parallel requests, view counting |

---

## 5. `/memory/connect-demo` (Memory Connect)

| Aspect | Detail |
|---|---|
| Component | `src/components/MemoryConnectPage.tsx` |
| Current mock source | `src/data/mockMediaSearch.ts` |
| Auth requirement | Bearer (creates memory) |
| Required API | GET /api/youtube/oembed?url=X, POST /api/memories |
| Confirmed available | YES — both confirmed |
| Missing API/field | Multi-source search (only YouTube supported) |
| Request sequence | 1) User pastes URL 2) GET oembed (preview) 3) POST /api/memories (save) |
| DTO transform | oEmbed response → preview; form → CreateMemoryPayload |
| Loading | oEmbed fetch spinner; save button loading |
| Empty | "Paste a YouTube URL to get started" |
| 401 | Redirect to login |
| 403 | Plus gate (if private visibility) |
| 404 | Invalid tree |
| 409 | N/A (no idempotency on memory create) |
| Network failure | "Could not fetch video info" / "Save failed, retry" |
| Implementation Issue | Issue 11 (memory CRUD/connect) |
| Risk | LOW |

---

## 6. `/my-trees`

| Aspect | Detail |
|---|---|
| Component | `src/components/MyTreesPage.tsx` |
| Current mock source | `src/data/mockMyTrees.ts` |
| Auth requirement | Bearer |
| Required API | GET /api/trees |
| Confirmed available | YES |
| Missing API/field | None critical |
| Request sequence | Single authenticated GET |
| DTO transform | NormalizedTree → MyTree (visibility, memoryCount, groupName, keywords) |
| Loading | Skeleton list |
| Empty | "Create your first tree" CTA |
| 401 | Redirect to login (token expired) |
| 403 | N/A (own trees) |
| 404 | N/A (list) |
| 409 | N/A |
| Network failure | Retry + "Could not load trees" |
| Implementation Issue | Issue 8 (authenticated my-trees) |
| Risk | LOW |

---

## 7. `/tree/edit-demo` (Tree Editor)

| Aspect | Detail |
|---|---|
| Component | `src/components/TreeEditorPage.tsx` |
| Current mock source | `src/data/mockTreeEditor.ts` |
| Auth requirement | Bearer |
| Required API | GET /api/trees/:id, GET /api/memories?treeId=X, GET /api/trees/:id/hub-layout, PUT /api/trees/:id/hub-layout, PUT /api/trees/:id |
| Confirmed available | YES — all confirmed |
| Missing API/field | Drag-and-drop position persistence (hub-layout covers this) |
| Request sequence | 1) GET tree + memories + hub-layout (parallel) 2) User edits 3) PUT hub-layout (positions) 4) PUT tree (metadata) |
| DTO transform | NormalizedMemory → TreeEditorMemory (position from hub-layout); hub-layout revision for OCC |
| Loading | Canvas skeleton |
| Empty | "Add memories to your tree" |
| 401 | Redirect to login |
| 403 | Not owner → 404 (leak-safe) |
| 404 | Tree not found |
| 409 | hub-layout baseRevision mismatch → reload and retry |
| Network failure | "Save failed" + local state preserved |
| Implementation Issue | Issue 10 (tree update/delete) + Issue 11 (memory management) |
| Risk | MEDIUM — OCC conflict handling, complex UI state |

---

## 8. `/tree/new-demo` (Tree Create)

| Aspect | Detail |
|---|---|
| Component | `src/components/EmptyTreeEditorPage.tsx` |
| Current mock source | Inline form state |
| Auth requirement | Bearer |
| Required API | POST /api/trees |
| Confirmed available | YES |
| Missing API/field | None |
| Request sequence | Single POST with {title, visibility, groupName, keywords} |
| DTO transform | Form → CreateTreePayload; response → navigate to editor |
| Loading | Button spinner |
| Empty | N/A (form) |
| 401 | Redirect to login |
| 403 | Plus gate (private visibility) |
| 404 | N/A |
| 409 | N/A |
| Network failure | "Create failed, retry" |
| Implementation Issue | Issue 9 (tree create) |
| Risk | LOW |

---

## 9. `/memory/detail-demo` (Memory Detail)

| Aspect | Detail |
|---|---|
| Component | `src/components/MemoryDetailPage.tsx` |
| Current mock source | `src/data/mockMemoryDetail.ts` |
| Auth requirement | Bearer (for reactions/comments); None for public view |
| Required API | GET /api/memories/:id OR public memory read, GET reactions, POST reactions, GET comments, POST comments |
| Confirmed available | YES — all confirmed |
| Missing API/field | `relatedMemories` (UI_PRESENT/MOCK_ONLY, NOT_CONFIRMED), `shareCount` (UI_PRESENT/MOCK_ONLY, NOT_CONFIRMED) |
| Request sequence | 1) GET memory 2) Parallel: GET reactions + GET comments 3) User action: POST reaction/comment |
| DTO transform | NormalizedMemory → MemoryDetail; reaction summary → like state |
| Loading | Detail skeleton |
| Empty | "No comments yet" |
| 401 | Redirect to login (for writes) |
| 403 | Plus gate / visibility |
| 404 | Memory not found or private |
| 409 | Idempotency conflict — stop retry, re-query state, reconcile, show conflict to user |
| Network failure | Retry; optimistic UI for reactions |
| Component | `src/components/MemoryDetailPage.tsx` |
| Implementation phase | Issue 7 (public memory detail) + Issue 12 (social) |
| Risk | LOW-MEDIUM |

---

## 10. `/media/search-demo` (Media Search)

| Aspect | Detail |
|---|---|
| Component | `src/components/MediaSearchPage.tsx` |
| Current mock source | `src/data/mockMediaSearch.ts` |
| Auth requirement | Bearer (to save results as memories) |
| Required API | GET /api/youtube/oembed?url=X |
| Confirmed available | YES (oEmbed proxy) |
| Missing API/field | Full search API (only URL-based lookup, no keyword search), multi-platform support |
| Request sequence | 1) User enters URL 2) GET oembed 3) Display preview 4) POST /api/memories (save) |
| DTO transform | oEmbed → MediaSearchResult (title, channelName, thumbnailUrl, sourceUrl, duration) |
| Loading | Search spinner |
| Empty | "Enter a YouTube URL" |
| 401 | Redirect to login (for save) |
| 403 | N/A (search is public) |
| 404 | Invalid URL / video not found |
| 409 | N/A |
| Network failure | "Search failed" |
| Implementation Issue | Issue 14 (media search gap handling) |
| Risk | MEDIUM — limited to URL lookup, no keyword search backend |

---

## 11. `/settings/visibility-demo` (Visibility Settings)

| Aspect | Detail |
|---|---|
| Component | `src/components/VisibilitySettingsPage.tsx` |
| Current mock source | `src/data/visibilitySettingsMockData.ts` |
| Auth requirement | Bearer |
| Required API | GET /api/trees (list), PUT /api/trees/:id (update visibility) |
| Confirmed available | YES (public/private only) |
| Missing API/field | Bulk visibility update (must update per-tree), default visibility preference (no endpoint), **"link" visibility option** (UI has 3 options: private/link/community; backend supports only public/private — do NOT map link arbitrarily) |
| Additional UI settings | allow-comments, allow-likes, show-profile-name — all UI_PRESENT/MOCK_ONLY, BACKEND_CONTRACT_NOT_CONFIRMED, PRODUCT_DECISION_REQUIRED |
| Request sequence | 1) GET /api/trees 2) User toggles 3) PUT /api/trees/:id {visibility} per tree |
| DTO transform | NormalizedTree → VisibilitySettings; "link" option: disabled/hidden until Q19b resolved |
| Loading | Toggle spinner per tree |
| Empty | "No trees to configure" |
| 401 | Redirect to login |
| 403 | Plus gate (setting to private) |
| 404 | Tree deleted concurrently |
| 409 | N/A |
| Network failure | Revert toggle + "Update failed" |
| Implementation Issue | Issue 13 (visibility settings) — PARTIALLY BLOCKED on Q19b |
| Risk | MEDIUM — Plus tier UX, per-tree updates, 3-option UI vs 2-option backend mismatch, additional settings have no backend contract |

---

## 12. `/my-trees/empty-demo` (Empty State)

| Aspect | Detail |
|---|---|
| Component | `src/components/MyTreesEmptyPage.tsx` |
| Current mock source | Same as /my-trees with empty array |
| Auth requirement | Bearer |
| Required API | GET /api/trees (returns empty) |
| Confirmed available | YES |
| Missing API/field | None |
| Request sequence | Single GET |
| DTO transform | Empty array → empty state UI |
| Loading | Skeleton |
| Empty | Primary state: "Create your first LoveTree" CTA |
| 401 | Redirect to login |
| 403 | N/A |
| 404 | N/A |
| 409 | N/A |
| Network failure | Retry |
| Implementation Issue | Issue 8 (with my-trees) |
| Risk | LOW |

---

## Gap Summary (4-Layer)

| Field | UI | DTO | DB | Mutation |
|---|---|---|---|---|
| shareCount | UI_PRESENT / MOCK_ONLY | NOT_CONFIRMED | NOT_CONFIRMED | NOT_IMPLEMENTED |
| isSaved | UI_PRESENT / MOCK_ONLY | NOT_CONFIRMED | NOT_CONFIRMED | NOT_IMPLEMENTED |
| relatedMemories | UI_PRESENT / MOCK_ONLY | NOT_CONFIRMED | NOT_CONFIRMED | NOT_IMPLEMENTED |

UI has mock fields and visual treatment for all three. Backend contracts are not confirmed for any layer beyond UI.
