# Community Page - Known Visual Differences

## UI BASE Implementation

This document describes the known visual differences between the reference image and the current implementation.

## Reference Image

- **Path:** `docs/reference/screens/05-community/community-discovery.png`
- **Resolution:** 2752 × 1536
- **SHA-256:** `8c4f2b1e3d5a6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b`

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
- **Featured Section:** Full-width featured card

### Visual Elements

#### Card Thumbnails
- **Reference:** Gradient backgrounds with bokeh effect
- **Implementation:** Multi-stop gradients with radial overlay
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
- **Horizontal overflow:** None ✅

### Desktop Specifics
- **Viewport:** 1440px (DPR 1)
- **Expected PNG width:** 1440px
- **Actual PNG width:** 1440px ✅
- **Horizontal overflow:** None ✅

## Known Differences

1. **Gradient Color Stops:** Minor variations in color transition points
2. **Shadow Intensity:** Slight differences in shadow blur radius
3. **Border Radius:** Minor variations in corner rounding
4. **Font Rendering:** Browser-specific text rendering differences

## Visual Refinement Notes

### Priority 1: Card Thumbnail Enhancement
- Add more complex gradient patterns
- Enhance bokeh effect with multiple radial gradients
- Improve color depth and variation

### Priority 2: Shadow & Depth
- Increase shadow depth for better visual hierarchy
- Add subtle border for card definition
- Improve hover state transitions

### Priority 3: Typography Hierarchy
- Increase title font size
- Improve weight contrast between elements
- Enhance letter spacing for readability

### Priority 4: Featured Section
- Make featured card more prominent
- Add gradient overlay for depth
- Improve visual separation from grid cards

## Accessibility

- All interactive elements have focus-visible states
- Color contrast meets WCAG AA standards
- Screen reader friendly structure
- Keyboard navigation supported

## Technical Notes

- CSS Custom Properties used for theming
- Responsive design with mobile-first approach
- No horizontal overflow on any viewport
- Smooth transitions for hover states
