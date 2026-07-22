# Auth Login — Evidence Commit Metadata

## Commit Trace
1. Visual Source: `18f1b88cf65eccaaddd24a3fa2a2b2055ff3c8e3` — `fix: finalize LT3-AUTH-001 accessibility and button states`
2. Evidence: `f0489a6256d5347ba706ba82c17c509f1d1c2f15` — `docs: add verified LT3-AUTH-001 visual evidence`
3. Metadata: recorded in PR #51 body and final report — `docs: finalize LT3-AUTH-001 evidence metadata`

## Branch Preview
- URL: `https://fix-auth-login-acceptance-46.lovetree3.pages.dev/login`
- Commit-hash URL: `https://03c3dccf.lovetree3.pages.dev`
- Branch: `fix/auth-login-acceptance-46`
- PR: #51 (OPEN/DRAFT)
- Issue: #46 (OPEN)

## Capture Environment
- Browser: Google Chrome 145.0.7632.116 (headless, system binary `/usr/bin/google-chrome-stable`)
- Automation: Playwright (independent headless process, no WebBridge)
- Capture script: `/tmp/kilo/capture.mjs` (outside repository)
- DPR: 1 (all viewports)

## Screenshot Hashes
- `auth-login-desktop-1440x-full.png` (1440×1000 px, 98,786 bytes):
  `5563799d7c3cd8550219e90ab0777a219e0fa983d4dd5863513a1fabd8dee271`
- `auth-login-intermediate-900x-full.png` (900×900 px, 89,169 bytes):
  `698a1ef17a3575fc87081017ac6207054f3129c34e8011726d7c5c65df40b3a4`
- `auth-login-mobile-390x-full.png` (390×901 px, 76,248 bytes):
  `199d1f4d3faef43eeca37ba818776cd3e64ce3104ab589509db9bdf3b9bc3699`

## Tests (at Visual Source Commit `18f1b88`)
- Focused: `AuthPage.test.tsx` — 7/7 passed
- Full repository: 13 files, 331 tests — all passed
- Lint: 0 warnings, 0 errors
- Typecheck: clean
- Build: success
- `git diff --check`: clean
