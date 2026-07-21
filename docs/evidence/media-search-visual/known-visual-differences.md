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
- **Implementation:** Bottom-fixed on mobile, sticky inline on desktop
- **Reason:** Adapted for desktop main/aside layout

### Desktop Layout
- **Reference:** Mobile-only mockup (2816 × 1536)
- **Implementation:** 2-column grid at 1100px+ with tree sidebar
- **Reason:** No desktop reference; layout follows MemoryConnectPage pattern

## Placeholder Image Usage
All thumbnails are CSS gradient placeholders. No actual image assets are used.
