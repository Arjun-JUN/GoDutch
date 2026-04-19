# mobile/src/slate

> Mobile design system: React Native components that encode the GoDutch visual language.

## Overview

This is the maintained Slate implementation for GoDutch. It encodes the shared visual decisions of the app - tonal elevation, no-border surfaces, pill buttons, and expressive typography - using React Native primitives and NativeWind utilities.

All visual output in the app should flow through these components. Route files should not rebuild the design system ad hoc with raw primitives and inline styling.

## Key files

| File | What it renders |
|------|----------------|
| `AppButton.tsx` | Pill button variants |
| `AppInput.tsx` | Labeled text inputs |
| `AppShell.tsx` | Screen layout wrapper |
| `AppSurface.tsx` | Content card with ambient elevation |
| `AppBottomSheet.tsx` | Bottom sheet overlay |
| `Header.tsx` | Screen header |
| `ExpenseCard.tsx` | Expense list row |
| `PageHero.tsx` | Large hero section |
| `Text.tsx` | Typography component |
| `atoms.tsx` | Small utility components |
| `cn.ts` | `clsx` + NativeWind merge helper |
| `index.ts` | Barrel export |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/` routes | Import and compose |
| Downstream | React Native | `View`, `Text`, `Pressable`, `ScrollView` |
| Downstream | NativeWind | `className` to RN styles |
| Downstream | `src/theme/tokens.ts` | Color and spacing values |

## Gotchas

- `AppBottomSheet.tsx` uses Reanimated for sheet motion and may behave differently in browser-based Expo previews.
- `ExpenseCard.tsx` is stateless and expects parent routes to own interaction state.

## Further reading

- [theme/](../theme/README.md)
- [../../../../DESIGN_RULES/README.md](../../../../DESIGN_RULES/README.md) - design system index
- [../../../../DESIGN_RULES/components/README.md](../../../../DESIGN_RULES/components/README.md) - component reference
- [../../../../DESIGN_RULES/user-interface/guides/README.md](../../../../DESIGN_RULES/user-interface/guides/README.md) - color, typography, and spacing rules
