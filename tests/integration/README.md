# tests/integration

> Integration tests: full request-to-database flows verifying the complete API contract.

## Overview

Integration tests hit the full stack: HTTP request → FastAPI route → business logic → mongomock-motor → response. They verify that features work end-to-end, including auth guards, database round-trips, and response shapes. Unlike unit tests, dependencies are not mocked — mongomock-motor stands in for MongoDB but behaves identically for our use cases.

Per project rules: for every bug fix, add a regression test here that reproduces the original failure path before the fix.

## How it works

1. `test_client` fixture from `conftest.py` provides a `TestClient` with mongomock-motor.
2. Tests call HTTP methods: `client.post('/api/auth/register', json={...})`.
3. Assertions check status code, response body shape, and database state (via follow-up GET calls).
4. Auth-protected tests use the `auth_headers` fixture which returns `{"Authorization": "Bearer <valid_token>"}`.

## Key files

| File | What it tests |
|------|--------------|
| `test_auth.py` | Full register → login → token → protected resource flow |
| `test_expenses.py` | Create expense → fetch → update → delete; access control; OCR mocked |
| `test_groups.py` | Create group → add members → create expense → fetch group expenses |
| `test_upi.py` | Add account → send money → request money → accept request → transaction history |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Tests | `backend/app/` | Full app via `TestClient` |
| Tests | `mongomock-motor` | In-memory DB — no real MongoDB |
| Tests | Gemini API | Mocked — integration tests must not make real AI calls |

## Gotchas

- Test isolation: each test should create its own users/groups/expenses via the API rather than sharing state from a previous test. Order-dependent tests are a source of flaky failures.
- The minimized settlement algorithm is complex — write integration tests with known debt graphs and assert the exact settlement list rather than just checking the count.

## Further reading

- [../unit/](../unit/README.md)
- [../conftest.py](../README.md)
- [backend/app/routes/](../../backend/app/routes/README.md)
