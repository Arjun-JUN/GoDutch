# GoDutch — Security Audit Report

**Date:** 2026-04-03  
**Scope:** Full codebase (`/backend` + `/frontend`) + dependency CVE review  
**Stack:** FastAPI · Python-Jose / PyJWT · Motor/MongoDB · React 19 · Vite 6  

---

## Summary

| Severity | Count |
|---|---|
| **Critical** | 3 |
| **High** | 7 |
| **Medium** | 8 |
| **Low** | 6 |
| **CVE (dependency)** | 9 |

---

## CRITICAL Findings

---

### CRIT-1 — Missing Authorization on `POST /api/expenses` (IDOR)

**File:** `backend/app/routes/expenses.py:12–41`  
**Also:** `backend/server.py:460–489`

`create_expense` never verifies that the authenticated user is a member of the supplied `group_id`. Any authenticated user can create an expense against any group in the system by supplying an arbitrary `group_id`. The group membership check exists only in GET, PUT, and DELETE handlers.

```python
@router.post("", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(verify_token)):
    # NO group membership check
    expense_doc = {
        "group_id": expense_data.group_id,  # attacker-controlled
        ...
    }
    await db.expenses.insert_one(expense_doc)
```

**Remediation:** Before inserting, query `db.groups.find_one({"id": expense_data.group_id, "members.id": current_user["user_id"]})` and raise HTTP 403 if not found.

---

### CRIT-2 — Unauthenticated `POST /api/dev/reset` Destroys Entire Database

**File:** `backend/app/routes/dev.py:10–27`

The `/api/dev/reset` endpoint has no `Depends(verify_token)`. Its only guard checks `os.getenv("ENV", "development") != "development"` — the default value is `"development"`, so the guard passes if `ENV` is unset. Any unauthenticated caller who can reach the API can wipe all users, groups, expenses, transactions, and payments, then re-seed with predictable test data.

The frontend login page exposes a button that calls this endpoint (`frontend/src/pages/AuthPageRedesign.js:179`).

```python
@router.post("/reset")
async def reset_db():          # No verify_token dependency
    if os.getenv("ENV", "development") != "development":  # Default = pass
        raise HTTPException(...)
    await db.users.delete_many({})   # Wipes everything
```

**Remediation:** Either delete this route entirely in non-development builds, or (minimally) require a `Depends(verify_token)` plus an admin role check, and flip the env default to `"production"`.

---

### CRIT-3 — Open Redirect / URL Injection via `upi_url`

**File:** `frontend/src/pages/SettlementsPageRedesign.js:74`  
**Backend:** `backend/app/routes/upi.py:35–36`

The server builds a `upi_url` from user-supplied values without URL-encoding them, and the frontend blindly navigates to the result:

```js
const data = await api.post('/upi/initiate-payment', { upi_id: upiId, ... });
window.location.href = data.upi_url;   // unvalidated redirect
```

```python
upi_url = f"upi://pay?pa={payment.upi_id}&pn=goDutch&am={payment.amount}&cu=INR&tn={payment.note or 'Settlement'}"
```

The `note` field has no length limit or encoding. An attacker can inject `&` characters to append arbitrary query parameters. If the scheme ever becomes `http://` or `javascript:`, this escalates to XSS.

**Remediation:** URL-encode all user-supplied values with `urllib.parse.quote`. On the frontend, validate that `data.upi_url` starts with `upi://` before navigating.

---

## HIGH Findings

---

### HIGH-1 — Bypassable Authorization on UPI Payment Initiation

**File:** `backend/app/routes/upi.py:27–33`  
**Also:** `backend/server.py:586–596`

The ownership check only executes when `len(payment.settlement_id) >= 110`. An attacker supplies a short `settlement_id` and the check is skipped entirely. Even when it runs, it extracts a user ID via a hardcoded string slice (`[37:73]`), which silently produces a wrong result for IDs with unexpected format.

```python
if len(payment.settlement_id) >= 110:
    debtor_id = payment.settlement_id[37:73]
    if debtor_id != current_user['user_id']:
        raise HTTPException(...)
# If len < 110 → check is skipped
```

**Remediation:** Look up the settlement from the database and compare its `debtor_id` field against `current_user["user_id"]`. Do not derive identity from string slicing.

---

### HIGH-2 — JWT Stored in `localStorage` (XSS Token Theft)

**File:** `frontend/src/contexts/AuthContext.js:24–25`  
**File:** `frontend/src/lib/api.js:11`

The 30-day JWT is stored in `localStorage` and accessible to any JavaScript running on the same origin. Any current or future XSS vulnerability enables full token exfiltration and account takeover for up to 30 days.

**Remediation:** Migrate to `HttpOnly` + `SameSite=Strict` cookies. If staying with `localStorage`, reduce token lifetime significantly and implement refresh-token rotation.

---

### HIGH-3 — 30-Day JWT Lifetime with No Server-Side Revocation

**File:** `backend/app/routes/auth.py:39–48`

Tokens expire in 30 days and there is no revocation list, refresh-token mechanism, or logout invalidation endpoint. Frontend logout is purely client-side (`localStorage.removeItem`). A stolen token remains valid for up to 30 days with no way to invalidate it.

**Remediation:** Add a token blocklist (Redis or DB), add a `POST /auth/logout` endpoint that adds the token's `jti` to the blocklist, and reduce token lifetime to 1 hour with a refresh-token flow.

---

### HIGH-4 — `GET /ai/smart-split` Does Not Check Group Membership (IDOR)

**File:** `backend/app/routes/ai.py:56–93`

The AI smart-split endpoint retrieves a group by `group_id` with no membership check:

```python
group = await db.groups.find_one({"id": request.group_id}, {"_id": 0})
# Missing: "members.id": current_user['user_id']
```

Any authenticated user can enumerate group members and receive AI-generated expense splits for any group by guessing UUIDs.

**Remediation:** Add `"members.id": current_user["user_id"]` to the query filter, raise HTTP 403 if not found.

---

### HIGH-5 — Raw Exception Messages Returned to API Clients

**File:** `backend/app/utils/errors.py:20–23`  
**Also:** `backend/server.py:237–240`

The generic error handler includes `str(e)` in HTTP 500 responses, potentially leaking database schema details, internal hostnames, stack traces, and configuration values.

**Remediation:** Log the full exception server-side; return only a generic message to the client (e.g., `"An unexpected error occurred"`).

---

### HIGH-6 — No Rate Limiting on Authentication or Financial Endpoints

**Files:** `backend/app/routes/auth.py`, `backend/app/routes/upi.py`

There is no rate limiting anywhere in the application. The login endpoint allows unlimited password attempts. Financial endpoints (`send-money`, `bill-payment`, `recharge`) have no per-user or per-IP throttle.

**Remediation:** Add `slowapi` (FastAPI-compatible) rate limiting: e.g., 5 attempts/minute on `/auth/login`, 10 requests/minute on financial endpoints.

---

### HIGH-7 — Known-Credential Seed Data Auto-Runs in Non-Production

**File:** `backend/seed.py:18–25`  
**File:** `backend/app/main.py:35–40`

Four user accounts are created with the password `password123`. Seeding runs automatically at startup whenever `ENV != "production"`. The same accounts are also created via the unauthenticated `/dev/reset` endpoint. Frontend login provides buttons that pre-fill these credentials.

**Remediation:** Require `ENV=development` to be set explicitly (not as the default) before seeding. Remove the seed trigger from `main.py` startup. Remove credential pre-fill buttons from the frontend build entirely.

---

## MEDIUM Findings

---

### MED-1 — CORS Allows Any `localhost` Port with Credentials

**File:** `backend/app/main.py:59`  
**Also:** `backend/server.py:1045`

```python
allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
```

With `allow_credentials=True`, any page served from any local port can make credentialed cross-origin requests. If this regex reaches production, it widens the attack surface significantly.

**Remediation:** Use an explicit `allow_origins` list; load from an environment variable. Ensure `allow_credentials=True` is only set when explicitly needed.

---

### MED-2 — Missing Security Headers

**Files:** `backend/app/main.py`, `backend/server.py`

No security headers are set anywhere:
- No `Content-Security-Policy`
- No `X-Frame-Options`
- No `X-Content-Type-Options`
- No `Strict-Transport-Security`
- No `Referrer-Policy`

**Remediation:** Add a middleware (e.g., `secure` library or manual `@app.middleware`) that sets these headers on every response.

---

### MED-3 — `receipt_image` Rendered Unvalidated in `<img src>`

**File:** `backend/app/models/expense.py:25`  
**File:** `frontend/src/pages/ExpenseDetail.js:635–641`

`receipt_image` is stored as a free-form string and rendered in `<img src={expense.receipt_image}>`. External URL references allow attacker to track other users' IPs; a future schema change could enable XSS.

**Remediation:** Validate on backend that the value is either a data URI with an allowed image MIME type or a URL matching a trusted CDN domain. On the frontend, additionally check the prefix before rendering.

---

### MED-4 — `date` Field Accepts Arbitrary Strings

**File:** `backend/app/models/expense.py:20`

No format validation on `date`. The settlements computation slices `expense['date'][:7]` for monthly grouping — an oversized string causes silent corruption.

**Remediation:** Change type to `datetime.date` or apply a regex pattern validator: `Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")`.

---

### MED-5 — `split_type` and `category` Accept Arbitrary Strings (No Enum)

**File:** `backend/app/models/expense.py:23, 26, 38, 41, 50, 52`

Application logic branches on these values but they are unconstrained strings. Invalid values silently bypass business rules.

**Remediation:** Replace with `Literal` or `Enum` types: e.g., `split_type: Literal["equal", "custom", "item-based"]`.

---

### MED-6 — Unbounded `limit` Parameter on `/upi/transactions`

**File:** `backend/app/routes/upi.py:219`  
**Also:** `backend/server.py:810`

```python
async def get_transactions(..., limit: int = 50):
    ...
    .limit(limit).to_list(limit)
```

No maximum enforced. Any authenticated user can set `limit=1000000` to DoS the server.

**Remediation:** Add `limit: int = Query(default=50, le=200)`.

---

### MED-7 — Unvalidated User Object Round-Tripped via `localStorage`

**File:** `frontend/src/contexts/AuthContext.js:14–16`

The server-returned `user` object is stored in and loaded from `localStorage` without schema validation. A successful XSS can inject an arbitrary user object that the application trusts.

**Remediation:** Validate the parsed user object against a schema (e.g., Zod) before trusting it. Better: derive user identity from the JWT itself rather than storing separately.

---

### MED-8 — Two Parallel Backend Implementations (Security Patch Drift Risk)

**Files:** `backend/server.py` (monolith, ~1100 lines) + `backend/app/` (modular)

Both implement the same endpoints. Security fixes applied to one are not automatically reflected in the other, creating a persistent patch-drift risk.

**Remediation:** Remove `server.py` entirely; use only `backend/app/` as the single source of truth.

---

## LOW Findings

---

### LOW-1 — Test JWT Secret Could Leak into Production

**File:** `tests/conftest.py:16`

```python
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-testing")
```

If `JWT_SECRET` is unset in any deployed environment, this default (from test config) would allow forging valid tokens.

**Remediation:** Add a startup assertion that `JWT_SECRET` is set and is at least 32 bytes.

---

### LOW-2 — Dependency Pinning Issues

**File:** `backend/requirements.txt`

- `python-jose>=3.3.0` — unbounded upper version on an unmaintained library with known CVEs.
- `cryptography>=42.0.8` — unbounded; `cryptography` has had critical CVEs.
- `fastapi==0.110.1` and `uvicorn==0.25.0` are pinned to outdated versions.
- Having both `python-jose` and `pyjwt` is confusing; python-jose should be removed.

**Remediation:** Pin all dependencies to exact versions in production. Remove `python-jose` and use `PyJWT` exclusively.

---

### LOW-3 — Dev Credentials Compiled into Frontend if `NODE_ENV` Not Correctly Set

**File:** `frontend/src/pages/AuthPageRedesign.js:160–189`

```js
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => { setEmail('arjun@example.com'); setPassword('password123'); }}>
    Dev: Arjun
  </button>
)}
```

If the Vite build runs without `NODE_ENV=production`, these credentials ship to end users.

**Remediation:** Ensure CI build pipeline explicitly sets `NODE_ENV=production`. Audit the built bundle to confirm the block is tree-shaken.

---

### LOW-4 — No Backend Logout Endpoint

**File:** `backend/app/routes/auth.py`

No `POST /auth/logout` endpoint exists. Frontend logout is purely client-side. Exfiltrated tokens cannot be revoked.

**Remediation:** Add a `POST /auth/logout` that adds the token's `jti` to a server-side blocklist (pairs with HIGH-3 remediation).

---

### LOW-5 — 402 Response Leaks Gemini API Quota Status

**File:** `backend/app/utils/errors.py:13–17`

A 402 error with the message `"Upstream AI service is temporarily unavailable due to quota or billing limits"` reveals internal infrastructure billing state to external callers.

**Remediation:** Return a generic 503 `"Service temporarily unavailable"` without disclosing the reason.

---

### LOW-6 — `mime_type` on OCR Request Passed Unvalidated to Gemini API

**File:** `backend/app/models/ai.py:7`  
**File:** `backend/app/routes/ai.py:41`

The `mime_type` field accepts any string and is forwarded directly to Gemini. While Gemini will reject unknown types, this can be used to probe internal API behavior.

**Remediation:** Restrict to `Literal["image/jpeg", "image/png", "image/webp", "application/pdf"]`.

---

## Dependency CVEs (2024–2026)

### Vulnerable / Affected Dependencies in `requirements.txt` + `package.json`

| CVE | Package | Severity | GoDutch Status | Description |
|---|---|---|---|---|
| **CVE-2024-33663** | python-jose ≤ 3.3.0 | High | **VULNERABLE** | Algorithm confusion with ECDSA keys — JWT signature forgery possible. Library is unmaintained. |
| **CVE-2024-33664** | python-jose ≤ 3.3.0 | High | **VULNERABLE** | JWE zip-bomb: crafted token causes unbounded memory/CPU during decode (DoS on any authenticated endpoint). |
| **CVE-2024-47874** | Starlette < 0.40.0 | High (CVSS 8.7) | **VULNERABLE** | Multipart form fields without a filename are buffered in memory with no size cap — OOM DoS. FastAPI 0.110.1 ships Starlette ~0.37.x. |
| **CVE-2025-54121** | Starlette ≤ 0.47.1 | High | **VULNERABLE** | Large multipart file upload blocks the event thread until file is spooled to disk — server-wide DoS. |
| **CVE-2025-62727** | Starlette 0.39.0–0.49.0 | High | **VULNERABLE** | Crafted `Range` header triggers quadratic CPU usage in `_parse_range_header` — DoS per unauthenticated request. |
| **CVE-2024-53981** | python-multipart < 0.0.18 | High | **LIKELY VULNERABLE** | Malformed multipart boundary causes CPU exhaustion via per-byte logging — DoS. Pinned `>=0.0.9`. |
| **CVE-2025-14847** | MongoDB Server | High (CVSS 8.7) | **CHECK SERVER VERSION** | "MongoBleed": zlib decompression leaks adjacent heap memory (credentials, JWT secrets). Patch server to ≥ 4.4.30 / 7.0.28 / 8.0.17. 87,000+ servers exploited in wild. |
| **CVE-2025-30208** | Vite < 6.2.3 | Medium | **LIKELY VULNERABLE** | `/@fs/` path traversal bypass exposes arbitrary host files — dev server only, but relevant in CI/containers. |
| **CVE-2025-46565** | Vite (multiple) | Medium | **CHECK VERSION** | `/./.env` slash-dot bypass serves denied files including `.env` — dev server only. |

> **Note:** CVE-2024-24762 (FastAPI/multipart ReDoS) is **patched** — pinned to FastAPI 0.110.1.  
> **Note:** CVE-2024-53861 (PyJWT issuer bypass) is **patched** — pinned to PyJWT ≥ 2.10.1.  
> **Note:** CVE-2025-55182 (React Server Components RCE) does **not affect** this app — RSC is not enabled in Vite SPA mode.

### Priority Remediation for CVEs

| Priority | Action |
|---|---|
| **Critical** | Remove `python-jose`; use `PyJWT` exclusively (jose is unmaintained, CVE-2024-33663/33664) |
| **Critical** | Patch MongoDB server to ≥ 4.4.30 / 7.0.28 / 8.0.17 (CVE-2025-14847 / MongoBleed) |
| **High** | Upgrade FastAPI to ≥ 0.115.x (brings Starlette ≥ 0.40.0) — fixes CVE-2024-47874 |
| **High** | Pin `python-multipart >= 0.0.18` — fixes CVE-2024-53981 |
| **High** | Upgrade Starlette to ≥ 0.49.1 — fixes CVE-2025-54121, CVE-2025-62727 |
| **Medium** | Upgrade Vite to ≥ 6.2.3 — fixes CVE-2025-30208, CVE-2025-46565 |

---

## Consolidated Priority List

| Priority | Finding | Effort |
|---|---|---|
| 1 | CRIT-2: Delete or properly gate `/api/dev/reset` | Low |
| 2 | CRIT-1: Add group-membership check to `POST /api/expenses` | Low |
| 3 | HIGH-4: Add group-membership check to `GET /ai/smart-split` | Low |
| 4 | HIGH-1: Fix UPI payment authorization (DB lookup, not string slice) | Low |
| 5 | CVE: Remove `python-jose`, upgrade FastAPI + Starlette + python-multipart | Medium |
| 6 | CRIT-3: URL-encode UPI fields; validate scheme on frontend | Low |
| 7 | HIGH-6: Add `slowapi` rate limiting to auth + financial endpoints | Medium |
| 8 | CVE: Patch MongoDB server (CVE-2025-14847 MongoBleed) | Ops |
| 9 | HIGH-2 + HIGH-3: Move JWT to HttpOnly cookie; add revocation + logout endpoint | High |
| 10 | MED-8: Remove `backend/server.py` monolith | Medium |
| 11 | MED-1: Lock down CORS to explicit origin list | Low |
| 12 | MED-2: Add security headers middleware | Low |
| 13 | HIGH-5: Strip exception details from 500 responses | Low |
| 14 | MED-4/5/6: Add input validation (date format, enums, query limit cap) | Low |
| 15 | CVE: Upgrade Vite ≥ 6.2.3 | Low |
