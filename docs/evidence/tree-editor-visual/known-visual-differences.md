# Known Visual Differences — LT3-EDITOR-002

## Reference vs Implementation

| Area | Reference | Implementation | Reason |
|---|---|---|---|
| Node icons | Custom illustrations per memory | Emoji placeholders | No custom image assets in mock data |
| Canvas connectors | Organic curved lines between scattered nodes | DOM-flow straight/branch SVG connectors | CSS/SVG range only, no external libs |
| Node layout | Free-form scattered with organic curves | Centered vertical tree with branch rows | DOM-flow approach for stability |
| Inspector media | Full video player | Gradient placeholder with play icon | Presentation-only, no real media |
| Background | Warm gradient with depth | Flat warm background | CSS only |
| Left sidebar icons | Custom SVG icons | Emoji icons | No custom icon assets |
| Brand logo | Custom tree illustration | 🌿 emoji | No custom logo assets |

## What IS matching
- 3-panel layout (nav / canvas / inspector)
- 5 memory nodes with full metadata
- Tree relationship hierarchy with branching
- 4 connectors (3 straight + 1 branch)
- Selected node with visual emphasis (border + badge)
- Insert marker after selected
- Inspector with media preview, metadata, tags, memo, connection context
- All presentation-only contracts
- Responsive 3-panel → single-column
