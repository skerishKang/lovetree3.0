# Visual Validation Report — LT3-EDITOR-001

## Metadata & SHA Traceability

- **Actual Branch Preview URL:** `https://style-empty-tree-onboarding.lovetree3.pages.dev/tree/new-demo`
- **Visual Source Commit (Commit 1):** `edc9ad1eeeae5171c335e786760865cf38a30ac3`
- **Evidence Commit (Commit 2):** Pending commit creation
- **Metadata Commit (Commit 3):** Recorded in PR body and final report
- **Reference SHA-256:** `a13fda6cefee5914eda12d4913bd9bbf3900f5b282b4c87fdfcf9aca579e0158` (`docs/reference/screens/05-editor/empty-tree-desktop.png`)

## Environment & Browser Information

- **Browser:** HeadlessChromium `149.0.7827.55` (Playwright Chromium)
- **Host System:** Windows (pwsh)

## Viewport Screenshots & Evidence

| Viewport Name | Viewport (WxH) | DPR | Image Dimensions | File Bytes | SHA-256 |
|---|---|---|---|---|---|
| Desktop | 1440 × 1000 | 1 | 1440 × 1000 | 47,967 | `3c09cd13c2eebb2d5f3e57dc3a90e76859a4cfdbdd686dd507d7df66694be22b` |
| Intermediate | 900 × 900 | 1 | 900 × 900 | 38,174 | `e4455b3d19a0769e14a7b36b5ef19ad909afdcfa6010e95d0ba5f1fe2c61c089` |
| Mobile | 390 × 844 | 1 | 390 × 844 | 35,201 | `ad6df9765c56e23c16f452860218ad91a1d607b70ce2e12adf4fca0caa473464` |

## Live Browser Runtime Audit

- **Console Errors:** 0
- **Page Errors:** 0
- **Failed Requests:** 0
- **Horizontal Overflow:** 0px across all 3 viewports

## Contract & DOM Verification Summary

- **Sidebar Menu Count:** 3 (`내 러브트리`, `탐색`, `설정`)
- **Active Menu Count:** 1 (`내 러브트리`, `aria-current="page"`)
- **CTA Count:** 1 (`첫 순간 추가`)
- **Article/Moment Card Count:** 0
- **Prohibited Buttons Count:** 0 (`기억 추가`: 0, `저장`: 0, `게시하기`: 0)
- **Decorative SVG Accessibility:** Hidden (`aria-hidden="true"`)
- **Presentation-Only Integrity:** 0 fetch calls, 0 Storage API calls, 0 URL changes, 0 dialogs/alerts/modals.

## Summary of Known Visual Differences

Refer to `known-visual-differences.md` for full breakdown. Summary:
1. Brand name styled as "Relovetree" with sprout icon (🌿) for design system consistency.
2. Sidebar menus enhanced with symbol icons and explicit `aria-current="page"` state.
3. Canvas features subtle grid texture and context header to reinforce editor workspace identity.
4. Central onboarding panel incorporates a clean SVG root node anchor.
