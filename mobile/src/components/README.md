# mobile/src/components

> Feature-specific compound components: cross-screen assemblies too big for a single Slate primitive but tightly coupled to product behavior.

## Overview

Unlike `slate/` (generic design-system primitives) this directory holds components that encode **feature behavior** — data fetching, store wiring, feature-specific UI flows. They are reused by two or more routes; single-use components live alongside their consumer instead.

Two rules of thumb:
- If another developer could reuse it on a different product, it belongs in `slate/`.
- If it's only used by one screen, it belongs next to that screen.

## How it works

Each component owns its own effects and store reads. The consuming route is usually a thin wrapper — `<AppShell><ThisComponent /></AppShell>` — that decides navigation intent via props.

## Key files

| File | What it does |
|------|-------------|
| `GroupsList.tsx` | Groups list with per-group balance, create-sheet, empty state, pull-to-refresh. Shared by `(tabs)/groups.tsx` and the legacy `/groups` route. |
| `Expense/ItemSplitSection.tsx` | Per-item member assignment — items with multi-select member chips |
| `Expense/PaidByModal.tsx` | Bottom sheet to select which group member paid |
| `Expense/SplitOptionsModal.tsx` | Bottom sheet to pick split type: equal, custom, or item-based |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/(tabs)/groups.tsx` | Renders `GroupsList` |
| Upstream | `app/groups/index.tsx` | Renders `GroupsList` (legacy deep-link entry) |
| Upstream | `app/new-expense.tsx` | Renders the `Expense/*` modals |
| Downstream | `src/slate/` | AppBottomSheet, AppButton, Text, InteractiveSurface, atoms |
| Downstream | `src/stores/` | Reads groups + settlements, writes new groups via upsert |
| Downstream | `src/api/client.ts` | Create-group POST inside `GroupsList` |

## Gotchas

- `GroupsList` owns the create-group POST. Do not duplicate that logic in the consuming route.
- `Expense/*` components receive the expense draft object as a prop and return updates via callbacks — they do not write to the store directly. The parent route owns the draft state.

## Further reading

- [slate/](../slate/README.md)
- [app/(tabs)/](<../../app/(tabs)/README.md>)
- [app/groups/](../../app/groups/README.md)
