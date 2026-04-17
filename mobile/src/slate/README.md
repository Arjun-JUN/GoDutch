# mobile/src/slate

> Mobile design system: React Native components that encode the GoDutch Alpine Ledger visual language.

## Overview

The mobile counterpart to `frontend/src/slate/`. Same design tokens, same visual decisions (tonal elevation, no-border surfaces, pill buttons), adapted to React Native constraints: NativeWind Tailwind classes for utility styling, React Native's `View`/`Text`/`Pressable` as the underlying primitives.

All visual output in the app comes through these components. Route files should never use raw `View`/`Text` with inline styles.

## Key files

| File | What it renders |
|------|----------------|
| `AppButton.tsx` | Pill button — primary/secondary/tertiary variants |
| `AppInput.tsx` | Labeled text input with GoDutch styling |
| `AppShell.tsx` | Screen layout wrapper — safe area, background, scroll |
| `AppSurface.tsx` | Content card with ambient shadow, no border |
| `AppBottomSheet.tsx` | Bottom sheet overlay for modals |
| `Header.tsx` | Screen header — title, back button, action slot |
| `ExpenseCard.tsx` | Expense list item — merchant, amount, split summary |
| `PageHero.tsx` | Large hero section — balance display, gradient |
| `Text.tsx` | Typography component — title/body/caption variants |
| `atoms.tsx` | Small utility components — Badge, Divider, Avatar, etc. |
| `cn.ts` | `clsx` + NativeWind merge utility |
| `index.ts` | Barrel re-export |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/` (all route files) | Import and compose |
| Downstream | React Native | `View`, `Text`, `Pressable`, `ScrollView` |
| Downstream | NativeWind | Tailwind class → React Native style |
| Downstream | `src/theme/tokens.ts` | Color and spacing values |

## Gotchas

- `AppBottomSheet.tsx` uses `react-native-reanimated` for gesture-driven animation. On Expo Go in browser, this may behave differently.
- `ExpenseCard.tsx` is stateless — all data is props. Interaction state is handled by the parent route.

## Further reading

- [theme/](../theme/README.md)
- [../../../../DESIGN_RULES/README.md](../../../../DESIGN_RULES/README.md) — design system index
- [../../../../DESIGN_RULES/components/README.md](../../../../DESIGN_RULES/components/README.md) — component reference
- [../../../../DESIGN_RULES/user-interface/guides/](../../../../DESIGN_RULES/user-interface/guides/README.md) — color, typography, spacing rules
