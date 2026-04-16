import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Trash2,
  Edit3,
  Receipt,
  Calendar,
  Tag,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { AppButton } from '../../src/slate/AppButton';
import { AppSurface } from '../../src/slate/AppSurface';
import { Avatar, Callout, Breath, IconBadge } from '../../src/slate/atoms';
import { useExpensesStore, useGroupsStore } from '../../src/stores';
import { api } from '../../src/api/client';
import { getCurrencySymbol } from '../../src/utils/constants';
import { colors } from '../../src/theme/tokens';
import type { Expense } from '../../src/stores/types';

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();

  const { getAll, remove, invalidate } = useExpensesStore();
  const { getById: getGroup } = useGroupsStore();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try store cache first, then fetch
  const loadExpense = useCallback(async () => {
    // Check cache across all groups
    const cached = getAll().find((e) => e.id === expenseId);
    if (cached) {
      setExpense(cached);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/expenses/${expenseId}`);
      setExpense(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load expense');
    } finally {
      setLoading(false);
    }
  }, [expenseId, getAll]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const group = expense ? getGroup(expense.group_id) : undefined;
  const currency = group?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/expenses/${expenseId}`);
              if (expense) {
                remove(expense.group_id, expenseId);
                invalidate(expense.group_id);
              }
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (e: any) {
              setError(e?.message ?? 'Failed to delete expense');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Expense" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  if (!expense) {
    return (
      <AppShell>
        <Header title="Expense" />
        <PageContent>
          <Callout tone="danger">
            {error ?? 'Expense not found.'}
          </Callout>
        </PageContent>
      </AppShell>
    );
  }

  const title = expense.merchant || expense.description || 'Expense';
  const displayDate =
    expense.date ||
    (expense.created_at ? new Date(expense.created_at).toLocaleDateString() : '');

  return (
    <AppShell>
      <Header
        title="Expense Detail"
        eyebrow={group?.name}
        right={
          <AppButton
            variant="icon"
            size="sm"
            leftIcon={<Trash2 size={18} color={colors.danger} strokeWidth={2.2} />}
            onPress={handleDelete}
            loading={deleting}
            haptic
          />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          {error && <Callout tone="danger" style={{ marginBottom: 20 }}>{error}</Callout>}

          {/* Hero amount */}
          <AppSurface variant="soft" style={{ marginBottom: 24, alignItems: 'center', paddingVertical: 28 }}>
            <IconBadge
              icon={<Receipt size={24} color={colors.primary} strokeWidth={2.2} />}
              tone="soft"
              size="lg"
            />
            <Text variant="titleLg" weight="extrabold" style={{ marginTop: 16, textAlign: 'center' }}>
              {title}
            </Text>
            <Text variant="display" weight="extrabold" style={{ marginTop: 8, color: colors.primary }}>
              {sym}{expense.total_amount.toFixed(2)}
            </Text>
          </AppSurface>

          {/* Meta rows */}
          <View style={{ gap: 10, marginBottom: 28 }}>
            {displayDate ? (
              <AppSurface variant="solid" compact>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Calendar size={18} color={colors.mutedSubtle} strokeWidth={2} />
                  <View>
                    <Text variant="label" tone="subtle">Date</Text>
                    <Text variant="title" weight="semibold" style={{ marginTop: 2 }}>{displayDate}</Text>
                  </View>
                </View>
              </AppSurface>
            ) : null}

            {expense.category ? (
              <AppSurface variant="solid" compact>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Tag size={18} color={colors.mutedSubtle} strokeWidth={2} />
                  <View>
                    <Text variant="label" tone="subtle">Category</Text>
                    <Text variant="title" weight="semibold" style={{ marginTop: 2 }}>{expense.category}</Text>
                  </View>
                </View>
              </AppSurface>
            ) : null}

            {expense.notes ? (
              <AppSurface variant="solid" compact>
                <Text variant="label" tone="subtle" style={{ marginBottom: 4 }}>Notes</Text>
                <Text variant="body">{expense.notes}</Text>
              </AppSurface>
            ) : null}
          </View>

          {/* Items */}
          {expense.items && expense.items.length > 0 && (
            <>
              <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>ITEMS</Text>
              <View style={{ gap: 8, marginBottom: 28 }}>
                {expense.items.map((item, i) => (
                  <AppSurface key={i} variant="solid" compact>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text variant="title" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                        {item.name}
                        {item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ''}
                      </Text>
                      <Text variant="title" weight="extrabold">
                        {sym}{(item.amount ?? 0).toFixed(2)}
                      </Text>
                    </View>
                  </AppSurface>
                ))}
              </View>
            </>
          )}

          {/* Split details */}
          {expense.split_details && expense.split_details.length > 0 && (
            <>
              <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>
                SPLIT ({expense.split_type ?? 'equally'})
              </Text>
              <View style={{ gap: 8, marginBottom: 28 }}>
                {expense.split_details.map((split, i) => {
                  const member = group?.members.find((m) => m.id === split.user_id);
                  const name = member?.name ?? split.user_id;
                  return (
                    <AppSurface key={i} variant="solid" compact>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Avatar name={name} size="sm" />
                        <Text variant="title" weight="semibold" style={{ flex: 1 }}>{name}</Text>
                        <Text variant="title" weight="extrabold" style={{ color: colors.primary }}>
                          {sym}{split.amount.toFixed(2)}
                        </Text>
                      </View>
                    </AppSurface>
                  );
                })}
              </View>
            </>
          )}

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
