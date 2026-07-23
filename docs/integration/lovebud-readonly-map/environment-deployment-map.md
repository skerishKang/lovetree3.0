# Environment & Deployment Map

LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## Deployment Topology

```
[Browser]
    |
    v
[Cloudflare Pages] (static assets + Pages Functions)
    |
    v (server-to-server fetch)
[Modal.com] (serverless Python/FastAPI)
    |
    v (psycopg3 pool)
[PostgreSQL] (DATABASE_URL)

[Browser] --> [Firebase Auth] (Google OAuth, token issuance)
[Modal]   --> [Firebase Admin] (token verification, Firestore user profile)
```

**Status: CONFIRMED** (architecture from source), **UNKNOWN** (production deployment specifics)

---

## Environment Variables

### Modal (Python)

| Variable | Purpose | Default | Source | Status |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | None (required) | [db.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/db.py) | CONFIRMED (name), UNKNOWN (value) |
| `FIREBASE_PROJECT_ID` | Firebase project for JWT aud verification | `relovetree` | [config.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/config.py) | CONFIRMED |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `lovebud.vercel.app,lovebud.pages.dev,lovebud.netlify.app` | [config.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/config.py) | CONFIRMED (default), UNKNOWN (production override) |
| `MODAL_BASE_URL` | Modal function URL (for CF proxy) | None (required by CF) | [functions/api/[[path]].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/%5B%5Bpath%5D%5D.js) | CONFIRMED (name), UNKNOWN (value) |

### Cloudflare Pages Functions (Node.js)

| Variable | Purpose | Source | Status |
|---|---|---|---|
| `MODAL_BASE_URL` | Target for server-to-server proxy | functions/api/[[path]].js | CONFIRMED (name) |

### Scout AI (Cloudflare-only)

| Variable | Purpose | Source | Status |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Live AI mode (primary) | functions/api/scout/suggest.js | CONFIRMED (name) |
| `OPENAI_API_KEY` | Live AI mode (fallback) | functions/api/scout/suggest.js | CONFIRMED (name) |
| `SCOUT_MODE` | `stub` (default) or `live` | functions/api/scout/suggest.js | CONFIRMED |

### Firebase (Client)

| Variable | Purpose | Source | Status |
|---|---|---|---|
| Firebase web config | Project/auth initialization | [js/firebase-config.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/js/firebase-config.js) | CONFIRMED (exists), values NOT reproduced |

Note: Firebase web config is public by design (identifies project, not a secret). However, per policy, actual values are not copied into this documentation.

---

## Database Configuration

| Parameter | Value | Source |
|---|---|---|
| Driver | psycopg3 (`psycopg[binary,pool]`) | requirements.txt |
| Pool min | 1 | db.py |
| Pool max | 4 | db.py |
| Pool idle timeout | 300s | db.py |
| Statement timeout | 20000ms | db.py |
| Connect timeout | 10s | db.py |
| Pool acquire timeout | 15s | db.py |
| Row factory | dict_row | db.py |

**Status: CONFIRMED**

### Database Provider

- Evidence for Neon: project documentation, connection string format references
- Production DB identity: **UNKNOWN** (cannot verify without runtime access)
- Current production schema state: **PRODUCTION_STATUS_UNKNOWN**

---

## Cloudflare Pages Configuration

| Aspect | Value | Status |
|---|---|---|
| Static hosting | Cloudflare Pages | CONFIRMED |
| Functions runtime | Cloudflare Pages Functions (Node.js) | CONFIRMED |
| Cache API | Used for public reads (30s trees, 420s browse) | CONFIRMED |
| Body size limit | 128KB (write endpoints) | CONFIRMED |
| Proxy timeout | 25s (Modal fetch) | CONFIRMED |

---

## Modal Configuration

| Aspect | Value | Status |
|---|---|---|
| Framework | FastAPI | CONFIRMED |
| Python deps | psycopg[binary,pool], pyjwt, firebase-admin, httpx | CONFIRMED (requirements.txt) |
| CORS | Configured in app.py with env override | CONFIRMED |
| Auth middleware | Firebase JWT verification on protected routes | CONFIRMED |

---

## LoveTree 3.0 Deployment Considerations

### Option A: Same Cloudflare Pages Project

- Add LoveTree 3.0 routes to existing LoveBud Pages project
- Reuse existing Pages Functions (proxy already handles /api/*)
- No CORS changes needed (same-origin)
- **Risk:** Couples deployments

### Option B: Separate Deployment + Same-Origin Proxy (Recommended)

- Deploy LoveTree 3.0 independently on Cloudflare Pages
- Add `functions/api/**` proxy that forwards to LoveBud public API origin
- Proxy target: `LOVEBUD_API_BASE_URL` (Cloudflare server environment only)
- LoveTree proxy calls LoveBud's `/api/**` public routes, NOT Modal directly
- No CORS changes needed (browser sees same-origin; server-to-server call to LoveBud origin)
- Production Modal CORS is NOT a blocker for LoveTree screen implementation

### Option C: Direct Cross-Origin to Modal

- NOT recommended
- Would require CORS_ALLOWED_ORIGINS production override
- Exposes Modal URL to browser
- Security and coupling concerns
- Bypasses LoveBud's existing caching, body limit, request ID, and error boundary policies

### LoveTree 3.0 Environment Variables (Proposed)

| Variable | Purpose | Scope | Status |
|---|---|---|---|
| `LOVEBUD_API_BASE_URL` | LoveBud public API origin for server-to-server proxy | Cloudflare server environment ONLY | PROPOSED (name only, value not recorded) |

This variable MUST NOT appear in browser bundle. It is server-side only.

---

## CI/CD

| Aspect | Status |
|---|---|
| GitHub Actions | NOT USED (billing/runner issue) |
| LoveBud test command | `npm test` (smoke + routes + contracts) |
| LoveTree 3.0 test command | `npm test` (vitest) |
| Deployment automation | UNKNOWN (no workflow files inspected) |
