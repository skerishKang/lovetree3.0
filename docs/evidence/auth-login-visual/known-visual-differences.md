# Known Visual Differences — Auth Login

## Capture Context

- URL: `https://fix-auth-login-acceptance-46.lovetree3.pages.dev/login`
- Commit: `18f1b88cf65eccaaddd24a3fa2a2b2055ff3c8e3`
- Browser: Google Chrome 145.0.7632.116 (headless) · DPR 1

## No Blocking Visual Differences

All contract requirements are met at all three viewports. The items below are
informational notes, not defects.

### 1. Mobile full-page height exceeds viewport (901px vs 844px)

- Viewport: 390×844
- Full-page PNG height: 901px
- Cause: page content is 57px taller than the 844px viewport; full-page capture
  includes the scrolled region
- Impact: none — no horizontal overflow (`scrollWidth == clientWidth == 390`);
  the page scrolls vertically as expected on mobile
- Status: expected behaviour, not a defect

### 2. Button widths scale with viewport

- Desktop: 453px · Intermediate: 376px · Mobile: 318px
- Both buttons share the same width at each viewport (consistent pair)
- Height is constant at 51px across all viewports (≥ 44px requirement met)
- Status: expected responsive behaviour

### 3. Desktop two-area composition

- Left panel: brand + value proposition (3 items) + trust context
- Right panel: login form (h1, buttons, legal notice)
- At 1440px the two areas are balanced; no overlap or clipping detected
- Status: matches design intent

## Unchanged / Matching (all viewports)

- h1: `내 러브트리를 계속 이어가려면 로그인하세요` — exact match
- Brand "Relovetree" appears exactly once (in `span.brandName`, not in a heading)
- Google button: dark background `rgb(62,44,26)` — visually primary
- Email button: light background `rgb(254,248,240)` — visually secondary
- Both buttons ≥ 44px high (51px)
- Trust context section visible
- Exactly 3 value items, each with title + description
- Legal notice: `로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.`
- No horizontal overflow at any viewport
- No console errors, page errors, or failed network requests
