# Security Risk Register

LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## Risk Matrix

| # | Risk | Severity | Likelihood | Status | Mitigation |
|---|---|---|---|---|---|
| S1 | Token in sessionStorage accessible to XSS | HIGH | LOW | CONFIRMED (by design) | CSP headers, input sanitization, no innerHTML |
| S2 | Firebase web config exposed in client bundle | LOW | CERTAIN | CONFIRMED (by design) | Firebase security rules enforce auth; config is not a secret |
| S3 | No CSRF protection on state-changing endpoints | MEDIUM | LOW | CONFIRMED | Bearer token auth (not cookies) mitigates CSRF; same-origin proxy adds layer |
| S4 | Idempotency key predictable/replayable | MEDIUM | LOW | CONFIRMED | UUID v4 recommended; fingerprint check prevents payload swap |
| S5 | Rate limit bypass via multiple accounts | MEDIUM | MEDIUM | CONFIRMED | Per-actor limits; no IP-based limiting observed |
| S6 | Private tree existence leakage via timing | LOW | LOW | INFERRED | 404 returned uniformly; timing side-channel theoretical |
| S7 | No request signing between CF and Modal | MEDIUM | LOW | CONFIRMED | Server-to-server over HTTPS; MODAL_BASE_URL not exposed to browser |
| S8 | Audit log does not capture IP | LOW | CERTAIN | CONFIRMED (by design) | Privacy-first; request_key_hash allows correlation if needed |
| S9 | Plus tier check relies on Firestore (single source) | MEDIUM | LOW | CONFIRMED | Firestore unavailability → tier unknown → fail-closed (403) |
| S10 | No content sanitization on comment body | MEDIUM | MEDIUM | CONFIRMED | 5000 char limit only; XSS via stored comments possible if frontend renders unsafely |
| S11 | CORS misconfiguration in production | HIGH | UNKNOWN | UNKNOWN | Default origins do not include LoveTree 3.0; production override status unknown |
| S12 | Hub layout positions allow arbitrary coordinates | LOW | CERTAIN | CONFIRMED | Bounded to 1,000,000; finite check; no security impact (visual only) |

---

## Detailed Analysis

### S1: Session Token Storage

**Source:** [js/api/base-api-fetch.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/js/api/base-api-fetch.js)

- Token stored in `sessionStorage` (tab-scoped, cleared on tab close)
- NOT in localStorage (persists across tabs, more XSS-exposed)
- UID binding prevents cross-account token reuse
- 30s expiry buffer prevents use of nearly-expired tokens

**LoveTree 3.0 requirement:** Adopt same pattern. Never store tokens in localStorage or cookies.

### S3: CSRF Posture

- Authentication via `Authorization: Bearer` header (not cookies)
- Browser does not auto-attach Bearer tokens to cross-origin requests
- Same-origin proxy pattern further eliminates cross-origin request vectors
- **No explicit CSRF token mechanism exists or is needed** given Bearer auth

### S4: Idempotency Key Security

**Source:** [modal_compute/social_idempotency.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/social_idempotency.py)

- Key scoped to (actor_id, operation, idempotency_key) — cannot replay another user's key
- SHA-256 fingerprint of body prevents same-key-different-payload attacks
- Replay with same payload returns cached result (safe)
- Key pattern `[A-Za-z0-9._:-]{8,128}` prevents injection

### S10: Comment Body Sanitization

- Backend stores raw body (max 5000 chars)
- No HTML sanitization server-side
- **Frontend MUST escape/sanitize before rendering**
- React's default JSX escaping handles this if `dangerouslySetInnerHTML` is never used
- LoveTree 3.0 must NOT use `dangerouslySetInnerHTML` for user-generated content

### S11: CORS Configuration

**Source:** [modal_compute/config.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/config.py)

Default allowed origins: `lovebud.vercel.app, lovebud.pages.dev, lovebud.netlify.app`

- LoveTree 3.0 domain NOT in defaults
- Production env override: **UNKNOWN**
- **Mitigation:** Use same-origin proxy (recommended architecture) so browser never makes cross-origin calls to Modal
- If direct browser-to-Modal calls are needed, CORS_ALLOWED_ORIGINS must be updated (requires LoveBud team action)

---

## LoveTree 3.0 Security Requirements

| # | Requirement | Priority | Phase |
|---|---|---|---|
| R1 | Never use dangerouslySetInnerHTML for UGC | CRITICAL | All phases |
| R2 | Token in sessionStorage only | HIGH | Phase 1 |
| R3 | UID binding on token cache | HIGH | Phase 1 |
| R4 | 401 retry max 1 attempt | MEDIUM | Phase 1 |
| R5 | Idempotency key = crypto.randomUUID() | HIGH | Phase 1 |
| R6 | Same-origin proxy (no direct Modal calls) | HIGH | Deployment |
| R7 | CSP headers (if deploying independently) | MEDIUM | Deployment |
| R8 | Input validation client-side (mirror server limits) | MEDIUM | Phase 8+ |
| R9 | No secrets in client bundle | CRITICAL | All phases |
| R10 | Firebase config is public (acceptable) but no service account keys | CRITICAL | Phase 2 |

---

## What Was NOT Found (Positive)

- No hardcoded secrets in source
- No SQL injection vectors (parameterized queries throughout)
- No raw token/key storage in audit logs (SHA-256 hash only)
- No PII in error responses
- Leak-safe 404 pattern (no existence disclosure)
- Advisory locks prevent race conditions on social writes
