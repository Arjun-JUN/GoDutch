# Text

> Manrope-wrapped typographic component — variant + weight + tone, never raw RNText in screens.

**Status:** Shipped · **Source:** `mobile/src/slate/Text.tsx`

## When to use

Always use this `Text` instead of React Native's bare `<Text>` in screens and components. It enforces:
- Manrope typeface at the correct weight
- The editorial typescale (size + letter-spacing per variant)
- Consistent color via `tone` prop

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'display' \| 'titleXl' \| 'titleLg' \| 'title' \| 'body' \| 'label' \| 'eyebrow'` | `'body'` | Size + letter-spacing preset |
| `weight` | `'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold'` | See defaults below | Overrides the variant's default weight |
| `tone` | `'default' \| 'muted' \| 'subtle' \| 'primary' \| 'danger' \| 'inverse' \| 'success'` | `'default'` | Color |
| `className` | `string` | — | NativeWind className |

All `TextProps` are spread onto the underlying RNText.

## Default weights by variant

| Variant | Default weight |
|---------|---------------|
| `display` | `extrabold` |
| `titleXl` | `extrabold` |
| `titleLg` | `extrabold` |
| `title` | `bold` |
| `body` | `regular` |
| `label` | `semibold` |
| `eyebrow` | `bold` |

## Sample code

```tsx
import { Text } from '@/slate';

// Hero balance
<Text variant="display" weight="extrabold">₹4,280</Text>

// Screen title
<Text variant="titleLg">Add Expense</Text>

// Section header
<Text variant="title">Split Details</Text>

// Body text
<Text variant="body" tone="muted">
  This expense is split equally among all members.
</Text>

// Form label
<Text variant="label" weight="semibold" tone="muted">Amount</Text>

// Eyebrow above title
<Text variant="eyebrow" tone="primary">YOUR BALANCE</Text>

// Error text
<Text variant="label" tone="danger">Email is required</Text>

// Weight override
<Text variant="body" weight="bold">Important note</Text>

// Inline with numberOfLines
<Text variant="body" numberOfLines={2} ellipsizeMode="tail">
  A very long expense description that should truncate after two lines.
</Text>
```

## Typescale reference

| Variant | Size | Line height | Letter spacing |
|---------|------|-------------|---------------|
| `display` | 36px | 40px | −1px |
| `titleXl` | 28px | 34px | −0.5px |
| `titleLg` | 22px | 28px | −0.3px |
| `title` | 18px | 24px | −0.2px |
| `body` | 15px | 22px | −0.1px |
| `label` | 13px | 18px | 0 |
| `eyebrow` | 11px | 14px | +2.4px, UPPERCASE |

## Tone → color

| Tone | Color token | Hex |
|------|------------|-----|
| `default` | `colors.foreground` | `#2a3434` |
| `muted` | `colors.muted` | `#576160` |
| `subtle` | `colors.mutedSubtle` | `#727d7c` |
| `primary` | `colors.primary` | `#4e635a` |
| `danger` | `colors.danger` | `#9f403d` |
| `success` | `colors.success` | `#4f7a60` |
| `inverse` | `colors.primaryForeground` | `#e6fdf2` |

## Related

- [../../user-interface/guides/typography.md](../../user-interface/guides/typography.md)
- [../../user-interface/guides/color.md](../../user-interface/guides/color.md)
