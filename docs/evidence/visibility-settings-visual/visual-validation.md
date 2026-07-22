# Visual Validation Report — LT3-SETTINGS-001

## Evidence Files

| File | Dimensions | SHA-256 |
|---|---|---|
| `visibility-settings-desktop-1440x-full.png` | 1440 × 1231 | `107cead645491c5cdc1f94f3980fb57a715460a32b54311ac21fc6ea46866bbf` |
| `visibility-settings-intermediate-900x-full.png` | 900 × 1210 | `9241401843d4d4573f84c311b6281452e0c0452dd789f5f7bbcbf045c9d23666` |
| `visibility-settings-mobile-390x-full.png` | 390 × 963 | `aaa5b79c9c39b846333ac43e386cf4bc090a381e8eb43f6c92d34738834f3d19` |

**Captured from:** `https://style-visibility-settings-vi.lovetree3.pages.dev/settings/visibility-demo`  
**Code commit SHA:** `b10281c6f320719ed8bcfee5e77a17daa2832273`  
**Browser:** Chromium (Playwright headless)  
**Viewport DPR:** 1x (all viewports)

**Note:** Cloudflare Pages deployment successful (deployed commit `b10281c`). Screenshots captured from branch preview URL.  

---

## Validation Checklist

### Layout

- [x] Mobile 390px: single column, no horizontal overflow
- [x] Desktop 1440px: left-aligned content within centered page, max-width 560px
- [x] Intermediate 900px: left-aligned content within centered page, max-width 560px
- [x] Save button does not overlap or cover content

### Top Area

- [x] h1 "공개 범위 설정" present
- [x] Description paragraph "LoveTree의 공개 범위와 참여 설정을 관리합니다." present
- [x] Title and description naturally connected on mobile
- [x] Desktop: title/description area and content body clearly separated

### Visibility Options (Radio 3)

- [x] "나만 보기" (radio) - initial checked
- [x] "링크를 가진 사람만" (radio)
- [x] "커뮤니티에 공개" (radio)
- [x] Each option shows label and description
- [x] Selection state visually clear (border + shadow on selected)

### Share Link

- [x] Read-only textbox with placeholder `https://example.invalid/share/demo-tree`
- [x] Link copy button present
- [x] Visually indicates read-only state (different background)

### Additional Settings (Checkbox 3)

- [x] "댓글 허용" - initial checked
- [x] "좋아요 허용" - initial checked
- [x] "프로필 표시 이름 공개" - initial unchecked
- [x] Consistent row structure with visibility options

### Save CTA

- [x] "저장" button at final position
- [x] Button visually distinct
- [x] No overlapping or fixed positioning issues

### Visual Language

- [x] Warm ivory gradient background
- [x] Dark brown text (#3d3229, #2b221a)
- [x] Muted brown/grey secondary colors
- [x] Shallow, limited shadows
- [x] Clear card boundaries
- [x] Adequate spacing
- [x] Korean typography readable
- [x] Consistent radius and spacing
- [x] No neon, glassmorphism, or decorative SVG overuse

### Console/Errors

- [x] 0 console errors
- [x] 0 page errors
- [x] 0 failed requests

### Touch Targets

- [x] Save button: 366×49px (mobile), 560×62px (desktop) — ≥44px
- [x] Option card: ~336×72px+ — ≥44px
- [x] Setting row: ~336×72px+ — ≥44px
- [ ] Copy button: 80×37px (mobile) — **below 44px**; 105×49px (desktop) — ≥44px

---

## Test Results

| Metric | Value |
|---|---|
| Tests | 30/30 passed |
| Test files | 1 |
| Lint | 0 errors |
| Typecheck | clean |
| Build | success |