# mobile/src/theme

> Design tokens: the single source of truth for colors, spacing, and typography in the mobile app.

## Overview

`tokens.ts` exports the same visual values as the Tailwind config — primary green (#4e635a), surface backgrounds, error red, text hierarchy — as TypeScript constants. Components import from here when they need a raw value (e.g. for a `StatusBar` tint or an SVG fill). Tailwind classes in NativeWind are generated from `tailwind.config.js`, which references the same values.

## Key files

| File | What it does |
|------|-------------|
| `tokens.ts` | Color palette, spacing scale, type sizes — matches `tailwind.config.js` |

## Inputs & Outputs

**Takes in:** Nothing — static constants.
**Emits:** TypeScript token values consumed by components and config files.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `src/slate/` | Import token values for non-Tailwind styling |
| Upstream | `app/_layout.tsx` | `StatusBar` tint color |
| Downstream | None | Static constants |

## Gotchas

- Changes here must be mirrored in `tailwind.config.js` (and vice versa) or Tailwind classes and raw token values will diverge.
- These token values should also stay in sync with the web `tailwind.config.js` in `frontend/`.

## Further reading

- [slate/](../slate/README.md)
- [../../../../DESIGN_RULES/user-interface/guides/color.md](../../../../DESIGN_RULES/user-interface/guides/color.md) — color usage rules
- [../../../../DESIGN_RULES/user-interface/guides/spacing-and-rhythm.md](../../../../DESIGN_RULES/user-interface/guides/spacing-and-rhythm.md) — spacing rules
