# Header

> In-page navigation bar — back button, centered title, right action slot.

**Status:** Shipped · **Source:** `mobile/src/slate/Header.tsx`

## Why in-page, not native

Native stack headers are disabled globally in GoDutch (`headerShown: false` in Expo Router layout). This gives full control over the header appearance to match the Slate design language.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `title` | `string` | — | Centered; renders as `Text variant="title" weight="bold"` |
| `eyebrow` | `string` | — | Small caps label above title |
| `showBack` | `boolean` | `true` | Renders back button on the left |
| `onBack` | `() => void` | — | Custom handler; defaults to `router.back()` if `router.canGoBack()` |
| `right` | `ReactNode` | — | 44pt-wide right slot; pass a button or icon |

## Sample code

```tsx
import { Header } from '@/slate';
import { AppButton } from '@/slate';
import { colors } from '@/theme/tokens';

// Standard sub-screen
<Header title="Expense Detail" showBack />

// With right action button
<Header
  title="Split"
  showBack
  right={
    <AppButton variant="ghost" size="sm" onPress={handleDone}>Done</AppButton>
  }
/>

// Root tab screen (no back)
<Header title="GoDutch" showBack={false} />

// With eyebrow (group context)
<Header eyebrow="GOA TRIP" title="Expenses" showBack />

// Custom back handler (e.g. discard changes confirmation)
<Header
  title="Add Expense"
  showBack
  onBack={handleDiscardConfirm}
/>
```

## Layout

```
[ 44pt back btn ] [ flex-1 centered title/eyebrow ] [ 44pt right slot ]
```

Padding: 24px horizontal, 8px top, 16px bottom.

## Design rules honored

- Back button uses `AppButton variant="icon"` with `ArrowLeft` icon — matches pill/circle shape system
- Title is centered, not left-aligned (editorial feel)
- No border below the header — screen content flows naturally into the gradient background

## Related

- [../shell/](../shell/README.md)
- [../../slate-for-dashboard/navigation.md](../../slate-for-dashboard/navigation.md)

