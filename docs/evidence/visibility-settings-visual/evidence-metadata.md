# Evidence Metadata — LT3-SETTINGS-001

## Repository

- **Name:** lovetree3.0
- **Owner:** skerishKang
- **Remote:** `https://github.com/skerishKang/lovetree3.0`

## Branch Information

| Field | Value |
|---|---|
| Branch | `fix/visibility-settings-acceptance-48` |
| Base main SHA | `67c680ec9d14f1b948f992f376b4f258de0010b9` |
| Screenshot source SHA | `e652909ab7ebc00174d536d18f11d20f744f22ac` |
| Evidence commit SHA | `df8a54a85df37f080a1ce65aff2122ae244da19b` |
| Cloudflare deployed commit | `e652909ab7ebc00174d536d18f11d20f744f22ac` |
| Actual capture URL | `https://fix-visibility-settings-acce.lovetree3.pages.dev/settings/visibility-demo` |
| Build verification | GitHub Actions SUCCESS |
| Cloudflare deployment | SUCCESS (deployed commit `e652909`) |

## SHA Record (separate)

| SHA Type | Value |
|---|---|
| Base main SHA | `67c680ec9d14f1b948f992f376b4f258de0010b9` |
| Screenshot source SHA | `e652909ab7ebc00174d536d18f11d20f744f22ac` |
| Evidence commit SHA | `df8a54a85df37f080a1ce65aff2122ae244da19b` |
| Cloudflare deployed commit | `e652909ab7ebc00174d536d18f11d20f744f22ac` |

## Screenshot Details

### Desktop 1440x-full.png

| Property | Value |
|---|---|
| Dimensions | 1440 × 1231px |
| File size | 287,718 bytes |
| SHA-256 | `b04db55a2f44dfc714db1f4d877451a209418c2827f206ab9030361c3a1c3ecc` |

### Intermediate 900x-full.png

| Property | Value |
|---|---|
| Dimensions | 900 × 1210px |
| File size | 195,070 bytes |
| SHA-256 | `e782b4840ce7355b9dda9e279efb67e32841eb323e68c97c701a847fe73475dc` |

### Mobile 390x-full.png

| Property | Value |
|---|---|
| Dimensions | 390 × 970px |
| File size | 103,670 bytes |
| SHA-256 | `149b4705cab469a23ad9dfa2d083e8d7837ad7b31db8369d80f219dd97685854` |

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
| Copy button | Mobile 390px | 80 × 44px | ✅ |
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
5. **Desktop layout**: Content centered within page container (max-width 560px at 900px+)
6. **Copy button**: min-height 44px for WCAG touch target compliance at mobile