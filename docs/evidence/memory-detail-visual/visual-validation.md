# Memory Detail Visual Validation — LT3-MEMORY-002

## Branch Preview URL

- **Branch Preview**: `https://style-memory-detail-visual-r.lovetree3.pages.dev/memory/detail-demo`
- **Deployment Preview**: `https://a22d48fa.lovetree3.pages.dev/memory/detail-demo`
- **Production**: `https://lovetree3.pages.dev/memory/detail-demo`

## Commits

| Item | SHA |
|------|-----|
| Current main | `8f9a24822f57b2a8174d08bbc97f0690f194ede3` |
| Visual source (code) | `388bcf730d06a5c0de9dd980a4326da8d0d2f36a` |
| Evidence (docs) | `034c2bcdce368a760fb06a599cb0c88027950f7e` |
| Merge-main commit | `d0908fe` |
| Semantic test fix | `1955bf9` |
| Desktop CSS fix | `cf56a3e` |
| Scrollbar fix | `3652b52` |
| Final branch head | `3652b52115160a44de85fbe8ed7dd62fce83c13f` |

## Browser / Version

- **Browser**: Chromium (Playwright bundled)
- **User-Agent**: `Chrome/150.0.0.0`

## Reference

- SHA-256: `ab0d3668d3bf8c2dfd2a533e40d8eb952ad8b451d5ea64024c467d6a23e1da3e`
- Resolution: `2816 × 1536`

## Mobile 390px

| Item | Value |
|------|-------|
| Viewport | 390 × 844 |
| DPR | 1 |
| PNG dimensions | 390 × 1523 |
| PNG SHA-256 | `B47998CF9800EA3AA68C9C6061176FCE46595EA7B66E9F460A5D07B6B4A9AA17` |
| Console errors | 0 |
| Page errors | 0 |
| Failed requests | 0 |
| Horizontal overflow | 0px |
| Fixed action bar overlap | None |
| Sticky header overlap | None |
| Tag clipping | None |
| Related memory card clipping | None |

## Desktop 1440px

| Item | Value |
|------|-------|
| Viewport | 1440 × 1000 |
| DPR | 1 |
| PNG dimensions | 1440 × 1736 |
| PNG SHA-256 | `3400CCA398E878223EAA66A4CCAF7CB8D27586CC2BD70F1D2A3E4981DEBD6347` |
| Console errors | 0 |
| Page errors | 0 |
| Failed requests | 0 |
| Horizontal overflow | 0px |
| Desktop 2-column layout | Yes — main area + 360px sidebar |
| Fixed/sticky overlap | None |

## Unimplemented Interactions

- Video play (presentation-only placeholder, no real playback)
- Back button navigation
- More menu
- Share/Edit actual flows
- Like toggle state change (static `aria-pressed=true`)
- Comment section
- No API, Firebase, localStorage, navigation, modal, toast
- No external network requests

## Remaining Visual Differences from Reference

1. Reference uses a blurred photo background in the media placeholder; implementation uses a gradient approximation (presentation-only constraint).
2. Reference has "Relovetree" brand text centered in the header; implementation uses "기억 상세" screen title.
3. Reference shows a pen/write icon next to the Memo body; implementation omits this as non-functional.
4. Related memory cards use vertical layout (thumbnail on top) on mobile matching the reference; desktop uses 2-column grid.
5. Desktop layout: sidebar includes author info, reaction stats, and tree context — not present in the mobile-only reference.
6. Scrollbar is hidden via CSS (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`) on the html element to ensure exact viewport-width screenshots.
