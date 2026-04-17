# backend

> The FastAPI server root: entry points, configuration, and dev tooling for the GoDutch API.

## Overview

This directory is the container for everything the server needs to run. The actual application logic lives one level deeper in `app/`, but this root holds the critical bootstrapping files that make the server startable in different contexts (dev, test, production) and the seed script that populates a fresh MongoDB instance with realistic development data.

`server.py` exists purely as a legacy shim — it re-exports the app from `app/main.py` to satisfy old deployment configs that expected a top-level entry point. All new development starts from `app/main.py`.

## How it works

1. A process runner (uvicorn) imports `backend.app.main:app`.
2. `app/main.py` creates the FastAPI instance, registers CORS middleware, mounts all routers, and wires up the MongoDB lifecycle (connect on startup, close on shutdown).
3. To seed dev data, run `python backend/seed.py` separately — it connects to the same MongoDB instance and upserts sample users, groups, and expenses.

## Key files

| File | What it does |
|------|-------------|
| `app/main.py` | FastAPI app factory — CORS, routers, DB lifecycle |
| `server.py` | Legacy shim — re-exports `app` from `app/main.py` |
| `seed.py` | Dev-data seeder — sample users, groups, expenses |
| `requirements.txt` | Python package dependencies |
| `pyproject.toml` | Project metadata and tool config (pytest, ruff) |
| `.env.test` | Test environment variables (MongoDB URI, JWT secret) |

## Inputs & Outputs

**Takes in:** HTTP requests on port 8000 from web/mobile clients; env vars (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
**Emits:** JSON HTTP responses; MongoDB reads/writes; Gemini API calls via `app/utils/ai_helpers.py`.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `frontend/src/lib/api.js` | HTTP REST |
| Upstream | `mobile/src/api/client.ts` | HTTP REST |
| Downstream | MongoDB | `motor` async driver via `app/database.py` |
| Downstream | Gemini API | `google-generativeai` SDK in `app/utils/ai_helpers.py` |

## Gotchas

- `server.py` is a shim — do not add logic there.
- `.env.test` is committed intentionally (test secrets only); never commit a production `.env`.
- `seed.py` is idempotent but will overwrite existing dev data if re-run.

## Further reading

- [app/](app/README.md) — the application core
- [../tests/](../tests/README.md) — backend test suite
