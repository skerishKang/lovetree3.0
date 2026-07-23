# Post-Remediation Defect Register

Source: `docs/audits/ui-integration-12-screen/defect-register.md` (branch
`audit/ui-integration-12-screen`). All items re-verified after remediation at
head `657b012` (application code identical at this docs commit).

## P1 — Mobile Home clipping and containment

- **Status:** RESOLVED (Phase 1, `b057f69`)
- **Observed (pre):** at 390px the Home hero headline clipped outside its panel
  and page sections exceeded the viewport width.
- **Fix:** `SiteHeader` nav wraps; hero headline wraps with `min-width: 0` copy
  container; Home panel goes full-bleed on mobile; memory-tree preview scales
  down. Mobile containment regression tests added to `HomePage.test.tsx`.
- **Verification:** 36-capture audit — 0 hard clips, 0 document overflow at all
  viewports.

## D-01 — Brand / object notation inconsistency (P2)

- **Status:** RESOLVED (Phase 4, `6b5d32f`)
- **Fix:** visible UI now uses `Relovetree` (brand) and `러브트리` (object).
  Remaining `LoveTree` occurrences are comments/identifiers only
  (`FeaturedLoveTree` component/interface, file-header comments).
- **Verification:** cross-screen DOM contract — no visible `LoveTree` text on
  any of the 12 routes (`UiRemediationContracts.test.tsx`).
- **Caveat:** `index.html` `<title>` ("Relovetree — LoveTree 3.0") is outside
  the allowed modification scope and was left unchanged.

## D-02 — Interactive targets below 44px (P2)

- **Status:** RESOLVED (Phase 2, `c3bf36e`)
- **Fix:** flagged controls raised to `min-height: 44px` (square icon buttons
  also `min-width: 44px`); `MemoryPreviewCard` play/dots affordances converted
  to non-interactive `aria-hidden` spans (decorative, not controls).
- **Verification:** touch probe @390px — 75 undersized → 0; DOM contract asserts
  the preview affordances are non-interactive and hidden from AT.

## D-03 — Inconsistent decorative-SVG `aria-hidden` (P2)

- **Status:** RESOLVED (Phase 3, `59f671d`)
- **Fix:** all 50 inline SVGs normalized to `focusable="false"` +
  `aria-hidden="true"` (or inside an `aria-hidden` ancestor). See
  `svg-classification.md` — every SVG in scope is decorative; there are no
  meaningful-image SVGs.
- **Verification:** per-component regression tests (5 files) + cross-screen DOM
  contract across all 12 routes.

## D-04 — Line-clamped card text without ellipsis (P3)

- **Status:** RESOLVED (Phase 5, `ace2303`)
- **Investigation:** Chrome 145 reports computed `display: -webkit-box` as
  `flow-root` (resolved-value reporting change; behavior unchanged). Pixel-diff
  after `scrollIntoView` confirmed truncated clamp text renders ellipsis.
- **Fix:** every multi-line clamp rule standardized to
  `display: -webkit-box; -webkit-line-clamp: N; line-clamp: N;
  -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;`
  (9 CSS files). Single-line ellipsis rules verified complete; 0 silent clips.
- **Verification:** CSS-source contract — every `-webkit-line-clamp` block is
  paired with standard `line-clamp`, and each clamped selector carries the full
  clamp set (`UiRemediationContracts.test.tsx`).

## D-05 — h1 size/weight not tokenized (P3)

- **Status:** RESOLVED (Phase 6, `e2e0800`)
- **Fix:** 4-tier heading tokens in `src/index.css` (`hero` 36/800/1.05,
  `page` 32/800/1.3, `work` 28/700/1.3, `compact` 18/700/1.5) mapped across
  13 CSS files; redundant per-breakpoint size overrides removed.
- **Verification:** computed h1 at 1440px resolves to exactly four values
  (36/32/28/18) with two weights (800/700); token-definition and screen-mapping
  contracts in `UiRemediationContracts.test.tsx`; exactly one h1 per route.

## D-06 — Header height / background / position drift (P3)

- **Status:** RESOLVED (Phase 7, `ef20def`)
- **Fix:** app-header tokens (`--app-header-bg`, `-ivory`, `-translucent`,
  `--app-header-border-color`, `--app-header-z-index`, `--app-bar-padding-y`,
  `--app-bar-height[-mobile]`) applied to 5 app bars; border colors unified to
  `#ede6dc`. Documented exceptions in `header-tokens.md` (media-search hero
  padding, visibility-settings page header, memory-detail transparent desktop
  bar, editor mobile dense toolbar).
- **Verification:** header probe — white bars share bg/border/z tokens; desktop
  heights after remediation: my-trees 69 (0), tree-edit 69 (+12 vs pre-batch:
  44px buttons from Phase 2 + pad-y 10→12), tree-new 52 (0), memory-detail 80
  (+4: 44px back button), media-search 91 (0), settings 102 (−1: Phase 6
  line-height). No overflow/clipping regressions. See `header-tokens.md`.

## D-07 — Inconsistent SVG `focusable="false"` (P3)

- **Status:** RESOLVED (Phase 3, `59f671d`) — normalized together with D-03.
- **Verification:** cross-screen DOM contract asserts `focusable="false"` on
  every rendered `<svg>` across all 12 routes.

## Acceptance metrics (head 657b012)

| Metric | Result |
| --- | --- |
| Captures | 36 (12 routes × 3 viewports) |
| Non-200 responses | 0 |
| Console errors | 0 |
| Page errors | 0 |
| Failed requests | 0 |
| Blank screens | 0 |
| Horizontal overflow (document) | 0 |
| Hard clips (bbox + clipping context) | 0 |
| Undersized touch targets @390px | 0 |
| Unknown route → `/` fallback | yes |
| Tests | 459 passed / 14 files |
