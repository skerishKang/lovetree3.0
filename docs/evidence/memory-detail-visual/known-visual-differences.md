# Known Visual Differences — LT3-MEMORY-002

## Differences from Reference

### 1. Media Placeholder Background
- **Reference**: Blurred real photo thumbnail
- **Implementation**: Gradient approximation (`linear-gradient(135deg, #d4cdc4, #bfb5aa)`)
- **Reason**: Presentation-only constraint prohibits real photo content

### 2. Header Title
- **Reference**: "Relovetree" brand text centered
- **Implementation**: "기억 상세" screen title centered
- **Reason**: Consistent with project screen title pattern; brand header handled by shared component not in scope

### 3. Memo Pen Icon
- **Reference**: Small pen/write icon at bottom-right of memo card
- **Implementation**: Omitted
- **Reason**: Non-functional decoration in presentation-only mode

### 4. Desktop Sidebar
- **Reference**: Mobile-only layout (no desktop reference provided)
- **Implementation**: 2-column desktop layout with author info, reaction stats, and tree context sidebar
- **Reason**: Issue #36 explicitly requires desktop 2-column layout at 1440px

### 5. Related Memory Thumbnails
- **Reference**: Appears to have small image thumbnails
- **Implementation**: Colored gradient thumbnails with type label overlay
- **Reason**: Presentation-only constraint; colored placeholders with semantic type labels

### 6. Tag Styling
- **Reference**: Slightly different warm tone pills with specific color per tag
- **Implementation**: Consistent warm-toned pills (`#f0e8de` background)
- **Reason**: Minimal visual difference; follows project tag convention
