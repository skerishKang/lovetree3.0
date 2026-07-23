# Accessibility Smoke — Post-Remediation

## Decorative SVG (D-03, D-07, resolved)

- All 50 inline SVGs across 12 components carry `focusable="false"` and
  `aria-hidden="true"` (or sit inside an `aria-hidden="true"` ancestor).
- Full classification table: `svg-classification.md`. Result: every SVG in
  scope is decorative; there are no meaningful-image SVGs requiring
  `role="img"` + labels.
- Cross-screen DOM contract: on all 12 routes, every rendered `<svg>` has
  `focusable="false"` and is hidden from assistive technology.

## Heading structure (D-05)

- Exactly one `<h1>` per route on all 12 routes (DOM contract).
- Heading sizes/weights follow the 4-tier token hierarchy (see
  `visual-consistency.md`).

## Interactive vs decorative affordances (D-02)

- `MemoryPreviewCard` play button and dots menu are non-interactive
  `aria-hidden` spans with `data-testid="memory-play-affordance"` /
  `memory-dots-affordance`; DOM contract asserts they are not buttons and
  contain no focusable descendants.
- All flagged interactive controls meet the 44px minimum (touch probe: 0
  undersized @390px).

## Focus behavior

- Global `:focus-visible` outline (2px accent-rose, 3px offset) remains in
  `src/index.css`; no decorative SVG is focusable, so tab order contains only
  real controls.

## Not in scope

- Screen-reader traversal, keyboard-only flow testing, and color-contrast
  certification remain follow-up items (unchanged from the original audit's
  scope notes).
