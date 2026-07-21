# Known Visual Differences — LT3-EDITOR-002

## Reference vs Implementation

| Area | Reference | Implementation | Reason |
|---|---|---|---|
| Node icons | Custom illustrations per memory | Emoji-free gradient thumbnails with type badge | No custom image assets in mock data |
| Canvas connectors | Organic curved lines between scattered nodes | DOM-flow straight/branch SVG connectors | CSS/SVG range only, no external libs |
| Node layout | Free-form scattered with organic curves | Centered vertical tree with branch rows | DOM-flow approach for layout stability |
| Inspector media | Full video player with timeline | Gradient placeholder with play icon | Presentation-only, no real media |
| Background | Warm gradient with depth | Flat warm background | CSS only |
| Left sidebar icons | Custom SVG icons | Emoji icons | No custom icon assets |
| Brand logo | Custom tree illustration | 🌿 emoji | No custom logo assets |
| Highlighted connector | Thick colored line | Solid dark line (#5c4a3a, 2.5px) | Visual emphasis preserved |

## What IS matching
- 3-panel layout (nav / canvas / inspector)
- 5 memory nodes with full metadata
- Tree relationship hierarchy with branching
- 4 data-driven connectors with semantic attributes
- 1 highlighted connector (conn-2: mem-2 → mem-3)
- Selected node with visual emphasis (border + badge)
- Insert marker after selected
- Inspector with read-only fields (러브트리 제목, 설명, 날짜, 메모)
- Inspector metadata (type, media, source, duration, tags)
- Connection context (parent + children)
- All presentation-only contracts
- Responsive 3-panel → single-column
