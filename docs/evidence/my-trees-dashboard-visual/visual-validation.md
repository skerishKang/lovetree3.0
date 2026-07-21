# My Trees Dashboard Visual Evidence

## Branch Preview URL
`https://style-my-trees-dashboard-vis.lovetree3.pages.dev/my-trees`

## Commit Metadata
- Visual Source Commit: `71983cc28d5459f4eeb287e4781e8089146f2883`
- Evidence Commit: `4e832717582ffb559d98e43e828ebb3b702d72ce`
- Metadata Commit: `b7db764e6407b88f9529c624dd55fe79a461c720`
- Branch: `style/my-trees-dashboard-visual-refinement`
- Base (origin/main): `6199f475186fba6f2b966fb392eedf9bc32b50a6`
- Cloudflare Screenshot-source Deployment ID: `371d1a35-8c27-43f1-a353-10d9fe876223`
- Cloudflare Final-head Deployment ID: `e4d727ba-697c-41af-a77e-b99528106598`

## Remediation Commit Metadata
- Original Implementation Model: `Claude Sonnet 4.6 (Thinking)`
- Independent Reviewer/Remediator: `MiMo V2.5`

## Browser
- Engine: HeadlessChromium `149.0.7827.55` (via Playwright)
- JavaScript: Enabled
- Network: Real Cloudflare Pages CDN

## Screenshots

### Desktop — 1440 × 1000, DPR 1 (full-page: 1440 × 1366)
- File: `my-trees-dashboard-desktop-1440x-full.png`
- Size: 268,722 bytes
- SHA-256: `1ca1541b9e1cfdba9aeb6de4ec872dc31fc8bdba77f4d2c531060e9cd1940716`

### Intermediate — 900 × 900, DPR 1 (full-page: 900 × 1350)
- File: `my-trees-dashboard-intermediate-900x-full.png`
- Size: 198,961 bytes
- SHA-256: `c4f937b28009ec0da4a1b0c4c832f0b1593d9373e9f13d465483e306d5b82f2b`

### Mobile — 390 × 844, DPR 1 (full-page: 390 × 2748)
- File: `my-trees-dashboard-mobile-390x-full.png`
- Size: 211,767 bytes
- SHA-256: `6ddea041e7f3df0b54cf988e6e256363839136269943a00d4523056e37995e01`

### Reference Image
- File: `docs/reference/screens/06-my-trees/my-trees-dashboard-desktop.png`
- SHA-256: `df3893253f2b1289a99b78245c7d8700ead7ba9cde4e584742134f306ea07814`

## Errors
- Console errors: 0
- Page errors: 0
- Failed requests: 0

## Horizontal Overflow
- Desktop (1440px): 0px
- Intermediate (900px): 0px
- Mobile (390px): 0px

## DOM Count Verification (per viewport, confirmed equal)
| Check | Desktop | Intermediate | Mobile |
|-------|---------|-------------|--------|
| H1 count | 1 | 1 | 1 |
| H1 text | "나의 러브트리" | "나의 러브트리" | "나의 러브트리" |
| Article cards | 6 | 6 | 6 |
| Selected cards | 1 | 1 | 1 |
| Public badges | 2 | 2 | 2 |
| Private badges | 4 | 4 | 4 |
| Aside landmarks | 1 | 1 | 1 |
| Dialogs/alerts | 0 | 0 | 0 |

## Card Action Buttons (verified)
- 편집 buttons: 6
- 공유 buttons: 6
- 복제 buttons: 6
- 삭제 buttons: 6
- Total: 24

## Recent Moments (verified in aside)
- Recent moment items: 2
- "첫 콘서트 도착": 1
- "앙코르 무대": 1
- Each item verified non-interactive (no role=button, tabIndex, onclick)

## Interactions Not Implemented (as expected)
- Card navigation/routing: not implemented (presentation-only)
- 편집/공유/복제/삭제 actions: not implemented (presentation-only)
- "새 러브트리 만들기" CTA: not implemented (presentation-only)
- Modals/toasts/dialogs: not implemented
- fetch/XHR/Storage side-effects: 0 calls confirmed by test spies

## Tree Card Visual Context
- Each card renders a mini SVG tree branch visualization in the thumbnail area
- Node density differs by memory count (larger nodes for more memories)
- Selected card ("나의 러브트리") shows "현재 편집 중" static badge
- Thumbnail gradients are richer/deeper vs. original pastel gradients
- Card action buttons rendered with background and border (not plain text)

## Preview Placeholder Notice
- Tree card thumbnails use CSS gradients + inline SVG for tree branch visualization (no external image fetch)
- Mini tree branch graphics are DOM-rendered, not image assets
