# Overview Page

> The dashboard home screen pattern — balance summary + recent activity.

## Purpose

The overview page is the first screen the user lands on. It must answer "where do I stand?" in under two seconds:
1. Net balance (how much you owe / are owed)
2. Recent expenses
3. Quick action (add expense)

## Pattern

```tsx
import { AppShell, PageContent, PageHero, AppSurface } from '@/slate';
import { StatCard, Breath } from '@/slate/atoms';
import { FlatList, ScrollView } from 'react-native';

export default function DashboardScreen() {
  return (
    <AppShell edges={['top', 'bottom']}>
      <Header title="GoDutch" showBack={false} right={<BellButton />} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          {/* Hero — net balance */}
          <PageHero
            eyebrow="YOUR BALANCE"
            title={<Text variant="display" weight="extrabold">₹4,280</Text>}
            description="You are owed ₹4,280 across 3 groups"
          />

          {/* Stat row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard label="You owe" value="₹840" tone="negative" />
            <StatCard label="Owed to you" value="₹5,120" tone="positive" />
          </View>

          <Breath size="md" />

          {/* Recent expenses */}
          <Text variant="title" style={{ marginBottom: 16 }}>Recent</Text>
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPress={() => router.push(`/expenses/${expense.id}`)}
            />
          ))}
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
```

## Key layout decisions

- **Balance is the hero.** Use `PageHero` with `display`-size value — it should be the biggest text on screen.
- **Stats side by side.** Two `StatCard` components in a `flexDirection: 'row'` row with `flex: 1` each.
- **Recent list is not full-height.** It's scrollable within the page — no nested `FlatList` inside a `ScrollView`. For long lists, use a full-screen list (see [list-page.md](list-page.md)).

## Further reading

- [page-templates.md](page-templates.md)
- [list-page.md](list-page.md)
- [../components/expense-card/](../components/expense-card/README.md)
- [../components/atoms/](../components/atoms/README.md) — `StatCard`
