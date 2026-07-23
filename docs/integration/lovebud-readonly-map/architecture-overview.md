# Architecture Overview

## Request Flow

```
Browser (LoveTree 3.0 SPA)
  │  fetch("/api/...")  [same-origin]
  ▼
Cloudflare Pages Functions (pure proxy, no business logic)
  │  fetch(MODAL_BASE_URL + "/modal/...")  [server-to-server]
  ▼
Modal (FastAPI / Python, serverless)
  │  psycopg3 ConnectionPool
  ▼
PostgreSQL (DATABASE_URL)
```

**Status: CONFIRMED** — [functions/api/[[path]].js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/%5B%5Bpath%5D%5D.js), [modal_compute/app.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/app.py)

## Component Responsibilities

### Cloudflare Pages Functions

- **Role:** Transparent HTTP proxy. No business logic, no DB access.
- **Adds:** `x-lovebud-request-id` (80 chars, `[A-Za-z0-9._:-]`), `x-lovebud-upstream: modal|cloudflare`
- **Limits:** Write body 128KB, Modal fetch timeout 25s
- **Caching:** Public tree read 30s TTL (Cache API), browse summary 420s + 120s SWR
- **Status:** CONFIRMED

### Modal (FastAPI)

- **Role:** All business logic, validation, authorization, DB access.
- **Runtime:** Python serverless on Modal.com
- **DB driver:** psycopg3 with `dict_row` factory
- **Pool:** min=1, max=4, idle timeout=300s
- **Timeouts:** statement=20000ms, connect=10s, pool acquire=15s
- **Status:** CONFIRMED — [modal_compute/db.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/db.py)

### PostgreSQL

- **Driver:** psycopg3 (`psycopg[binary,pool]`)
- **Connection:** `DATABASE_URL` environment variable
- **Row factory:** `dict_row` (column-name-keyed dicts)
- **Status:** CONFIRMED_IN_SOURCE

### Neon (Database Provider)

- **Evidence:** Project documentation and configuration references identify Neon as the PostgreSQL provider.
- **Production identity:** The actual production database instance, region, and current schema state cannot be verified without runtime access.
- **Status:** INFERRED (provider identity), PRODUCTION_STATUS_UNKNOWN (actual schema state)

## Authentication Layer

```
Browser → Firebase Auth SDK (Google OAuth)
  → user.getIdTokenResult() → JWT
  → Authorization: Bearer <JWT>
  → Cloudflare (pass-through, no token inspection)
  → Modal auth.py:
      1. Decode JWT header → kid
      2. Fetch Google public certs (cached)
      3. Verify signature, exp, iss, aud
      4. Extract uid (sub claim)
      5. Firestore: fetch user profile (displayName, photoURL, tier)
```

**Status:** CONFIRMED — [modal_compute/auth.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/auth.py)

## CORS Configuration

Modal default `CORS_ALLOWED_ORIGINS`: `lovebud.vercel.app, lovebud.pages.dev, lovebud.netlify.app`

- LoveTree 3.0 domain is **not** in the default list.
- Production environment override: **UNKNOWN** (cannot verify without runtime access).
- **Recommended architecture:** If LoveTree 3.0 is deployed behind a same-origin `/api` proxy (Cloudflare Pages Functions or equivalent), browser-to-Modal CORS changes are unnecessary because the browser never makes cross-origin calls to Modal directly.
- **Direct cross-origin Modal calls from browser are NOT recommended.**

**Status:** CONFIRMED (default origins in source), UNKNOWN (production override)

Source: [modal_compute/config.py](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/modal_compute/config.py)

## Deprecated Infrastructure

- **Vercel:** `vercel.json` exists with legacy page routing. Not active.
- **Netlify:** Referenced in CORS defaults. Not active.
- **Status:** CONFIRMED (deprecated, present in source)

## Scout AI (Separate Subsystem)

- Runs entirely in Cloudflare Pages Functions (no Modal involvement).
- Default mode: `stub` (deterministic, no network, no secrets).
- Live mode: requires 7+ env vars, `stage ∈ {staging, test}` (production hard-blocked).
- `save-memory` returns 202 with `persistence: "gated"` — no actual DB write.
- **Status:** CONFIRMED (stub), NOT_IMPLEMENTED (live persistence)
