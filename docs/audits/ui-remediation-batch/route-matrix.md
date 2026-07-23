# Route Matrix — 12 Routes × 3 Viewports

Captured at head `657b012` via local `vite preview` (port 4173), Chrome
145.0.7632.116, Playwright 1.61.0. Viewports: desktop 1440×1000, intermediate
900×900, mobile 390×844 (dpr 1, full-page screenshots).

| Route | Desktop | Intermediate | Mobile | Body chars | h1 @1440 | Header @1440 |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 200 ✓ | 200 ✓ | 200 ✓ | 415 | 36px / 800 (hero) | SiteHeader (marketing) |
| `/community` | 200 ✓ | 200 ✓ | 200 ✓ | 1159 | 32px / 800 (page) | SiteHeader (marketing) |
| `/login` | 200 ✓ | 200 ✓ | 200 ✓ | 309 | 18px / 700 (compact) | — |
| `/tree/community-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 1633 | 28px / 700 (work) | screen hero (marketing) |
| `/memory/connect-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 519 | 28px / 700 (work) | screen hero (marketing) |
| `/my-trees` | 200 ✓ | 200 ✓ | 200 ✓ | 557 | 28px / 700 (work) | 69px white sticky |
| `/tree/edit-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 494 | 18px / 700 (compact) | 69px white sticky |
| `/tree/new-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 130 | 28px / 700 (work) | 52px white static |
| `/memory/detail-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 694 | 18px / 700 (compact) | 80px transparent sticky |
| `/media/search-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 503 | 18px / 700 (compact) | 91px ivory sticky |
| `/settings/visibility-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 278 | 32px / 800 (page) | 102px transparent static |
| `/my-trees/empty-demo` | 200 ✓ | 200 ✓ | 200 ✓ | 196 | 28px / 700 (work) | SiteHeader (marketing) |

All 36 captures: 0 console errors, 0 page errors, 0 failed requests,
0 document overflow, 0 hard clips (bounding-box + clipping-context method).

Intentional scroll rails (not defects): `/community` mobile card rail
(2 horizontally scrollable elements), `/tree/edit-demo` mobile workspace nav
(6 elements).

Unknown route (`/__ui-audit-missing-route__`) → falls back to `/` (HTTP 200,
no errors).

Per-capture file sizes and SHA-256 hashes: `capture-metadata.json`.
Contact sheets: `contact-sheet-{desktop,intermediate,mobile}.png`.
