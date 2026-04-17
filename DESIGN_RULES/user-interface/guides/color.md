# Color

> The Alpine Ledger palette — a soft sage-and-white tonal system that keeps the UI calm and editorial.

## Palette

All tokens live in `mobile/src/theme/tokens.ts`. Import via:

```tsx
import { colors } from '@/theme/tokens';
```

### Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `colors.primary` | `#4e635a` | Primary actions, active states, primary text tint |
| `colors.primaryStrong` | `#42564e` | Gradient end for primary buttons |
| `colors.primaryForeground` | `#e6fdf2` | Text/icons on primary backgrounds |
| `colors.primaryContainer` | `#d1e8dd` | Secondary button background, soft highlights |

### Surface (backgrounds)

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `colors.backgroundStart` | `#f8faf9` | App gradient top (`AppShell`) |
| `colors.backgroundEnd` | `#eef3f1` | App gradient bottom |
| `colors.soft` | `#f0f4f3` | Secondary content areas, input default bg |
| `colors.softStrong` | `#d1e8dd` | Input focused bg |
| `colors.softHighest` | `#dae5e3` | Input bg in some states |
| `colors.surfaceSolid` | `#ffffff` | Elevated cards (`AppSurface solid`) |
| `colors.surface` | `rgba(255,255,255,0.84)` | Glass surface fallback |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `colors.foreground` | `#2a3434` | Primary text — never pure `#000000` |
| `colors.muted` | `#576160` | Secondary text, labels |
| `colors.mutedSubtle` | `#727d7c` | Placeholder, hints |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `colors.danger` | `#9f403d` | Error text, danger buttons (desaturated — not bright red) |
| `colors.dangerSoft` | `rgba(159,64,61,0.1)` | Error input bg, callout bg |
| `colors.success` | `#4f7a60` | Success states |
| `colors.successSoft` | `rgba(79,122,96,0.1)` | Success callout bg |

### Borders (ghost borders only)

| Token | Value | Usage |
|-------|-------|-------|
| `colors.border` | `rgba(169,180,179,0.18)` | Ghost border (accessibility fallback only — see tonal-topography) |
| `colors.borderSoft` | `rgba(169,180,179,0.14)` | Subtle divider when truly needed |
| `colors.borderGhost` | `rgba(169,180,179,0.15)` | Alias used in older components |

## Gradients

```tsx
import { gradients } from '@/theme/tokens';

gradients.primary    // [colors.primary, colors.primaryStrong] — primary button fill
gradients.background // [colors.backgroundStart, colors.backgroundEnd] — AppShell bg
```

## Rules

1. **Never use `#000000` or `#ffffff` for text.** Use `colors.foreground` and `colors.primaryForeground` instead.
2. **Never use bright red for errors.** `colors.danger` is desaturated to avoid user panic.
3. **Use soft tones for backgrounds, not neutral grays.** The palette is sage-tinted throughout.
4. **Borders are a last resort.** See [tonal-topography.md](tonal-topography.md).

## Tailwind class equivalents

In NativeWind `className` props, the tokens map to Tailwind custom colors defined in `mobile/tailwind.config.js`:

```tsx
<Text className="text-foreground" />          // colors.foreground
<View className="bg-soft" />                  // colors.soft
<View className="bg-primary-container" />     // colors.primaryContainer
```

## Further reading

- [tonal-topography.md](tonal-topography.md)
- [mobile/src/theme/tokens.ts](../../../mobile/src/theme/tokens.ts)
