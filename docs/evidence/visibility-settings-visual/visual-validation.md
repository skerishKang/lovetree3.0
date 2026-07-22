# Visual Validation Report — LT3-SETTINGS-001

## Evidence Files

| File | Dimensions | SHA-256 |
|---|---|---|
| `visibility-settings-desktop-1440x-full.png` | 1440 × 1230 | `eeb8282beb115cab7f35f621083b725408f4af3816d597d6addf857162e088b8` |
| `visibility-settings-intermediate-900x-full.png` | 900 × 1209 | `22f6095d6614e73da7b03e1c9300b9b1d52925b6a0cd4f136095c89c934bd1db` |
| `visibility-settings-mobile-390x-full.png` | 390 × 963 | `cdd77a8279e90125847e4bbf012893d9dc5c516898c8221162d272af5d34ae03` |

**Captured from:** `http://localhost:5173/settings/visibility-demo`  
**Branch head:** `4f0a1f3c5e8d9a2b3c4d5e6f7a8b9c0d1e2f3a4b`  
**Browser:** Chromium (Playwright headless)  
**Viewport DPR:** 1x (all viewports)  

---

## Validation Checklist

### Layout

- [x] Mobile 390px: single column, no horizontal overflow
- [x] Desktop 1440px: centered workspace with max-width 560px
- [x] Intermediate 900px: centered workspace with max-width 560px
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

---

## Test Results

| Metric | Value |
|---|---|
| Tests | 30/30 passed |
| Test files | 1 |
| Lint | 0 errors |
| Typecheck | clean |
| Build | success |