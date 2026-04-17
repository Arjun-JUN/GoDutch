# Detail Page

> Pattern for displaying a single object (expense, group) with its full context.

## When to use

A detail page surfaces all information about one entity: an expense's item breakdown, payers, and settlement status; or a group's members and running totals.

## Pattern

```tsx
import { AppShell, PageContent, Header, AppSurface } from '@/slate';
import { Text } from '@/slate';
import { Breath, StatCard, MemberBadge } from '@/slate/atoms';
import { ScrollView, View } from 'react-native';

export default function ExpenseDetailScreen({ expense }) {
  return (
    <AppShell>
      <Header title="Expense" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          {/* Hero */}
          <PageHero
            eyebrow={expense.category?.toUpperCase()}
            title={expense.merchant}
            description={`${expense.date} · ${expense.participants.length} people`}
            compact
          />

          {/* Summary card */}
          <AppSurface variant="solid" style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard label="Total" value={`₹${expense.total_amount}`} />
              <StatCard label="Your share" value={`₹${expense.user_share}`} />
            </View>
          </AppSurface>

          {/* Item breakdown */}
          <Text variant="title" style={{ marginBottom: 12 }}>Items</Text>
          {expense.items.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="body">{item.name}</Text>
              <Text variant="body" tone="muted">₹{item.amount}</Text>
            </View>
          ))}

          <Breath size="sm" />

          {/* Members */}
          <Text variant="title" style={{ marginBottom: 12 }}>Split between</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {expense.participants.map((p) => (
              <MemberBadge key={p.id} active={p.id === currentUserId}>{p.name}</MemberBadge>
            ))}
          </View>
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
```

## Key layout decisions

- **`compact` PageHero** — detail pages are sub-screens; the hero is smaller than on the overview page.
- **Group related data in `AppSurface solid`** — amounts and stats go in a white card. Raw field/value pairs go outside.
- **Use `MemberBadge` for person lists** — don't list people as plain text rows.
- **No in-line delete buttons** — destructive actions go in an `AppBottomSheet` action panel (see [object-drawer.md](object-drawer.md)).

## Further reading

- [object-drawer.md](object-drawer.md)
- [../components/surfaces/](../components/surfaces/README.md)
- [../components/atoms/](../components/atoms/README.md)
