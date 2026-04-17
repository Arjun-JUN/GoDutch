# AppButton

> The primary interactive element — gradient pill with Reanimated press scale and haptic feedback.

**Status:** Shipped · **Source:** `mobile/src/slate/AppButton.tsx`

## When to use

- **Primary** — the single most important action on a screen ("Add expense", "Settle up"). Use once per screen.
- **Secondary** — supporting actions alongside a primary button ("Cancel", "Skip").
- **Ghost** — inline text actions in lists or headers ("Edit", "Done").
- **Danger** — destructive actions that need a separate confirm step ("Delete group").
- **Icon** — icon-only circular button for header actions, floating actions, close buttons.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'icon'` | `'primary'` | Controls visual style |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` | Height: sm=40, md=52, lg=60, icon=48 |
| `loading` | `boolean` | `false` | Shows `ActivityIndicator`, disables press |
| `disabled` | `boolean` | `false` | Applies 60% opacity, disables press |
| `leftIcon` | `ReactNode` | — | Icon before label text |
| `rightIcon` | `ReactNode` | — | Icon after label text |
| `haptic` | `boolean` | `true` for `primary` | Triggers `Haptics.selectionAsync()` on press |
| `onPress` | `() => void` | — | Press handler |
| `className` | `string` | — | NativeWind className for layout overrides |
| `style` | `ViewStyle` | — | Extra styles on the outermost animated wrapper |

All other `PressableProps` are spread onto the underlying `Pressable`.

## Sample code

```tsx
import { AppButton } from '@/slate';
import { Plus, Check } from '@/slate/icons';
import { colors } from '@/theme/tokens';

// Primary — main screen CTA
<AppButton variant="primary" size="lg" onPress={handleAdd}>
  Add Expense
</AppButton>

// Primary with left icon
<AppButton variant="primary" size="md" leftIcon={<Plus size={18} color={colors.primaryForeground} />} onPress={handleAdd}>
  Add Expense
</AppButton>

// Secondary — alongside a primary
<AppButton variant="secondary" size="md" onPress={handleCancel}>
  Cancel
</AppButton>

// Ghost — inline text action
<AppButton variant="ghost" size="sm" onPress={handleEdit}>
  Edit
</AppButton>

// Danger — destructive action
<AppButton variant="danger" size="md" onPress={handleDelete}>
  Delete Group
</AppButton>

// Icon — header close button
<AppButton
  variant="icon"
  size="sm"
  onPress={handleClose}
  leftIcon={<X size={18} color={colors.foreground} strokeWidth={2.5} />}
  accessibilityLabel="Close"
/>

// Loading state
<AppButton variant="primary" size="md" loading={isSubmitting} onPress={handleSubmit}>
  Save
</AppButton>
```

## Variants

| Variant | Background | Text color | Border | Notes |
|---------|-----------|-----------|--------|-------|
| `primary` | LinearGradient (`primary` → `primaryStrong`) | `primaryForeground` | None | Tinted ambient shadow |
| `secondary` | `primaryContainer` (#d1e8dd) | `primary` | None | |
| `ghost` | Transparent | `primary` | None | No background, generous horizontal padding |
| `danger` | `colors.danger` (#9f403d) | `primaryForeground` | None | |
| `icon` | `colors.soft` | — | None | Square icon slot; pass icon via `leftIcon` |

## Size specs

| Size | Height | H padding | Font size |
|------|--------|-----------|-----------|
| `sm` | 40px | 18px | 14px |
| `md` | 52px | 24px | 15px |
| `lg` | 60px | 32px | 17px |
| `icon` | 48px | 0 | 14px |

## Animation

- `onPressIn` → scale springs to `0.97` (spring: damping 18, stiffness 300)
- `onPressOut` → scale springs back to `1.0`
- Skipped when OS reduced-motion preference is enabled.

## Design rules honored

- Pill shape (`borderRadius: 999`) — no square buttons
- Gradient primary (`colors.primary` → `colors.primaryStrong`)
- No 1px borders on any variant
- `colors.danger` is desaturated (#9f403d), not bright red
- Reduced-motion detection via `AccessibilityInfo`

## Related

- [../surfaces/](../surfaces/README.md)
- [../interaction-states.md](../interaction-states.md)
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md)
