# Indicators

> Status badges, progress, and skeleton loading states.

## Current indicators

GoDutch does not yet have a dedicated `Badge`, `Progress`, or `Skeleton` component in the React Native Slate library. Use the patterns below until the library grows a dedicated indicator surface.

## Status dots

For simple positive, negative, or neutral indicators, use a small `View` circle inline with text:

```tsx
import { View } from 'react-native';
import { colors } from '@/theme/tokens';

<View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.primary }} />
<View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.danger }} />
```

`StatCard` uses this pattern with its `tone` prop.

## Category and type badge

For tags and category chips, `MemberBadge` works as a read-only badge:

```tsx
import { MemberBadge } from '@/slate/atoms';

<MemberBadge>Food</MemberBadge>
<MemberBadge active>Transport</MemberBadge>
```

## Loading skeleton

**Status: Not implemented yet.** Until a `Skeleton` component exists, show a loading state via `ActivityIndicator`:

```tsx
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme/tokens';

{isLoading ? (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
    <ActivityIndicator color={colors.primary} size="large" />
  </View>
) : (
  <FlatList />
)}
```

## Progress bar

**Status: Not implemented yet.** Target API:

```tsx
<ProgressBar value={0.6} tone="primary" />
<ProgressBar value={0.3} tone="danger" />
```

Design rules for when built:

- Height: 6px
- Background: `colors.soft`
- Fill: `colors.primary` by default or `colors.danger`
- Border radius: `pill` (`999`)
- No border

## Further reading

- [atoms/](atoms/README.md) - `StatCard`, `MemberBadge`
- [interaction-states.md](interaction-states.md) - loading state in buttons
