# Affordances & Signifiers

> How the UI communicates what is clickable, grouped, active, and disabled — without words.

## Overview

An *affordance* is what an element allows a user to do (tap, toggle, drag). A *signifier* is how the UI communicates that the affordance exists (a container, a weight shift, an icon pairing). Every interactive element in GoDutch must have both.

This doc is the detail companion to the first pillar in [`../user-interface/guides/foundational-principles.md`](../user-interface/guides/foundational-principles.md). The rules here apply across Slate components and app screens.

## Grouping

Related controls share a container. Unrelated ones don't.

When three chips toggle between *Drinks*, *Food*, and *Dessert*, but only *Drinks* and *Food* are real categories for the current order, place *Drinks* and *Food* inside a shared tonal container. *Dessert* sits outside, visibly disabled.

```tsx
// ✅ Correct — related options inside a shared soft surface
<View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.xs,
               backgroundColor: colors.soft, borderRadius: radii.pill }}>
  <Chip active>Drinks</Chip>
  <Chip>Food</Chip>
</View>
<Chip disabled>Dessert</Chip>

// ❌ Wrong — three chips in a flex row with no container
<View style={{ flexDirection: 'row', gap: 10 }}>
  <Chip active>Drinks</Chip>
  <Chip>Food</Chip>
  <Chip disabled>Dessert</Chip>
</View>
```

The container itself is the affordance: it signals "choose one of these."

## Active vs. inactive — more than color

A selected item must be distinguishable from unselected by something other than hue. Colorblind users, users in glare, users on e-ink screens — they all lose the color-only signal.

Acceptable non-color signifiers:
- **Filled background** vs. transparent (tonal shift)
- **Weight shift** (regular → semibold, semibold → extrabold)
- **Check-mark or dot** appended to the label
- **Scale / elevation** shift (slightly larger, slightly raised)

Pick **one** in addition to color. Two is overkill.

```tsx
// MemberBadge active state — background fill + weight shift
<Pressable style={{
  backgroundColor: active ? colors.primary : colors.soft,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: radii.pill,
}}>
  <Text variant="label" style={{
    color: active ? colors.primaryForeground : colors.foreground,
    fontWeight: active ? '700' : '500',   // ← non-color signifier
  }}>
    {label}
  </Text>
</Pressable>
```

## Disabled — more than opacity

`opacity: 0.6` alone reads as *loading* or *pending*, not *disabled*. Pair it with desaturation or a muted tone.

On React Native, true CSS `filter: grayscale()` is not available, so achieve the effect by:
- **Substituting the tonal palette** — disabled buttons use `colors.soft` (background) + `colors.mutedSubtle` (text) instead of primary hues
- **Removing the shadow** — disabled cards have no `shadows.card` elevation
- **Dropping the press affordance** — disabled rows have no `onPress` handler at all (so there's no wasted tap)

```tsx
// AppButton disabled — opacity AND tonal shift
const disabledStyle = isDisabled ? {
  opacity: 0.6,
  backgroundColor: colors.soft,          // ← not the primary hue
  color: colors.mutedSubtle,             // ← not primaryForeground
  shadowOpacity: 0,                      // ← no lift
} : {};
```

Keep disabled elements in the accessibility tree:

```tsx
<Pressable
  accessibilityState={{ disabled: isDisabled }}
  accessibilityRole="button"
  disabled={isDisabled}
>
  ...
</Pressable>
```

Screen readers still announce the label and its disabled state — removing the element breaks a11y.

## Iconography over text

When an icon alone communicates, prefer the icon. A "from → to" route is a line with two pins, not the words "from" and "to".

```tsx
// ✅ Route as icons
<View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
  <MapPinIcon />
  <Text variant="body">Syracuse</Text>
  <ArrowRightIcon tone="subtle" />
  <MapPinIcon />
  <Text variant="body">Jamesville</Text>
</View>

// ❌ Redundant text
<Text>from Syracuse to Jamesville</Text>
```

Use text when:
- The icon vocabulary does not already encode the concept (e.g., "paid by", "owed to")
- The user base includes accessibility users who will hear the icon's `accessibilityLabel` read aloud — the text is the accessibilityLabel here
- The icon is ambiguous at glance size (two chevrons vs. two arrows)

## Press affordance — every tap target

No dead taps. Every `Pressable` in the app uses one of two press affordances:

1. **Scale-spring** — `AppButton`, via Reanimated `withSpring(0.97, { damping: 18, stiffness: 300 })`.
2. **Tonal shift** — `InteractiveSurface`, `ExpenseCard`, list rows, via `pressed ? colors.soft : colors.surfaceSolid`.

A `Pressable` with neither is incomplete. See [`interaction-states.md`](interaction-states.md) for the implementation recipe.

## Gotchas

- **Do not use border to signal active state.** The no-line rule in [`../user-interface/guides/tonal-topography.md`](../user-interface/guides/tonal-topography.md) applies here. Use background shift.
- **Do not stack two non-color signifiers.** Background + weight is one; background + weight + checkmark + scale is four and looks frantic.
- **Do not use `pointerEvents="none"` to fake disabled.** The element disappears from a11y. Use `disabled` on the `Pressable` and pair with the visual treatment.

## Further reading

- [interaction-states.md](interaction-states.md) — press, focus, disabled, loading
- [buttons/](buttons/README.md) — AppButton variants
- [../user-interface/guides/foundational-principles.md](../user-interface/guides/foundational-principles.md) — the four pillars
- [../user-interface/guides/accessibility.md](../user-interface/guides/accessibility.md) — a11y props and reduced motion
