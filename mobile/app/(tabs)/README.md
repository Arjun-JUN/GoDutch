# mobile/app/(tabs)

> Bottom-tab navigation screens: the four visible tabs plus a center FAB that jumps to new-expense.

## Overview

The tab bar uses a **five-slot layout** — `Home | Groups | [+FAB] | Activity | You` — with the center slot intercepted by a custom `tabBarButton` that navigates to `/new-expense` instead of switching tabs. Three legacy tabs (`expenses`, `settlements`, `profile`) are kept as routes for deep-link compatibility but hidden from the bar via `href: null`.

Each tab screen is self-contained: it reads from Zustand stores, renders Slate components, and handles its own data loading.

## How it works

1. `_layout.tsx` renders a `<Tabs>` navigator with five visible screens and three hidden ones.
2. The center `add` slot has `tabBarButton: () => <FabTabButton />` — tapping it calls `router.push('/new-expense')` directly. The `add.tsx` placeholder route exists only so expo-router has a file to resolve.
3. Each visible tab mounts and calls `useEffect(() => fetchX())` against its stores.
4. The stores call `src/api/client.ts`, cache the response, and the component re-renders.

## Key files

| File | Tab label | Primary purpose |
|------|----------|----------------|
| `_layout.tsx` | — | 5-tab bar + center FAB; hides legacy tabs via `href: null` |
| `dashboard.tsx` | Home | Greeting + net balance hero + quick actions + groups preview |
| `groups.tsx` | Groups | Thin wrapper around `src/components/GroupsList` |
| `add.tsx` | (FAB) | Placeholder route — never rendered; FAB intercepts the press |
| `activity.tsx` | Activity | Derived feed: pending settlements on top + expenses grouped by day |
| `you.tsx` | You | Profile card + UPI linking + preferences + sign out |
| `expenses.tsx` | (hidden) | Legacy — kept for deep links |
| `settlements.tsx` | (hidden) | Reached via Dashboard quick action + group-detail "Settle up" |
| `profile.tsx` | (hidden) | Superseded by `you.tsx` |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/_layout.tsx` | Stack renders this group |
| Downstream | `src/stores/` | `useGroupsStore`, `useExpensesStore`, `useSettlementsStore` |
| Downstream | `src/components/GroupsList` | Shared list used by Groups tab and legacy `/groups` |
| Downstream | `src/slate/` | AppShell, AppSurface, AppButton, Text, atoms (Avatar, EmptyState, MemberBadge, IconBadge) |
| Downstream | `src/api/client.ts` | `you.tsx` directly queries `/upi/accounts` to toggle the linked-UPI badge |

## Gotchas

- **FAB button behavior.** The `add` tab never mounts in normal use. If you navigate to `/(tabs)/add` via a deep link it will render an empty screen (`add.tsx` returns `null`).
- **Activity feed dates.** `SettlementItem` has no date field — settlements are shown under a "Pending" header at the top, not chronologically.
- **Multi-currency simplification.** The dashboard's net balance uses `groups[0]?.currency` when formatting — a known limitation tracked separately.
- **Legacy tabs still route.** `/expenses`, `/settlements`, `/profile` all resolve; they're just not on the tab bar. Anything quick-action-ing them works.

## Further reading

- [../groups/](../groups/README.md) — group detail + legacy /groups route
- [../../src/components/](../../src/components/README.md) — shared feature components like `GroupsList`
- [../(upi)/](<../(upi)/README.md>) — UPI flow reached from You tab and Settle actions
- [../../src/stores/](../../src/stores/README.md)
