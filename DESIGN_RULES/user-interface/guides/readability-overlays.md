# Readability Overlays

> How to place text over imagery without losing contrast. Linear gradients and progressive blur, never hope.

## The problem

Photographs and illustrations have variable luminance. The same image has bright patches and dark patches. Text placed directly on top of it is readable in one region and invisible in another — the user's eye has to work, and accessibility contrast fails in the bright spots.

A *readability overlay* sits between the image and the text. It normalizes the contrast so the text is readable everywhere the text appears. Two patterns:

1. **LinearGradient** — a dark-to-transparent wash, positioned in the text region
2. **Progressive blur** — an `expo-blur` `BlurView` with opacity, positioned in the text region

Use a gradient for simple, performant overlays (list cards, hero photos). Use a progressive blur for premium surfaces where the image should still read clearly through the effect (hero detail screens, empty states with imagery).

## Contrast target

Every text-on-image composition must meet **WCAG 2.0 AA**:

- Body text ≥ **4.5:1** contrast
- Large text (≥ 18pt regular or ≥ 14pt bold) ≥ **3:1**

Measure against the darkest plausible region of the image once the overlay is applied. When in doubt, strengthen the overlay.

## Pattern 1 — LinearGradient

Use `expo-linear-gradient`. Gradient runs from transparent (where the image should show) to a dark color (where the text sits).

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Image, View } from 'react-native';
import { Text } from '@/slate';
import { colors, spacing } from '@/theme/tokens';

<View style={{ height: 240, borderRadius: radii.xl, overflow: 'hidden' }}>
  <Image source={require('./ski.jpg')} style={StyleSheet.absoluteFill} />

  {/* Overlay — dark at the bottom where the text sits, transparent up top */}
  <LinearGradient
    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
    locations={[0.4, 1]}
    style={StyleSheet.absoluteFill}
  />

  {/* Text on top */}
  <View style={{ position: 'absolute', bottom: spacing.md, left: spacing.md, right: spacing.md }}>
    <Text variant="titleLg" style={{ color: colors.white }}>Hit the slopes this winter</Text>
    <Text variant="label" style={{ color: colors.white, opacity: 0.85 }}>12 new trails open</Text>
  </View>
</View>
```

Gradient rules:
- **Direction** matches the text position. Text at bottom → transparent top → dark bottom. Text at top → dark top → transparent bottom.
- **Max opacity `0.55`–`0.7`**. Beyond that the image is visually lost and you might as well use a solid card.
- **Start the dark stop at `0.4`** (40% of the gradient length), not `0`. A gradient that's dark everywhere is a solid; a gradient that fades too gently doesn't help the text.

## Pattern 2 — Progressive blur

Use `expo-blur` with `intensity` tuned to the image complexity. Blur preserves the image's shape and color through the overlay, which reads as more premium than a flat gradient.

```tsx
import { BlurView } from 'expo-blur';

<View style={{ height: 240, borderRadius: radii.xl, overflow: 'hidden' }}>
  <Image source={require('./slopes.jpg')} style={StyleSheet.absoluteFill} />

  {/* Blurred band at the bottom where the text sits */}
  <BlurView
    intensity={40}
    tint="dark"
    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: spacing.md }}
  >
    <View style={{ paddingHorizontal: spacing.md }}>
      <Text variant="titleLg" style={{ color: colors.white }}>Hit the slopes this winter</Text>
      <Text variant="label" style={{ color: colors.white, opacity: 0.85 }}>12 new trails open</Text>
    </View>
  </BlurView>
</View>
```

Blur rules:
- **Intensity 30–60** for text overlays. Below 30 the contrast is insufficient; above 60 you've blurred the image out of existence.
- **Tint matches the text.** Dark tint with light text, light tint with dark text. Never dark text on a dark blur — contrast drops.
- **Confine the blur to the text region.** Blurring the whole image defeats the point of having an image.

## Which one to use

| Situation | Pick |
|-----------|------|
| List cards with image thumbnails | Gradient |
| Single hero section with photo | Gradient (simpler, cheaper on scroll) |
| Premium detail header (e.g., group detail with cover photo) | Progressive blur |
| Empty states with illustrative imagery | Gradient |
| Modal / bottom-sheet over a photo background | Progressive blur (this is what `AppSurface variant="glass"` already does) |

## Never do

- **No text directly on an image** with no overlay. Even "the image is dark" is a lie once the user opens the app outdoors.
- **No `textShadow` as a substitute.** It works on title-case text of one line and fails on body text, multi-line copy, and i18n strings.
- **No semi-transparent white behind text** (`rgba(255,255,255,0.6)`). It reads as a broken blur and fails contrast in both directions.

## Gotchas

- `BlurView` is expensive on Android's low-tier devices. Under heavy list scroll, prefer gradient.
- `StyleSheet.absoluteFill` requires the parent to have `overflow: 'hidden'` and explicit bounds, otherwise the overlay escapes the image.
- Gradient `locations` must be monotonic ascending. `[0.4, 1]` is valid; `[1, 0.4]` silently flips and looks wrong.

## Further reading

- [foundational-principles.md](foundational-principles.md) — pillar 4
- [elevation-and-luminosity.md](elevation-and-luminosity.md) — why Slate avoids heavy shadows
- [../../components/surfaces/](../../components/surfaces/README.md) — `AppSurface variant="glass"` already uses progressive blur
- [accessibility.md](accessibility.md) — WCAG contrast targets
