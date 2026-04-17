# frontend/src/slate

> The GoDutch Slate design system: branded components, shadcn/ui primitives, icons, and global styles.

## Overview

Slate is the component library for GoDutch's web frontend. It encodes the Alpine Ledger visual language — tonal topography, no-line rule, 4-point grid, ambient luminosity — into reusable React components so that pages never need to reason about color, spacing, or border radius.

The library has two layers: `components/` contains opinionated, GoDutch-branded wrappers (AppButton, AppField, etc.), and `ui/` contains the underlying shadcn/ui primitives that those wrappers build on.

## How it works

Pages import from `slate/` (not from individual subdirectory files) — `index.js` re-exports everything. Adding a new component means building it, exporting it from its directory's `index.js`, and re-exporting it from the root `index.js`.

## Key files

| Path | What it does |
|------|-------------|
| `components/` | GoDutch-branded components (Button, Field, Shell, Surface, Header, ExpenseCard) |
| `ui/` | shadcn/ui primitives (Dialog, Tabs, Card, Input, Form, etc.) |
| `icons/` | Icon set (Lucide-based, filtered to icons in active use) |
| `styles/` | Global CSS — Tailwind base, typography scale, design tokens |

## Inputs & Outputs

**Takes in:** Props from page components.
**Emits:** Rendered DOM nodes.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `pages/` | Import and compose components |
| Downstream | `ui/` (shadcn/ui) | Primitive component implementation |
| Downstream | Tailwind CSS | Styling via class names |
| Downstream | Framer Motion | Animation (mocked in tests) |

## Gotchas

- Never import directly from `ui/` in pages — always go through `components/` or the Slate root `index.js`. This keeps the API surface clean.
- Framer Motion is mocked in tests (`src/__mocks__/framer-motion.js`) because jsdom doesn't support animations. Any new animation code must be mockable the same way.

## Further reading

- [components/](components/README.md) — branded wrappers
- [ui/](ui/README.md) — shadcn/ui primitives
- [../../../DESIGN_RULES/README.md](../../../DESIGN_RULES/README.md) — design system (components + guides)
- [../../../DESIGN_RULES/user-interface/legacy-web.md](../../../DESIGN_RULES/user-interface/legacy-web.md) — note: this web layer is frozen; canonical Slate is in `mobile/src/slate/`
