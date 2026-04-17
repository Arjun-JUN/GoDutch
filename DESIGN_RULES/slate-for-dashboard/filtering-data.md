# Filtering Data

> **Status: Not implemented yet.**

Filter chips and sort controls for expense lists.

## When to add filtering

Add filtering when a list can contain > ~20 items. Filtering is needed on:
- All-expenses list (filter by group, date range, category)
- Group settlement view (filter by member)

## Target pattern: filter chips

```tsx
import { FilterChip } from '@/slate'; // not yet exported

<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 24 }}>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <FilterChip label="All" active onPress={() => setFilter('all')} />
    <FilterChip label="Food" onPress={() => setFilter('food')} />
    <FilterChip label="Transport" onPress={() => setFilter('transport')} />
    <FilterChip label="This month" onPress={() => setFilter('this-month')} />
  </View>
</ScrollView>
```

## FilterChip design (when built)

A `FilterChip` is effectively a `MemberBadge` with slightly different semantics:

| State | Background | Text |
|-------|-----------|------|
| Default | `colors.soft` | `colors.foreground` |
| Active | `colors.primary` | `colors.primaryForeground` |

Chips use pill shape (`borderRadius: 999`). No borders.

## Sort control

A sort control is a ghost `AppButton` with a `CaretDown` icon:

```tsx
<AppButton
  variant="ghost"
  size="sm"
  rightIcon={<CaretDown size={14} color={colors.muted} />}
  onPress={openSortSheet}
>
  <Text variant="label" tone="muted">Newest first</Text>
</AppButton>
```

Tapping it opens an `AppBottomSheet` with sort options.

## Filter placement

Place the filter row:
- After the `Header`, before the `FlatList`
- Outside `PageContent` so it doesn't inherit horizontal padding (it needs to scroll edge-to-edge with its own `paddingHorizontal`)

## Further reading

- [list-page.md](list-page.md)
- [../components/atoms/](../components/atoms/README.md) — `MemberBadge` (similar to FilterChip)
