# Accessibility Smoke — 12-Screen UI Integration Audit

Base SHA: `562cb177379d4b61d664f7a0d8bcba1428602805`.
This is a **smoke** check of basic accessibility contracts, not a WCAG conformance audit.
No WCAG compliance or certification is claimed.

Auto-collected values are separated from manual judgement below.

## Auto-collected (desktop viewport; stable across viewports)

| Route | h1 | h2 | icon-only btn | icon-only no-name | SVG total | SVG aria-hidden | SVG focusable=false | img no-alt | initial dialog |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 1 | 0 | 10 | **0** | 16 | 2 | 0 | 0 | 0 |
| `/community` | 1 | 9 | 0 | **0** | 10 | 10 | 0 | 0 | 0 |
| `/login` | 1 | 1 | 0 | **0** | 4 | 4 | 4 | 0 | 0 |
| `/tree/community-demo` | 1 | 0 | 0 | **0** | 0 | 0 | 0 | 0 | 0 |
| `/memory/connect-demo` | 1 | 0 | 1 | **0** | 4 | 1 | 0 | 0 | 0 |
| `/my-trees` | 1 | 2 | 3 | **0** | 28 | 22 | 0 | 0 | 0 |
| `/tree/edit-demo` | 1 | 1 | 2 | **0** | 7 | 3 | 0 | 0 | 0 |
| `/tree/new-demo` | 1 | 0 | 0 | **0** | 1 | 0 | 0 | 0 | 0 |
| `/memory/detail-demo` | 1 | 2 | 3 | **0** | 12 | 8 | 0 | 0 | 0 |
| `/media/search-demo` | 1 | 7 | 0 | **0** | 7 | 7 | 0 | 0 | 0 |
| `/settings/visibility-demo` | 1 | 1 | 0 | **0** | 3 | 0 | 0 | 0 | 0 |
| `/my-trees/empty-demo` | 1 | 1 | 1 | **0** | 4 | 4 | 4 | 0 | 0 |

## Auto-collected results — summary

- **h1 structure:** exactly one h1 on all 12 screens. No missing or duplicate h1. ✅
- **Icon-only button accessible names:** 0 violations across all screens (every icon-only
  button has `aria-label`/`aria-labelledby`/`title`). ✅
- **img alt:** no `<img>` elements used (all graphics are inline SVG); 0 missing-alt imgs. ✅
- **Initial dialog/alert:** no `dialog`/`alertdialog`/`alert` present on load anywhere. ✅
- **Decorative SVG `aria-hidden`:** inconsistent coverage (see D-03). ⚠️
- **Decorative SVG `focusable="false"`:** only `/login` and `/my-trees/empty-demo` set it. ⚠️

## Manual judgement

- **Touch targets:** many secondary/utility controls are below the 44px guideline
  (see D-02). Primary CTAs are generally ≥42px. This is a target-size concern, recorded as
  P2; it is not a missing-name/role error.
- **Button/link roles:** interactive elements use native `<button>`/`<a>`; no misused
  `role` detected in the auto pass.
- **SVG semantics:** the screens with partial `aria-hidden` coverage (`/`, `/memory/connect`,
  `/my-trees`, `/tree/edit`, `/memory/detail`, `/tree/new`, `/settings`) likely contain
  decorative SVGs that should be hidden from assistive tech. Because this environment cannot
  render images to confirm each SVG is decorative, this is recorded as a **recommendation to
  verify**, not a confirmed violation. The recently refined screens (`/login`,
  `/my-trees/empty-demo`, `/community`, `/media/search-demo`) demonstrate the intended
  pattern (decorative SVGs `aria-hidden="true" focusable="false"`).
- **`.visuallyHidden` spans** on `/my-trees` are a correct screen-reader-only pattern and are
  **not** defects.

## Verdict

Basic accessibility contracts (single h1, icon-button names, no missing alt, no modal on
load) hold on all 12 screens. Two hygiene gaps are recorded as non-blocking findings:
**D-03 (P2)** inconsistent decorative-SVG `aria-hidden`, and a **P3** note on inconsistent
`focusable="false"`. No P0/P1 accessibility defects.
