# Responsive Audit — Post-Remediation

Method: Playwright full-page captures at 1440×1000 / 900×900 / 390×844.
Clipping detection uses bounding-box intersection plus clipping-context
analysis (overflow/position ancestors); `scrollWidth == clientWidth` alone is
not trusted (per batch acceptance rules).

## Results (head 657b012)

- **Document horizontal overflow:** 0 across all 36 captures.
- **Hard clips (element bbox outside/clipped by an ancestor):** 0.
- **Blank screens:** 0 (all pages render text content).
- **Failed network requests:** 0.

## Phase 1 — Mobile Home clipping and containment (P1, resolved)

Pre-remediation at 390px: hero headline overflowed the panel and page sections
exceeded viewport width. Fixes (`b057f69`):

- `SiteHeader` nav wraps instead of overflowing.
- Hero headline wraps; `.copy` gets `min-width: 0` so flex children shrink.
- Home panel goes full-bleed below the mobile breakpoint; the fixed
  `min-height: 100vh` panel constraint was removed.
- `MemoryTreePreview` scales to 0.75 on mobile.
- Regression: `HomePage.test.tsx` mobile containment describe block.

## Touch targets (D-02, resolved)

Probe at 390px counts visible interactive elements whose bounding box is below
44px in either axis (excluding `aria-hidden` subtrees):

- Pre-remediation: 75 undersized elements.
- Post-remediation: **0**.
- Decorative non-controls (`MemoryPreviewCard` play/dots) are `aria-hidden`
  spans, excluded from the interactive set by design.

## Intentional scroll rails

- `/community` mobile: horizontal card rail (2 scrollable elements).
- `/tree/edit-demo` mobile: workspace nav rail (6 scrollable elements).

These are deliberate horizontal scroll regions with `overflow-x: auto`; they
are not document-level overflow and are excluded from clip findings.

## Breakpoint behavior notes

- Heading sizes clamp down smoothly on small viewports (floors: hero 32px,
  page 24px, work 22–21.6px, compact 18px fixed).
- App bars keep 44px control heights at all viewports; the editor toolbar
  wraps with dense 8px padding below 768px (documented exception).
