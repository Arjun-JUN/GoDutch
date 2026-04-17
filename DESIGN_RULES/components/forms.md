# Forms

> Composing `Field`, `AppInput`, `AppTextarea`, and `AppButton` into complete form screens.

## Building a form screen

A form screen wraps fields in a `ScrollView` with `PageContent`, and puts submit/cancel buttons at the bottom inside a `KeyboardAvoidingView`.

```tsx
import { KeyboardAvoidingView, ScrollView, Platform, View } from 'react-native';
import { AppShell, PageContent, Header, AppButton } from '@/slate';
import { Field, AppInput, AppTextarea } from '@/slate';
import { Breath } from '@/slate/atoms';

export default function AddExpenseScreen() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const errs = validate({ merchant, amount });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // submit...
  };

  return (
    <AppShell>
      <Header title="Add Expense" showBack onBack={handleDiscard} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <PageContent>
            <Field label="Merchant" error={errors.merchant}>
              <AppInput
                invalid={!!errors.merchant}
                placeholder="e.g. Swiggy, Auto"
                value={merchant}
                onChangeText={setMerchant}
              />
            </Field>

            <Breath size="sm" />

            <Field label="Amount" error={errors.amount}>
              <AppInput
                invalid={!!errors.amount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </Field>

            <Breath size="sm" />

            <Field label="Notes" hint="Optional">
              <AppTextarea
                rows={3}
                placeholder="What was this for?"
                value={notes}
                onChangeText={setNotes}
              />
            </Field>
          </PageContent>
        </ScrollView>

        {/* Sticky bottom actions */}
        <View style={{ padding: 24, paddingBottom: 32, gap: 12 }}>
          <AppButton variant="primary" size="lg" onPress={handleSubmit} loading={isSubmitting}>
            Add Expense
          </AppButton>
          <AppButton variant="ghost" size="md" onPress={handleDiscard}>
            Discard
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
```

## Validation pattern

- Validate on submit, not on change (less distracting for first-time users).
- Pass `error` string to `Field` and `invalid={!!error}` to `AppInput`.
- Use `Text variant="label" tone="danger"` for error summaries at the top of a form (when there are multiple errors).

## Field ordering

Place fields in the order a user would naturally fill them — top to bottom, most required first.

## Keyboard handling rules

- Always wrap form screens in `KeyboardAvoidingView` with `behavior="padding"` (iOS) or `behavior="height"` (Android).
- Add `keyboardShouldPersistTaps="handled"` to the `ScrollView` so tapping outside an input dismisses the keyboard.
- Put the primary submit button outside the `ScrollView` so it's always visible — it should not scroll out of view.

## Further reading

- [inputs/](inputs/README.md)
- [buttons/](buttons/README.md)
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md)
