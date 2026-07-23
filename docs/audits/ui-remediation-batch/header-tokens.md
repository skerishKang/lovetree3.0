# App Header Tokens (UI-AUDIT-D-06)

Phase 7 of the UI remediation batch standardizes app-screen header chrome
through shared tokens defined in `src/index.css` `:root`.

## Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--app-header-bg` | `#ffffff` | Solid app-bar background |
| `--app-header-bg-ivory` | `#f8f5f0` | Ivory app-bar background (media search) |
| `--app-header-bg-translucent` | `rgba(248, 245, 240, 0.92)` | Translucent bar + blur (memory detail mobile) |
| `--app-header-border-color` | `#ede6dc` | Unified warm-gray bottom border |
| `--app-header-z-index` | `10` | Shared stacking for sticky bars |
| `--app-bar-padding-y` | `12px` | Standard vertical padding for padding-driven bars |
| `--app-bar-height` | `52px` | Fixed-height context bar (editor frame, desktop) |
| `--app-bar-height-mobile` | `44px` | Fixed-height context bar (editor frame, mobile) |

## Screen mapping

| Route | Element | Height model | Background | Position |
| --- | --- | --- | --- | --- |
| `/my-trees` | `.topBar` | `--app-bar-padding-y` + content | `--app-header-bg` | sticky |
| `/tree/edit-demo` | `.toolbar` | `--app-bar-padding-y` + content | `--app-header-bg` | sticky |
| `/tree/new-demo` | `.contextHeader` | `--app-bar-height` (`-mobile` ≤767px) | `--app-header-bg` | static (editor app frame) |
| `/memory/detail-demo` | `.topBar` | `--app-bar-padding-y` + content | `--app-header-bg-translucent` (mobile) | sticky |
| `/media/search-demo` | `.topBar` | hero-spaced padding (exception) | `--app-header-bg-ivory` | sticky |
| `/settings/visibility-demo` | `.topBar` | page-header block (exception) | transparent | static |

## Documented exceptions

- **Marketing screens (`/`, `/community`, `/my-trees/empty-demo`,
  `/tree/community-demo`, `/memory/connect-demo`)** keep `SiteHeader` or
  screen-hero headers; the marketing vs app split remains intentional.
- **`/media/search-demo`** keeps its large responsive top padding
  (52/60/48px) because the bar doubles as page-hero spacing; only
  background and z-index are tokenized.
- **`/settings/visibility-demo`** uses a static, centered page-header block
  (title + description) with no background or border; it is not an app bar.
- **`/memory/detail-demo` desktop (≥960px)** switches to a transparent bar
  without blur for the two-column reading view.
- **`/tree/edit-demo` mobile (≤767px)** keeps dense `8px 16px` toolbar
  padding because the wrapping toolbar needs tighter spacing.

## Height changes vs pre-remediation audit

| Route | Before | After (desktop) | Delta |
| --- | --- | --- | --- |
| `/my-trees` | 69px | ~65px | −4px (pad-y 14→12) |
| `/tree/edit-demo` | 57px | ~61px | +4px (pad-y 10→12) |
| `/tree/new-demo` | 52px | 52px | 0 |
| `/memory/detail-demo` | 76px | 76px | 0 |
| `/media/search-demo` | 91px | 91px | 0 |
| `/settings/visibility-demo` | 103px | 103px | 0 |

Border colors `#ede6dc` (my-trees) and `#e8e0d8` (editor screens) are unified
to `--app-header-border-color: #ede6dc`.
