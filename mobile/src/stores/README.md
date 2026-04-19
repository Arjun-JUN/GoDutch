# mobile/src/stores

> Zustand state stores: client-side cache for expenses, groups, and settlements.

## Overview

Three Zustand stores provide the data layer for the mobile app. Each store holds a list of entities, a loading flag, an error string, and async actions that call `src/api/client.ts`. Route components subscribe to stores rather than fetching directly — this means navigating back to a tab doesn't re-fetch unless the data is stale.

## How it works

1. A route component calls `useExpensesStore().fetch(groupId)`.
2. The store checks a 20-second cache window (`loadedAtGroupId`); if fresh it skips the API call.
3. On cache miss, `api.get('/groups/:id/expenses')` is called, results sorted by date desc, stored in `byGroupId[groupId]`.
4. **Optimistic creates**: `addOptimistic(tempExpense)` inserts immediately; `replace(tempId, serverExpense)` swaps in the server record on success; `remove` rolls back on failure.
5. **Edits**: `update(groupId, expenseId, updatedExpense)` replaces the entry in-place after a successful `PUT /expenses/:id`.
6. `invalidate(groupId?)` clears the cache timestamp so the next `fetch` re-hits the API.

## Key files

| File | What it does |
|------|-------------|
| `expensesStore.ts` | `byGroupId` cache; `fetch`, `addOptimistic`, `replace`, `update`, `remove`, `invalidate`, `reset` |
| `groupsStore.ts` | `groups[]`; `fetch`, `getById`, `getAll`, `reset` |
| `settlementsStore.ts` | `settlements[]`; `fetchSettlements(groupId)` |
| `types.ts` | Shared TypeScript types (`Expense`, `Group`, `Member`, `ExpenseSplit`, `ExpenseItem`, `SettlementItem`) |
| `index.ts` | Barrel re-export |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/` route files | Subscribe via `useXxxStore()` hooks |
| Downstream | `src/api/client.ts` | All HTTP calls |

## Gotchas

- Stores are not persisted to disk by default. Killing the app clears all store state; data is refetched on next mount.
- `settlementsStore` requires a `groupId` argument — calling `fetchSettlements` with a new group ID overwrites the previous result unless the store is extended to cache by key.

## Further reading

- [api/](../api/README.md)
- [app/(tabs)/](<../../app/(tabs)/README.md>) — consumers
