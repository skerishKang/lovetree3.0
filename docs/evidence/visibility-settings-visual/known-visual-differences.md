# Known Visual Differences — LT3-SETTINGS-001 Visibility Settings Visual Evidence

## Screen: LT3-SETTINGS-001 (`/settings/visibility-demo`)

**Evidence captured from:** `https://fix-visibility-settings-acce.lovetree3.pages.dev/settings/visibility-demo`  
**Code commit SHA:** `e652909ab7ebc00174d536d18f11d20f744f22ac`  
**Base main SHA:** `67c680ec9d14f1b948f992f376b4f258de0010b9`  
**Cloudflare deployed commit:** `e652909ab7ebc00174d536d18f11d20f744f22ac`  
**Captured:** 2026-07-23

**Note:** Cloudflare Pages deployment successful. Screenshots captured from branch preview URL.

---

## Expected vs. Actual Differences

| Area | Reference (design) | Actual (implementation) | Reason |
|---|---|---|---|
| Page background | Flat beige | Gradient (warm ivory) | LoveTree 3.0 visual language consistency |
| Title hierarchy | Single h1 | h1 + description p | Added context description per requirements |
| Radio selection indicator | Card border/shadow | CSS selector for selected state | Visual clarity for selected option |
| Share link input | Read-only | Read-only with distinct background | Visually indicates non-editable state |
| Icon colors | Mixed | Consistent #3d3229 stroke | Unified icon styling |
| Desktop layout | Left-aligned | Centered within page container | Issue #48 acceptance: balanced viewport centering at 900px+ |
| Copy button height | — | min-height 44px | Issue #48 acceptance: WCAG touch target compliance at mobile |

---

## What IS matching

- 3 visibility radio options with correct labels and descriptions
- 3 additional setting checkboxes with correct initial states
- Share link textbox with correct placeholder value
- Link copy button present
- Save button at final position
- Mobile-first single column layout
- Intermediate and Desktop responsive layouts
- No horizontal overflow at any viewport
- Touch targets 44px or larger (including copy button at mobile: 44px)
- 0 side effects (fetch, storage, clipboard, navigation)
- 0 console errors or failed requests

---

## Responsive Behavior

| Viewport | Behavior |
|---|---|
| Mobile 390px | Single column, content flows naturally, centered |
| Intermediate 900px | Centered content within page container, max-width 560px |
| Desktop 1440px | Centered content within page container, max-width 560px, larger typography |

---

## Side-effect Verification

- fetch: 0 calls
- XMLHttpRequest: 0 calls
- localStorage/sessionStorage: 0 accesses
- Clipboard API: 0 calls
- URL changes: 0
- window.open: 0
- modal/dialog/alert: 0