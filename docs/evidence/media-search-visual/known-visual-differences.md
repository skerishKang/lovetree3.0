# Known Visual Differences — LT3-MEDIA-001

## Reference vs Implementation

### Thumbnail Style
- **Reference:** Artistic illustrated placeholders with silhouettes and stage lighting
- **Implementation:** Gradient-colored placeholder blocks with play icon overlay
- **Reason:** No asset pipeline for illustrated thumbnails; gradient placeholders maintain visual hierarchy

### Channel Icon
- **Reference:** Small circular icon beside channel name (star icon for StarArchive, play icon for K-Pop Central)
- **Implementation:** CSS pseudo-element circle (colored dot)
- **Reason:** Simplified channel indicator; semantic equivalence maintained

### Date Format
- **Reference:** Mixed formats (2020. 06. 7일, 2023년 12 1일)
- **Implementation:** Consistent dot format (2025. 01. 15.)
- **Reason:** Consistency with existing project date conventions

### Card Layout
- **Reference:** Thumbnail left, title + date + channel right, button far right
- **Implementation:** Same layout with additional metadata (duration badge, content type badge, tags)
- **Reason:** Enhanced information density per Issue #37 requirements

### Filter Bar Position
- **Reference:** Bottom-fixed with scrollable results
- **Implementation:** Bottom-fixed on mobile, inline after search context on desktop
- **Reason:** Adapted for desktop main/aside layout; filter is non-interactive (static chip contract)

### Desktop Layout
- **Reference:** Mobile-only mockup (2816 × 1536)
- **Implementation:** 2-column main/aside at 1100px+ with sticky tree sidebar
- **Reason:** No desktop reference; layout follows main/aside semantic structure

### Search Query Text
- **Reference:** "무대 직캠 상랑크 검색" (unclear origin text)
- **Implementation:** "무대 직캠 검색" (meaningful, clear query)
- **Reason:** Original text contained unclear "상랑크" term; corrected to meaningful search query

### Sidebar Text
- **Reference:** "미디어 6건이 이 트리에 추가됩니다" (asserts all results will be added)
- **Implementation:** "검색 결과 6건" + "선택한 미디어가 이 트리에 추가됩니다" (selection-based)
- **Reason:** User selects individual cards; avoids implying all results are auto-added

## Placeholder Image Usage
All thumbnails are CSS gradient placeholders. No actual image assets are used.
