# Accessibility

> WCAG 2.0 targets, React Native a11y props, reduced-motion, and focus handling.

## Target

GoDutch targets **WCAG 2.0 AA**. The critical criteria for a mobile finance app:

| Criterion | Requirement | How Slate meets it |
|-----------|-------------|-------------------|
| 1.4.3 Contrast Ratio | 4.5:1 for body text | `colors.foreground` (#2a3434) on `colors.backgroundStart` (#f8faf9) achieves ~9:1 |
| 1.4.3 for large text | 3:1 | `display` + `titleXl` exceed this against all Slate backgrounds |
| 1.4.11 Non-text contrast | 3:1 for UI components | Buttons and inputs have sufficient contrast via tonal hierarchy |
| 2.4.7 Focus visible | Focus indicator visible | `AppButton` and `AppInput` show system focus ring on Android/iOS |
| 2.5.3 Label in name | Accessible name includes visible label | `AppButton` with `children` automatically passes; use `accessibilityLabel` for icon-only buttons |

## React Native a11y props

Always add `accessibilityLabel` to interactive elements that lack visible text:

```tsx
// Icon-only button — label required
<AppButton
  variant="icon"
  onPress={handleClose}
  leftIcon={<X size={18} color={colors.foreground} />}
  accessibilityLabel="Close"
/>

// Button with text — no extra label needed
<AppButton variant="primary" onPress={handleSettle}>
  Settle up
</AppButton>
```

Use `accessibilityRole` when the element's role isn't implied:

```tsx
<Pressable accessibilityRole="button" />
<View accessibilityRole="header" />
```

Use `accessibilityState` for state changes:

```tsx
<Pressable
  accessibilityState={{ disabled: isLoading, checked: isSelected }}
/>
```

## Reduced motion

`AppButton` and any component using Reanimated should respect the OS reduced-motion preference:

```tsx
import { AccessibilityInfo } from 'react-native';

const [reducedMotion, setReducedMotion] = useState(false);
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
  return () => sub.remove();
}, []);

// Skip animation if reduced motion is enabled
scale.value = reducedMotion ? 1 : withSpring(0.97);
```

`AppButton` implements this pattern natively — you don't need to add it in screens.

## Touch targets

Minimum touch target: **44×44pt** (iOS HIG) / **48×48dp** (Android). Slate buttons are sized to meet this:

| AppButton size | Height |
|---------------|--------|
| `sm` | 40px — just below minimum; use only in dense layouts |
| `md` | 52px |
| `lg` | 60px |
| `icon` | 48px |

## Error states

Do not use color alone to signal errors. Pair a danger color with:
- An error message via `Field` component's `error` prop
- An icon (e.g., `WarningCircle` from `@/slate/icons`)

```tsx
<Field label="Amount" error="Amount must be greater than 0">
  <AppInput invalid value={value} onChangeText={setValue} />
</Field>
```

## Further reading

- [adaptability.md](adaptability.md)
- [../../components/inputs/](../../components/inputs/README.md)
- [../../components/buttons/](../../components/buttons/README.md)
