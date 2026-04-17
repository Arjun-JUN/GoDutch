# Interaction States

> How GoDutch components communicate press, focus, disabled, and loading states — without borders or bright colors.

## States overview

| State | Visual signal | How it's implemented |
|-------|--------------|---------------------|
| Default | Resting background + shadow | Base component style |
| Hovered / focused | — | Mobile has no hover; focus uses system ring |
| Pressed | Scale spring + tonal bg shift | Reanimated `withSpring(0.97)` + pressed bg |
| Disabled | 60% opacity | `opacity: 0.6` on the root element |
| Loading | Spinner replaces content | `ActivityIndicator` inside button |

## Press feedback

GoDutch uses two complementary press signals:

### 1. Scale spring (AppButton)
```
onPressIn → scale → 0.97 (spring: damping 18, stiffness 300)
onPressOut → scale → 1.0
```
Implemented in `AppButton` via `Animated.createAnimatedComponent(Pressable)` + `useSharedValue`.

### 2. Background tonal shift (InteractiveSurface, ExpenseCard, Pressable rows)
```
pressed → backgroundColor: colors.soft (#f0f4f3)
resting → backgroundColor: colors.surfaceSolid (#ffffff)
```
No hard border appears — the tonal shift alone signals the interaction.

## Disabled state

Disabled elements drop to 60% opacity. No other change:

```tsx
style={[
  { opacity: isDisabled ? 0.6 : 1 },
  // no color change, no strikethrough
]}
```

Do not remove the element from the DOM/tree when disabled — accessibility tools should still be able to see it and read its label.

## Loading state

When an async action is in progress, replace button content with a spinner:

```tsx
<AppButton variant="primary" size="md" loading={isSubmitting} onPress={handleSubmit}>
  Save
</AppButton>
// Shows ActivityIndicator instead of "Save" text
// Automatically disabled while loading
```

Spinner color:
- `primary` / `danger` variant: `colors.primaryForeground`
- `secondary` / `ghost` variant: `colors.primary`

## Reduced motion

Both `AppButton` (Reanimated scale) and `PageHero` (FadeInDown) check the OS reduce-motion setting. When enabled, animations are skipped and components render in their final state immediately.

```tsx
// AppButton implementation (reference)
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
  return () => sub.remove();
}, []);

// Before animating:
if (!reducedMotion && !isDisabled) {
  scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
}
```

## Haptic feedback

`AppButton variant="primary"` triggers `Haptics.selectionAsync()` on press by default. Pass `haptic={false}` to disable.

Other interactive elements (e.g. tab presses, row selections) can add haptic via:
```tsx
import * as Haptics from 'expo-haptics';
Haptics.selectionAsync(); // light tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // medium bump
```

## Further reading

- [buttons/](buttons/README.md)
- [surfaces/](surfaces/README.md)
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md)
