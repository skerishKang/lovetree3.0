# LT3-AUTH-001 — Auth Login Visual Validation

## Evidence Source

- **Visual source commit:** f7babe54fd7c847b56b781d219ff6e1b60be8e04
- **Branch preview URL:** https://style-auth-login-visual-r.lovetree3.pages.dev/login
- **Browser:** HeadlessChrome/150.0.0.0
- **Viewport / DPR:** See individual screenshot files

## Screenshot Artifacts

| File | Dimensions | DPR | Description |
|---|---|---|---|
| `auth-login-desktop-1440x-full.png` | 1440 × 1000 | 1 | Desktop full-page screenshot |
| `auth-login-intermediate-900x-full.png` | 900 × 900 | 1 | Intermediate viewport screenshot |
| `auth-login-mobile-390x-full.png` | 390 × 844 | 1 | Mobile full-page screenshot |

## DOM Contract Verification

### Brand Context
- LoveTree brand text: exactly 1 occurrence
- Brand container: visually prominent, centered

### Login Hierarchy
- h1 (login heading): exactly 1 occurrence
  - Text: "LoveTree에 계속 이어가려면 로그인하세요"
- Short description: exactly 1 occurrence
  - Text: "기록한 순간을 안전하게 개인 공간에 저장하고, 다른 기기에서도 이어서 볼 수 있어요"

### Login Buttons
- Google 계정으로 계속하기 button: exactly 1
  - Role: button
  - Variant: primary (brown background, white text)
- 이메일로 로그인 button: exactly 1
  - Role: button
  - Variant: secondary (white background, brown text)

### Trust Context
- Trust context section: present
  - Title: "개인 공간에서 시작됩니다" (h2)
  - Description: "당신의 기록은 모두 개인 공간에서 안전하게 보관됩니다."

### Core Values
- Value items: exactly 3
  1. 개인 아카이브 (📚)
  2. 동기화 (🔄)
  3. 연결 (🔗)

### Legal Notice
- Legal notice: exactly 1 occurrence
  - Text: "로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다."

### Decorative Elements
- All decorative SVG/emojis: aria-hidden="true"
- No dialog, alertdialog, or alert elements

## Responsive Verification

### Desktop (1440×1000)
- Login panel and brand context balanced
- No horizontal overflow
- Button text length appropriate

### Intermediate (900×900)
- Layout adapts appropriately
- No element clipping or overlap
- No horizontal overflow

### Mobile (390×844)
- Brand, h1, and primary button visible
- Minimum button height maintained
- Legal copy not compressed
- No fixed/sticky overlap
- No horizontal overflow

## Side-Effect Verification (Pre-render)

Spy setup before render:
- `fetch`
- `XMLHttpRequest.prototype.open`
- `Storage.prototype.getItem`
- `Storage.prototype.setItem`
- `Storage.prototype.removeItem`
- `Storage.prototype.clear`
- `window.open`

All call counts: 0

## Interaction Verification

### Button Click Behavior
- All button clicks: no navigation, no URL change
- DOM structure unchanged after click
- No network requests triggered

## Known Visual Differences

See `known-visual-differences.md` for details on expected differences from reference.

## Implementation Notes

- No actual authentication, OAuth, or Firebase integration
- Profile preview shows static mock data only
- All icons are Unicode characters (not SVG images)
- CSS Module classes used for styling