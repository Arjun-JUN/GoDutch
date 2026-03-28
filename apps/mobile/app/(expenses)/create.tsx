import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Screen,
  Stack,
  Row,
  Text,
  Button,
  Input,
  Card,
  Chip,
  Callout,
  Icon,
  Divider,
} from '@godutch/slate';
import { useToast } from '@godutch/slate';
import { SplitMode } from '@godutch/commons';
import { validateSplits, splitEqual } from '@godutch/dutch';
import { amountToCents, formatCurrency } from '@godutch/commons';

type Step = 'details' | 'splits';

const SPLIT_MODES: { label: string; value: SplitMode }[] = [
  { label: 'Equal', value: SplitMode.Equal },
  { label: 'Percentage', value: SplitMode.Percentage },
  { label: 'Exact', value: SplitMode.Exact },
];

export default function CreateExpenseScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { show } = useToast();

  const [step, setStep] = useState<Step>('details');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>(SplitMode.Equal);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amountCents = amountToCents(parseFloat(amountStr) || 0);
  const currency = 'USD';

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!description.trim()) e['description'] = 'Description is required';
    if (!amountStr || parseFloat(amountStr) <= 0) e['amount'] = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateDetails()) setStep('splits');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: call POST /api/expenses with splits
      show('Expense added!', { type: 'success' });
      router.back();
    } catch {
      show('Could not save expense', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen keyboardAvoiding scrollable>
      <Stack padding={4} gap={5}>
        {/* Header */}
        <Row gap={3} align="center">
          <Button
            label=""
            variant="ghost"
            onPress={() => (step === 'splits' ? setStep('details') : router.back())}
            leftIcon={<Icon name="arrow-back" size="md" color="textPrimary" />}
          />
          <Text variant="heading3">
            {step === 'details' ? 'Add Expense' : 'Split'}
          </Text>
        </Row>

        {step === 'details' ? (
          <Card>
            <Stack gap={4}>
              <Input
                label="Description"
                placeholder="e.g. Thai dinner, Uber"
                value={description}
                onChangeText={v => { setDescription(v); setErrors(e => ({ ...e, description: '' })); }}
                error={errors['description']}
                clearable
                autoFocus
              />
              <Input
                label="Amount"
                placeholder="0.00"
                value={amountStr}
                onChangeText={v => { setAmountStr(v); setErrors(e => ({ ...e, amount: '' })); }}
                error={errors['amount']}
                keyboardType="decimal-pad"
                leftIcon={<Text variant="body" color="textMuted">$</Text>}
              />
            </Stack>
          </Card>
        ) : (
          <Stack gap={4}>
            <Card>
              <Stack gap={3}>
                <Text variant="label" color="textSecondary">Split Mode</Text>
                <Row gap={2} wrap>
                  {SPLIT_MODES.map(m => (
                    <Chip
                      key={m.value}
                      label={m.label}
                      selected={splitMode === m.value}
                      onPress={() => setSplitMode(m.value)}
                    />
                  ))}
                </Row>
              </Stack>
            </Card>

            <Callout
              type="info"
              body={`Splitting ${formatCurrency(amountCents, currency)} ${splitMode === SplitMode.Equal ? 'equally' : `by ${splitMode}`}.`}
            />
          </Stack>
        )}

        <Divider />

        {step === 'details' ? (
          <Button label="Next: Split" variant="primary" fullWidth onPress={handleNext} />
        ) : (
          <Button label="Save Expense" variant="primary" fullWidth loading={loading} onPress={handleSave} />
        )}
      </Stack>
    </Screen>
  );
}
