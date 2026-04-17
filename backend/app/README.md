# backend/app

> The application core: FastAPI app factory, database connection, and shared dependency injection.

## Overview

This package is the heart of the GoDutch API. It does three things: creates the FastAPI application instance (and mounts all feature routers onto it), manages the MongoDB connection lifecycle, and exposes reusable `Depends()` objects that every route uses for authentication and config.

The module structure is deliberately flat at this level — no nested business logic lives here. Each concern (auth, expenses, groups, UPI, AI, settlements) is a self-contained router in `routes/`, validated by `models/`, and optionally helped by `utils/`.

## How it works

1. `main.py` instantiates `FastAPI()`, adds CORS middleware, and imports each domain router from `routes/`.
2. Each router is mounted at its prefix (`/api/auth`, `/api/expenses`, etc.).
3. On startup, `database.py` calls `AsyncIOMotorClient` to open a connection pool to MongoDB; the `db` object is stored as a module-level singleton.
4. Every protected route declares `Depends(verify_token)` from `dependencies.py`, which validates the JWT and returns the current user dict.
5. On shutdown, `database.py` closes the Motor client.

## Key files

| File | What it does |
|------|-------------|
| `main.py` | App factory — mounts routers, registers startup/shutdown hooks |
| `database.py` | MongoDB Motor client — `get_database()` returns the `db` singleton |
| `dependencies.py` | `verify_token` — JWT decode → user dict; used by every protected route |
| `__init__.py` | Package marker (empty) |

## Inputs & Outputs

**Takes in:** HTTP requests (FastAPI handles parsing); `MONGO_URI` and `JWT_SECRET` from environment.
**Emits:** Route handlers registered on the `app` instance; the `db` singleton available to all routes.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `backend/server.py` | imports `app` |
| Upstream | uvicorn | imports and serves `app` |
| Downstream | `routes/` | `app.include_router()` |
| Downstream | `database.py` | startup/shutdown hooks |
| Downstream | MongoDB | `motor` async driver |

## Gotchas

- `db` in `database.py` is a module-level singleton. Tests must patch it with `mongomock-motor` before importing routes, or they will hit a real database.
- JWT expiry is hardcoded to 30 days in `dependencies.py`. Changing this requires a coordinated client-side change — stored tokens will remain valid until they expire naturally.

## Further reading

- [routes/](routes/README.md) — feature-specific route handlers
- [models/](models/README.md) — Pydantic request/response schemas
- [utils/](utils/README.md) — AI helpers and error utilities
- [../../tests/](../../tests/README.md) — test suite
