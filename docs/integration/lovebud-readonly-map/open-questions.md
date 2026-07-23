# Open Questions

Unresolved items requiring runtime access, CTO decision, or LoveBud team input.
LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## Deployment & Infrastructure

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q1 | What is the production `CORS_ALLOWED_ORIGINS` value? Does it include any LoveTree 3.0 domain? | Determines if same-origin proxy is mandatory or optional | Deployment |
| Q2 | What is the production `MODAL_BASE_URL`? (needed for proxy config) | Proxy target configuration | Deployment |
| Q3 | Is the production database actually Neon? Which region/instance? | Connection reliability, latency expectations | All |
| Q4 | What is the current production schema state? Do all 13 inferred tables exist? | May discover missing tables or columns | All |
| Q5 | Is there a staging environment for integration testing? | Test strategy | Phase 1+ |
| Q6 | What is the Modal function cold-start latency in production? | Loading state timing | UX |

---

## API Contract Gaps

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q7 | Does BrowseSnapshot include likeCount/viewCount, or must these be fetched separately? | Community card display | Phase 4 |
| Q8 | Is there a public tree detail endpoint that returns social counts (likes, views, comments count)? | Tree detail page | Phase 5 |
| Q9 | What is the exact response shape of GET /api/private/trees/:id/capability? | Tree editor feature gating | Phase 9 |
| Q10 | Are there pagination params for GET /api/trees (offset/cursor)? | Large tree lists | Phase 7 |
| Q11 | What is the max limit for GET /api/community/trees? | Community page design | Phase 4 |
| Q12 | Does the public tree detail path (`/modal/trees/:id`) return the same shape as owner path? | DTO transform | Phase 5 |

---

## Feature Gaps (Backend)

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q13 | Will shareCount be implemented? (UI field exists in LoveTree 3.0 mock) | Share button display | Phase 4-5 |
| Q14 | Will a bookmark/save API be implemented? (isSaved in mock) | Save-for-later feature | Phase 4 |
| Q15 | Will relatedMemories be implemented? (field in MemoryDetail mock) | Memory detail enrichment | Phase 6 |
| Q16 | Will keyword search for media be implemented? (only URL lookup exists) | Media search UX | Phase 13 |
| Q17 | Will multi-platform media support be added? (only YouTube) | Media connect | Phase 13 |
| Q18 | Is there a plan for bulk visibility update? (currently per-tree PUT) | Settings page performance | Phase 12 |
| Q19 | Will a default visibility preference endpoint be added? | Settings UX | Phase 12 |
| Q19b | UI has 3 visibility options (private/link/community) but backend supports only 2 (public/private). Should "link" visibility be implemented backend-side, or mapped to public with access-control layer? | Visibility settings contract | Phase 12 |

---

## Authentication & Authorization

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q20 | What Firebase project should LoveTree 3.0 use? Same as LoveBud (`relovetree`) or separate? | Firebase config, user sharing | Phase 2 |
| Q21 | If same Firebase project, do LoveTree 3.0 users share accounts with LoveBud users? | Data model, migration | Phase 2 |
| Q22 | How is Plus tier determined? Stripe? Manual? What is the Firestore document path? | Plus gate UI | Phase 8, 12 |
| Q23 | Is there a token refresh callback or must the client poll? | Token management | Phase 2 |
| Q24 | What happens to existing LoveBud sessions when LoveTree 3.0 deploys? | Migration UX | Deployment |

---

## Data & Migration

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q25 | Are there legacy `is_public` boolean rows that lack `visibility` column? | Query compatibility | Phase 4+ |
| Q26 | What is the actual users table schema? (dynamic column detection suggests variability) | User bootstrap | Phase 2 |
| Q27 | Are there orphaned memories (tree_id pointing to deleted trees)? | Data integrity | Phase 7 |
| Q28 | What is the max tree count per user? Any limits? | UI pagination | Phase 7 |
| Q29 | What is the max memory count per tree? (fork limits to 200) | Editor performance | Phase 9 |

---

## Testing & CI

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q30 | When will GitHub Actions billing be resolved? | CI for integration tests | All |
| Q31 | Is there a test/staging Modal deployment for integration testing? | Test strategy | Phase 1+ |
| Q32 | Can LoveBud contract tests be run against a staging DB? | Regression safety | Phase 1+ |

---

## LoveTree 3.0 Specific

| # | Question | Impact | Blocking Phase |
|---|---|---|---|
| Q33 | Should LoveTree 3.0 zero-network tests be replaced or supplemented? | Test strategy | Phase 1 |
| Q34 | What is the deployment target for LoveTree 3.0? (Cloudflare Pages? Vercel? Other?) | Proxy architecture | Deployment |
| Q35 | Should the `/tree/community-demo` route become `/tree/:id` in production? | URL structure | Phase 5 |
| Q36 | Should demo routes be removed or kept as fallback? | Route planning | All |

---

## Priority Classification

### Must Resolve Before Phase 1
- Q20 (Firebase project), Q34 (deployment target), Q33 (test strategy)

### Must Resolve Before Phase 4
- Q1 (CORS), Q2 (proxy target), Q7 (browse social counts), Q11 (max limit)

### Must Resolve Before Phase 8
- Q22 (Plus tier mechanism), Q28 (tree limits)

### Can Defer
- Q13-Q19 (feature gaps — can ship without, add later)
- Q25-Q29 (data questions — discoverable at runtime)
