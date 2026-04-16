import React, { useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Receipt, TrendingUp } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { AppButton } from '../../src/slate/AppButton';
import { StatCard, EmptyState, Avatar, Breath } from '../../src/slate/atoms';
import { AppSurface } from '../../src/slate/AppSurface';
import { ExpenseCard } from '../../src/slate/ExpenseCard';
import { useGroupsStore, useExpensesStore, useSettlementsStore } from '../../src/stores';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/tokens';
import { getCurrencySymbol } from '../../src/utils/constants';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { getById, fetch: fetchGroups } = useGroupsStore();
  const {
    getForGroup,
    fetch: fetchExpenses,
    loadingGroupId,
  } = useExpensesStore();
  const { getForGroup: getSettlements, fetch: fetchSettlements } = useSettlementsStore();

  const group = getById(groupId);
  const expenses = getForGroup(groupId);
  const settlements = getSettlements(groupId);
  const isLoading = loadingGroupId[groupId] && expenses.length === 0;

  const loadAll = useCallback(
    async (force = false) => {
      await fetchGroups({ force });
      fetchExpenses(groupId, { force });
      fetchSettlements(groupId, { force });
    },
    [fetchGroups, fetchExpenses, fetchSettlements, groupId]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const currency = group?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  // Balances for current user in this group
  const myOwe = settlements
    .filter((s) => s.from_user_id === user?.id)
    .reduce((a, s) => a + s.amount, 0);
  const myOwed = settlements
    .filter((s) => s.to_user_id === user?.id)
    .reduce((a, s) => a + s.amount, 0);
  const total = expenses.reduce((a, e) => a + e.total_amount, 0);

  if (!group && !isLoading) {
    return (
      <AppShell>
        <Header title="Group not found" />
        <PageContent>
          <EmptyState title="Group not found" description="This group doesn't exist or you don't have access." />
        </PageContent>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title={group?.name ?? ''}
        eyebrow="Group"
        right={
          <AppButton
            variant="icon"
            size="sm"
            haptic
            leftIcon={<Plus size={18} color={colors.foreground} strokeWidth={2.4} />}
            onPress={() => router.push({ pathname: '/new-expense', params: { groupId } })}
          />
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingGroupId[groupId] ?? false}
              onRefresh={() => loadAll(true)}
              tintColor={colors.primary}
            />
          }
        >
          <PageContent>
            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <StatCard label="Group total" value={`${sym}${total.toFixed(2)}`} />
              <StatCard
                label="You owe"
                value={`${sym}${myOwe.toFixed(2)}`}
                tone={myOwe > 0 ? 'negative' : 'default'}
              />
              <StatCard
                label="Owed to you"
                value={`${sym}${myOwed.toFixed(2)}`}
                tone={myOwed > 0 ? 'positive' : 'default'}
              />
            </View>

            {/* Members */}
            <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>
              MEMBERS ({group?.members.length ?? 0})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
              contentContainerStyle={{ gap: 12 }}
            >
              {group?.members.map((m) => (
                <View key={m.id} style={{ alignItems: 'center', gap: 6 }}>
                  <Avatar name={m.name} size="md" tone={m.id === user?.id ? 'primary' : 'default'} />
                  <Text variant="label" weight="semibold" tone="muted">
                    {m.id === user?.id ? 'You' : m.name.split(' ')[0]}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Pending settlements in this group */}
            {settlements.length > 0 && (
              <>
                <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>
                  PENDING SETTLEMENTS
                </Text>
                <View style={{ gap: 8, marginBottom: 24 }}>
                  {settlements.map((s, i) => (
                    <AppSurface key={i} variant="solid" compact>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Avatar name={s.from_user_name} size="sm" />
                        <Text variant="label" tone="muted" style={{ flex: 1 }}>
                          <Text variant="label" weight="semibold" style={{ color: colors.foreground }}>
                            {s.from_user_name}
                          </Text>
                          {' owes '}
                          <Text variant="label" weight="semibold" style={{ color: colors.foreground }}>
                            {s.to_user_name}
                          </Text>
                        </Text>
                        <Text variant="label" weight="extrabold" style={{ color: colors.danger }}>
                          {sym}{s.amount.toFixed(2)}
                        </Text>
                      </View>
                    </AppSurface>
                  ))}
                </View>
              </>
            )}

            {/* Quick actions */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
              <AppButton
                variant="primary"
                size="md"
                style={{ flex: 1 }}
                leftIcon={<Plus size={18} color={colors.primaryForeground} strokeWidth={2.5} />}
                onPress={() => router.push({ pathname: '/new-expense', params: { groupId } })}
                haptic
              >
                Add Expense
              </AppButton>
              <AppButton
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
                leftIcon={<TrendingUp size={18} color={colors.primary} strokeWidth={2.2} />}
                onPress={() => router.push(`/reports/${groupId}`)}
                haptic
              >
                Reports
              </AppButton>
            </View>

            {/* Expenses list */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text variant="titleLg" weight="extrabold">Expenses</Text>
              <Text variant="eyebrow" tone="muted">{expenses.length} TOTAL</Text>
            </View>

            {expenses.length === 0 ? (
              <EmptyState
                icon={<Receipt size={28} color={colors.mutedSubtle} strokeWidth={2} />}
                title="No expenses yet"
                description="Add the first expense to start tracking."
                action={{
                  label: 'Add Expense',
                  onPress: () => router.push({ pathname: '/new-expense', params: { groupId } }),
                }}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    currency={currency}
                    onPress={() => router.push(`/expenses/${expense.id}`)}
                  />
                ))}
              </View>
            )}

            <Breath size="lg" />
          </PageContent>
        </ScrollView>
      )}
    </AppShell>
  );
}
