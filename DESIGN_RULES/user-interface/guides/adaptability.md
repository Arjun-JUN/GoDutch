# Adaptability

> Safe areas, responsive layout considerations, and the dark mode stance.

## Safe areas

Always wrap screens in `<AppShell>`, which applies `SafeAreaView` automatically.

```tsx
import { AppShell, PageContent } from '@/slate';

export default function MyScreen() {
  return (
    <AppShell edges={['top']}>
      <PageContent>
        {/* content */}
      </PageContent>
    </AppShell>
  );
}
```

`AppShell` props:

| Prop | Default | Notes |
|------|---------|-------|
| `edges` | `['top']` | Pass `['top', 'bottom']` on tab screens |
| `flat` | `false` | Disables the gradient bg for screens with a custom background |

For bottom-safe areas on non-tab screens, add padding via:
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();
<View style={{ paddingBottom: insets.bottom + 16 }} />
```

## Responsive layout

GoDutch primarily targets phones (320–430pt wide). The design system is not tablet-first, but avoid hard-coded widths:

- Prefer `flex: 1` over fixed widths.
- Use `PageContent` (with `padded` prop) for consistent 24px horizontal margins.
- For two-column layouts, use `flexDirection: 'row'` with `flex: 1` on each child.

## Dark mode

**GoDutch does not currently ship dark mode.** The design palette is a light sage-and-white system.

- Do not use `useColorScheme()` to conditionally flip colors.
- Do not add dark mode variants to tokens.

If dark mode is added in the future, it will be done as a full token-level update — all components will switch automatically via token replacement, not per-component conditionals.

## Text scaling

React Native respects the OS "Font Size" accessibility setting (`allowFontScaling`, default `true`). Slate's `Text` component does not disable font scaling. Ensure layouts can accommodate 1.5× text scaling without overflow.

Avoid hard-coded heights on text containers. Let them grow with content.

## Further reading

- [accessibility.md](accessibility.md)
- [../../components/shell/](../../components/shell/README.md)
