# Spacing and Rhythm

> 4-point grid, generous breath, and the art-gallery feel.

## Spacing tokens

All spacing values live in `mobile/src/theme/tokens.ts`:

```tsx
import { spacing } from '@/theme/tokens';
```

| Token | Value | Usage |
|-------|-------|-------|
| `spacing.xs` | 4px | Tight gaps between inline elements |
| `spacing.sm` | 8px | Small gaps within a component |
| `spacing.s12` | 12px | Row-level gaps (`gap-3` equivalent) — expense lists, quick actions |
| `spacing.md` | 16px | Default padding inside cards |
| `spacing.s20` | 20px | Stat-card padding; hero-action top margin |
| `spacing.lg` | 24px | Page-level horizontal padding (`px-6` in NativeWind) |
| `spacing.xl` | 32px | Between major sections on a screen |
| `spacing.s40` | 40px | Page bottom padding under scrollable content |
| `spacing['2xl']` | 48px | Large section gaps |
| `spacing['3xl']` | 64px | Hero sections |
| `spacing.breath` | 88px | Between functionally distinct groups ("generous breath") |
| `spacing.breathLg` | 136px | Top margin on primary hero sections |

## The 4-point grid

All spacing is a multiple of 4. If you're composing a custom layout, only use values from the token table. Do not introduce arbitrary pixel values like 13 or 22.

## The breath principle

> *"When in doubt, more space = more premium."*

GoDutch aims for an "Art Gallery" feel — content should breathe, not be packed. When laying out groups of related elements:

- Use `spacing.breath` (88px) between **functionally distinct groups** (e.g., balance overview → transaction list).
- Use `spacing.xl` (32px) or `spacing['2xl']` (48px) between related sections within a group.
- Use `spacing.md` (16px) or `spacing.lg` (24px) for internal card padding.

```tsx
import { Breath } from '@/slate/atoms';
import { spacing } from '@/theme/tokens';

// Semantic spacer between functional groups
<Breath size="lg" />  // 56px (not exactly breath, but same intent)

// Or inline
<View style={{ height: spacing.breath }} />
```

## NativeWind equivalents

```tsx
className="p-6"    // padding: 24px (spacing.lg)
className="px-6"   // paddingHorizontal: 24px
className="mb-4"   // marginBottom: 16px (spacing.md)
className="gap-3"  // gap: 12px
```

## Rules

- **4-point grid** — every spacing value must be a multiple of 4.
- **Lean generous** — when choosing between two valid spacings, pick the larger one.
- **No 0-margin stacking** — never put two cards directly against each other with no gap.
- **Art gallery top margin** — hero sections on primary screens use `spacing.breathLg` (136px equivalent) top margin to create the gallery feel.

## Further reading

- [elevation-and-luminosity.md](elevation-and-luminosity.md)
- [../../components/layout.md](../../components/layout.md)
- [../../components/atoms/](../../components/atoms/README.md) (Breath component)
