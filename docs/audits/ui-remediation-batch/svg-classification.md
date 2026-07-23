# SVG Accessibility Classification — UI Remediation Batch (Phase 3)

Scope: `src/components/**/*.tsx` on branch `integration/ui-remediation-batch`.

Rule applied: every `<svg>` is either explicitly `aria-hidden="true"` (or inside an
`aria-hidden="true"` ancestor) AND `focusable="false"`. No SVG in the current
12-screen scope conveys information that is not already exposed via adjacent text,
`aria-label`, or visually-hidden text, so all are classified **decorative**.

| Component | SVG role | Classification | Treatment |
| --- | --- | --- | --- |
| `icons.tsx` (PlayIcon, DotsMenuIcon, RecordIcon, ConnectIcon, ReplayIcon, ShareIcon, StarDecoration) | Icon glyphs paired with text labels / decorative star | Decorative | `aria-hidden="true" focusable="false"` on root |
| `MemoryPreviewCard.tsx` | Play/dots affordances (non-interactive preview) | Decorative | Parent span `aria-hidden="true"`; icons `focusable="false"` |
| `SiteHeader.tsx` | None | — | — |
| `HeroSection.tsx` / `MemoryTreePreview.tsx` / `TreeConnectorSvg.tsx` | Tree connector curves, preview illustration | Decorative | `aria-hidden="true" focusable="false"` |
| `CommunityTreePreview.tsx` | Mini tree illustration in community cards | Decorative | `aria-hidden="true" focusable="false"` |
| `CommunitySearch.tsx` | Search magnifier icon inside labeled input | Decorative | `aria-hidden="true" focusable="false"` |
| `MemoryConnectPage.tsx` | Back-chevron button icon; connector line | Decorative | Button has `aria-label`; svg `aria-hidden="true" focusable="false"` |
| `MemoryDetailPage.tsx` | Back/menu/play button icons, stat icons, action-bar icons, avatar/tree context illustrations | Decorative | Buttons/spans carry `aria-label` or `aria-hidden`; svg `aria-hidden="true" focusable="false"` |
| `MediaSearchPage.tsx` | Search icon, thumbnail play overlay | Decorative | Inside `aria-hidden` wrappers; svg `focusable="false"` |
| `MyTreesPage.tsx` | Header icons, new-tree plus, mini-tree graphic, stat icons | Decorative | `aria-hidden="true" focusable="false"` |
| `MyTreesEmptyPage.tsx` | Onboarding illustration, quick-start icons | Decorative | `aria-hidden="true" focusable="false"` |
| `TreeEditorPage.tsx` | Toolbar/inspector icons, search icon, connector/branch line SVGs | Decorative | Connectors inside `aria-hidden` containers; svg `aria-hidden="true" focusable="false"` |
| `EmptyTreeEditorPage.tsx` | Root-anchor onboarding illustration | Decorative | Inside `aria-hidden` wrapper; svg `aria-hidden="true" focusable="false"` |
| `VisibilitySettingsPage.tsx` | Option icons inside `aria-hidden` icon wells | Decorative | `aria-hidden="true" focusable="false"` |
| `LoginPanel.tsx` / `AuthBrand.tsx` | Brand mark / decorative auth illustration | Decorative | `aria-hidden="true" focusable="false"` |

## Regression tests

- `MyTreesEmptyPage.test.tsx`, `AuthPage.test.tsx`: exact-count decorative SVG contract (`aria-hidden` + `focusable`).
- `MyTreesPage.test.tsx`, `MemoryDetailPage.test.tsx`, `VisibilitySettingsPage.test.tsx`, `MemoryConnectPage.test.tsx`, `TreeEditorPage.test.tsx`: every rendered `<svg>` is hidden from AT (self or ancestor) and `focusable="false"`.

## Notes

- Meaningful-image SVGs (would require `role="img"` + accessible name): **none found** in scope.
- `focusable="false"` prevents legacy IE/Edge tab stops on inline SVG; combined with `aria-hidden` it removes decorative graphics from the accessibility tree and tab order.
