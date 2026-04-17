# frontend/src/__tests__

> Vitest + React Testing Library test suite for all pages and Slate components.

## Overview

22 test files covering the full frontend surface: page components (render, data fetch, user interaction), Slate components (visual output, prop variants), hooks, and utility functions. Tests run in jsdom with framer-motion mocked.

Per project rules, every change must add tests here. Target dozens of cases per changed file — render, loading state, error state, empty state, user interactions, edge cases, boundary values.

## How it works

1. `pnpm test` (from `frontend/`) runs Vitest in watch mode.
2. Each test file imports the component under test, wraps it in necessary providers (`AuthProvider`, `MemoryRouter`), and uses `@testing-library/react` to render and query.
3. API calls are mocked via `vi.mock('../lib/api.js')`.
4. Framer-motion is globally mocked via `src/__mocks__/framer-motion.js`.

## Key files

Test files mirror the source structure:
- `Dashboard.test.js`, `GroupsPage.test.js`, `NewExpenseRedesign.test.js`, etc. — page tests
- `AppButton.test.js`, `ExpenseCard.test.js`, etc. — Slate component tests
- `calculateShare.test.js` — utility function tests

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Tests | All `pages/` components | Render and interaction testing |
| Tests | All `slate/components/` | Visual output and prop testing |
| Tests | `lib/api.js` | Mocked; tests verify correct calls are made |
| Tests | `utils/` | Pure function tests, no mocking needed |

## Gotchas

- When adding a new page, add a corresponding test file here in the same PR.
- Tests that render pages with `AuthContext` must either wrap in `<AuthProvider>` with a mock token or mock `useAuth()`.
- Coverage is collected with `pnpm test --coverage`. Project target is ≥ 90% on touched files.

## Further reading

- [__mocks__/](../__mocks__/README.md)
- [pages/](../pages/README.md)
