# Known Visual Differences — LT3-SETTINGS-001 Visibility Settings Visual Evidence

## Screen: LT3-SETTINGS-001 (`/settings/visibility-demo`)

**Evidence captured from:** `http://localhost:5173/settings/visibility-demo`  
**Branch head:** `4f0a1f3c5e8d9a2b3c4d5e6f7a8b9c0d1e2f3a4b`  
**Captured:** 2026-07-22

---

## Expected vs. Actual Differences

| Area | Reference (design) | Actual (implementation) | Reason |
|---|---|---|---|
| Page background | Flat beige | Gradient (warm ivory) | LoveTree 3.0 visual language consistency |
| Title hierarchy | Single h1 | h1 + description p | Added context description per requirements |
| Radio selection indicator | Card border/shadow | CSS selector for selected state | Visual clarity for selected option |
| Share link input | Read-only | Read-only with distinct background | Visually indicates non-editable state |
| Icon colors | Mixed | Consistent #3d3229 stroke | Unified icon styling |

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
- All touch targets 44px or larger
- 0 side effects (fetch, storage, clipboard, navigation)
- 0 console errors or failed requests

---

## Responsive Behavior

| Viewport | Behavior |
|---|---|
| Mobile 390px | Single column, content flows naturally |
| Intermediate 900px | Centered workspace, max-width 560px |
| Desktop 1440px | Centered workspace, max-width 560px, larger typography |

---

## Side-effect Verification

- fetch: 0 calls
- XMLHttpRequest: 0 calls
- localStorage/sessionStorage: 0 accesses
- Clipboard API: 0 calls
- URL changes: 0
- window.open: 0
- modal/dialog/alert: 0