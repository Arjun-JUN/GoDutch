# mobile/app/groups

> Group list + group detail screens reachable outside the tab bar.

## Overview

Two routes live here: `index.tsx` (legacy `/groups` list) and `[groupId].tsx` (detail page). The **primary** entry to the groups list is now the Groups tab at `(tabs)/groups.tsx`; this folder's `index.tsx` is kept so older deep links — emails, push notifications, external links — keep working.

Both the tab wrapper and the legacy route render the same shared component: `src/components/GroupsList`. The list logic has a single source of truth.

## How it works

- `index.tsx` wraps `<GroupsList />` in `<AppShell>` — no additional logic.
- `[groupId].tsx` renders a **colored header block** (back + group identity + balance sentence + action row) followed by members, pending settlements, and the expense list.
- The balance sentence reads: `+₹N — you're ahead`, `-₹N — you owe`, or `You're all settled`, colored by tone.
- Action buttons: Settle up (→ settlements tab), Reports (→ `/reports/:id`), Add (→ `/new-expense?groupId=...`).

## Key files

| File | Route | What it does |
|------|-------|-------------|
| `index.tsx` | `/groups` | Legacy list route; renders shared `GroupsList` component |
| `[groupId].tsx` | `/groups/:id` | Group detail with colored header, balance sentence, action row, members, settlements, expenses |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `(tabs)/dashboard.tsx` | "See all" link → `/(tabs)/groups`; group-preview row → `/groups/:id` |
| Upstream | `(tabs)/groups.tsx` | Primary entry for the list |
| Downstream | `src/components/GroupsList.tsx` | Shared list + create sheet |
| Downstream | `src/stores/` | `useGroupsStore`, `useExpensesStore`, `useSettlementsStore` |
| Downstream | `src/slate/` | AppShell, AppButton, AppSurface, Text, Avatar, EmptyState |

## Gotchas

- Do not duplicate list logic in `index.tsx`. Any changes belong in `src/components/GroupsList.tsx` so both the tab and the legacy route stay in sync.
- The group detail header is NOT the Slate `Header` component — it's a custom colored block. Use the existing block as-is; don't swap it for `Header` or the balance sentence disappears.
- Navigating back from group detail: uses `router.back()` when possible, otherwise falls back to `/(tabs)/groups`.

## Further reading

- [../../src/components/](../../src/components/README.md) — shared `GroupsList` lives here
- [../(tabs)/](<../(tabs)/README.md>) — Groups tab wrapper
