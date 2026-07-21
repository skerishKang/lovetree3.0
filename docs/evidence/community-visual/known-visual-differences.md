# Community Page - Known Visual Differences

## UI BASE Implementation

This document describes the known visual differences between the reference image and the current implementation.

## Reference Image

- **Path:** `docs/reference/screens/01-community/community-discovery.png`
- **Resolution:** 2752 × 1536
- **SHA-256:** `8d54dcd05d95196248658008ab5ba630d4538f66c61945bbff13034183229b2b`

## Implementation Details

### UI BASE Stage
- Static mockup data only
- No real API calls
- No Firebase/LoveBud connection
- No actual user data

### Layout Structure
- **Desktop:** 4-column grid for tree cards
- **Mobile:** Single column layout
- **Header:** Brand logo + search bar
- **Categories:** Horizontal scrollable chips
- **Featured Section:** Prominent header and card with side-by-side SVG tree structures

### Visual Elements

#### Card Thumbnails
- **Reference:** Gradient backgrounds with bokeh effect
- **Implementation:** Multi-stop gradients with radial overlay and SVG connection trees (3-5 nodes)
- **Difference:** Subtle color variation due to gradient stopping points

#### Typography
- **Reference:** System font with specific weights
- **Implementation:** Same system font with CSS custom properties
- **Difference:** Minor rendering differences between browsers

#### Shadows & Borders
- **Reference:** Soft shadows with subtle borders
- **Implementation:** CSS box-shadow with border
- **Difference:** Shadow intensity may vary slightly

### Mobile Specifics
- **Viewport:** 390px (DPR 2)
- **Expected PNG width:** 780px
- **Actual PNG width:** 780px ✅
- **Actual PNG height:** 8856px ✅
- **Horizontal overflow:** None ✅
- **Visual Evidence SHA-256:** `d24a01793aab4d1cbfa0e71f395cf535923bea3ad5a173b85e5b21feee3d721e`
- **Visual Evidence Git blob SHA:** `07121729e3719cec0dd5ebdeec3832a5152b6364`

### Desktop Specifics
- **Viewport:** 1440px (DPR 1)
- **Expected PNG width:** 1440px
- **Actual PNG width:** 1440px ✅
- **Actual PNG height:** 2031px ✅
- **Horizontal overflow:** None ✅
- **Visual Evidence SHA-256:** `0fef853c2a0907113479bacc9b4f7981a621755c5bfd01963a1cf64a95e9410a`
- **Visual Evidence Git blob SHA:** `84c11d863e77296769215756e010322526f02295`

## Known Differences

1. **Gradient Color Stops:** Minor variations in color transition points
2. **Shadow Intensity:** Slight differences in shadow blur radius
3. **Border Radius:** Minor variations in corner rounding
4. **Font Rendering:** Browser-specific text rendering differences
5. **Bokeh Effect:** Reference has more pronounced bokeh blur on thumbnails
6. **Card Depth:** Reference cards appear slightly more elevated

## Visual Refinement Applied

### Card Thumbnails
- Multi-stop gradients (5 stops) for richer color depth
- Radial bokeh overlay with transparency
- SVG Tree Node structure (3-5 nodes, lines, active node emphasis) layered on gradients
- Subtle border for card definition

### Shadows & Depth
- Enhanced shadow intensity for better visual hierarchy
- Border added for card separation
- Hover state transitions with depth increase

### Featured Section
- Enhanced featured card with custom large SVG tree layout (7 nodes, connections, special glowing active node)
- Rich description summary text and metadata (기억 수, 업데이트 라벨, 추천 배지)
- Hover effects for interactive feedback

## Accessibility

- All interactive controls have focus-visible outlines styled appropriately.
- Automated WCAG AA color-contrast compliance was not independently measured.
- Full screen-reader and keyboard-flow audits remain pending.

## Technical Notes

- CSS Custom Properties used for theming
- Responsive design with mobile-first approach
- No horizontal overflow on any viewport
- Smooth transitions for hover states
- SVG graphics marked with `aria-hidden="true"` to prevent bloating the accessibility tree.
