# Setup

> How to import and use Slate components in a React Native / Expo screen.

## Canonical platform

**`mobile/src/slate/`** is the canonical Slate implementation. All new development targets React Native.

## Imports

```tsx
// Named imports from the barrel export
import { AppButton, AppSurface, AppShell, Text, ExpenseCard } from '@/slate';

// Atoms (IconBadge, MemberBadge, StatCard, EmptyState, Callout, Avatar, Breath)
import { IconBadge, EmptyState, Breath } from '@/slate/atoms';

// Icons (Phosphor, re-exported from @/slate/icons for consistent weight/size)
import { Plus, Receipt, ArrowLeft } from '@/slate/icons';
// NOTE: mobile uses lucide-react-native directly in some components — prefer Phosphor for screens
```

The path alias `@/` maps to `mobile/src/` via `tsconfig.json` paths.

## Barrel export

`mobile/src/slate/index.ts` re-exports everything. Add new components there when you create them.

## Styling: NativeWind

Slate components use [NativeWind](https://www.nativewind.dev/) for className-based styling. The Tailwind config at `mobile/tailwind.config.js` defines all color, spacing, and radius tokens.

```tsx
// Use className for layout overrides; tokens for raw values
<AppSurface variant="soft" className="mb-4">...</AppSurface>
```

For values that Tailwind can't reach (status bar tint, gradient stops, Reanimated interpolations) use tokens directly:

```tsx
import { colors, spacing, radii } from '@/theme/tokens';
```

## Fonts

Load **Manrope** via `expo-google-fonts` before rendering. All Text variant weights are mapped to named font families (`Manrope_400Regular`, `Manrope_700Bold`, etc.) — do not override `fontFamily` on Text components.

```tsx
// In app/_layout.tsx
import { useFonts, Manrope_400Regular, Manrope_500Medium,
         Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
```

## Safe area

Wrap every root screen in `<AppShell>`. It handles `SafeAreaView` automatically via `react-native-safe-area-context`.

```tsx
export default function MyScreen() {
  return (
    <AppShell>
      <PageContent>
        {/* screen content */}
      </PageContent>
    </AppShell>
  );
}
```

## React Native for Web

GoDutch is moving toward a single RN codebase for both iOS/Android and web. The path:

1. `react-native-web` is already a transitive dependency via Expo.
2. Switch the web bundler entry from the current Vite/React setup to `expo export:web` or a Metro web bundle.
3. Replace Tailwind CSS in the web app with NativeWind (already used in `mobile/`).
4. Retire `frontend/src/slate/` — see [legacy-web.md](legacy-web.md).

Until that migration is complete, the web app uses `frontend/src/slate/` which is a separate (frozen) implementation.

## Further reading

- [legacy-web.md](legacy-web.md)
- [mobile/src/slate/index.ts](../../mobile/src/slate/index.ts)
- [mobile/src/theme/tokens.ts](../../mobile/src/theme/tokens.ts)
