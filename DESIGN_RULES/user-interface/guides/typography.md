# Typography

> Manrope, size-first hierarchy, and tight letter-spacing for an editorial voice.

## Typeface

**Manrope** is the sole typeface. Load it via `expo-google-fonts` before the first render (see [setup.md](../setup.md)).

Available weights: `Regular (400)`, `Medium (500)`, `SemiBold (600)`, `Bold (700)`, `ExtraBold (800)`.

## Text variants

Use the `<Text>` component from `@/slate`. Never use React Native's bare `<RNText>` — it bypasses the typescale.

| Variant | Size | Line height | Letter spacing | Default weight | Usage |
|---------|------|-------------|---------------|----------------|-------|
| `display` | 36px | 40px | −1px | ExtraBold | Balances (hero numbers) |
| `titleXl` | 28px | 34px | −0.5px | ExtraBold | Section totals, large headings |
| `titleLg` | 22px | 28px | −0.3px | ExtraBold | Screen titles, sheet headings |
| `title` | 18px | 24px | −0.2px | Bold | Sub-section headers |
| `body` | 15px | 22px | −0.1px | Regular | Default reading text |
| `label` | 13px | 18px | 0 | SemiBold | Form labels, metadata |
| `eyebrow` | 11px | 14px | +2.4px, UPPERCASE | Bold | Category labels above titles |

```tsx
import { Text } from '@/slate';

<Text variant="display">₹4,280.00</Text>
<Text variant="eyebrow" tone="primary">YOUR GROUPS</Text>
<Text variant="body" tone="muted">Split equally among 4 people</Text>
```

## Weight overrides

Default weights are intentional. Only override when there is a clear reason:

```tsx
<Text variant="title" weight="extrabold">Strongly emphasized heading</Text>
```

## Tone

Controls color without leaving the typescale:

| Tone | Color | Usage |
|------|-------|-------|
| `default` | `colors.foreground` (#2a3434) | Primary text |
| `muted` | `colors.muted` (#576160) | Secondary, labels |
| `subtle` | `colors.mutedSubtle` (#727d7c) | Placeholder, hints |
| `primary` | `colors.primary` (#4e635a) | Active states, eyebrows |
| `danger` | `colors.danger` (#9f403d) | Error messages |
| `success` | `colors.success` (#4f7a60) | Confirmation text |
| `inverse` | `colors.primaryForeground` (#e6fdf2) | Text on dark/primary bg |

## Rules

- **Size over weight** — differentiate hierarchy by choosing a smaller variant, not by making large text lighter. A `titleLg` and a `body` read as more distinct than two `body` with different weights.
- **Never pure black** — use `colors.foreground` (#2a3434) for "black" text.
- **Tight display letter-spacing** — display and titleXl have negative letter spacing for an editorial feel. Do not override this.
- **Eyebrow always uppercase** — `eyebrow` variant applies `textTransform: uppercase` automatically.

## Further reading

- [color.md](color.md)
- [../../components/text/](../../components/text/README.md)
