# Atoms

> Utility building blocks — badges, stat cards, empty states, callouts, avatars, and spacers.

**Status:** Shipped · **Source:** `mobile/src/slate/atoms.tsx`

## Components

| Atom | Purpose |
|------|---------|
| `IconBadge` | Circular background with a centered icon |
| `MemberBadge` | Pill-shaped member tag (optionally pressable and active) |
| `StatCard` | Metric card: label + large value + optional description |
| `EmptyState` | Centered empty-list illustration with title, description, and CTA |
| `Callout` | Inline info/danger/success banner |
| `Avatar` | Initials avatar circle |
| `Breath` | Semantic vertical spacer |

## Import

```tsx
import { IconBadge, MemberBadge, StatCard, EmptyState, Callout, Avatar, Breath } from '@/slate/atoms';
```

---

## IconBadge

Circular background tile — for icons in expense cards, empty states, and list rows.

| Prop | Type | Default |
|------|------|---------|
| `icon` | `ReactNode` | required |
| `tone` | `'soft' \| 'white' \| 'primary' \| 'danger'` | `'soft'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

Sizes: sm=36pt, md=44pt, lg=56pt.

```tsx
import { Plus, Receipt } from 'lucide-react-native';
<IconBadge icon={<Receipt size={24} color={colors.foreground} />} tone="soft" size="md" />
<IconBadge icon={<Plus size={20} color={colors.primaryForeground} />} tone="primary" size="sm" />
```

---

## MemberBadge

Pill tag for displaying group members. Can be active (selected) or pressable.

| Prop | Type | Default |
|------|------|---------|
| `children` | `ReactNode` | required |
| `active` | `boolean` | `false` |
| `onPress` | `() => void` | — |

```tsx
<MemberBadge active>Arjun</MemberBadge>
<MemberBadge onPress={() => toggleMember(m.id)}>{m.name}</MemberBadge>

{/* Member selection row */}
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {members.map((m) => (
    <MemberBadge key={m.id} active={selected.includes(m.id)} onPress={() => toggle(m.id)}>
      {m.name}
    </MemberBadge>
  ))}
</View>
```

---

## StatCard

Metric display card for the dashboard. Use two `StatCard`s in a row for the balance overview.

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | required |
| `value` | `string` | required |
| `description` | `string` | — |
| `tone` | `'default' \| 'positive' \| 'negative'` | `'default'` |
| `indicatorColor` | `string` | — |
| `valueColor` | `string` | — |
| `icon` | `ReactNode` | — |

`positive` → `colors.primary` (green) value; `negative` → `colors.danger` value.

```tsx
<View style={{ flexDirection: 'row', gap: 12 }}>
  <StatCard label="You owe" value="₹840" tone="negative" />
  <StatCard label="Owed to you" value="₹5,120" tone="positive" />
</View>

<StatCard label="Total spent" value="₹12,400" description="This month" />
```

---

## EmptyState

Centered placeholder for empty lists and first-use screens.

| Prop | Type | Default |
|------|------|---------|
| `title` | `string` | required |
| `icon` | `ReactNode` | — |
| `description` | `string` | — |
| `action` | `{ label: string; onPress: () => void }` | — |

```tsx
import { Plus, Receipt } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

<EmptyState
  icon={<Receipt size={28} color={colors.muted} />}
  title="No expenses yet"
  description="Add your first expense to get started splitting costs."
  action={{ label: 'Add Expense', onPress: handleAdd }}
/>
```

---

## Callout

Inline contextual message — not a toast, not a modal. Use for inline hints, warnings, or status.

| Prop | Type | Default |
|------|------|---------|
| `tone` | `'info' \| 'danger' \| 'success'` | `'info'` |
| `className` | `string` | — |
| `children` | `ReactNode` | required |

String children are wrapped in `Text variant="label"` automatically.

```tsx
<Callout tone="info">
  This expense is settled. No further action needed.
</Callout>

<Callout tone="danger">
  You have an outstanding balance with Priya.
</Callout>

<Callout tone="success">
  Settlement recorded. Arjun has been notified.
</Callout>
```

---

## Avatar

Initials circle for member identification.

| Prop | Type | Default |
|------|------|---------|
| `name` | `string` | required |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `tone` | `'default' \| 'primary'` | `'default'` |

Sizes: sm=32pt, md=44pt, lg=56pt. Extracts up to 2 initials from `name`.

```tsx
<Avatar name="Arjun Vikas" />
<Avatar name="Priya Singh" tone="primary" size="sm" />
```

---

## Breath

Semantic vertical spacer for "generous breath" between functional groups.

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

Heights: sm=16px, md=32px, lg=56px.

```tsx
<StatCard ... />
<Breath size="md" />
<Text variant="title">Recent Expenses</Text>
```

---

## Related

- [../text/](../text/README.md)
- [../surfaces/](../surfaces/README.md)
- [../../user-interface/guides/spacing-and-rhythm.md](../../user-interface/guides/spacing-and-rhythm.md)

