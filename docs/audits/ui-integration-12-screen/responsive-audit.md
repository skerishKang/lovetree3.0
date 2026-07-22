# Responsive Audit — 12-Screen UI Integration Audit

Base SHA: `562cb177379d4b61d664f7a0d8bcba1428602805`.
Viewports: Desktop 1440×1000, Intermediate 900×900, Mobile 390×844 (DPR 1, full-page).

`clip` = clipping heuristic fired. Every `yes*` was manually triaged (computed-style +
geometry) and is an **intentional** pattern — see notes below; none is a content defect.

| Route | 1440 doc-h | clip | 900 doc-h | clip | 390 doc-h | clip | H-overflow (all) |
|---|---|---|---|---|---|---|---|
| `/` | 1095 | yes* | 1321 | yes* | 1792 | yes* | **0** |
| `/community` | 2016 | yes* | 3285 | 0 | 4462 | yes* | **0** |
| `/login` | 1000 | 0 | 900 | 0 | 901 | 0 | **0** |
| `/tree/community-demo` | 5012 | yes* | 6012 | yes* | 6116 | yes* | **0** |
| `/memory/connect-demo` | 1547 | 0 | 1859 | 0 | 1789 | 0 | **0** |
| `/my-trees` | 1360 | yes* | 1344 | yes* | 2736 | yes* | **0** |
| `/tree/edit-demo` | 1236 | 0 | 2281 | 0 | 2315 | 0 | **0** |
| `/tree/new-demo` | 1000 | 0 | 900 | 0 | 844 | 0 | **0** |
| `/memory/detail-demo` | 1732 | 0 | 1525 | 0 | 1522 | yes* | **0** |
| `/media/search-demo` | 1103 | 0 | 1147 | 0 | 1132 | 0 | **0** |
| `/settings/visibility-demo` | 1228 | 0 | 1207 | 0 | 968 | yes* | **0** |
| `/my-trees/empty-demo` | 1016 | 0 | 916 | 0 | 901 | 0 | **0** |

## Headline results

- **Horizontal overflow = 0 on all 36 captures.** No screen produces a horizontal scrollbar
  at 1440, 900, or 390px.
- **Clipping = 0 content defects.** All heuristic hits are intentional (below).
- **Overlap = 0 content defects.** All overlap hits were the h1 *inside* its sticky header
  (`containsH1=true`); no fixed/sticky element covers the content region.

## Clipping triage (all `yes*` explained)

| Route(s) | Element | Explanation | Classification |
|---|---|---|---|
| `/` | `._container` (full-bleed wrapper) | Decorative container ~144px wider than viewport, `overflow:hidden`; page-level overflow stays 0 | INTENTIONAL (decorative bleed) |
| `/` | `p._body` (feature cards) | 2-line fixed-height clamp, clean line boundary | P3 (clamp w/o ellipsis) |
| `/community` | `h2._cardTitle`, `p._summary` | 1/2-line clamps, clean boundaries | P3 (clamp w/o ellipsis) |
| `/tree/community-demo` | `p._description` | 2-line clamp, clean boundary | P3 (clamp w/o ellipsis) |
| `/my-trees` | `span._visuallyHidden` (×18) | sr-only accessibility pattern (1px clip) | INTENTIONAL (a11y) |
| `/memory/detail-demo` (390) | `p._relatedDesc` | `nowrap` + `text-overflow:ellipsis`; content fits | OK (correct pattern) |
| `/settings` (390) | `input._linkInput` | Native `<input>` horizontal scroll | OK (native behaviour) |

## Breakpoint quality per route

- **390px structure:** all screens collapse to a single column with no horizontal overflow;
  document heights grow as expected (e.g. `/community` 2016→4462, `/my-trees` 1360→2736).
  No too-narrow cards causing character-level Korean title fragmentation were detected
  (clamped titles cut at line boundaries, not mid-glyph).
- **900px transition:** intermediate layouts hold; no screen regresses to overflow or
  clipping at 900px. Editor (`/tree/edit-demo`) and detail (`/memory/detail-demo`) screens
  reflow to taller single-column compositions (1236→2281, 1732→1525) as expected.
- **1440px composition:** marketing screens use wide centered heroes; app screens use
  multi-column dashboards; no "mobile card simply scaled up" behaviour observed in geometry
  (column counts / max-widths change across breakpoints).

## First-viewport hierarchy

- Every screen presents exactly one h1 within the first viewport.
- Sticky headers (my-trees, tree/edit, memory/detail, media/search) keep the page title
  visible; none obscure the content below.
- Fixed footers on `/memory/detail-demo` and `/media/search-demo` (mobile) sit at the
  bottom and do not intersect the h1 or main content box.

## Fixed / sticky inventory

| Route | fixed | sticky |
|---|---|---|
| `/memory/connect-demo` | 1 | 1 |
| `/tree/edit-demo` | 0 | 1 |
| `/memory/detail-demo` | 0–1 | 1–2 |
| `/media/search-demo` | 1–2 | 1–3 |
| `/my-trees` | 0 | 1 |
| others | 0 | 0 |

No fixed/sticky element overlaps content (verified geometrically).

## Summary

Responsive contracts hold across all 12 routes and 3 viewports: zero horizontal overflow,
zero content clipping, zero content overlap. Remaining responsive-related items are P3
(clamp-without-ellipsis) and are recorded in `defect-register.md`.
