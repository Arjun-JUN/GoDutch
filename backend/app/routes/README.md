# backend/app/routes

> Feature-scoped FastAPI routers: one file per product domain, each handling request parsing, auth, business logic, and DB writes.

## Overview

Each file in this directory is an `APIRouter` for one product domain. The pattern is uniform: validate the JWT (`Depends(verify_token)`), deserialize the request body against a model from `../models/`, apply business logic inline or via `../utils/`, read/write MongoDB through `../database.py`, and return a response model.

There is intentionally no service layer between routes and the database — the app is small enough that the added indirection would be friction without benefit.

## How it works

1. `main.py` imports each router and calls `app.include_router(router, prefix="/api/<domain>")`.
2. A request arrives; FastAPI deserializes it against the declared Pydantic model. Invalid input is rejected with 422 before the handler runs.
3. The handler calls `Depends(verify_token)` — invalid/missing JWT returns 401.
4. Business logic runs (calculations, Gemini calls for AI routes).
5. MongoDB is read/written via Motor async calls.
6. The handler returns a dict or Pydantic model that FastAPI serializes to JSON.

## Key files

| File | Prefix | What it handles |
|------|--------|----------------|
| `auth.py` | `/api/auth` | Register, login, JWT issuance |
| `groups.py` | `/api/groups` | CRUD groups, member management, expense listing |
| `expenses.py` | `/api/expenses` | CRUD expenses, item-level splits, receipt images |
| `settlements.py` | `/api/groups/{id}` | Balance calculation, minimized settlement algorithm |
| `upi.py` | `/api/upi` | Bank accounts, send/request money, transactions, bill pay |
| `ai.py` | `/api/ai` + `/api/ocr` | OCR receipt scan, natural-language smart split |
| `dev.py` | `/api/dev` | Dev/seeding helpers (not for production) |

## Inputs & Outputs

**Takes in:** HTTP requests with JWT in `Authorization: Bearer <token>` header; JSON request bodies.
**Emits:** JSON responses; MongoDB writes; Gemini API calls (via `ai.py`).

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/main.py` | `include_router()` at startup |
| Upstream | HTTP clients (frontend, mobile) | REST calls |
| Downstream | `app/models/` | Pydantic model instantiation |
| Downstream | `app/utils/ai_helpers.py` | OCR and smart-split logic |
| Downstream | `app/database.py` | MongoDB collection access |
| Downstream | `app/dependencies.py` | `verify_token` on every protected endpoint |

## Gotchas

- `settlements.py` has no own collection — balances are calculated on-demand from the `expenses` collection. This is correct by design (no stale state) but means heavy groups will be slow without an index on `group_id`.
- `dev.py` endpoints are unauthenticated and must never be reachable in production. Gate them with an env flag if deploying publicly.
- Receipt images in `expenses.py` are passed as base64 strings directly in the JSON body. Large receipts can make request payloads very large.

## Further reading

- [models/](../models/README.md) — Pydantic schemas for each domain
- [utils/](../utils/README.md) — AI helpers
- [../../../tests/unit/](../../../tests/unit/README.md) — unit tests for routes
- [../../../tests/integration/](../../../tests/integration/README.md) — integration tests
