# Visual Consistency — Post-Remediation

## Heading hierarchy (D-05, resolved)

Four shared tokens in `src/index.css`; every screen h1 maps to exactly one
tier. Computed values at 1440px:

| Tier | Token size / weight / line-height | Screens |
| --- | --- | --- |
| hero | `clamp(2rem, 2.5vw, 4rem)` → 36px / 800 / 1.05 | `/` |
| page | `2rem` → 32px / 800 / 1.3 | `/community`, `/settings/visibility-demo` |
| work | `1.75rem` → 28px / 700 / 1.3 | `/tree/community-demo`, `/memory/connect-demo`, `/my-trees`, `/tree/new-demo`, `/my-trees/empty-demo` |
| compact | `1.125rem` → 18px / 700 / 1.5 | `/login`, `/tree/edit-demo`, `/memory/detail-demo`, `/media/search-demo` |

Pre-remediation drift (34.56px vs 36px, 28.8px vs 28px, weights 600/700/800)
is eliminated: only four sizes and two weights remain, and the hierarchy order
(marketing hero > dashboard page > work screen > compact bar title) is
preserved rather than flattened. Exactly one `<h1>` renders per route
(DOM contract).

## App header chrome (D-06, resolved)

Shared tokens: `--app-header-bg` (#fff), `--app-header-bg-ivory` (#f8f5f0),
`--app-header-bg-translucent` (rgba ivory 0.92), `--app-header-border-color`
(#ede6dc, unifies the former #ede6dc/#e8e0d8 pair), `--app-header-z-index`
(10), `--app-bar-padding-y` (12px), `--app-bar-height` (52px / 44px mobile).
Full mapping and documented exceptions: `header-tokens.md`.

The marketing vs app split remains intentional: `/`, `/community`,
`/my-trees/empty-demo`, `/tree/community-demo`, `/memory/connect-demo` keep
`SiteHeader` or screen-hero headers.

## Brand terminology (D-01, resolved)

- Brand: `Relovetree` (site header logo, connect-page logo).
- Object: `러브트리` (tree names, settings copy, community labels).
- No visible `LoveTree`/`Love Tree` text remains on any route (DOM contract).
  Residual occurrences are comments and identifiers only.
- Exception: `index.html` `<title>` retains "Relovetree — LoveTree 3.0"
  (file outside the allowed modification scope).

## Intentional variations (not defects)

- Per-screen accent colors and card radii follow each screen's established
  design language (warm editor browns, ivory media surfaces, rose accents).
- `/memory/detail-demo` desktop uses a transparent top bar for the two-column
  reading view; mobile uses the translucent blurred bar.
- `/media/search-demo` keeps hero-spaced top padding (bar doubles as page
  hero); `/settings/visibility-demo` uses a static centered page-header block.
