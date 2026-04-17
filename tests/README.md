# tests

> Backend pytest test suite: configuration, fixtures, and test organization.

## Overview

Root of the backend test suite. `conftest.py` defines shared pytest fixtures — most importantly the `test_client` fixture (FastAPI `TestClient` with `mongomock-motor` patched in) and sample user/group/expense objects. Every test file imports these fixtures rather than setting up its own database state.

Per project rules: every code change must add tests. Cover unit tests (isolated functions), integration tests (full request/response with DB), negative cases (auth failures, invalid input, wrong permissions), regression tests (one test per bug fix), and edge cases.

## How it works

1. `pytest` discovers all `test_*.py` files in `unit/` and `integration/`.
2. `conftest.py` patches `motor` with `mongomock-motor` before any test runs — no real MongoDB needed.
3. Fixtures create a `TestClient(app)` and yield it; each test gets a clean database state.
4. Run `pytest --cov=backend/app` to see coverage. Target ≥ 90% on touched files.

## Key files

| File | What it does |
|------|-------------|
| `conftest.py` | Shared fixtures: `test_client`, `auth_headers`, `sample_user`, `sample_group`, `sample_expense` |
| `__init__.py` | Package marker |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Tests | `backend/app/` | Imports `app` for `TestClient`; patches DB |
| Tests | `mongomock-motor` | In-memory MongoDB replacement |

## Further reading

- [unit/](unit/README.md)
- [integration/](integration/README.md)
