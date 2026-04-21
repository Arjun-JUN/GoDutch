import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppShell, PageContent } from '../../../src/slate/AppShell';
import { Text } from '../../../src/slate/Text';
import { Header } from '../../../src/slate/Header';
import { AppButton } from '../../../src/slate/AppButton';
import { AppInput, Field } from '../../../src/slate/AppInput';
import { Callout, Breath } from '../../../src/slate/atoms';
import { api } from '../../../src/api/client';
import { colors, spacing } from '../../../src/theme/tokens';

export default function AddAccountScreen() {
  const router = useRouter();
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!upiId.trim()) return 'UPI ID is required.';
    if (!upiId.includes('@')) return 'UPI ID must be in the format name@bank.';
    if (!bankName.trim()) return 'Bank name is required.';
    return null;
  };

  const handleAdd = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    setError(null);
    try {
      await api.post('/upi/accounts', {
        upi_id: upiId.trim(),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim() || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <Header title="Add UPI Account" eyebrow="UPI" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <PageContent>
            {error && (
              <Callout tone="danger" style={{ marginBottom: spacing.s20 }}>{error}</Callout>
            )}
            {success && (
              <Callout tone="success" style={{ marginBottom: spacing.s20 }}>
                Account added successfully!
              </Callout>
            )}

            <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
              <Field label="UPI ID">
                <AppInput
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="name@okaxis"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Field>

              <Field label="Bank Name">
                <AppInput
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="HDFC Bank, Axis Bank…"
                  autoCapitalize="words"
                />
              </Field>

              <Field label="Account Number (optional)">
                <AppInput
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="XXXX XXXX XXXX"
                  keyboardType="numeric"
                />
              </Field>
            </View>

            <AppButton
              variant="primary"
              size="lg"
              onPress={handleAdd}
              loading={saving}
              haptic
            >
              Link Account
            </AppButton>

            <Breath size="lg" />
          </PageContent>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
