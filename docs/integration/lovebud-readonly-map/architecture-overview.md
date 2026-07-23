# Architecture Overview

LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.
LoveTree 3.0 base: `f321d9933ce5b470958f46e4ff2ccbcab314b11e`.

---

## 1. LoveBud Current Architecture

**Status: CONFIRMED**

```
Browser (LoveBud SPA)
  |  fetch("/api/...")  [same-origin]
  v
LoveBud Cloudflare Pages Functions (pure proxy, no business logic)
  |  fetch(MODAL_BASE_URL + "/modal/...")  [server-to-server]
  v
Modal (FastAPI / Python, serverless)
  |  psycopg3 ConnectionPool
  v
PostgreSQL (DATABASE_URL)
```

Source: [functions/api/[[path]].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/%5B%5Bpath%5D%5D.js), [modal_compute/app.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/app.py)

### Component Responsibilities

| Component | Role | Status |
|---|---|---|
| Cloudflare Pages Functions | Transparent HTTP proxy. No business logic, no DB access. Adds `x-lovebud-request-id`, `x-lovebud-upstream`. 128KB write body limit. 25s Modal fetch timeout. Cache API (30s trees, 420s browse). | CONFIRMED |
| Modal (FastAPI) | All business logic, validation, authorization, DB access. Python serverless. psycopg3 dict_row. Pool min=1 max=4. Statement timeout 20s. | CONFIRMED |
| PostgreSQL | psycopg3 driver. `DATABASE_URL` env var. dict_row factory. | CONFIRMED_IN_SOURCE |
| Neon (provider) | Identified by project documentation/config references. Production instance/region/schema state unverifiable. | INFERRED (identity), PRODUCTION_STATUS_UNKNOWN (schema) |

### Authentication Layer

```
Browser -> Firebase Auth SDK (Google OAuth)
  -> user.getIdTokenResult() -> JWT
  -> Authorization: Bearer <JWT>
  -> Cloudflare (pass-through, no token inspection)
  -> Modal auth.py:
      1. Decode JWT header -> kid
      2. Fetch Google public certs (cached)
      3. Verify signature, exp, iss, aud
      4. Extract uid (sub claim)
      5. Firestore: fetch user profile (displayName, photoURL, tier)
```

**Status: CONFIRMED** — [modal_compute/auth.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/auth.py)

### CORS Configuration

Modal default `CORS_ALLOWED_ORIGINS`: `lovebud.vercel.app, lovebud.pages.dev, lovebud.netlify.app`

- LoveTree 3.0 domain is NOT in the default list.
- Production environment override: **UNKNOWN** (cannot verify without runtime access).
- If LoveTree 3.0 uses a same-origin `/api` proxy, browser-to-Modal CORS changes are unnecessary.
- Direct cross-origin Modal calls from browser are NOT recommended.

**Status:** CONFIRMED (default origins), UNKNOWN (production override)

Source: [modal_compute/config.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/config.py)

### Deprecated Infrastructure

- Vercel: `vercel.json` exists with legacy routing. Not active.
- Netlify: Referenced in CORS defaults. Not active.
- **Status:** CONFIRMED (deprecated, present in source)

### Scout AI (Separate Subsystem)

- Runs entirely in Cloudflare Pages Functions (no Modal involvement).
- Default mode: `stub` (deterministic, no network, no secrets).
- Live mode: requires 7+ env vars, `stage in {staging, test}` (production hard-blocked).
- `save-memory` returns 202 with `persistence: "gated"` — no actual DB write.
- **Status:** CONFIRMED (stub), NOT_IMPLEMENTED (live persistence)

---

## 2. LoveTree 3.0 Current Architecture

**Status: CONFIRMED**

```
Browser
  |
  v
Vite React SPA (static build)
  |
  v
Static mock data imports (src/data/*.ts)
```

LoveTree 3.0 at `f321d99` is a **static UI prototype** with zero network capability:

| Capability | Status |
|---|---|
| `functions/api/**` (Cloudflare Pages Functions) | NOT_IMPLEMENTED |
| Same-origin API proxy | NOT_IMPLEMENTED |
| API client (`src/api/**`) | NOT_IMPLEMENTED |
| Firebase SDK bootstrap | NOT_IMPLEMENTED |
| Auth provider/context | NOT_IMPLEMENTED |
| Real network data connection | NOT_IMPLEMENTED |
| Mock data imports | STATIC_UI_IMPLEMENTED / MOCK_DATA_ONLY |

All 12 routes render from `src/data/*.ts` mock constants. Tests enforce `globalThis.fetch` never-called (zero-network guarantee).

**No proxy exists. No API client exists. No auth exists.**

---

## 3. Proposed LoveTree 3.0 Target Architecture

**Status: PROPOSED / NOT_IMPLEMENTED**

```
Browser (LoveTree 3.0 SPA)
  |  fetch("/api/...")  [same-origin]
  v
LoveTree Cloudflare Pages Function proxy (TO BE IMPLEMENTED)
  |  fetch(UPSTREAM_URL + path)  [server-to-server]
  v
LoveBud public API or Modal
  |
  v
PostgreSQL
```

This architecture does NOT exist yet. It requires:
1. Cloudflare Pages deployment for LoveTree 3.0
2. `functions/api/**` proxy implementation (see implementation-issue-plan.md Issue 2)
3. API client layer in `src/api/**`
4. Firebase Auth SDK integration
5. Environment variable configuration for upstream URL

**Do not reference this as CONFIRMED. It is a design proposal only.**

### Why Same-Origin Proxy

- Browser never calls Modal directly (no CORS changes needed on LoveBud)
- Upstream URL stays server-side (not exposed in client bundle)
- Authorization/Idempotency-Key headers forwarded transparently
- 128KB body limit enforceable at proxy layer
- Request ID generation/forwarding at proxy layer

### Vite Dev Proxy Note

Vite's `server.proxy` config is for local development only. It does NOT replace the production Cloudflare Pages Function proxy. Production requires an actual `functions/api/**` implementation.

---

## Summary of Architecture States

| Layer | LoveBud | LoveTree 3.0 Current | LoveTree 3.0 Target |
|---|---|---|---|
| UI | CONFIRMED (SPA) | CONFIRMED (static mock) | CONFIRMED (same components) |
| API Proxy | CONFIRMED (CF Pages Functions) | NOT_IMPLEMENTED | PROPOSED |
| API Client | CONFIRMED (js/api/) | NOT_IMPLEMENTED | PROPOSED |
| Auth | CONFIRMED (Firebase + Modal) | NOT_IMPLEMENTED | PROPOSED |
| Backend | CONFIRMED (Modal FastAPI) | N/A (uses LoveBud) | N/A (uses LoveBud) |
| Database | CONFIRMED_IN_SOURCE | N/A | N/A |
