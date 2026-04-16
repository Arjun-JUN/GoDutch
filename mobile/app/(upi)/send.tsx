import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { AppButton } from '../../src/slate/AppButton';
import { AppInput, Field } from '../../src/slate/AppInput';
import { Callout, Breath } from '../../src/slate/atoms';
import { api } from '../../src/api/client';
import { colors } from '../../src/theme/tokens';

export default function SendMoneyScreen() {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!upiId.trim()) return 'Please enter a UPI ID.';
    if (!upiId.includes('@')) return 'UPI ID must be in the format name@bank.';
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return 'Please enter a valid amount.';
    return null;
  };

  const handleSend = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setSending(true);
    setError(null);

    try {
      // 1. Register the payment intent on the backend
      await api.post('/upi/send-money', {
        upi_id: upiId.trim(),
        amount: parseFloat(amount),
        description: note.trim() || 'GoDutch payment',
      });

      // 2. Try to open a native UPI app via deep link
      const upiUrl =
        `upi://pay?pa=${encodeURIComponent(upiId.trim())}` +
        `&am=${parseFloat(amount).toFixed(2)}` +
        `&tn=${encodeURIComponent(note.trim() || 'GoDutch payment')}` +
        `&cu=INR`;

      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen) {
        await Linking.openURL(upiUrl);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'No UPI App Found',
          'Please install a UPI app like Google Pay, PhonePe, or Paytm to complete payments.',
          [{ text: 'OK' }]
        );
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to initiate payment. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <Header title="Send Money" eyebrow="UPI" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <PageContent>
            {error && (
              <Callout tone="danger" style={{ marginBottom: 20 }}>{error}</Callout>
            )}

            <View style={{ gap: 16, marginBottom: 32 }}>
              <Field label="UPI ID">
                <AppInput
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="name@okaxis"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Field>

              <Field label="Amount (₹)">
                <AppInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </Field>

              <Field label="Note (optional)">
                <AppInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Dinner split, rent…"
                />
              </Field>
            </View>

            <Callout tone="info" style={{ marginBottom: 24 }}>
              This will open your UPI app to complete the payment securely.
            </Callout>

            <AppButton
              variant="primary"
              size="lg"
              onPress={handleSend}
              loading={sending}
              haptic
            >
              Pay via UPI
            </AppButton>

            <Breath size="lg" />
          </PageContent>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
