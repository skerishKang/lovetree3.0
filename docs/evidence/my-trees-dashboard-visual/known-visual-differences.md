# Known Visual Differences — My Trees Dashboard

## vs. Reference Screenshot (`docs/reference/screens/06-my-trees/my-trees-dashboard-desktop.png`)

The reference image is the design target. The implementation intentionally adds visual enhancements
beyond the reference while strictly meeting all DOM/contract requirements.

### Expected Differences

1. **Mini tree branch visualization in card thumbnails**
   - Reference: Plain gradient rectangle thumbnails
   - Implementation: SVG branch + node graphics overlaid on gradient, with node size
     scaling based on memory count (`memoryCount > 50` = larger nodes)
   - Rationale: Issue §5 "Card visual hierarchy" explicitly allows "CSS gradient / small
     inline SVG / DOM-flow mini branch preview" and "memory count에 따른 node density 차이"

2. **Selected card "현재 편집 중" context badge**
   - Reference: Standard selected styling only
   - Implementation: Additional static badge in top-right of thumbnail area
   - Rationale: Issue §5 explicitly allows "selected card의 `현재 편집 중` 또는 동등한 정적 context badge"

3. **Deeper gradient thumbnails**
   - Reference: Pastel/light gradients
   - Implementation: More saturated gradients (e.g., rose: `#f5a9b8` → `#d96b8f`)
   - Rationale: Issue §5 "card visual hierarchy" allows richer visual treatment

4. **Card action buttons with background/border**
   - Reference: Minimal/plain action buttons
   - Implementation: Buttons with `background: #faf6f1`, `border: 1px solid #eee7de`,
     `border-radius: 8px` for better visual affordance
   - Rationale: Visual improvement within allowed component styling

5. **Section header with tree count badge ("총 6개")**
   - Reference: Simple section title only
   - Implementation: Flexrow with title and count badge
   - Rationale: Additive UI element showing dashboard context

6. **Sidebar with "최신활동" badge + description text**
   - Reference: Simple sidebar title only
   - Implementation: Adds sidebar activity badge and static description text
   - Rationale: Additional context without violating any contract

7. **Recent item cards with background + border**
   - Reference: Plain list items
   - Implementation: Each item has `background: #faf6f1`, `border: 1px solid #eee7de`,
     `border-radius: 12px` + 🌱 icon in thumbnail
   - Rationale: Premium visual treatment, non-interactive (not button/link)

8. **Logo text changed to "Relovetree" in header**
   - Reference: "LoveTree"
   - Implementation: "Relovetree" (brand wordmark update in this screen)
   - Note: This is within the allowed `MyTreesPage.tsx` file scope

### Unchanged / Matching

- All 3 header buttons present (메뉴 열기, 알림 보기, 마이페이지)
- H1 "나의 러브트리" — exact match
- Description text — exact match
- CTA "새 러브트리 만들기" — exact match
- 6 tree cards in grid layout — exact match
- Selected card (tree-1, "나의 러브트리") — exact match
- Public (2) / Private (4) badges — exact match
- Aside landmark with "최근 수정한 순간" heading — exact match
- "첫 콘서트 도착" and "앙코르 무대" recent moments — exact match
- Responsive layout: 2-column grid on desktop, collapses to 1-column on mobile

### Performance

- No network fetch calls (all data from MOCK_MY_TREES)
- No image assets loaded (all visuals are CSS/SVG)
- No external font loading issues
