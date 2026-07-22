# Auth Login — Visual Validation

Capture URL: `https://fix-auth-login-acceptance-46.lovetree3.pages.dev/login`
Deployed commit: `18f1b88cf65eccaaddd24a3fa2a2b2055ff3c8e3`
Browser: Google Chrome 145.0.7632.116 (headless) · DPR 1 · Playwright

---

## Desktop — 1440×1000

| Metric | Value |
|---|---|
| Screenshot | `auth-login-desktop-1440x-full.png` |
| PNG dimensions | 1440×1000 px |
| Bytes | 98,786 |
| SHA-256 | `5563799d7c3cd8550219e90ab0777a219e0fa983d4dd5863513a1fabd8dee271` |
| scrollWidth | 1440 |
| clientWidth | 1440 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Google button | 453×51 px · bg `rgb(62,44,26)` (dark/primary) |
| Email button | 453×51 px · bg `rgb(254,248,240)` (light/secondary) |
| Button height ≥ 44px | PASS (both 51px) |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `내 러브트리를 계속 이어가려면 로그인하세요`
- H2: `기록은 개인 공간에서 시작됩니다`
- Brand ("Relovetree") appears exactly once
- Value items: 3 (each with title + description)
- Trust context: visible
- Legal notice: `로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.`
- Layout: balanced two-area composition (brand/value panel + login form)

---

## Intermediate — 900×900

| Metric | Value |
|---|---|
| Screenshot | `auth-login-intermediate-900x-full.png` |
| PNG dimensions | 900×900 px |
| Bytes | 89,169 |
| SHA-256 | `698a1ef17a3575fc87081017ac6207054f3129c34e8011726d7c5c65df40b3a4` |
| scrollWidth | 900 |
| clientWidth | 900 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Google button | 376×51 px · bg `rgb(62,44,26)` (dark/primary) |
| Email button | 376×51 px · bg `rgb(254,248,240)` (light/secondary) |
| Button height ≥ 44px | PASS (both 51px) |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `내 러브트리를 계속 이어가려면 로그인하세요`
- H2: `기록은 개인 공간에서 시작됩니다`
- Brand ("Relovetree") appears exactly once
- Value items: 3 (each with title + description)
- Trust context: visible
- Legal notice: readable

---

## Mobile — 390×844

| Metric | Value |
|---|---|
| Screenshot | `auth-login-mobile-390x-full.png` |
| PNG dimensions | 390×901 px (full-page; page height 901 > viewport 844) |
| Bytes | 76,248 |
| SHA-256 | `199d1f4d3faef43eeca37ba818776cd3e64ce3104ab589509db9bdf3b9bc3699` |
| scrollWidth | 390 |
| clientWidth | 390 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Google button | 318×51 px · bg `rgb(62,44,26)` (dark/primary) |
| Email button | 318×51 px · bg `rgb(254,248,240)` (light/secondary) |
| Button height ≥ 44px | PASS (both 51px) |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `내 러브트리를 계속 이어가려면 로그인하세요`
- H2: `기록은 개인 공간에서 시작됩니다`
- Brand ("Relovetree") appears exactly once
- Value items: 3 (each with title + description)
- Trust context: visible
- Legal notice: readable
- Layout: real single-column (scrollWidth == clientWidth == 390)

---

## Visual Verification Checklist

| Check | Desktop | Intermediate | Mobile |
|---|---|---|---|
| h1 = `내 러브트리를 계속 이어가려면 로그인하세요` | PASS | PASS | PASS |
| Brand appears exactly once | PASS | PASS | PASS |
| Google button visually primary (dark bg) | PASS | PASS | PASS |
| Email button visually secondary (light bg) | PASS | PASS | PASS |
| Both buttons ≥ 44px high | PASS (51px) | PASS (51px) | PASS (51px) |
| Trust context visible | PASS | PASS | PASS |
| Exactly 3 value items | PASS | PASS | PASS |
| Every value has title + description | PASS | PASS | PASS |
| Legal notice readable | PASS | PASS | PASS |
| No horizontal overflow | PASS | PASS | PASS |
| No console/page errors | PASS | PASS | PASS |
| No failed requests | PASS | PASS | PASS |
| Mobile single-column layout | n/a | n/a | PASS |
| Desktop balanced two-area composition | PASS | n/a | n/a |
