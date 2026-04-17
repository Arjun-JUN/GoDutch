# mobile/src/utils

> Pure utility functions: expense arithmetic, splitting algorithms, and app-wide constants.

## Overview

All splitting math and calculation logic for the mobile app lives here. These are pure functions — no side effects, no API calls, no React. They are the source of truth for how expense shares are computed. `constants.ts` centralizes magic values shared across the app.

## Key files

| File | What it does |
|------|-------------|
| `arithmetic.ts` | Safe decimal arithmetic helpers — avoids floating-point issues in currency math |
| `splitting.ts` | `equalSplit()`, `itemBasedSplit()`, `customSplit()` — returns `{ userId, amount }[]` |
| `constants.ts` | Category list, split types enum, limits, default currency |
| `__tests__/arithmetic.test.ts` | Unit tests for arithmetic helpers |
| `__tests__/splitting.test.ts` | Unit tests for splitting algorithms |

## Inputs & Outputs

**Takes in:** Expense total, item list, member list, split type.
**Emits:** Array of `{ userId, amount }` — one entry per member with their share.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `src/components/Expense/` | Splitting functions for live totals |
| Upstream | Expense creation route | Final split calculation before submit |
| Downstream | None | Pure functions |

## Gotchas

- Currency amounts are handled as integers (paise/cents) internally to avoid floating-point drift. `arithmetic.ts` handles the conversion boundary.
- `splitting.ts` does not validate that amounts sum to the total — the caller must check before submitting to the API.

## Further reading

- [components/](../components/README.md)
- [backend/app/routes/expenses.py](../../../backend/app/routes/README.md)
