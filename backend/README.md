# backend

> The FastAPI server root: entry points, configuration, and dev tooling for the GoDutch API.

## Overview

This directory is the container for everything the server needs to run. The actual application logic lives one level deeper in `app/`, while this root holds the bootstrapping files that make the server startable in development.

`server.py` exists as a compatibility shim. It re-exports the app from `app/main.py` for older entry-point expectations, but new work should begin from `app/main.py`.

## How it works

1. A process runner imports `backend.app.main:app`.
2. `app/main.py` creates the FastAPI instance, registers middleware, mounts routers, and manages the MongoDB lifecycle.

## Key files

| File | What it does |
|------|-------------|
| `app/main.py` | FastAPI app factory for routes, middleware, and DB lifecycle |
| `server.py` | Compatibility shim that re-exports `app` |
| `requirements.txt` | Python package dependencies |
| `pyproject.toml` | Tooling config for pytest and ruff |

## Inputs & Outputs

**Takes in:** HTTP requests from the mobile app, environment variables such as `MONGO_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.
**Emits:** JSON responses, MongoDB reads and writes, and Gemini API calls through `app/utils/ai_helpers.py`.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `mobile/src/api/client.ts` | HTTP REST |
| Downstream | MongoDB | `motor` via `app/database.py` |
| Downstream | Gemini API | helpers in `app/utils/ai_helpers.py` |
| Shared state | MongoDB collections | persisted app data |

## Gotchas

- `server.py` is a shim, so avoid adding product logic there.
- The maintained backend tests live under [`../tests/`](../tests/README.md), not as one-off scripts in this folder.

## Further reading

- [app/](app/README.md) - application core
- [../tests/](../tests/README.md) - backend test suite
