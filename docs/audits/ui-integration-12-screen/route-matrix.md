# Route Matrix — 12-Screen UI Integration Audit

Base SHA: `562cb177379d4b61d664f7a0d8bcba1428602805`
Preview: `https://audit-ui-integration-12-scre.lovetree3.pages.dev`
Method: independent Playwright 1.61.0 + system Google Chrome 145.0.7632.116, DPR 1, full-page.

Runtime = HTTP status / console errors / page errors / failed requests.
A11y smoke = h1 count, icon-only buttons without accessible name, decorative SVG `aria-hidden`, initial dialog.
Overflow = `documentElement.scrollWidth - clientWidth` (target 0).

| # | Route | Component | h1 (size/weight) | Desktop | Intermediate | Mobile | Runtime | A11y smoke | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `/` | `HomePage` | 36px / 800 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, no-name=0, svg aria-hidden 2/16 | **PASS_WITH_NOTES** |
| 2 | `/community` | `CommunityPage` | 34.56px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, h2=9, svg 10/10 | **PASS_WITH_NOTES** |
| 3 | `/login` | `AuthLoginPage` | 21.6px / 600 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, svg 4/4 + focusable, no header (intentional) | **PASS** |
| 4 | `/tree/community-demo` | `TreeDetailPage` | 28.8px / 800 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, svg 0 | **PASS_WITH_NOTES** |
| 5 | `/memory/connect-demo` | `MemoryConnectPage` | 28px / 800 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, no-name=0, svg 1/4 | **PASS_WITH_NOTES** |
| 6 | `/my-trees` | `MyTreesPage` | 28px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, h2=2, no-name=0, svg 22/28 | **PASS_WITH_NOTES** |
| 7 | `/tree/edit-demo` | `TreeEditorPage` | 16px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, no-name=0, svg 3/7 | **PASS_WITH_NOTES** |
| 8 | `/tree/new-demo` | `EmptyTreeEditorPage` | 26px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, svg 0/1 | **PASS_WITH_NOTES** |
| 9 | `/memory/detail-demo` | `MemoryDetailPage` | 18px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, h2=2, no-name=0, svg 8/12 | **PASS_WITH_NOTES** |
| 10 | `/media/search-demo` | `MediaSearchPage` | 18px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, h2=7, svg 7/7, min target 44px | **PASS** |
| 11 | `/settings/visibility-demo` | `VisibilitySettingsPage` | 32px / 800 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, h2=1, svg 0/3 | **PASS_WITH_NOTES** |
| 12 | `/my-trees/empty-demo` | `MyTreesEmptyPage` | 28px / 700 | overflow 0 | overflow 0 | overflow 0 | 200 / 0 / 0 / 0 | h1=1, h2=1, no-name=0, svg 4/4 + focusable | **PASS** |

## Unknown-route fallback smoke

| Item | Result |
|---|---|
| Initial URL | `https://audit-ui-integration-12-scre.lovetree3.pages.dev/__ui-audit-missing-route__` |
| Final URL | `https://audit-ui-integration-12-scre.lovetree3.pages.dev/` |
| HTTP status | 200 |
| Fallback result | Client-side `<Route path="*">` → `Navigate to="/"`; lands on home. **PASS** |
| Console / page errors | 0 / 0 |

## Verdict summary

| Verdict | Count |
|---|---|
| PASS | 3 (`/login`, `/media/search-demo`, `/my-trees/empty-demo`) |
| PASS_WITH_NOTES | 9 |
| FAIL | 0 |
| BLOCKED | 0 |

No route crashed, rendered blank, overflowed horizontally, or lost its single h1. All
`PASS_WITH_NOTES` verdicts are driven by P2/P3 consistency findings (brand notation,
sub-44px targets, partial SVG `aria-hidden`, clamp-without-ellipsis, typography/header
drift) recorded in `defect-register.md` — none are blocking.

### Per-route notes (non-blocking)

- `/` — feature-card body text is a 2-line fixed-height clamp with `text-overflow: clip`
  (no ellipsis); only 2/16 SVGs carry `aria-hidden`; icon buttons 20–33px tall.
- `/community` — card titles clamp to 1 line and summaries to 2 lines without ellipsis;
  filter chips 37px; "Featured LoveTree" uses the Latin object noun beside the
  "Relovetree" brand.
- `/login` — intentionally header-less onboarding layout; all targets ≥51px; SVGs fully
  `aria-hidden` + `focusable="false"`.
- `/tree/community-demo` — card descriptions 2-line clamp without ellipsis; inline "♥ n"
  like buttons only 13px tall; tall 201px hero header.
- `/memory/connect-demo` — header brand reads "LoveTree" (other screens use "Relovetree");
  1/4 SVGs `aria-hidden`.
- `/my-trees` — "편집/공유" buttons 30px; `.visuallyHidden` sr-only spans are an intentional
  a11y pattern (not clipping defects).
- `/tree/edit-demo` — compact editor toolbar buttons 27–35px (high-density workspace,
  largely intentional); h1 sits inside the sticky header (overlap heuristic false positive).
- `/tree/new-demo` — bottom tab buttons 39px; 1 SVG without `aria-hidden`.
- `/memory/detail-demo` — h1 inside sticky header (false positive); related-card description
  uses correct `nowrap` + `text-overflow: ellipsis`; 8/12 SVGs `aria-hidden`.
- `/media/search-demo` — cleanest screen: all targets ≥44px, SVGs 100% `aria-hidden`.
- `/settings/visibility-demo` — body uses "LoveTree" ×7 and "Relovetree" ×1 (notation mix);
  0/3 SVGs `aria-hidden`; link `<input>` horizontal scroll is normal behaviour.
- `/my-trees/empty-demo` — recently refined; SVGs fully `aria-hidden` + `focusable="false"`,
  quick-start buttons 44px.
