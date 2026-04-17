# AppSurface / InteractiveSurface

> Tonal card/surface — the primary container for grouped content. Implements the no-line rule.

**Status:** Shipped · **Source:** `mobile/src/slate/AppSurface.tsx`

## When to use

Use `AppSurface` to group related information that should read as a single unit: a stat block, a form section, an expense summary. Its tone variant communicates depth in the surface hierarchy.

## AppSurface props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'glass' \| 'soft' \| 'solid' \| 'list'` | `'solid'` | Visual style (see Variants) |
| `compact` | `boolean` | `false` | `true` → 16px padding + 20px radius (vs 24px + 28px) |
| `className` | `string` | — | NativeWind layout overrides |
| `style` | `ViewStyle` | — | Merged on top of the base surface style |

All other `ViewProps` are spread onto the underlying `View`.

## InteractiveSurface props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `compact` | `boolean` | `false` | Same as AppSurface |
| `variant` | `'solid' \| 'soft'` | `'solid'` | Background tone for resting state |
| `className` | `string` | — | |
| `style` | `ViewStyle` | — | |

All other `PressableProps` are spread.

## Sample code

```tsx
import { AppSurface } from '@/slate';
import { InteractiveSurface } from '@/slate';

// Standard content card
<AppSurface variant="solid">
  <Text variant="title">Balance</Text>
  <Text variant="display" weight="extrabold">₹4,280</Text>
</AppSurface>

// Compact inside a row
<AppSurface variant="solid" compact>
  <Text variant="label" tone="muted">Your share</Text>
  <Text variant="titleXl" weight="extrabold">₹840</Text>
</AppSurface>

// Soft — secondary section (no shadow)
<AppSurface variant="soft">
  <Text variant="body">This expense is settled.</Text>
</AppSurface>

// Glass — floating hero card
<AppSurface variant="glass">
  <Text variant="eyebrow" tone="primary">Goa Trip</Text>
  <Text variant="titleXl">₹12,400 total</Text>
</AppSurface>

// List row — less rounded, no shadow
<AppSurface variant="list">
  <Text variant="body">Item name</Text>
</AppSurface>

// Interactive — taps to open detail
<InteractiveSurface onPress={() => router.push('/group/1')}>
  <Text variant="title">Goa Trip</Text>
</InteractiveSurface>
```

## Variants

| Variant | Background | Shadow | Radius | Use for |
|---------|-----------|--------|--------|---------|
| `solid` | `#ffffff` | `shadows.cardSm` | 28px | Elevated cards, primary content blocks |
| `soft` | `#f0f4f3` | None | 28px | Secondary info sections |
| `glass` | BlurView (intensity 30–40) + white fallback | `shadows.cardSm` | 28px | Hero cards, floating overlays |
| `list` | `#ffffff` | None | 20px | List row backgrounds |

## Design rules honored

- No 1px borders — separation via background color and shadow only
- Ambient shadow (`shadows.cardSm` = `0 12px 32px rgba(42,52,52,0.05)`)
- `glass` variant uses `expo-blur` with Android fallback
- Minimum radius is 20px even for `compact` — no sharp corners

## Related

- [../buttons/](../buttons/README.md)
- [../../user-interface/guides/tonal-topography.md](../../user-interface/guides/tonal-topography.md)
- [../../user-interface/guides/elevation-and-luminosity.md](../../user-interface/guides/elevation-and-luminosity.md)
