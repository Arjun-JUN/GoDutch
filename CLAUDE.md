# GoDutch — Claude Code Guidelines

## Test enforcement

**Every code addition must be accompanied by tests.**

- New backend route or helper function → add a test in `tests/unit/` (for pure functions) or `tests/integration/` (for endpoints).
- New frontend component or utility → add a test in `frontend/src/__tests__/`.
- Modified logic (bug fix, refactor) → update or extend the relevant test.

Never mark a coding task as done without running the relevant tests first.

## Running tests

### Backend

```bash
cd /path/to/GoDutch
pip install -r backend/requirements.txt
pytest
```

Key flags:
- `pytest tests/unit/` — unit tests only (fast, no HTTP)
- `pytest tests/integration/` — integration tests with in-memory MongoDB
- `pytest -x` — stop on first failure
- `pytest -v` — verbose output

### Frontend

```bash
cd frontend
yarn test --watchAll=false
```

Key flags:
- `yarn test --testPathPattern=AppButton` — run a single test file
- `yarn test --coverage` — generate coverage report

## Test structure

```
tests/
├── conftest.py              # shared fixtures (mock_db, client, registered_user, …)
├── unit/
│   ├── test_helpers.py      # _extract_json_block
│   ├── test_models.py       # Pydantic model validation
│   └── test_settlements.py  # settlement calculation algorithm
└── integration/
    ├── test_auth.py         # /api/auth/register + /api/auth/login
    ├── test_groups.py       # /api/groups
    ├── test_expenses.py     # /api/expenses + /api/groups/{id}/settlements + reports
    └── test_upi.py          # /api/upi/*

frontend/src/
├── __mocks__/
│   └── framer-motion.js     # jsdom-safe animation mock
└── __tests__/
    ├── utils.test.js        # cn() utility
    ├── AppButton.test.js    # AppButton component
    ├── AppField.test.js     # Field, AppInput, AppSelect, AppTextarea
    └── AppShell.test.js     # AppShell, PageContent, PageHero, PageBackButton
```

## Architecture

- **Backend**: FastAPI + MongoDB (Motor async driver). Tests use `mongomock-motor` for an in-memory database — no real MongoDB required.
- **Frontend**: React 19 + Tailwind + Radix UI. Tests use React Testing Library; framer-motion is mocked so animations don't break jsdom.
- **Auth**: JWT tokens issued at register/login; `verify_token` FastAPI dependency reads `JWT_SECRET` env var.
- **Settlement algorithm**: Balance-netting logic lives in `GET /api/groups/{id}/settlements`. Algorithm is independently unit-tested in `tests/unit/test_settlements.py`.
