import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Send, Plus, ArrowDownLeft, Clock, CreditCard } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { PageHero } from '../../src/slate/PageHero';
import { StatCard, Callout, Breath, IconBadge } from '../../src/slate/atoms';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { AppButton } from '../../src/slate/AppButton';
import { api } from '../../src/api/client';
import { colors } from '../../src/theme/tokens';

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  status: string;
  created_at: string;
  type?: string;
}

interface BankAccount {
  id: string;
  upi_id: string;
  bank_name: string;
  account_number?: string;
}

export default function UpiHomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [txns, accs] = await Promise.all([
          api.get('/upi/transactions'),
          api.get('/upi/accounts'),
        ]);
        setTransactions(txns ?? []);
        setAccounts(accs ?? []);
      } catch {
        // Non-fatal — UPI module might not be configured yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickActions = [
    {
      label: 'Send Money',
      icon: <Send size={20} color={colors.primaryForeground} strokeWidth={2.2} />,
      onPress: () => router.push('/(upi)/send'),
      primary: true,
    },
    {
      label: 'Add Account',
      icon: <Plus size={20} color={colors.primary} strokeWidth={2.5} />,
      onPress: () => router.push('/(upi)/accounts/add'),
      primary: false,
    },
  ];

  return (
    <AppShell>
      <Header title="UPI & Payments" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          <PageHero eyebrow="Money Transfer" title="UPI Pay" compact />

          <Callout tone="info" style={{ marginBottom: 24 }}>
            UPI payments open your installed UPI app (GPay, PhonePe, Paytm). Works only on real devices with a UPI app installed.
          </Callout>

          {/* Quick actions */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            {quickActions.map((action) =>
              action.primary ? (
                <AppButton
                  key={action.label}
                  variant="primary"
                  size="md"
                  leftIcon={action.icon}
                  onPress={action.onPress}
                  style={{ flex: 1 }}
                  haptic
                >
                  {action.label}
                </AppButton>
              ) : (
                <AppButton
                  key={action.label}
                  variant="secondary"
                  size="md"
                  leftIcon={action.icon}
                  onPress={action.onPress}
                  style={{ flex: 1 }}
                  haptic
                >
                  {action.label}
                </AppButton>
              )
            )}
          </View>

          {/* Linked accounts */}
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>
            LINKED ACCOUNTS ({accounts.length})
          </Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginBottom: 24 }} />
          ) : accounts.length === 0 ? (
            <AppSurface variant="solid" compact style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <IconBadge icon={<CreditCard size={18} color={colors.mutedSubtle} strokeWidth={2} />} tone="soft" size="sm" />
                <Text variant="label" tone="subtle">No accounts linked yet.</Text>
              </View>
            </AppSurface>
          ) : (
            <View style={{ gap: 8, marginBottom: 24 }}>
              {accounts.map((acc) => (
                <AppSurface key={acc.id} variant="solid" compact>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <IconBadge icon={<CreditCard size={18} color={colors.primary} strokeWidth={2.2} />} tone="soft" size="sm" />
                    <View style={{ flex: 1 }}>
                      <Text variant="title" weight="semibold">{acc.bank_name}</Text>
                      <Text variant="label" tone="subtle" style={{ marginTop: 2 }}>{acc.upi_id}</Text>
                    </View>
                  </View>
                </AppSurface>
              ))}
            </View>
          )}

          {/* Recent transactions */}
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>
            RECENT TRANSACTIONS
          </Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : transactions.length === 0 ? (
            <AppSurface variant="solid" compact>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <IconBadge icon={<Clock size={18} color={colors.mutedSubtle} strokeWidth={2} />} tone="soft" size="sm" />
                <Text variant="label" tone="subtle">No transactions yet.</Text>
              </View>
            </AppSurface>
          ) : (
            <View style={{ gap: 8 }}>
              {transactions.slice(0, 10).map((txn) => (
                <AppSurface key={txn.id} variant="solid" compact>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <IconBadge
                      icon={
                        txn.type === 'credit'
                          ? <ArrowDownLeft size={18} color={colors.success} strokeWidth={2.2} />
                          : <Send size={18} color={colors.primary} strokeWidth={2.2} />
                      }
                      tone="soft"
                      size="sm"
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="title" weight="semibold" numberOfLines={1}>
                        {txn.description ?? 'UPI Transfer'}
                      </Text>
                      <Text variant="label" tone="subtle" style={{ marginTop: 2 }}>
                        {new Date(txn.created_at).toLocaleDateString()} · {txn.status}
                      </Text>
                    </View>
                    <Text variant="title" weight="extrabold" style={{ color: txn.type === 'credit' ? colors.success : colors.foreground }}>
                      ₹{txn.amount.toFixed(2)}
                    </Text>
                  </View>
                </AppSurface>
              ))}
            </View>
          )}

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
