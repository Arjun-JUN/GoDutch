# mobile/src/components

> Feature-specific compound components: complex UI assemblies tightly coupled to a product domain.

## Overview

Unlike `slate/` (generic and reusable), this directory contains components coupled to a specific feature — the expense-creation flow. They are too complex to be a single Slate primitive and too feature-specific to live in `slate/`.

## How it works

These components are consumed by the expense creation route. They manage their own local state (e.g. which item is selected) and emit callbacks to the parent when the user commits a choice.

## Key files

| File | What it does |
|------|-------------|
| `Expense/ItemSplitSection.tsx` | Per-item member assignment — items with multi-select member chips |
| `Expense/PaidByModal.tsx` | Bottom sheet to select which group member paid |
| `Expense/SplitOptionsModal.tsx` | Bottom sheet to pick split type: equal, custom, or item-based |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | Expense creation route | Rendered as sub-sections of the expense form |
| Downstream | `src/slate/` | AppBottomSheet, AppButton, Text, etc. |
| Downstream | `src/stores/groupsStore.ts` | Reads member list for the current group |

## Gotchas

- These components receive the expense draft object as a prop and return updates via callbacks — they do not write to the store directly. The parent route owns the draft state.

## Further reading

- [slate/](../slate/README.md)
- [app/(tabs)/](<../../app/(tabs)/README.md>)
