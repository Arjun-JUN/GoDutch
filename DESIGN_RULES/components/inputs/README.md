# AppInput / AppTextarea / Field

> Soft-fill text inputs — no borders, focus shifts background color.

**Status:** Shipped · **Source:** `mobile/src/slate/AppInput.tsx`

## Components

- **`Field`** — layout wrapper: label above, hint/error below the input.
- **`AppInput`** — single-line text input.
- **`AppTextarea`** — multi-line text input.

## Field props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | `string` | — | Displayed as `Text variant="label" weight="semibold" tone="muted"` |
| `hint` | `string` | — | Shown below input when no error |
| `error` | `string` | — | Shown below input in `danger` tone; replaces hint |
| `className` | `string` | — | Outer container class |
| `style` | `ViewStyle` | — | Outer container style |
| `children` | `ReactNode` | — | The input element (`AppInput` or `AppTextarea`) |

## AppInput props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `leftIcon` | `ReactNode` | — | Absolutely positioned inside the input on the left |
| `rightIcon` | `ReactNode` | — | Absolutely positioned inside the input on the right |
| `invalid` | `boolean` | `false` | Shifts background to `dangerSoft` |
| `className` | `string` | — | |

All `TextInputProps` are spread onto the underlying `TextInput`.

## AppTextarea props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `rows` | `number` | `4` | Minimum height = `rows * 22 + 24px` |
| `invalid` | `boolean` | `false` | Shifts background to `dangerSoft` |

All `TextInputProps` are spread.

## Sample code

```tsx
import { Field, AppInput, AppTextarea } from '@/slate';
import { IndianRupee, Search } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

// Basic labeled input
<Field label="Amount" hint="Enter amount in INR">
  <AppInput
    keyboardType="decimal-pad"
    placeholder="0.00"
    value={amount}
    onChangeText={setAmount}
  />
</Field>

// With left icon
<Field label="Merchant">
  <AppInput
    leftIcon={<Search size={18} color={colors.mutedSubtle} />}
    placeholder="Search or enter name"
    value={merchant}
    onChangeText={setMerchant}
  />
</Field>

// With currency icon
<Field label="Amount">
  <AppInput
    leftIcon={<IndianRupee size={18} color={colors.muted} />}
    keyboardType="decimal-pad"
    placeholder="0.00"
    value={amount}
    onChangeText={setAmount}
  />
</Field>

// Error state
<Field label="Email" error="Please enter a valid email address">
  <AppInput
    invalid
    keyboardType="email-address"
    autoCapitalize="none"
    value={email}
    onChangeText={setEmail}
  />
</Field>

// Textarea
<Field label="Notes">
  <AppTextarea
    rows={3}
    placeholder="Optional note about this expense"
    value={notes}
    onChangeText={setNotes}
  />
</Field>
```

## Visual states

| State | Background | Notes |
|-------|-----------|-------|
| Default | `colors.soft` (#f0f4f3) | |
| Focused | `colors.softStrong` (#d1e8dd) | Keyboard active |
| Invalid | `colors.dangerSoft` (rgba(159,64,61,0.1)) | Combined with `Field error` prop |

## Design rules honored

- No border — background color shift signals state changes (no-line rule)
- `borderRadius: 14` — rounded but not pill (inputs are not buttons)
- Manrope `Manrope_500Medium` font at 15px inside inputs
- `colors.dangerSoft` for invalid — not bright red

## Related

- [../buttons/](../buttons/README.md)
- [../text/](../text/README.md)
- [../../slate-for-dashboard/settings.md](../../slate-for-dashboard/settings.md)

