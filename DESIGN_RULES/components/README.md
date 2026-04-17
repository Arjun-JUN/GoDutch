# Components

> Every Slate component — shipped and planned — with prop tables and sample code.

## How to use this index

Open only the leaf you need. Each component has its own `README.md`.

## Shipped components

| Component | Source | Doc |
|-----------|--------|-----|
| `AppButton` | `mobile/src/slate/AppButton.tsx` | [buttons/](buttons/README.md) |
| `AppSurface` + `InteractiveSurface` | `mobile/src/slate/AppSurface.tsx` | [surfaces/](surfaces/README.md) |
| `AppInput` + `AppTextarea` + `Field` | `mobile/src/slate/AppInput.tsx` | [inputs/](inputs/README.md) |
| `AppShell` + `PageContent` | `mobile/src/slate/AppShell.tsx` | [shell/](shell/README.md) |
| `PageHero` | `mobile/src/slate/PageHero.tsx` | [shell/](shell/README.md) |
| `Header` | `mobile/src/slate/Header.tsx` | [header/](header/README.md) |
| `AppBottomSheet` + `SheetHeader` | `mobile/src/slate/AppBottomSheet.tsx` | [bottom-sheet/](bottom-sheet/README.md) |
| `ExpenseCard` | `mobile/src/slate/ExpenseCard.tsx` | [expense-card/](expense-card/README.md) |
| `Text` | `mobile/src/slate/Text.tsx` | [text/](text/README.md) |
| `IconBadge`, `MemberBadge`, `StatCard`, `EmptyState`, `Callout`, `Avatar`, `Breath` | `mobile/src/slate/atoms.tsx` | [atoms/](atoms/README.md) |

## Planned components (not yet shipped)

| Component | Doc |
|-----------|-----|
| `DataTable` | [../slate-for-dashboard/tables.md](../slate-for-dashboard/tables.md) |
| `FilterChip` | [../slate-for-dashboard/filtering-data.md](../slate-for-dashboard/filtering-data.md) |
| `NotificationBell` + `NotificationTray` | [../communicating-with-users/bell-notifications.md](../communicating-with-users/bell-notifications.md) |
| `DiscoveryModule` | [../communicating-with-users/feature-discovery.md](../communicating-with-users/feature-discovery.md) |
| `DatePicker` | [date-selection.md](date-selection.md) |

## Cross-cutting topics

| Topic | Doc |
|-------|-----|
| Forms composition | [forms.md](forms.md) |
| Icons inventory | [icons.md](icons.md) |
| Badges, progress, skeleton | [indicators.md](indicators.md) |
| Press / focus / disabled / loading states | [interaction-states.md](interaction-states.md) |
| Layout (AppShell, Breath, PageContent) | [layout.md](layout.md) |
| Data visualization | [data-visualization/](data-visualization/README.md) |
| Date selection | [date-selection.md](date-selection.md) |

## Import

```tsx
// Named components from barrel
import { AppButton, AppSurface, AppShell, PageContent, PageHero, Header,
         AppBottomSheet, SheetHeader, AppInput, AppTextarea, Field,
         ExpenseCard, Text } from '@/slate';

// Atoms
import { IconBadge, MemberBadge, StatCard, EmptyState, Callout, Avatar, Breath } from '@/slate/atoms';

// Icons
import { Plus, Receipt, ArrowLeft } from '@/slate/icons';
```
