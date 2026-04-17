# ExpenseCard

> Tappable expense list item — icon tile, merchant name, date, and right-aligned amount.

**Status:** Shipped · **Source:** `mobile/src/slate/ExpenseCard.tsx`

## When to use

Use `ExpenseCard` in any list or scroll view displaying expense entries. It is stateless — pass `onPress` to handle navigation.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `expense` | `ExpenseShape` | required | See shape below |
| `onPress` | `() => void` | — | Card tap handler |
| `amount` | `number` | `expense.total_amount` | Override displayed amount (e.g. user's share) |
| `amountLabel` | `ReactNode` | `'Your share'` | Eyebrow label above the amount |
| `icon` | `ReactNode` | `<Receipt size={24} />` | Custom icon in the left tile |
| `currency` | `string` | `'INR'` | ISO currency code; resolved to symbol via `getCurrencySymbol` |

### ExpenseShape

```ts
{
  id: string;
  merchant?: string;
  description?: string;
  total_amount: number;
  date?: string;          // display date string
  created_at?: string;    // ISO timestamp fallback if no date
  category?: string;
}
```

## Sample code

```tsx
import { ExpenseCard } from '@/slate';
import { ShoppingBag } from '@/slate/icons';
import { colors } from '@/theme/tokens';

// Basic card
<ExpenseCard
  expense={expense}
  onPress={() => router.push(`/expenses/${expense.id}`)}
/>

// Show user share instead of total
<ExpenseCard
  expense={expense}
  amount={expense.user_share}
  amountLabel="Your share"
  onPress={() => router.push(`/expenses/${expense.id}`)}
/>

// Custom icon
<ExpenseCard
  expense={expense}
  icon={<ShoppingBag size={24} color={colors.foreground} />}
  onPress={() => router.push(`/expenses/${expense.id}`)}
/>

// In a FlatList
<FlatList
  data={expenses}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}
  renderItem={({ item }) => (
    <ExpenseCard
      expense={item}
      amount={item.user_share}
      onPress={() => router.push(`/expenses/${item.id}`)}
    />
  )}
/>
```

## Anatomy

```
┌──────────────────────────────────────────────┐
│ [icon tile]  Merchant Name        ₹           │
│              12 Apr 2025          840.00      │
│                                   YOUR SHARE  │
└──────────────────────────────────────────────┘
```

- Left: 56×56pt rounded-square icon tile (`borderRadius: 16`, `#e9efee` bg)
- Center: merchant/description (2 lines max, `extrabold`), date below (`opacity: 0.6`)
- Right: currency symbol (13px), amount (24px, `extrabold`, `letterSpacing: -1`), label (10px eyebrow, `opacity: 0.5`)

## Design rules honored

- `borderRadius: 32` — soft, pill-like card
- Press state shifts bg to `colors.soft` — tonal feedback, no hard press ring
- No divider between cards in a list — use `gap: 12` in FlatList
- Amount uses high-contrast `colors.foreground` (not colored) — the amount is data, not a status signal

## Related

- [../../slate-for-dashboard/list-page.md](../../slate-for-dashboard/list-page.md)
- [../atoms/](../atoms/README.md) — `EmptyState` for empty lists
