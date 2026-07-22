# Known Visual Differences — My Trees Empty State

## Capture Context

- URL: `https://style-my-trees-empty-visual.lovetree3.pages.dev/my-trees/empty-demo`
- Commit: `802957b34f8af47d8b1a8e66813e81dfa5e8edbc`
- Browser: Google Chrome 145.0.7632.116 (headless) · DPR 1

This capture supersedes the earlier `3bc1ac2` evidence. The intermediate-width
readability defect (quick-start titles fragmenting character-by-character at 900px)
was fixed in `fix: preserve quick-start readability at intermediate width`.

## No Blocking Visual Differences

All contract requirements are met at all three viewports. The items below are
informational notes, not defects.

### 1. Full-page height exceeds viewport at all sizes

- Desktop: 1016px (viewport 1000) · Intermediate: 916px (viewport 900) · Mobile: 901px (viewport 844)
- Cause: page content is slightly taller than the viewport; full-page capture includes the scrolled region
- Impact: none — no horizontal overflow at any viewport; vertical scroll is expected and allowed
- Status: expected behaviour, not a defect

### 2. Quick-start column count is breakpoint-driven (intentional)

- Desktop 1440px (≥1200px breakpoint): 3 cards in a single balanced row (`distinctItemRows: 1`, widths 178/178/178 px)
- Intermediate 900px (<1200px breakpoint): single column, stacked full-width cards (`distinctItemRows: 3`, widths 454/454/454 px)
- Mobile 390px: single column, stacked (`distinctItemRows: 3`, widths 342/342/342 px)
- Rationale: the 3-column arrangement is only applied once enough width is available (≥1200px), so cards never become too narrow to read
- Status: expected responsive behaviour, matches the fix intent

### 3. Quick-start titles never fragment character-by-character

- `white-space: nowrap` on the quick-start button keeps `입덕`, `첫 콘서트`, `최애 무대` on a single line at every viewport
- Verified: button `scrollWidth == clientWidth` (no overflow) at all three viewports
- Descriptions use `word-break: keep-all` so Korean words wrap as whole tokens, not mid-syllable
- Status: defect from the prior `3bc1ac2` capture is resolved

### 4. Quick-start button heights are uniform

- Desktop: 44/44/44 px · Intermediate: 44/44/44 px · Mobile: 44/44/44 px
- With titles on a single line, button height is the stable 44px minimum touch target everywhere
- Status: expected behaviour

### 5. Desktop two-area composition

- Left panel: sprout/memory illustration in a white card with caption "첫 기억을 심기 전의 조용한 시작점"
- Right panel: h1, description, CTA pair, quick-start items in a row of 3 cards
- Grid uses an asymmetric `2fr / 3fr` split so the action panel (with the 3-card quick-start) has enough room at 1440px; no overlap or clipping within the 1080px max-width grid
- Status: matches "First Memory Garden" design intent

### 6. Intermediate 900px breakpoint

- At exactly 900px the outer layout is the two-area grid, but the quick-start list remains a single column
- No element overlap detected; cards and descriptions read at a natural 454px width
- Status: expected breakpoint behaviour

## Unchanged / Matching (all viewports)

- h1: `아직 러브트리가 없어요` — exact match
- Description: `처음 좋아하게 된 순간부터 하나씩 이어보세요` — exact match
- Primary CTA: `첫 순간 기록하기` — dusty rose `rgb(217,107,143)`, visually primary
- Secondary CTA: `예시 러브트리 보기` — transparent bg, visually secondary
- Quick-start titles: `입덕`, `첫 콘서트`, `최애 무대` — exact match, each on one line
- Each quick-start item has a one-sentence description
- Brand "Relovetree" appears exactly once
- 4 decorative SVGs (1 main sprout + 3 quick-start icons), all `aria-hidden="true" focusable="false"`
- No horizontal overflow at any viewport
- No console errors, page errors, or failed network requests
- All interactions presentation-only (no state change on click)
