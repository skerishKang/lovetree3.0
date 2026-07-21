# Tree Editor — known visual differences

## Reference

- Path: `docs/reference/screens/05-editor/tree-editor-desktop.png`
- Resolution: 2752 × 1536
- SHA-256: `c29ec6a5c2954999cd171dde8fa39a63a3644ce5fdaeac69c7fc8aacb7b9208b`
- Orientation: desktop

## Implementation stage

**UI BASE** — static mockup without actual editing, canvas rendering, or connection lines.

- Static mock data only
- Read-only inputs (`readonly` attribute, no `useState`)
- Fixed selected state via single source of truth (`selectedMemoryId`)
- No API, Firebase, or authentication
- No actual save, publish, or edit behavior
- No drag-and-drop or canvas rendering
- No image upload or FileReader
- No actual screen navigation

## Fixed selected state

- Single source of truth: `selectedMemoryId: "mem-2"`
- Computed per card: `const isSelected = mem.id === data.selectedMemoryId`
- No duplicate `isSelected` fields on individual objects

## Read-only inputs

- Tree title: `<input defaultValue="데뷔 무대 기록" readOnly />`
- Description: `<input defaultValue="..." readOnly />`
- Detail date: `<input readOnly />`
- Detail memo: `<textarea readOnly />`

## Visual differences from reference

| Aspect | Reference | Implementation |
|---|---|---|
| Layout | Full sidebar + canvas + detail panel | Focused two-column editor layout (canvas + detail panel) |
| Sidebar nav | 왼쪽 홈/내 러브트리/설정 | App-level navigation via existing site structure |
| Canvas rendering | Mindmap with connected nodes and connection lines | Card grid with visual thumbnails (no canvas drawing) |
| Video/Media player | Embedded video player in detail panel | Static thumbnail placeholder with color gradient |
| Connection settings | "연결 위는 소에서..." toggle | Not implemented (UI BASE) |
| Card count | ~7 visible cards | 5 memory cards |
| Color palette | Warm beige (Relovetree branding) | Consistent LoveTree warm beige palette |
| Typography | Exact reference fonts | System font stack matching existing LoveTree app |
| "뒤로 가기" button | Canvas-level back navigation | Page-level back button in header |

## Desktop interpretation

- Two-column layout: canvas section (flex: 1) + detail panel (340px fixed width)
- Cards displayed in responsive auto-fill grid
- Number of columns depends on available width
- Max columns: 3 in full-width viewport

## Mobile interpretation (≤ 900px)

- Single-column stack: canvas → detail panel
- Cards displayed in single column
- Detail panel moves below canvas with full width
- No horizontal scroll, no card overlap

## VISUAL items deferred to follow-up

- Pixel-perfect match of reference typography
- Canvas-style card connection lines
- Card drag handles and actual reordering
- Media preview in detail panel
- Connection settings UI
- Empty tree state ("첫 순간을 추가해" / "러브트리를 시작하세요")
- Gradient thumbnail color tuning
- Focus-visible ring color refinement
- Responsive breakpoint thresholds

## Accessibility implemented

- Page title is `<h1>`
- Memory cards use `<article>` with `aria-labelledby` pointing to card title
- Cards have no `role="button"`, `tabIndex`, or `draggable`
- Read-only inputs have explicit `<label>` association via `htmlFor`/`id`
- Detail action buttons include target title in `aria-label`
- Decorative SVGs have `aria-hidden="true"`
- Focus-visible outlines on all interactive elements
- Non-selected cards have no `aria-current` attribute
