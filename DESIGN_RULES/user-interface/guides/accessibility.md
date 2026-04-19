# Accessibility

> WCAG 2.0 targets, React Native a11y props, reduced-motion, and focus handling.

## Target

GoDutch targets **WCAG 2.0 AA**. The critical criteria for a mobile finance app:

| Criterion | Requirement | How Slate meets it |
|-----------|-------------|-------------------|
| 1.4.3 Contrast Ratio | 4.5:1 for body text | `colors.foreground` on `colors.backgroundStart` exceeds the target |
| 1.4.3 for large text | 3:1 | `display` and `titleXl` exceed this across Slate backgrounds |
| 1.4.11 Non-text contrast | 3:1 for UI components | Buttons and inputs rely on tonal hierarchy with adequate contrast |
| 2.4.7 Focus visible | Focus indicator visible | `AppButton` and `AppInput` preserve the platform focus treatment |
| 2.5.3 Label in name | Accessible name includes visible label | Icon-only buttons require `accessibilityLabel` |

## React Native a11y props

Always add `accessibilityLabel` to interactive elements that lack visible text:

```tsx
<AppButton
  variant="icon"
  onPress={handleClose}
  leftIcon={<X size={18} color={colors.foreground} />}
  accessibilityLabel="Close"
/>
```

Use `accessibilityRole` when the role is not already implied:

```tsx
<Pressable accessibilityRole="button" />
<View accessibilityRole="header" />
```

Use `accessibilityState` for state changes:

```tsx
<Pressable accessibilityState={{ disabled: isLoading, checked: isSelected }} />
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
```

`AppButton` already follows this pattern, so screens usually do not need to reimplement it.

## Touch targets

Minimum touch target: **44x44pt** on iOS and **48x48dp** on Android.

| AppButton size | Height |
|---------------|--------|
| `sm` | 40px |
| `md` | 52px |
| `lg` | 60px |
| `icon` | 48px |

Use `sm` only in dense layouts because it sits just below the recommended minimum.

## Error states

Do not use color alone to signal errors. Pair a danger color with:

- An error message via `Field` and its `error` prop
- An icon, for example `AlertCircle` from `lucide-react-native`

```tsx
<Field label="Amount" error="Amount must be greater than 0">
  <AppInput invalid value={value} onChangeText={setValue} />
</Field>
```

## Further reading

- [adaptability.md](adaptability.md)
- [../../components/inputs/](../../components/inputs/README.md)
- [../../components/buttons/](../../components/buttons/README.md)
