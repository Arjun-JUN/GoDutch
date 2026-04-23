# Security Audit Report — GoDutch

**Date:** 2026-04-05  
**Scope:** Full codebase review + dependency CVE scan  
**Auditor:** Automated security review

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 6 |
| Medium   | 4 |
| Low      | 2 |

---

## Critical

### C001 — Unauthenticated Database Reset Endpoint

**File:** `backend/app/routes/dev.py:10-27`  
**Type:** Broken Access Control (OWASP A01)

The `/api/dev/reset` endpoint has **no authentication**. It only checks if `ENV != "production"` — meaning any unauthenticated user on a staging, CI, or misconfigured deployment can wipe and reseed the entire database.

```python
@router.post("/reset")
async def reset_db():
    if os.getenv("ENV", "development") != "development":  # No auth check!
        raise HTTPException(...)
    await db.users.delete_many({})
    ...
```

**Fix:** Add `Depends(verify_token)` and additionally require an admin role check. Or remove the route entirely from non-local builds.

---

### C002 — UPI Payment Auth Check Trivially Bypassable

**File:** `backend/app/routes/upi.py:27-33`  
**Type:** Broken Access Control / Logic Flaw (OWASP A01)

The ownership check on payment initiation is gated on `len(payment.settlement_id) >= 110`. If an attacker sends a `settlement_id` shorter than 110 characters, the entire authorization check is **skipped**. An attacker can initiate payments on behalf of any user.

```python
if len(payment.settlement_id) >= 110:   # Skipped if short ID!
    debtor_id = payment.settlement_id[37:73]
    if debtor_id != current_user['user_id']:
        raise HTTPException(status_code=403, ...)
# No auth check if settlement_id < 110 chars
```

**Fix:** Always validate ownership. Don't encode authorization data into string offsets. Fetch the settlement record from the database and compare `from_user_id` against `current_user['user_id']`.

---

## High

### H001 — Missing Group Membership Check on Expense Creation

**File:** `backend/app/routes/expenses.py:12-41`  
**Type:** Insecure Direct Object Reference / Broken Access Control (OWASP A01)

`POST /api/expenses` does not verify the requesting user is a member of the target group. An authenticated user can create expenses in any group by supplying a guessed `group_id`.

```python
@router.post("", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(verify_token)):
    # No group membership check before insert!
    await db.expenses.insert_one(expense_doc)
```

Compare with `GET /{group_id}/expenses` which correctly checks membership. This endpoint omits it entirely.

**Fix:** Add a membership check before inserting:
```python
group = await db.groups.find_one({"id": expense_data.group_id, "members.id": current_user['user_id']}, {"_id": 0})
if not group:
    raise HTTPException(status_code=403, detail="Not a member of this group")
```

---

### H002 — AI Prompt Injection via Smart Split

**File:** `backend/app/routes/ai.py:62-88`  
**Type:** Prompt Injection (OWASP A03 / LLM01)

User-controlled inputs `request.instruction` and `request.expense_context` are directly concatenated into the Gemini AI prompt with no sanitization. An attacker can override system instructions to exfiltrate group member data, manipulate split assignments, or cause unintended AI behaviour.

```python
f"Instruction: {request.instruction}\n"    # Unsanitized user input
f"{context}"                                # Unsanitized user input
```

**Fix:** Use structured message formats to separate system context from user input. Validate and sanitize `instruction` length and content. Never concatenate user strings directly into the system portion of AI prompts.

---

### H003 — python-jose CVE-2024-33663 & CVE-2024-33664 (Algorithm Confusion + JWT Bomb)

**File:** `backend/requirements.txt:22`  
**Type:** Vulnerable Dependency (OWASP A06)

`python-jose>=3.3.0` resolves to **3.3.0**, the latest and final release. Two unpatched CVEs apply:

- **CVE-2024-33663** (CVSS 8.8 — High): Algorithm confusion with OpenSSH ECDSA keys allows signature forgery / authentication bypass.
- **CVE-2024-33664** (CVSS 7.5 — High): Malformed JWE token with high compression ratio causes unbounded memory allocation (JWT bomb DoS).

`python-jose` is **unmaintained** — no patch release exists or is expected.

**Fix:** Remove `python-jose` from `requirements.txt`. The project already uses `pyjwt` for all JWT operations (`backend/app/routes/auth.py`, `backend/app/dependencies.py`). Audit all `from jose import` usages and replace with `pyjwt` equivalents.

---

### H004 — Vite CVE-2025-30208 & CVE-2025-46565 (Arbitrary File Read)

**File:** `frontend/package.json:84`  
**Type:** Vulnerable Dependency (OWASP A06)

`"vite": "^6.0.0"` may resolve to versions below the security patches:

- **CVE-2025-30208** (CVSS 7.5 — High): Versions < 6.0.12 allow path traversal via `/@fs/` URLs with `?import&raw??` suffix to read arbitrary files from the filesystem (including `.env` files containing secrets).
- **CVE-2025-46565** (Medium): Slash-dot (`/./.env`) bypass of Vite's deny list for `.env` and other sensitive files.

**Fix:** Pin `"vite": "^6.2.3"` (minimum `6.0.12`) in `frontend/package.json`. Run `pnpm update vite` to apply.

---

### H005 — python-multipart CVE-2024-53981 (DoS via Malformed Multipart Boundary)

**File:** `backend/requirements.txt:26`  
**Type:** Vulnerable Dependency / DoS (OWASP A06)

`python-multipart>=0.0.9` may resolve to versions below 0.0.18. CVE-2024-53981 causes extreme CPU load when the server processes multipart data with content before/after the boundary, stalling FastAPI's async event loop.

**Fix:** Pin to `python-multipart>=0.0.18` in `requirements.txt`.

---

### H006 — No Rate Limiting on Auth and AI Endpoints

**File:** `backend/app/routes/auth.py`, `backend/app/routes/ai.py`  
**Type:** Lack of Resource & Rate Limiting (OWASP A05)

- `/api/auth/login` has no brute-force protection. Attackers can enumerate passwords without restriction.
- `/api/ai/ocr/scan` and `/api/ai/smart-split` call the Gemini API with no per-user rate limiting, enabling cost exhaustion attacks by any authenticated user.

**Fix:** Add `slowapi` (or equivalent) rate limiting middleware. Example: 10 requests/minute on auth endpoints, 20 requests/hour per user on AI endpoints.

---

## Medium

### M001 — Unvalidated MIME Type in OCR Endpoint

**File:** `backend/app/routes/ai.py:14-51`, `backend/app/models/ai.py:5-7`  
**Type:** Insufficient Input Validation (OWASP A03)

`OCRRequest.mime_type` is a free-form string with no validation. It is passed directly to the Gemini API. An attacker could supply arbitrary MIME types to probe API behaviour or trigger unexpected responses.

**Fix:** Validate `mime_type` against an allowlist:
```python
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
if request.mime_type not in ALLOWED_MIME_TYPES:
    raise HTTPException(status_code=400, detail="Unsupported image type")
```

---

### M002 — Unbounded `limit` Parameter on Transaction Query

**File:** `backend/app/routes/upi.py:219`  
**Type:** Lack of Resource Limiting (OWASP A05)

```python
async def get_transactions(current_user: dict = Depends(verify_token), limit: int = 50):
    ...to_list(limit)
```

A user can pass `limit=10000000`, causing the server to attempt to load millions of documents into memory.

**Fix:** Cap the limit:
```python
limit: int = Query(default=50, ge=1, le=200)
```

---

### M003 — CORS Regex Allows Any Localhost Port

**File:** `backend/app/main.py:59`  
**Type:** Security Misconfiguration (OWASP A05)

```python
allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
```

This regex permits any port on localhost/127.0.0.1 (e.g., `http://localhost:8080`, `http://localhost:1337`). In environments where other services run on localhost (CI servers, shared dev machines), this can allow unintended cross-origin requests.

**Fix:** Restrict to known ports only, or remove `allow_origin_regex` and rely solely on the explicit `cors_origins` list from the environment variable.

---

### M004 — Known Bug B003: Any User Can Settle for Anyone

**File:** `backend/app/routes/settlements.py` (noted in `PQ_BUGS_LOG.md`)  
**Type:** Broken Access Control (OWASP A01)

Acknowledged open bug. The settlement computation endpoint does not enforce that the requesting user can only mark themselves as having settled. Any group member can trigger settlements for other members.

**Fix:** When recording settlement state, verify `current_user['user_id'] == from_user_id` in the settlement record.

---

## Low

### L001 — No JWT Token Revocation Mechanism

**File:** `backend/app/dependencies.py`  
**Type:** Broken Authentication (OWASP A07)

JWTs are valid for 30 days with no server-side revocation. Compromised tokens remain valid until expiry. There is no logout mechanism that invalidates tokens.

**Fix:** Implement a token denylist (Redis set or DB collection) checked on each request, or use short-lived access tokens (15 min) with refresh tokens.

---

### L002 — Gemini API Key Logged in URL on Error

**File:** `backend/app/utils/ai_helpers.py:34`  
**Type:** Sensitive Data Exposure (OWASP A02)

```python
url = f"https://generativelanguage.googleapis.com/...?key={GEMINI_API_KEY}"
```

If this URL appears in error logs, stack traces, or HTTP error responses, the API key is exposed. FastAPI's default exception handler can include request URLs in some configurations.

**Fix:** Move the API key to a request header instead of a query parameter:
```python
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
headers = {"x-goog-api-key": GEMINI_API_KEY}
response = session.post(url, json=payload, headers=headers, timeout=60)
```

---

## Dependency Vulnerability Summary

| Package | Pinned Version | CVE | Severity | Status |
|---------|----------------|-----|----------|--------|
| `python-jose` | `>=3.3.0` (→3.3.0) | CVE-2024-33663 | High | **VULNERABLE** — no patch; remove package |
| `python-jose` | `>=3.3.0` (→3.3.0) | CVE-2024-33664 | High | **VULNERABLE** — no patch; remove package |
| `vite` | `^6.0.0` | CVE-2025-30208 | High | **POTENTIALLY VULNERABLE** if <6.0.12 |
| `vite` | `^6.0.0` | CVE-2025-46565 | Medium | **POTENTIALLY VULNERABLE** if <patched version |
| `python-multipart` | `>=0.0.9` | CVE-2024-53981 | High | **POTENTIALLY VULNERABLE** if <0.0.18 |
| `pyjwt` | `>=2.10.1` | CVE-2024-53861 | Low | **NOT AFFECTED** — fixed in 2.10.1 |
| `fastapi` | `==0.110.1` | CVE-2024-24762 | Medium | **NOT AFFECTED** — fixed in 0.109.1 |
| `react` | `^19.0.0` | CVE-2025-55182 | Critical | **NOT AFFECTED** — no React Server Components used |
| MongoDB Server | (driver only) | CVE-2025-14847 | High | Server-side; patch MongoDB server if self-hosted |

---

## Recommended Fix Priority

1. **C001** — Add auth to `/api/dev/reset` immediately (1-line fix)
2. **C002** — Rewrite UPI payment ownership check (remove string-offset auth)
3. **H001** — Add group membership check to `POST /api/expenses`
4. **H003** — Remove `python-jose` from `requirements.txt`
5. **H004** — Pin `vite` to `^6.2.3`
6. **H005** — Pin `python-multipart` to `>=0.0.18`
7. **H002** — Add prompt injection mitigations to smart-split
8. **H006** — Add rate limiting via `slowapi`
9. **L002** — Move Gemini API key to request header
10. **M001** — Validate MIME type allowlist on OCR endpoint
