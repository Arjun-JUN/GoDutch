# frontend/src/utils

> Domain-specific calculation utilities: expense share arithmetic and edge AI inference helpers.

## Overview

Two files with focused responsibilities. `calculateShare.js` contains the splitting algorithms that compute each member's share from an expense — these are pure functions used by the expense creation flow. `edgeAI.js` wraps any client-side AI inference (e.g. quick category guessing before the server responds).

## Key files

| File | What it does |
|------|-------------|
| `calculateShare.js` | `equalSplit()`, `customSplit()`, `itemBasedSplit()` — returns `{ user_id, amount }[]` |
| `edgeAI.js` | Client-side category inference and receipt pre-processing helpers |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `pages/NewExpenseRedesign.js` | Calls split functions before submitting |
| Upstream | `pages/ItemSplitView.js` | Calls `itemBasedSplit()` for live totals |
| Downstream | None | Pure functions; no external calls |

## Gotchas

- `calculateShare.js` functions do not validate that amounts sum to the expense total. The caller is responsible for validation before submitting to the API.

## Further reading

- [pages/](../pages/README.md)
- [backend/app/routes/expenses.py](../../../backend/app/routes/README.md)
