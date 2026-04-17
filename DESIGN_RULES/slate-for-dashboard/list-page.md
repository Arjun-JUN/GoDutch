# List Page

> `FlatList` + `ExpenseCard` for displaying scrollable expense lists.

## When to use

Use this pattern for a full-screen list of homogeneous items: all expenses in a group, all settlements, search results.

## Pattern

```tsx
import { AppShell, PageContent, Header, ExpenseCard } from '@/slate';
import { EmptyState } from '@/slate/atoms';
import { FlatList, View } from 'react-native';
import { Receipt } from '@/slate/icons';

export default function ExpenseListScreen({ expenses }) {
  return (
    <AppShell>
      <Header title="All Expenses" showBack />
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 12 }}
        renderItem={({ item }) => (
          <ExpenseCard
            expense={item}
            amount={item.user_share}
            amountLabel="Your share"
            onPress={() => router.push(`/expenses/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Receipt size={28} color={colors.muted} />}
            title="No expenses yet"
            description="Add an expense to get started."
            action={{ label: 'Add expense', onPress: handleAdd }}
          />
        }
      />
    </AppShell>
  );
}
```

## Rules

- **Use `FlatList`, not `ScrollView` + `map`** for lists that may exceed 20 items. FlatList virtualizes rendering.
- **`gap` in `contentContainerStyle`** — use `gap: 12` between cards, not `marginBottom` on each card (avoids extra space on last item on older RN versions).
- **Always provide `ListEmptyComponent`** — use `EmptyState` atom.
- **`paddingHorizontal: 24`** in `contentContainerStyle` matches `PageContent padded` margins.
- **`paddingBottom: 40`** ensures content clears floating action buttons and bottom safe area.

## With a floating add button

```tsx
<View style={{ flex: 1 }}>
  <FlatList ... />
  <View style={{ position: 'absolute', bottom: 24, right: 24 }}>
    <AppButton variant="icon" onPress={handleAdd} leftIcon={<Plus size={22} color={colors.primaryForeground} />} />
  </View>
</View>
```

## Further reading

- [page-templates.md](page-templates.md)
- [../components/expense-card/](../components/expense-card/README.md)
- [../components/atoms/](../components/atoms/README.md) — EmptyState
