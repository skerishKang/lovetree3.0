# Known Visual Differences — LT3-MEMORY-001

## Reference vs Implementation

| Area | Reference | Implementation | Reason |
|---|---|---|---|
| Icons | Custom illustrations | Emoji placeholders | No image assets in mock data |
| Connector style | Organic curved lines | Straight dashed/solid SVG | CSS/SVG range only, no external libs |
| New memory card | May have drag interaction | Static preview card | Presentation-only contract |
| Node hover | No hover effect | No hover effect (removed) | Non-interactive nodes |
| Desktop layout | Unknown (mobile-only ref) | 2-column with sticky context | Interpretation for wide screens |
| Font | System/default | System stack | No custom font loaded |
| Background pattern | Subtle texture | CSS gradient only | No image assets |

## What IS matching
- 4 memory nodes with full metadata
- 3 DOM-flow connectors between nodes
- 1 highlighted connector to selected node
- Selected node with border, badge, and visual emphasis
- Insert marker after selected node
- CTA with connection context text
- Mobile fixed CTA at bottom
- Desktop 2-column layout
- Presentation-only interaction contract
