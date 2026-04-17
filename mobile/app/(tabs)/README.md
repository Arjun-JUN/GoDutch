# mobile/app/(tabs)

> Bottom-tab navigation screens: the four main tabs the user sees after login.

## Overview

These four screens form the persistent tab bar. `_layout.tsx` defines the tab bar configuration — icons, labels, active tint color. Each screen is a self-contained page that reads from Zustand stores and renders Slate components.

## How it works

1. `_layout.tsx` renders a `<Tabs>` navigator with four children.
2. Each tab screen mounts and calls `useEffect` to trigger a store action (e.g. `fetchExpenses()`).
3. The store calls `src/api/client.ts`, updates Zustand state, and the component re-renders.

## Key files

| File | Tab label | Primary purpose |
|------|----------|----------------|
| `_layout.tsx` | — | Tab bar config — icons, labels, active color |
| `dashboard.tsx` | Home | Balance summary card + recent expenses |
| `expenses.tsx` | Expenses | SectionList of all expenses grouped by month |
| `settlements.tsx` | Settle | You-owe / you're-owed + Pay/Nudge actions |
| `profile.tsx` | Profile | User info, UPI account management, sign out |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/_layout.tsx` | Stack renders this group |
| Downstream | `src/stores/` | expensesStore, settlementsStore, groupsStore |
| Downstream | `src/slate/` | AppShell, ExpenseCard, PageHero, AppButton |
| Downstream | `src/api/client.ts` | Direct calls for settlements/profile |

## Gotchas

- `dashboard.tsx` shows only the last 5 expenses for performance. Full list is in `expenses.tsx`.
- The Pay button in `settlements.tsx` deep-links to UPI apps — this only works on physical devices. Simulators will show an error or silently fail.

## Further reading

- [../app/(upi)/](<../(upi)/README.md>) — UPI screens reachable from settlements
- [../../src/stores/](../../src/stores/README.md)
