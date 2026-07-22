# LoveTree 3.0 — 12-Screen UI Integration Audit

**Status:** IN PROGRESS (scaffold) — results pending
**Audit type:** audit-only (no application source changes)
**Issue:** #54
**Branch:** `audit/ui-integration-12-screen`

## Purpose

Treat the 12 implemented LoveTree 3.0 screens as a single product and verify that
the following are consistent and stable across them:

- Brand notation and color
- Header and navigation
- Typography
- Button and CTA hierarchy
- Card / surface / border / shadow
- Responsive transitions
- Basic accessibility contracts
- Horizontal overflow
- Clipping and overlap
- Runtime errors
- Visual connectivity between screens

Findings are recorded in `defect-register.md`. Actual fixes are split into separate
follow-up Issues; this branch does **not** modify application code.

## Base SHA

`562cb177379d4b61d664f7a0d8bcba1428602805` (`origin/main` at audit start)

## Audit target routes (exactly 12)

Read from `src/App.tsx` at the base SHA:

| # | Route | Component |
|---|---|---|
| 1 | `/` | `HomePage` |
| 2 | `/community` | `CommunityPage` |
| 3 | `/login` | `AuthLoginPage` |
| 4 | `/tree/community-demo` | `TreeDetailPage` |
| 5 | `/memory/connect-demo` | `MemoryConnectPage` |
| 6 | `/my-trees` | `MyTreesPage` |
| 7 | `/tree/edit-demo` | `TreeEditorPage` |
| 8 | `/tree/new-demo` | `EmptyTreeEditorPage` |
| 9 | `/memory/detail-demo` | `MemoryDetailPage` |
| 10 | `/media/search-demo` | `MediaSearchPage` |
| 11 | `/settings/visibility-demo` | `VisibilitySettingsPage` |
| 12 | `/my-trees/empty-demo` | `MyTreesEmptyPage` |

Additional smoke check: `/__ui-audit-missing-route__` must fall back to `/`.

## Viewports (3)

| Label | Width × Height | DPR |
|---|---|---|
| Desktop | 1440×1000 | 1 |
| Intermediate | 900×900 | 1 |
| Mobile | 390×844 | 1 |

Total captures: **12 routes × 3 viewports = 36 PNG** + 3 contact sheets.

## Constraints

- **No application source changes.** Forbidden: `src/**`, `package.json`,
  `package-lock.json`, `vite.config.*`, `tsconfig*`, `.github/**`, `public/**`,
  `docs/reference/**`, `docs/evidence/**`, `artifacts/**`.
- Allowed change scope: `docs/audits/ui-integration-12-screen/**` only.
- Captures use independent Playwright + system Chrome (no Kimi WebBridge).

## Documents (to be completed)

- `route-matrix.md`
- `visual-consistency.md`
- `responsive-audit.md`
- `accessibility-smoke.md`
- `defect-register.md`
- `capture-metadata.json`
- `contact-sheet-desktop.png` / `contact-sheet-intermediate.png` / `contact-sheet-mobile.png`

## Results

**PENDING** — captures and analysis not yet performed.
