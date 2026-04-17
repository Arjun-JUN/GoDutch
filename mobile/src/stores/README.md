# mobile/src/stores

> Zustand state stores: client-side cache for expenses, groups, and settlements.

## Overview

Three Zustand stores provide the data layer for the mobile app. Each store holds a list of entities, a loading flag, an error string, and async actions that call `src/api/client.ts`. Route components subscribe to stores rather than fetching directly — this means navigating back to a tab doesn't re-fetch unless the data is stale.

## How it works

1. A route component calls a store action: `useExpensesStore().fetchExpenses()`.
2. The action sets `loading = true`, calls `client.get('/expenses')`, updates the store array, sets `loading = false`.
3. Components select the slice they need: `const expenses = useExpensesStore(s => s.expenses)`.
4. Mutations (create, delete) call the API and then refetch or optimistically update the store.

## Key files

| File | What it does |
|------|-------------|
| `expensesStore.ts` | `expenses[]`, `fetchExpenses()`, `createExpense()`, `deleteExpense()` |
| `groupsStore.ts` | `groups[]`, `fetchGroups()`, `createGroup()` |
| `settlementsStore.ts` | `settlements[]`, `fetchSettlements(groupId)` |
| `types.ts` | Shared TypeScript types for store state shapes |
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
