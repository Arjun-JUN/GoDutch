# tests/unit

> Unit tests: each module tested in isolation, with all external dependencies mocked.

## Overview

Unit tests cover individual functions, models, and route handlers in isolation. External dependencies (MongoDB, Gemini API) are mocked. The goal is exhaustive branch coverage — every conditional path, every error case, every boundary value.

Per project rules: even simple changes get dozens of unit tests. When adding a function, cover: happy path, empty input, null/None, max-length, invalid types, all error branches, concurrent/race conditions where applicable.

## How it works

1. Import the function or route under test.
2. Mock external dependencies via `pytest-mock` or `unittest.mock`.
3. Assert return values, raised exceptions, and side effects (what was called with what arguments).
4. Use `conftest.py` fixtures from the parent directory for shared test data.

## Key files

| File | What it tests |
|------|--------------|
| `test_models.py` | Pydantic model validation — valid/invalid inputs, field constraints |
| `test_auth_routes.py` | `/api/auth` — register, login, token issuance, duplicate email, wrong password |
| `test_expenses_routes.py` | `/api/expenses` — CRUD, splits, receipt upload, access control |
| `test_groups_routes.py` | `/api/groups` — CRUD, member management, expense listing |
| `test_settlements.py` | Settlement calculation algorithm — various debt graph configurations |
| `test_ai_helpers.py` | `scan_receipt()` and `smart_split()` — mocked Gemini responses |
| `test_helpers.py` | `errors.py` and miscellaneous helper functions |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Tests | `backend/app/routes/` | Via `TestClient` with mocked DB |
| Tests | `backend/app/models/` | Direct instantiation |
| Tests | `backend/app/utils/` | Direct function calls with mocked deps |

## Gotchas

- Route tests use the `test_client` fixture from `../conftest.py` — do not create a new `TestClient` per file.
- Gemini API must always be mocked in unit tests (`@mock.patch('backend.app.utils.ai_helpers.genai')`). Never make real AI calls in tests.

## Further reading

- [../conftest.py](../README.md)
- [../integration/](../integration/README.md)
