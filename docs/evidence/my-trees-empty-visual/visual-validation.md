# My Trees Empty State — Visual Validation

Capture URL: `https://style-my-trees-empty-visual.lovetree3.pages.dev/my-trees/empty-demo`
Deployed commit: `3bc1ac210eec87f208ea68510c8c344ddcd1ddf2`
Browser: Google Chrome 145.0.7632.116 (headless) · DPR 1 · Playwright

---

## Desktop — 1440×1000

| Metric | Value |
|---|---|
| Screenshot | `my-trees-empty-desktop-1440x-full.png` |
| PNG dimensions | 1440×1016 px |
| Bytes | 61,206 |
| SHA-256 | `973e208af3950355422c0c9ddaff57ad0a3093e56f8b638aadf5616dc289bf33` |
| scrollWidth | 1440 |
| clientWidth | 1440 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Primary CTA | 161×48 px · bg `rgb(217,107,143)` (dusty rose) |
| Secondary CTA | 154×44 px · transparent bg |
| Quick-start button heights | 44, 54, 54 px — all ≥ 44px PASS |
| Decorative SVGs | 4 |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `아직 러브트리가 없어요`
- H2: `어떤 순간부터 시작할까요?`
- Brand ("Relovetree") appears exactly once
- Quick-start items: 3 (each with title + description)
- Layout: balanced two-area composition (visual panel + action panel)

---

## Intermediate — 900×900

| Metric | Value |
|---|---|
| Screenshot | `my-trees-empty-intermediate-900x-full.png` |
| PNG dimensions | 900×916 px |
| Bytes | 57,386 |
| SHA-256 | `9d64b1ff72b5a32e013e4019cb18611a0198433a85192872afe43e381830e1a0` |
| scrollWidth | 900 |
| clientWidth | 900 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Primary CTA | 161×48 px · bg `rgb(217,107,143)` |
| Secondary CTA | 154×44 px · transparent bg |
| Quick-start button heights | 54, 70, 54 px — all ≥ 44px PASS |
| Decorative SVGs | 4 |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `아직 러브트리가 없어요`
- H2: `어떤 순간부터 시작할까요?`
- Brand ("Relovetree") appears exactly once
- Quick-start items: 3 (each with title + description)
- Layout: two-area grid at 900px breakpoint, no overlap

---

## Mobile — 390×844

| Metric | Value |
|---|---|
| Screenshot | `my-trees-empty-mobile-390x-full.png` |
| PNG dimensions | 390×901 px (full-page; page height 901 > viewport 844) |
| Bytes | 48,333 |
| SHA-256 | `dd914f8074c0f5ccd911326b3f48c3a25b7439f46efc698f3a287e95d337a92e` |
| scrollWidth | 390 |
| clientWidth | 390 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Primary CTA | 300×48 px · bg `rgb(217,107,143)` |
| Secondary CTA | 154×44 px · transparent bg |
| Quick-start button heights | 44, 44, 44 px — all ≥ 44px PASS |
| Decorative SVGs | 4 |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `아직 러브트리가 없어요`
- H2: `어떤 순간부터 시작할까요?`
- Brand ("Relovetree") appears exactly once
- Quick-start items: 3 (each with title + description)
- Layout: real single-column (scrollWidth == clientWidth == 390)
- h1 + description + primary CTA visible in first viewport

---

## Visual Verification Checklist

| Check | Desktop | Intermediate | Mobile |
|---|---|---|---|
| h1 = `아직 러브트리가 없어요` | PASS | PASS | PASS |
| Brand appears exactly once | PASS | PASS | PASS |
| Primary CTA visually primary (dusty rose bg) | PASS | PASS | PASS |
| Secondary CTA visually secondary (transparent) | PASS | PASS | PASS |
| All buttons ≥ 44px high | PASS | PASS | PASS |
| Exactly 3 quick-start items | PASS | PASS | PASS |
| Each quick-start has title + description | PASS | PASS | PASS |
| Exactly 4 decorative SVGs | PASS | PASS | PASS |
| No horizontal overflow | PASS | PASS | PASS |
| No console/page errors | PASS | PASS | PASS |
| No failed requests | PASS | PASS | PASS |
| Mobile single-column layout | n/a | n/a | PASS |
| Desktop two-area composition | PASS | n/a | n/a |
| Intermediate no overlap at 900px | n/a | PASS | n/a |
