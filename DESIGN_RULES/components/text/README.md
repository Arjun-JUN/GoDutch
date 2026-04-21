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
| `variant` | `'display' \| 'titleXl' \| 'titleLg' \| 'title' \| 'titleSm' \| 'body' \| 'label' \| 'eyebrow' \| 'eyebrowSm' \| 'amount' \| 'amountLg'` | `'body'` | Size + letter-spacing preset |
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
| `titleSm` | `bold` |
| `body` | `regular` |
| `label` | `semibold` |
| `eyebrow` | `bold` |
| `eyebrowSm` | `bold` |
| `amount` | `extrabold` |
| `amountLg` | `extrabold` |

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

| Variant | Size | Line height | Letter spacing | Intended use |
|---------|------|-------------|---------------|--------------|
| `display` | 36px | 40px | −1px | Hero numbers, balance displays |
| `titleXl` | 28px | 34px | −0.5px | Section totals, large headings |
| `titleLg` | 22px | 28px | −0.3px | Screen titles, sheet headings |
| `title` | 18px | 24px | −0.2px | Sub-section headers |
| `titleSm` | 17px | 22px | −0.2px | Row-level merchant / list titles (`ExpenseCard`) |
| `body` | 15px | 22px | −0.1px | Default reading text |
| `label` | 13px | 18px | 0 | Form labels, metadata |
| `eyebrow` | 11px | 14px | +2.4px, UPPERCASE | Category labels above titles |
| `eyebrowSm` | 10px | 14px | +1.5px, UPPERCASE | Micro-eyebrow ("YOUR SHARE") |
| `amount` | 24px | 28px | −0.8px | Inline amounts in expense / settlement rows |
| `amountLg` | 30px | 34px | −1px | Stat-card amounts (dashboard balance, totals) |

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
