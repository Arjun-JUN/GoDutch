# mobile/src/theme

> Design tokens: the single source of truth for colors, spacing, and typography in the mobile app.

## Overview

`tokens.ts` exports the visual values used by the Expo app - primary greens, surface backgrounds, error colors, spacing scales, and typography sizes - as TypeScript constants. Components import from here when they need raw values such as a `StatusBar` tint or SVG fill.

NativeWind classes are generated from `tailwind.config.js`, which should stay aligned with these values.

## Key files

| File | What it does |
|------|-------------|
| `tokens.ts` | Color palette, spacing scale, and typography tokens |

## Inputs & Outputs

**Takes in:** Nothing - static constants.
**Emits:** Token values consumed by components and config files.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `src/slate/` | Imports token values for non-Tailwind styling |
| Upstream | `app/_layout.tsx` | Uses status bar colors |
| Downstream | None | Static constants |

## Gotchas

- Changes here must be mirrored in `tailwind.config.js` and vice versa or Tailwind classes and raw values will drift apart.

## Further reading

- [slate/](../slate/README.md)
- [../../../../DESIGN_RULES/user-interface/guides/color.md](../../../../DESIGN_RULES/user-interface/guides/color.md) - color usage rules
- [../../../../DESIGN_RULES/user-interface/guides/spacing-and-rhythm.md](../../../../DESIGN_RULES/user-interface/guides/spacing-and-rhythm.md) - spacing rules
