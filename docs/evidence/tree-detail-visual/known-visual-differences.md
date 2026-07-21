# Known Visual Differences — Tree Detail Visual Evidence
## Screen: LT3-TREE-DETAIL-001 (`/tree/community-demo`)

**Evidence captured from:** `https://style-tree-detail-visual-ref.lovetree3.pages.dev/tree/community-demo`  
**Branch head:** `0fe15cbf14e1f5c4608f12a0b182d5180c186f11`  
**Captured:** 2026-07-21

---

## Expected vs. Actual Differences

| Area | Reference (design) | Actual (implementation) | Reason |
|---|---|---|---|
| Tree node connections | Animated SVG lines | CSS border connector elements | No SVG dependency added intentionally |
| Media thumbnails | Real image previews | Placeholder polaroid frames | No CDN images in mock data |
| Author avatar | Circular profile photo | Emoji avatar (🎭) | No image upload in mock data |
| Comment avatars | Circular profile photos | Emoji avatars (🎨, 🌸, 🦁) | No image upload in mock data |
| Sidebar stats | Animated counters | Static text | Intentional static mock; no real API |

---

## What IS matching

- 8 memory cards with full metadata (title, date, description, typeLabel, mediaLabel, reactionCount)
- 7 timeline connections between nodes with connectionLabel text
- Featured memory badge (★ 대표 기억) on mem-3 (콘서트 직캠)
- TreeStorySummary section with story text and summary grid
- Sidebar with author info card, tree stats, featured memory highlight
- Header with category badge, tags, view/like/comment counts
- Comment section with 3 comments, timeLabel, and user avatars
- Responsive layout differences (sidebar collapses on mobile)
