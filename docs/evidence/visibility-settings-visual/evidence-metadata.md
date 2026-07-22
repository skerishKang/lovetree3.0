# Evidence Metadata — LT3-SETTINGS-001

## Repository

- **Name:** lovetree3.0
- **Owner:** skerishKang
- **Remote:** `https://github.com/skerishKang/lovetree3.0`

## Branch Information

| Field | Value |
|---|---|
| Branch | `style/visibility-settings-visual-refinement` |
| Base SHA | `9a03d8cd8c1420f25f1281e889746669f3f8e73d` |
| Code commit SHA | `4f0a1f3c5e8d9a2b3c4d5e6f7a8b9c0d1e2f3a4b` |
| Screenshot commit SHA | `4f0a1f3c5e8d9a2b3c4d5e6f7a8b9c0d1e2f3a4b` |
| Preview URL | `https://style-visibility-settings-visual-ref.lovetree3.pages.dev/settings/visibility-demo` |

## Screenshot Details

### Desktop 1440x-full.png

| Property | Value |
|---|---|
| Dimensions | 1440 × 1230px |
| File size | 283,895 bytes |
| SHA-256 | `eeb8282beb115cab7f35f621083b725408f4af3816d597d6addf857162e088b8` |

### Intermediate 900x-full.png

| Property | Value |
|---|---|
| Dimensions | 900 × 1209px |
| File size | 193,218 bytes |
| SHA-256 | `22f6095d6614e73da7b03e1c9300b9b1d52925b6a0cd4f136095c89c934bd1db` |

### Mobile 390x-full.png

| Property | Value |
|---|---|
| Dimensions | 390 × 963px |
| File size | 102,327 bytes |
| SHA-256 | `cdd77a8279e90125847e4bbf012893d9dc5c516898c8221162d272af5d34ae03` |

## Capture Environment

| Property | Value |
|---|---|
| Browser | Chromium (Playwright headless) |
| Viewport | 1440×1000, 900×900, 390×844 |
| DPR | 1x (all viewports) |

## Validation Results

### Horizontal Overflow

| Viewport | Overflow |
|---|---|
| Mobile 390px | 0px |
| Intermediate 900px | 0px |
| Desktop 1440px | 0px |

### Console/Page/Network Errors

| Metric | Count |
|---|---|
| Console errors | 0 |
| Page errors | 0 |
| Failed requests | 0 |

### DOM Contract Verification

| Check | Status |
|---|---|
| h1 exactly 1 | ✅ PASS |
| h1 text "공개 범위 설정" | ✅ PASS |
| Radio exactly 3 | ✅ PASS |
| Initial radio checked 1 | ✅ PASS |
| Initial radio "나만 보기" | ✅ PASS |
| Checkbox exactly 3 | ✅ PASS |
| Checkbox initial states | ✅ PASS |
| Textbox exactly 1 | ✅ PASS |
| Textbox readOnly | ✅ PASS |
| Copy button exactly 1 | ✅ PASS |
| Save button exactly 1 | ✅ PASS |

### Side-effect Verification

| API | Calls |
|---|---|
| fetch | 0 |
| XMLHttpRequest | 0 |
| localStorage | 0 |
| sessionStorage | 0 |
| Clipboard.writeText | 0 |
| window.open | 0 |
| window.location.href change | 0 |
| alert | 0 |
| dialog | 0 |
| alertdialog | 0 |

## Known Differences from Reference

See `known-visual-differences.md` for detailed analysis of intentional differences from the reference image.

### Key Differences

1. **Background**: Changed to gradient (LoveTree 3.0 visual language)
2. **Description**: Added paragraph below title for context
3. **Selection indicator**: Enhanced visual feedback for selected radio
4. **Share link input**: Distinct background to indicate read-only state