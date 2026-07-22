# Known Visual Differences — My Trees Empty State

## Capture Context

- URL: `https://style-my-trees-empty-visual.lovetree3.pages.dev/my-trees/empty-demo`
- Commit: `3bc1ac210eec87f208ea68510c8c344ddcd1ddf2`
- Browser: Google Chrome 145.0.7632.116 (headless) · DPR 1

## No Blocking Visual Differences

All contract requirements are met at all three viewports. The items below are
informational notes, not defects.

### 1. Full-page height exceeds viewport at all sizes

- Desktop: 1016px (viewport 1000) · Intermediate: 916px (viewport 900) · Mobile: 901px (viewport 844)
- Cause: page content is slightly taller than the viewport; full-page capture includes the scrolled region
- Impact: none — no horizontal overflow at any viewport; vertical scroll is expected and allowed
- Status: expected behaviour, not a defect

### 2. Quick-start button heights vary by viewport

- Desktop: 44/54/54 px · Intermediate: 54/70/54 px · Mobile: 44/44/44 px
- Variation is due to text wrapping at different container widths
- All heights are ≥ 44px (minimum touch target requirement met)
- Status: expected responsive behaviour

### 3. Desktop two-area composition

- Left panel: sprout/memory illustration in a white card with caption "첫 기억을 심기 전의 조용한 시작점"
- Right panel: h1, description, CTA pair, quick-start items in a row of 3 cards
- At 1440px the two areas are balanced within a 1080px max-width grid; no overlap or clipping
- Status: matches "First Memory Garden" design intent

### 4. Intermediate 900px breakpoint

- At exactly 900px the layout switches to the two-area grid
- No element overlap detected; quick-start items wrap within their cards
- Status: expected breakpoint behaviour

## Unchanged / Matching (all viewports)

- h1: `아직 러브트리가 없어요` — exact match
- Description: `처음 좋아하게 된 순간부터 하나씩 이어보세요` — exact match
- Primary CTA: `첫 순간 기록하기` — dusty rose `rgb(217,107,143)`, visually primary
- Secondary CTA: `예시 러브트리 보기` — transparent bg, visually secondary
- Quick-start titles: `입덕`, `첫 콘서트`, `최애 무대` — exact match
- Each quick-start item has a one-sentence description
- Brand "Relovetree" appears exactly once
- 4 decorative SVGs (1 main sprout + 3 quick-start icons), all `aria-hidden="true" focusable="false"`
- No horizontal overflow at any viewport
- No console errors, page errors, or failed network requests
- All interactions presentation-only (no state change on click)
