# Known Visual Differences — LT3-EDITOR-001

## Reference Overview

- Reference File: `docs/reference/screens/05-editor/empty-tree-desktop.png`
- Reference Resolution: 2752 × 1536
- Reference SHA-256: `a13fda6cefee5914eda12d4913bd9bbf3900f5b282b4c87fdfcf9aca579e0158`

## Comparison & Intentional Adaptations

1. **Brand Name Alignment**
   - Reference displays "LoveTree" text in sidebar.
   - Implementation uses "Relovetree" brand name with a sprout icon (🌿) to ensure visual and brand consistency with `TreeEditorPage` and the rest of the application.

2. **Sidebar Menu System & Icons**
   - Reference includes 3 text menu items: "내 러브트리", "탐색", "설정".
   - Implementation retains exact 3 menu items and adds decorative icon symbols (🌳, 🔍, ⚙️) and explicit `aria-current="page"` active state highlighting on "내 러브트리" for enhanced editor workspace navigation hierarchy.

3. **Workspace Canvas & Grid Texture**
   - Reference shows a plain light background with central illustration.
   - Implementation introduces a subtle dot-grid canvas texture (`radial-gradient`), context header bar ("새 러브트리 작업공간"), and styled onboarding card to make the empty state read unambiguously as an active editor workspace rather than an unstyled empty page.

4. **Root Node Anchor Illustration**
   - Reference features a small decorative branch.
   - Implementation utilizes a clean SVG root node anchor with dotted grid line and sprouting nodes, illustrating the origin position of the first root node without cluttering or imposing absolute layout constraints.

5. **Profile Section**
   - Reference has a simple avatar and profile label.
   - Implementation provides a structured avatar circle ("U"), user name ("사용자"), and plan badge ("무료 플랜") to match the workspace sidebar structure across the application.
