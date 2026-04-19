# Setup

> How to import and use Slate components in a React Native / Expo screen.

## Canonical platform

**`mobile/src/slate/`** is the canonical Slate implementation. All new development targets React Native.

## Imports

```tsx
// Named imports from the barrel export
import { AppButton, AppSurface, AppShell, Text, ExpenseCard } from '@/slate';

// Atoms
import { IconBadge, EmptyState, Breath } from '@/slate/atoms';

// Icons
import { Plus, Receipt, ArrowLeft } from 'lucide-react-native';
```

The path alias `@/` maps to `mobile/src/` via `tsconfig.json` paths.

## Barrel export

`mobile/src/slate/index.ts` re-exports the maintained Slate surface. Add new components there when you create them.

## Styling: NativeWind

Slate components use [NativeWind](https://www.nativewind.dev/) for `className`-based styling. The Tailwind config at `mobile/tailwind.config.js` defines the color, spacing, and radius tokens.

```tsx
<AppSurface variant="soft" className="mb-4">...</AppSurface>
```

For values that Tailwind cannot reach, such as status bar tint or SVG fills, use tokens directly:

```tsx
import { colors, spacing, radii } from '@/theme/tokens';
```

## Fonts

Load **Manrope** via `expo-google-fonts` before rendering. Text variant weights are mapped to named font families, so avoid overriding `fontFamily` on Slate text components.

## Safe area

Wrap every root screen in `<AppShell>`. It handles `SafeAreaView` automatically via `react-native-safe-area-context`.

```tsx
export default function MyScreen() {
  return (
    <AppShell>
      <PageContent>{/* screen content */}</PageContent>
    </AppShell>
  );
}
```

## Platform scope

GoDutch currently ships the Slate system for the Expo mobile app only. Treat `mobile/src/slate/` as the single maintained implementation.

## Further reading

- [mobile/src/slate/index.ts](../../mobile/src/slate/index.ts)
- [mobile/src/theme/tokens.ts](../../mobile/src/theme/tokens.ts)
