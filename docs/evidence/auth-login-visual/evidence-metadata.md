# LT3-AUTH-001 — Evidence Metadata

## Commit Information

| Field | Value |
|---|---|
| **Code commit SHA** | f7babe54fd7c847b56b781d219ff6e1b60be8e04 |
| **Evidence commit SHA** | (to be recorded when evidence is committed) |
| **Metadata commit SHA** | (to be recorded when metadata is committed) |

## Repository State

| Field | Value |
|---|---|
| **Repository** | skerishKang/lovetree3.0 |
| **Branch** | style/auth-login-visual-refinement |
| **Base SHA** | 9ddaa69388574af7f60d172c0ec6fb7ce405ff04 |
| **Parent commits** | 1 (origin/main) |

## File Changes

| File | Status |
|---|---|
| `src/data/authMockData.ts` | Modified |
| `src/components/AuthBrand.tsx` | Modified |
| `src/components/AuthBrand.module.css` | Modified |
| `src/components/LoginPanel.tsx` | Modified |
| `src/components/LoginPanel.module.css` | Modified |
| `src/components/SocialLoginButton.tsx` | Modified |
| `src/components/SocialLoginButton.module.css` | Modified |
| `src/components/AuthLoginPage.tsx` | Modified |
| `src/components/AuthLoginPage.module.css` | Modified |
| `src/components/AuthLegalNotice.tsx` | Unchanged |
| `src/components/AuthLegalNotice.module.css` | Unchanged |
| `src/components/AuthPage.test.tsx` | Modified |
| `src/components/MediaSearchPage.test.tsx` | Modified (regression test update) |
| `src/components/MemoryDetailPage.test.tsx` | Modified (regression test update) |
| `src/components/MyTreesEmptyPage.test.tsx` | Modified (regression test update) |
| `src/components/MyTreesPage.test.tsx` | Modified (regression test update) |
| `src/components/TreeEditorPage.test.tsx` | Modified (regression test update) |
| `src/components/VisibilitySettingsPage.test.tsx` | Modified (regression test update) |
| `src/components/EmptyTreeEditorPage.test.tsx` | Modified (regression test update) |

## Screenshot Information

| File | Dimensions | DPR | Bytes | SHA-256 |
|---|---|---|---|---|
| `auth-login-desktop-1440x-full.png` | 1440 × 1000 | 1 | (pending) | (pending) |
| `auth-login-intermediate-900x-full.png` | 900 × 900 | 1 | (pending) | (pending) |
| `auth-login-mobile-390x-full.png` | 390 × 844 | 1 | (pending) | (pending) |

## Verification Results

| Check | Result |
|---|---|
| `npm run test -- AuthPage.test.tsx` | 17 passed |
| `npm run test` | 288 passed |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Success |
| `git diff --check` | Clean |

## Browser Information

- **Browser:** HeadlessChrome/150.0.0.0
- **DPR:** 1 (CSS pixels)

## Console / Network Errors

- Console errors: 0
- Page errors: 0
- Failed requests: 0

## Horizontal Overflow

- Desktop: 0px
- Intermediate: 0px
- Mobile: 0px

## DOM Contract Counts

| Element | Count |
|---|---|
| LoveTree (brand) | 1 |
| h1 (heading) | 1 |
| Description (p) | 1 |
| Google login button | 1 |
| Email login button | 1 |
| Value items | 3 |
| Legal notice | 1 |
| dialog/alertdialog/alert | 0 |

## Side-Effect Spy Verification

All spies installed before render, all call counts = 0:
- `fetch`
- `XMLHttpRequest.prototype.open`
- `Storage.prototype.getItem`
- `Storage.prototype.setItem`
- `Storage.prototype.removeItem`
- `Storage.prototype.clear`
- `window.open`

## Implementation Notes

- No OAuth popup or redirect
- No Firebase/Auth/API connections
- No session, localStorage, or sessionStorage usage
- No secrets, tokens, or password handling
- Profile preview shows static mock data only

## References

- Issue: #46
- Reference image: `docs/reference/screens/08-auth/login-my-page-mobile.png`
- Reference SHA-256: `597fe871c22745213d4bd7cc65c2035b743dcd1c69661bd52f2e71c18733ea1b`