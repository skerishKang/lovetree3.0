# My Trees Empty State — Visual Validation

Capture URL: `https://style-my-trees-empty-visual.lovetree3.pages.dev/my-trees/empty-demo`
Deployed commit: `802957b34f8af47d8b1a8e66813e81dfa5e8edbc`
Browser: Google Chrome 145.0.7632.116 (headless) · DPR 1 · Playwright

This capture replaces the earlier `3bc1ac2` evidence after the intermediate-width
readability fix (`fix: preserve quick-start readability at intermediate width`).

---

## Desktop — 1440×1000

| Metric | Value |
|---|---|
| Screenshot | `my-trees-empty-desktop-1440x-full.png` |
| PNG dimensions | 1440×1016 px |
| Bytes | 60,418 |
| SHA-256 | `c260bfd9c22011dc2996ec82c1528c66f41d451ed67ea9b6ed370877e40bd02e` |
| scrollWidth | 1440 |
| clientWidth | 1440 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Primary CTA | 161×48 px · bg `rgb(217,107,143)` (dusty rose) |
| Secondary CTA | 154×44 px · transparent bg |
| Quick-start button heights | 44, 44, 44 px — all ≥ 44px PASS |
| Quick-start layout | 3 cards in ONE row (`distinctItemRows: 1`) — PASS |
| Quick-start item widths | 178 / 178 / 178 px (evenly spaced at x=650/842/1034) |
| Quick-start title overflow | none (scrollWidth == clientWidth for all 3) — PASS |
| Decorative SVGs | 4 |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `아직 러브트리가 없어요`
- H2: `어떤 순간부터 시작할까요?`
- Brand ("Relovetree") appears exactly once
- Quick-start items: 3 (each with title + description), balanced single row
- Layout: two-area composition (visual panel + action panel); quick-start 3-column active (≥1200px breakpoint)

---

## Intermediate — 900×900

| Metric | Value |
|---|---|
| Screenshot | `my-trees-empty-intermediate-900x-full.png` |
| PNG dimensions | 900×916 px |
| Bytes | 59,047 |
| SHA-256 | `6ba0733f836f5a13a1aea52b909cdff66f7cc147757db189c3d802a9f0b080af` |
| scrollWidth | 900 |
| clientWidth | 900 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Primary CTA | 161×48 px · bg `rgb(217,107,143)` |
| Secondary CTA | 154×44 px · transparent bg |
| Quick-start button heights | 44, 44, 44 px — all ≥ 44px PASS |
| Quick-start layout | single column, stacked (`distinctItemRows: 3`) — PASS |
| Quick-start item widths | 454 / 454 / 454 px (natural readable width) |
| Quick-start title overflow | none (scrollWidth == clientWidth == 418 for all 3) — PASS |
| Decorative SVGs | 4 |
| Clipping / overlap | none detected |

Visible hierarchy:
- H1: `아직 러브트리가 없어요`
- H2: `어떤 순간부터 시작할까요?`
- Brand ("Relovetree") appears exactly once
- Quick-start items: 3 (each with title + description), stacked full-width cards
- Layout: two-area grid preserved at 900px (action panel at x=398); quick-start stays single column below the 1200px breakpoint
- Titles `입덕`, `첫 콘서트`, `최애 무대` render on one line — no character-level fragmentation

---

## Mobile — 390×844

| Metric | Value |
|---|---|
| Screenshot | `my-trees-empty-mobile-390x-full.png` |
| PNG dimensions | 390×901 px (full-page; page height 901 > viewport 844) |
| Bytes | 48,335 |
| SHA-256 | `078c8cbfb27d1522ba12f6a2747e7e258a4932065eeecc27b3f53c564ea15e19` |
| scrollWidth | 390 |
| clientWidth | 390 |
| Horizontal overflow | 0 px — PASS |
| Console errors | none |
| Page errors | none |
| Failed requests | none |
| Primary CTA | 300×48 px · bg `rgb(217,107,143)` |
| Secondary CTA | 154×44 px · transparent bg |
| Quick-start button heights | 44, 44, 44 px — all ≥ 44px PASS |
| Quick-start layout | single column, stacked (`distinctItemRows: 3`) — PASS |
| Quick-start item widths | 342 / 342 / 342 px |
| Quick-start title overflow | none — PASS |
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
| Desktop quick-start 3-in-a-row (balanced) | PASS | n/a | n/a |
| Intermediate quick-start single column | n/a | PASS | n/a |
| Intermediate no character-level title fragmentation | n/a | PASS | n/a |
| Intermediate no overlap at 900px | n/a | PASS | n/a |
