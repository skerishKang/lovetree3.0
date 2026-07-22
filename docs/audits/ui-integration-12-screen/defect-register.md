# Defect Register — 12-Screen UI Integration Audit

Base SHA: `562cb177379d4b61d664f7a0d8bcba1428602805`.
Ordered P0 → P1 → P2 → P3. This branch performs **no fixes**; each defect proposes a
follow-up Issue.

## P0 — Blocking (crash / blank / infinite redirect / unusable)

**No blocking defects found.** All 12 routes return HTTP 200, render content (0/36 blank by
pixel-variance), have 0 console errors, 0 page errors, 0 failed requests, and no redirect
loop. Unknown route falls back to `/`.

## P1 — Major (clipping / overflow / header cover / a11y name / unreadable / serious brand)

**No P1 defects found.**
- Horizontal overflow = 0 on all 36 captures.
- No main CTA or body content clipping (all clipping is intentional line-clamp / sr-only /
  native input scroll).
- No header covers content (all overlap hits were the h1 *inside* its sticky header).
- 0 icon-only buttons missing an accessible name.
- Mobile (390px) and intermediate (900px) remain readable (no overflow, clean line-boundary
  clamps, single h1).
- Brand mixing is present but not "serious" (header wordmark is consistent on 11/12 screens;
  recorded as P2 below).

## P2 — Moderate

### D-01 — Brand / object notation inconsistency
- **ID:** UI-AUDIT-D-01
- **Severity:** P2
- **Routes:** `/settings/visibility-demo`, `/community`, `/memory/connect-demo` (plus Korean-noun screens)
- **Viewports:** all
- **Observed:** the product/object is named three ways: "Relovetree" (platform/header brand
  on 11 screens), "LoveTree" (Latin object noun in `/settings` ×7 and `/community` "Featured
  LoveTree"; also the header brand on `/memory/connect-demo`), and "러브트리" (Korean object
  noun on `/`, `/tree/community-demo`, `/my-trees`, `/tree/edit-demo`, `/tree/new-demo`,
  `/media/search-demo`, `/my-trees/empty-demo`).
- **Expected:** one canonical brand name and one object noun (documented bilingual policy);
  header brand identical on every screen that shows it.
- **Evidence:** `consistency-metrics.json` (brand counts), `/tmp/lovetree3-ui-audit/brand-context.mjs` output; screenshots `/settings`, `/community`, `/memory/connect-demo`.
- **Likely files:** `src/components/VisibilitySettingsPage.tsx`, `src/components/CommunityPage.tsx`, `src/components/MemoryConnectPage.tsx`, shared brand constants/copy.
- **Recommended fix scope:** introduce a single brand constant + object-noun glossary; replace ad-hoc strings.
- **Regression risk:** low (copy-only).
- **Suggested follow-up Issue title:** `fix: unify LoveTree brand and object notation across screens`

### D-02 — Interactive targets below 44px
- **ID:** UI-AUDIT-D-02
- **Severity:** P2
- **Routes:** `/`, `/community`, `/tree/community-demo`, `/my-trees`, `/tree/edit-demo`, `/tree/new-demo`, `/settings/visibility-demo`
- **Viewports:** all (min interactive height is viewport-stable)
- **Observed:** minimum interactive heights — `/tree/community-demo` 13px (inline "♥ n" like
  buttons), `/tree/edit-demo` 15px, `/` 20px, `/community` 19px (filter chips 37px),
  `/settings` 20px, `/my-trees` 30px (편집/공유). Primary CTAs are generally ≥42px.
- **Expected:** touch-primary targets ≥44px; documented exception only for inline/dense UI.
- **Evidence:** `capture-metadata.json` (`minInteractiveHeight`), `consistency-metrics.json` (`shortSamples`).
- **Likely files:** `TreeDetailPage.module.css` (like buttons), `TreeEditorPage.module.css` (toolbar), `CommunityPage.module.css` (chips), `MyTreesPage.module.css`, `HomePage.module.css`.
- **Recommended fix scope:** shared min-height token (44px) for touch-primary controls; enlarge the 13px like buttons; keep a documented dense-mode exception for the editor toolbar.
- **Regression risk:** medium (layout spacing shifts).
- **Suggested follow-up Issue title:** `fix: enforce 44px minimum touch targets for primary controls`

### D-03 — Inconsistent decorative-SVG `aria-hidden`
- **ID:** UI-AUDIT-D-03
- **Severity:** P2
- **Routes:** `/`, `/memory/connect-demo`, `/my-trees`, `/tree/edit-demo`, `/tree/new-demo`, `/memory/detail-demo`, `/settings/visibility-demo`
- **Viewports:** all
- **Observed:** decorative-SVG `aria-hidden="true"` coverage is partial on these screens
  (`/` 2/16, `/memory/connect` 1/4, `/my-trees` 22/28, `/tree/edit` 3/7, `/tree/new` 0/1,
  `/memory/detail` 8/12, `/settings` 0/3), while `/community`, `/login`, `/media/search-demo`,
  `/my-trees/empty-demo` are 100%.
- **Expected:** decorative SVGs carry `aria-hidden="true" focusable="false"` consistently
  (the pattern already used on the refined screens).
- **Evidence:** `capture-metadata.json` (`svgTotal`/`svgAriaHidden`/`svgFocusableFalse`).
- **Likely files:** the SVG markup in the affected `src/components/*.tsx`.
- **Recommended fix scope:** audit each uncovered SVG; add `aria-hidden="true" focusable="false"` to decorative ones (confirm meaningful icons have labels).
- **Regression risk:** low.
- **Suggested follow-up Issue title:** `fix: mark decorative SVGs aria-hidden consistently across screens`

## P3 — Minor

### D-04 — Line-clamped card text without ellipsis
- **ID:** UI-AUDIT-D-04
- **Severity:** P3
- **Routes:** `/` (feature body), `/community` (card title/summary), `/tree/community-demo` (description)
- **Viewports:** all
- **Observed:** clamped text uses fixed-height + `overflow:hidden` with `text-overflow: clip`
  (e.g. home body 2-line, community title 1-line / summary 2-line, tree-detail description
  2-line). Cuts are at clean line boundaries but show no "…" indicator. (`-webkit-line-clamp`
  is declared but paired with `display: flow-root`, so the clamp/ellipsis does not engage.)
- **Expected:** if truncation is intended, use a proper `-webkit-box` line-clamp with
  ellipsis, or ensure the full content is reachable.
- **Evidence:** `/tmp/lovetree3-ui-audit/clip-check.mjs` computed-style output.
- **Likely files:** `HomePage.module.css`, `CommunityPage.module.css`, `TreeDetailPage.module.css`.
- **Recommended fix scope:** switch clamps to `display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:N; text-overflow:ellipsis`.
- **Regression risk:** low.
- **Suggested follow-up Issue title:** `fix: add ellipsis to clamped card text`

### D-05 — h1 size/weight not tokenized
- **ID:** UI-AUDIT-D-05
- **Severity:** P3
- **Routes:** all (cross-screen)
- **Viewports:** all
- **Observed:** h1 sizes 16–36px and weights 600/700/800. Hierarchy is defensible
  (marketing > dashboard > work/detail) but values drift (34.56 vs 36px; 28.8 vs 28px; three
  weights).
- **Expected:** a small set of shared heading tokens.
- **Evidence:** `consistency-metrics.json` (`h1style`).
- **Likely files:** per-page `*.module.css` heading rules; shared typography tokens.
- **Recommended fix scope:** define 3–4 heading tokens and map screens to them.
- **Regression risk:** low.
- **Suggested follow-up Issue title:** `chore: tokenize heading sizes and weights`

### D-06 — Header height / background / position drift
- **ID:** UI-AUDIT-D-06
- **Severity:** P3
- **Routes:** app screens (`/my-trees` 69px, `/tree/edit-demo` 57px, `/memory/detail-demo` 76px, `/media/search-demo` 91px, `/tree/new-demo` 52px, `/settings` 103px)
- **Viewports:** all (heights vary slightly per viewport)
- **Observed:** app-screen header heights range 52–103px; backgrounds vary transparent /
  white / ivory; position varies static / sticky.
- **Expected:** shared header-height + background tokens for app screens (marketing vs app
  split can remain intentional).
- **Evidence:** `consistency-metrics.json` (`headerInfo`).
- **Likely files:** per-page header CSS; shared header component/token.
- **Recommended fix scope:** standardize app header height/background; keep documented exceptions.
- **Regression risk:** medium (sticky offset changes).
- **Suggested follow-up Issue title:** `chore: standardize app header height and background tokens`

### D-07 — Inconsistent SVG `focusable="false"`
- **ID:** UI-AUDIT-D-07
- **Severity:** P3
- **Routes:** all except `/login`, `/my-trees/empty-demo`
- **Viewports:** all
- **Observed:** `focusable="false"` is set on decorative SVGs only on `/login` and
  `/my-trees/empty-demo`; other screens omit it.
- **Expected:** consistent `focusable="false"` on decorative SVGs (legacy-IE hygiene; low
  impact in modern browsers).
- **Evidence:** `capture-metadata.json` (`svgFocusableFalse`).
- **Likely files:** SVG markup in affected `src/components/*.tsx`.
- **Recommended fix scope:** fold into the D-03 SVG pass.
- **Regression risk:** low.
- **Suggested follow-up Issue title:** `chore: add focusable=false to decorative SVGs`

## Counts

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 3 (D-01, D-02, D-03) |
| P3 | 4 (D-04, D-05, D-06, D-07) |

Non-blocking differences are intentionally not hidden; the items above are the complete set
of observed deviations. Screen-type variations listed in `visual-consistency.md`
(Intentional variations) are **not** counted as defects.
