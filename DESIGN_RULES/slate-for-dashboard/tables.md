# Tables

> **Status: Not implemented yet.**

Tabular data display for settlement summaries and expense breakdowns.

## Why it's here

Some data in GoDutch is inherently tabular: "Who owes whom how much?" — a settlement matrix. The current screens avoid tables by using `StatCard` + `ExpenseCard` compositions, but a proper table component will be needed for group settlement summaries.

## When to use a table vs. a list

Use a **list** (`FlatList` + `ExpenseCard`) when:
- Items are homogeneous and have the same structure.
- The user scans for a single item.

Use a **table** when:
- Data has 2+ columns that must align across rows.
- The user needs to compare values across rows (e.g. "Arjun owes everyone ₹X").

## Target API (not yet built)

```tsx
import { DataTable } from '@/slate'; // not yet exported

<DataTable
  columns={[
    { key: 'from', label: 'From', flex: 1 },
    { key: 'to', label: 'To', flex: 1 },
    { key: 'amount', label: 'Amount', align: 'right', flex: 0.6 },
  ]}
  rows={[
    { from: 'Arjun', to: 'Priya', amount: '₹840' },
    { from: 'Karan', to: 'Arjun', amount: '₹320' },
  ]}
/>
```

## Design rules (when built)

- No vertical column dividers — separate columns by alignment and spacing only (no-line rule).
- Alternating row tones via `colors.soft` on even rows — not borders.
- Header row uses `Text variant="eyebrow" tone="muted"`.
- Amount column is always right-aligned.
- Row height ≥ 44px for touch accessibility.

## Further reading

- [list-page.md](list-page.md)
- [../user-interface/guides/tonal-topography.md](../user-interface/guides/tonal-topography.md)
