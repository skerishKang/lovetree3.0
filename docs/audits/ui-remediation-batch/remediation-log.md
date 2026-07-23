# Remediation Log — Per-Phase Changes

All commits on `integration/ui-remediation-batch`, base `main @ 562cb17`.
Every phase passed: focused tests → full suite → lint (oxlint) → typecheck
(tsc) → build → `git diff --check` before commit and push.

## Phase 1 — `b057f69` fix: resolve mobile Home clipping and containment

P1 mobile clipping at 390px.

- `src/components/SiteHeader.module.css` — nav wraps on narrow viewports.
- `src/components/HeroSection.module.css` — headline wraps; `.copy` gets
  `min-width: 0`.
- `src/components/HomePage.module.css` — mobile panel full-bleed; removed
  fixed `min-height: 100vh`.
- `src/components/MemoryTreePreview.module.css` — mobile scale 0.75.
- `src/components/HomePage.test.tsx` — mobile containment contract describe.

## Phase 2 — `c3bf36e` fix: enforce minimum touch targets across core screens

D-02. Flagged controls raised to 44px minimums; decorative affordances made
non-interactive. 75 undersized @390px → 0.

- CSS: `CommentSection`, `CommunityCategories`, `CommunitySearch`,
  `EmptyTreeEditorPage`, `MemoryConnectPage`, `MemoryDetailPage`,
  `MemoryPreviewCard`, `MediaSearchPage`, `MyTreesPage`, `TreeDetailHeader`,
  `TreeEditorPage`, `VisibilitySettingsPage` (`.module.css`).
- `src/components/MemoryPreviewCard.tsx` — play/dots → `aria-hidden` spans.
- `src/components/HomePage.test.tsx` — affordance contract.

## Phase 3 — `59f671d` fix: normalize decorative SVG accessibility

D-03 + D-07. 50 inline SVGs normalized (`focusable="false"` + `aria-hidden`).

- Components: `icons.tsx`, `CommunitySearch`, `CommunityTreePreview`,
  `EmptyTreeEditorPage`, `MediaSearchPage`, `MemoryConnectPage`,
  `MemoryDetailPage`, `MyTreesPage`, `TreeConnectorSvg`, `TreeEditorPage`,
  `VisibilitySettingsPage`.
- Regression tests added: `TreeEditorPage`, `MyTreesPage`, `MemoryDetailPage`,
  `VisibilitySettingsPage`, `MemoryConnectPage` (`.test.tsx`).
- `docs/audits/ui-remediation-batch/svg-classification.md`.

## Phase 4 — `6b5d32f` fix: unify visible Relovetree brand terminology

D-01. Brand `Relovetree`, object `러브트리`; visible `LoveTree` removed.

- `src/components/MemoryConnectPage.tsx` — logo text.
- `src/components/VisibilitySettingsPage.tsx` — page description.
- `src/data/visibilitySettingsMockData.ts`, `communityMockData.ts`,
  `memoryDetailMockData.ts` — visible labels.
- Tests synced: `VisibilitySettingsPage.test.tsx`,
  `VisibilitySettingsVisual.test.tsx`, `MemoryDetailPage.test.tsx`,
  `CommunityPage.test.tsx`.
- Not modified (out of allowed scope): `index.html` `<title>`.

## Phase 5 — `ace2303` fix: correct clamped text ellipsis behavior

D-04. All multi-line clamp rules standardized to the full set
(`display: -webkit-box; -webkit-line-clamp: N; line-clamp: N;
-webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;`).

- `CommunityTreeCard`, `FeatureSummary`, `FeaturedLoveTree`,
  `MemoryConnectPage`, `MemoryDetailPage`, `MyTreesPage`, `TimelineCard`,
  `TreeEditorPage`, `TreeSocialSidebar` (`.module.css`).
- Investigation evidence: Chrome 145 reports `-webkit-box` computed as
  `flow-root` (reporting change only); pixel-diff confirmed ellipsis renders.

## Phase 6 — `e2e0800` chore: tokenize cross-screen heading hierarchy

D-05. Four heading tokens (`hero`/`page`/`work`/`compact`) in `src/index.css`,
mapped across 13 CSS files; redundant breakpoint size overrides removed.

- `src/index.css` + `AuthBrand`, `CommunityTreeGrid`, `EmptyTreeEditorPage`,
  `HeroSection`, `HomePage`, `MediaSearchPage`, `MemoryConnectPage`,
  `MemoryDetailPage`, `MyTreesEmptyPage`, `MyTreesPage`, `TreeDetailHeader`,
  `TreeEditorPage`, `VisibilitySettingsPage` (`.module.css`).

## Phase 7 — `ef20def` chore: standardize app header visual tokens

D-06. App-header tokens applied to 5 app bars; border colors unified.

- `src/index.css` + `EmptyTreeEditorPage`, `MediaSearchPage`,
  `MemoryDetailPage`, `MyTreesPage`, `TreeEditorPage` (`.module.css`).
- `docs/audits/ui-remediation-batch/header-tokens.md`.

## Phase 8 — `657b012` test: add cross-screen UI remediation regressions

- `src/components/UiRemediationContracts.test.tsx` — 110 tests:
  - CSS-source clamp completeness + standard/prefix pairing (D-04)
  - heading token definitions + screen mapping, hero alias (D-05)
  - app-header token definitions + screen mapping (D-06)
  - cross-screen DOM: exactly one h1 (D-05), SVG AT hiding (D-03/D-07),
    no visible `LoveTree` (D-01), non-interactive affordances (D-02)

## Follow-up — `9f1fd0d` test: align contract test defect labels with register

- Corrected `(D-0x)` labels in `UiRemediationContracts.test.tsx` to match the
  original defect register numbering.
