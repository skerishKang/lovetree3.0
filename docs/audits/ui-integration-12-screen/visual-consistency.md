# Visual Consistency — 12-Screen UI Integration Audit

Base SHA: `562cb177379d4b61d664f7a0d8bcba1428602805`. All observations are from computed
styles, DOM text, and pixel sampling (this audit environment cannot render images for
human-style review; screenshots are provided for the CTO's visual review).

## Brand

| Observation | Detail | Severity |
|---|---|---|
| Platform/header brand | "Relovetree" on `/`, `/community`, `/my-trees`, `/tree/edit-demo`, `/tree/new-demo`, `/settings`, `/my-trees/empty-demo` | — |
| Header brand drift | `/memory/connect-demo` header reads **"LoveTree"** instead of "Relovetree" | P2 |
| Object noun (Latin) | "LoveTree" used in body copy on `/settings` (×7) and `/community` ("Featured LoveTree") | P2 |
| Object noun (Korean) | "러브트리" used on `/`, `/tree/community-demo`, `/my-trees`, `/tree/edit-demo`, `/tree/new-demo`, `/media/search-demo`, `/my-trees/empty-demo` | P2 |
| Brand color/font/position | Header wordmark position and styling are consistent where present; no color drift detected | OK |
| Duplicate brand on one screen | No screen shows two competing brand wordmarks | OK |

**Finding (UI-AUDIT D-01, P2):** the product is referred to three ways — "Relovetree"
(platform), "LoveTree" (Latin object noun + one header), and "러브트리" (Korean object
noun). The split between "LoveTree" and "러브트리" for the same object, plus the
`/memory/connect-demo` header using "LoveTree", is a notation inconsistency. Recommend a
single canonical brand name and a single object noun (bilingual policy documented).

## Header & navigation

| Route | Header | Position | Height | Background |
|---|---|---|---|---|
| `/` | present | static | 80px | transparent |
| `/community` | present | static | 71px | transparent |
| `/login` | **none** | — | — | — (intentional onboarding) |
| `/tree/community-demo` | present | static | 201px (hero) | transparent |
| `/memory/connect-demo` | present | static | 88px | transparent |
| `/my-trees` | present | sticky | 69px | white |
| `/tree/edit-demo` | present | sticky | 57px | white |
| `/tree/new-demo` | present | static | 52px | white |
| `/memory/detail-demo` | present | sticky | 76px | transparent |
| `/media/search-demo` | present | sticky | 91px | ivory `rgb(248,245,240)` |
| `/settings/visibility-demo` | present | static | 103px | transparent |
| `/my-trees/empty-demo` | present | static | 80px | transparent |

**Findings:**
- Only `/` exposes a primary nav menu (About / Features / Community / My Tree); other
  screens use contextual headers (back / title / actions). This is an intentional
  marketing-vs-app split (INTENTIONAL_VARIATION).
- App-screen header heights drift: 52 / 57 / 69 / 76 / 91 / 103px. No shared header-height
  token. (P3 — screen-specific visual drift.)
- Header background drift: transparent vs white vs ivory across app screens. (P3.)
- No header overlaps body content: every "overlap" heuristic hit was the h1 *inside* its
  sticky header (`containsH1=true`), i.e. the page title is part of the header by design.
  No fixed/sticky element covers the content region.

## Typography

| Route | h1 size | h1 weight |
|---|---|---|
| `/` | 36px | 800 |
| `/community` | 34.56px | 700 |
| `/login` | 21.6px | 600 |
| `/tree/community-demo` | 28.8px | 800 |
| `/memory/connect-demo` | 28px | 800 |
| `/my-trees` | 28px | 700 |
| `/tree/edit-demo` | 16px | 700 |
| `/tree/new-demo` | 26px | 700 |
| `/memory/detail-demo` | 18px | 700 |
| `/media/search-demo` | 18px | 700 |
| `/settings/visibility-demo` | 32px | 800 |
| `/my-trees/empty-demo` | 28px | 700 |

**Findings:**
- h1 sizes range 16–36px, weights 600/700/800. They follow a defensible hierarchy —
  marketing (32–36px) > dashboard (26–29px) > work/detail (16–18px) — but values are not
  tokenized: 34.56px vs 36px, 28.8px vs 28px, and three different weights. (P3.)
- Every screen has exactly one h1 (no missing/duplicate h1).
- No mobile heading clipping detected (no overflow-hidden heading with clipped content).
- Body font-family is consistent across screens (single family stack).
- Line-clamped card text (home body, community title/summary, tree-detail description)
  truncates at clean line boundaries but uses `text-overflow: clip` — no ellipsis. (P3.)

## Color & surface

Pixel-sampled dominant backgrounds (desktop):

| Route | Background | Family |
|---|---|---|
| `/` | `#f0f0e8` | ivory |
| `/community` | `#f8f8f0` | ivory |
| `/login` | `#f8f0e8` | ivory-rose |
| `/tree/community-demo` | `#e8e0d8` | beige |
| `/memory/connect-demo` | `#f8f8f8` | near-white warm |
| `/my-trees` | `#f8f0f0` | rose |
| `/tree/edit-demo` | `#f8f0f0` | rose |
| `/tree/new-demo` | `#f8f0f0` | rose |
| `/memory/detail-demo` | `#f8f8f0` | ivory |
| `/media/search-demo` | `#f8f0f0` | rose |
| `/settings/visibility-demo` | `#f0e0e0` | rose |
| `/my-trees/empty-demo` | `#f8f0f0` | rose |

**Findings:**
- All backgrounds sit in one warm ivory/rose/beige family. **No pure-white "generic SaaS"
  screen** and no off-brand cold/grey screen. Palette is cohesive. (OK)
- Per-screen tone varies (rose app screens vs ivory content screens vs beige detail) —
  reasonable screen-type variation within one palette (INTENTIONAL_VARIATION).
- No blank screen: pixel-variance blank detection found 0/36 blank captures.

## CTA hierarchy

| Route | Min interactive height | Notable sub-44px controls |
|---|---|---|
| `/` | 20px | icon buttons 20–33px |
| `/community` | 19px | filter chips 37px |
| `/login` | 51px | none |
| `/tree/community-demo` | 13px | "♥ n" like buttons 13px, back 36px |
| `/memory/connect-demo` | 40px | icon button 40px |
| `/my-trees` | 30px | 편집/공유 30px, primary 42px |
| `/tree/edit-demo` | 15px | toolbar 미리보기/저장 29px, 게시하기 27px |
| `/tree/new-demo` | 31–39px | tab buttons 39px |
| `/memory/detail-demo` | 40px | icon buttons 40px |
| `/media/search-demo` | 44px | none |
| `/settings/visibility-demo` | 20px | (small controls) |
| `/my-trees/empty-demo` | 40px | icon button 40px, quick-start 44px |

**Findings (UI-AUDIT D-02, P2):** primary CTAs are generally ≥42px, but many secondary /
utility controls fall below the 44px touch-target guideline — most extreme the 13px inline
"♥ n" like buttons (`/tree/community-demo`) and 15–20px icon buttons. Editor toolbar
compactness (`/tree/edit-demo`) is partly intentional (high-density workspace). Recommend a
shared min-target token (44px for touch-primary, documented exception for inline/dense UI).

## Iconography

- Decorative SVG `aria-hidden="true"` coverage is inconsistent (see accessibility-smoke.md
  and D-03). Screens `/community`, `/login`, `/media/search-demo`, `/my-trees/empty-demo`
  are 100%; `/`, `/settings`, `/tree/new-demo` are largely uncovered.
- `focusable="false"` is set only on `/login` and `/my-trees/empty-demo`. (P3.)
- Icon-only buttons all have accessible names (0 violations).

## Screen density

- Marketing screens (`/`, `/community`, `/settings`) are spacious with large headings.
- App/dashboard screens (`/my-trees`, `/my-trees/empty-demo`) are medium density.
- Work/detail screens (`/tree/edit-demo`, `/memory/detail-demo`, `/media/search-demo`) are
  high density with compact headers and controls.
- Empty state (`/my-trees/empty-demo`) is deliberately low density.

These density differences are intentional per screen role (INTENTIONAL_VARIATION), not
defects.

## Intentional variations (not defects)

- `/login` header-less onboarding layout.
- `/tree/edit-demo` high-density editor workspace and compact toolbar.
- `/tree/community-demo` tall hero header and content-centric detail layout.
- `/my-trees/empty-demo` low-density empty state.
- `.visuallyHidden` sr-only spans on `/my-trees` (accessibility pattern, not clipping).
- `<input>` horizontal scroll on `/settings` (native behaviour).
- Per-screen background tone within the shared warm palette.
