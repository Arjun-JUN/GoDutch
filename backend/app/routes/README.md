# backend/app/routes

> Feature-scoped FastAPI routers: one file per product domain, each handling request parsing, auth, business logic, and DB writes.

## Overview

Each file in this directory is an `APIRouter` for one product domain. The pattern is uniform: validate the JWT with `Depends(verify_token)`, deserialize the request body against a model from `../models/`, apply business logic inline or via `../utils/`, read and write MongoDB through `../database.py`, and return a response model.

There is intentionally no service layer between routes and the database. The app is still small enough that the added indirection would create friction without adding much value.

## How it works

1. `main.py` imports each router and calls `app.include_router(router, prefix="/api/<domain>")`.
2. A request arrives and FastAPI deserializes it against the declared Pydantic model.
3. The handler calls `Depends(verify_token)` and rejects invalid or missing JWTs with `401`.
4. Business logic runs, including calculations or Gemini calls for AI routes.
5. MongoDB is read and written via Motor async calls.
6. FastAPI serializes the returned dict or model to JSON.

## Key files

| File | Prefix | What it handles |
|------|--------|----------------|
| `auth.py` | `/api/auth` | Register, login, JWT issuance |
| `groups.py` | `/api/groups` | CRUD groups, member management, expense listing |
| `expenses.py` | `/api/expenses` | CRUD expenses, item-level splits, receipt images |
| `settlements.py` | `/api/groups/{id}` | Balance calculation and minimized settlement output |
| `upi.py` | `/api/upi` | Bank accounts, send and request money, transactions, bill pay |
| `ai.py` | `/api/ai` + `/api/ocr` | OCR receipt scan and natural-language smart split |
| `dev.py` | `/api/dev` | Development helpers, not for production |

## Inputs & Outputs

**Takes in:** HTTP requests with JWT in `Authorization: Bearer <token>` and JSON request bodies.
**Emits:** JSON responses, MongoDB writes, and Gemini API calls via `ai.py`.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/main.py` | `include_router()` at startup |
| Upstream | HTTP clients (mobile app, tests) | REST calls |
| Downstream | `app/models/` | Pydantic model instantiation |
| Downstream | `app/utils/ai_helpers.py` | OCR and smart-split logic |
| Downstream | `app/database.py` | MongoDB collection access |
| Downstream | `app/dependencies.py` | `verify_token` on protected endpoints |

## Gotchas

- `settlements.py` has no collection of its own because balances are calculated on demand from the `expenses` collection.
- `dev.py` endpoints are unauthenticated and should never be exposed in production.
- Receipt images in `expenses.py` are passed as base64 strings in JSON, which can make request payloads large.

## Further reading

- [models/](../models/README.md) - Pydantic schemas for each domain
- [utils/](../utils/README.md) - AI helpers
- [../../../tests/unit/](../../../tests/unit/README.md) - route-level unit tests
- [../../../tests/integration/](../../../tests/integration/README.md) - integration tests
