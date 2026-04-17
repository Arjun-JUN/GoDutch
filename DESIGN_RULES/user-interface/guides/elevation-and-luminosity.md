# Elevation and Luminosity

> Ambient, ultra-diffused shadows — depth through tonal layering, not hard drop shadows.

## The layering principle

Don't use heavy shadows to highlight cards. Instead:

- Put a `surfaceSolid` (#ffffff) card on a `soft` (#f0f4f3) or gradient background.
- The 3% luminance difference between the card and background is enough to convey "elevated."
- Add an **ambient shadow** only on floating elements (bottom sheets, buttons, elevated cards).

## Shadow tokens

```tsx
import { shadows } from '@/theme/tokens';
```

| Token | Offset | Blur | Opacity | Used on |
|-------|--------|------|---------|---------|
| `shadows.card` | 0, 16px | 40px | 6% | Large cards (full-width) |
| `shadows.cardSm` | 0, 12px | 32px | 5% | Compact cards, list rows, `AppSurface solid` |
| `shadows.button` | 0, 12px | 30px | 22% (primary tinted) | Primary `AppButton` |

```tsx
import { shadows } from '@/theme/tokens';

<View style={{ ...shadows.cardSm, backgroundColor: colors.surfaceSolid, borderRadius: 28 }}>
  {/* content */}
</View>
```

## Glass variant shadows

`AppSurface variant="glass"` uses `BlurView` (intensity 30–40) instead of a shadow. On platforms where blur is not available, it falls back to `colors.surface` (`rgba(255,255,255,0.84)`).

## Rules

- **Ultra-diffused, not hard** — never use a tight shadow like `0 2px 4px rgba(0,0,0,0.2)`. That's a web/Material pattern, not Alpine Ledger.
- **One elevation per screen** — don't stack multiple shadow levels. Pick one: ambient card shadows, or floating bottom-sheet shadow, not both.
- **No explicit elevation on flat screens** — if the card is already on a tinted background and clearly separated by color, omit the shadow.
- **Button shadow is primary-tinted** — `shadows.button` uses `colors.primary` as shadow color. This tinting is intentional.

## Further reading

- [tonal-topography.md](tonal-topography.md)
- [color.md](color.md)
- [../../components/surfaces/](../../components/surfaces/README.md)
