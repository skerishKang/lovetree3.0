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
| Final SHA | `b10281c6f320719ed8bcfee5e77a17daa2832273` |
| Screenshot source | `https://style-visibility-settings-vi.lovetree3.pages.dev/settings/visibility-demo` (Cloudflare branch preview) |
| Build verification | GitHub Actions SUCCESS |
| Cloudflare deployment | SUCCESS (deployed commit `b10281c`) |

## Screenshot Details

### Desktop 1440x-full.png

| Property | Value |
|---|---|
| Dimensions | 1440 × 1231px |
| File size | 286,681 bytes |
| SHA-256 | `107cead645491c5cdc1f94f3980fb57a715460a32b54311ac21fc6ea46866bbf` |

### Intermediate 900x-full.png

| Property | Value |
|---|---|
| Dimensions | 900 × 1210px |
| File size | 194,859 bytes |
| SHA-256 | `9241401843d4d4573f84c311b6281452e0c0452dd789f5f7bbcbf045c9d23666` |

### Mobile 390x-full.png

| Property | Value |
|---|---|
| Dimensions | 390 × 963px |
| File size | 103,475 bytes |
| SHA-256 | `aaa5b79c9c39b846333ac43e386cf4bc090a381e8eb43f6c92d34738834f3d19` |

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

### Touch Target Verification

| Element | Viewport | Size (W × H) | ≥44px |
|---|---|---|---|
| Copy button | Desktop 1440px | 105 × 49px | ✅ |
| Copy button | Intermediate 900px | 105 × 49px | ✅ |
| Copy button | Mobile 390px | 80 × 37px | ⚠️ Below 44px |
| Save button | Desktop 1440px | 560 × 62px | ✅ |
| Save button | Intermediate 900px | 560 × 62px | ✅ |
| Save button | Mobile 390px | 366 × 49px | ✅ |
| Option card | All | ~336 × 72px+ | ✅ |
| Setting row | All | ~336 × 72px+ | ✅ |

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
3. **Selection indicator**: Enhanced visual feedback for selected radio (CSS :has() selector)
4. **Share link input**: Distinct background to indicate read-only state
5. **Desktop layout**: Content left-aligned within centered page container (max-width 560px at 900px+)