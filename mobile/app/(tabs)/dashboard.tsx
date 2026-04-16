import React, { useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Users,
  ArrowUpDown,
  Wallet,
  Receipt,
  TrendingUp,
} from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { PageHero } from '../../src/slate/PageHero';
import { StatCard, EmptyState, IconBadge, Breath } from '../../src/slate/atoms';
import { ExpenseCard } from '../../src/slate/ExpenseCard';
import { AppButton } from '../../src/slate/AppButton';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { useAuth } from '../../src/contexts/AuthContext';
import { useGroupsStore, useExpensesStore, useSettlementsStore } from '../../src/stores';
import { colors } from '../../src/theme/tokens';
import { getCurrencySymbol } from '../../src/utils/constants';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    groups,
    loading: groupsLoading,
    fetch: fetchGroups,
  } = useGroupsStore();

  const {
    getAll: getAllExpenses,
    fetch: fetchExpenses,
    loadingGroupId,
  } = useExpensesStore();

  const { fetch: fetchSettlements, byGroupId: settlementsByGroup } = useSettlementsStore();

  const isRefreshing =
    groupsLoading || Object.values(loadingGroupId).some(Boolean);

  // Aggregate balances across all groups for the current user
  const { youreOwed, youOwe } = React.useMemo(() => {
    let owed = 0;
    let owe = 0;
    for (const groupId of Object.keys(settlementsByGroup)) {
      for (const s of settlementsByGroup[groupId]) {
        if (s.to_user_id === user?.id) owed += s.amount;
        if (s.from_user_id === user?.id) owe += s.amount;
      }
    }
    return { youreOwed: owed, youOwe: owe };
  }, [settlementsByGroup, user?.id]);

  const net = youreOwed - youOwe;
  const allExpenses = getAllExpenses();
  const recentExpenses = allExpenses.slice(0, 5);

  // Primary currency — take the first group's currency or default to INR
  const currency = groups[0]?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  const loadAll = useCallback(
    async (force = false) => {
      await fetchGroups({ force });
      // Fire expense + settlement fetches for every group
      for (const g of useGroupsStore.getState().groups) {
        fetchExpenses(g.id, { force });
        fetchSettlements(g.id, { force });
      }
    },
    [fetchGroups, fetchExpenses, fetchSettlements]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = () => loadAll(true);

  const quickActions = [
    {
      label: 'New Expense',
      icon: <Plus size={20} color={colors.primaryForeground} strokeWidth={2.5} />,
      onPress: () => router.push('/new-expense'),
      primary: true,
    },
    {
      label: 'Groups',
      icon: <Users size={20} color={colors.primary} strokeWidth={2.2} />,
      onPress: () => router.push('/groups'),
      primary: false,
    },
    {
      label: 'Settle',
      icon: <ArrowUpDown size={20} color={colors.primary} strokeWidth={2.2} />,
      onPress: () => router.push('/(tabs)/settlements'),
      primary: false,
    },
    {
      label: 'UPI',
      icon: <Wallet size={20} color={colors.primary} strokeWidth={2.2} />,
      onPress: () => router.push('/(upi)'),
      primary: false,
    },
  ];

  if (groupsLoading && groups.length === 0) {
    return (
      <AppShell>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <PageContent>
          <PageHero
            eyebrow="Total Ledger"
            title={`Welcome back,\n${user?.name?.split(' ')[0] ?? 'Member'}`}
          />

          {/* Stat Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <StatCard
              label="You're owed"
              value={`${sym}${youreOwed.toFixed(2)}`}
              tone="positive"
              icon={<TrendingUp size={16} color={colors.success} strokeWidth={2.2} />}
            />
            <StatCard
              label="You owe"
              value={`${sym}${youOwe.toFixed(2)}`}
              tone={youOwe > 0 ? 'negative' : 'default'}
              icon={<ArrowUpDown size={16} color={youOwe > 0 ? colors.danger : colors.muted} strokeWidth={2.2} />}
            />
          </View>

          {/* Net balance callout */}
          {(net !== 0) && (
            <AppSurface
              variant="soft"
              compact
              style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
              <IconBadge
                icon={<TrendingUp size={18} color={net > 0 ? colors.success : colors.danger} strokeWidth={2.2} />}
                tone={net > 0 ? 'soft' : 'danger'}
                size="sm"
              />
              <View style={{ flex: 1 }}>
                <Text variant="label" tone="muted">Net balance</Text>
                <Text
                  variant="title"
                  weight="extrabold"
                  style={{ color: net > 0 ? colors.success : colors.danger, marginTop: 2 }}
                >
                  {net > 0 ? '+' : ''}{sym}{Math.abs(net).toFixed(2)}
                </Text>
              </View>
            </AppSurface>
          )}

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
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
                <InteractiveSurface
                  key={action.label}
                  compact
                  onPress={action.onPress}
                  style={{ flex: 1, alignItems: 'center', gap: 6, minWidth: 70 }}
                >
                  <IconBadge icon={action.icon} tone="soft" size="sm" />
                  <Text variant="label" weight="semibold" tone="muted">
                    {action.label}
                  </Text>
                </InteractiveSurface>
              )
            )}
          </View>

          {/* Recent Expenses */}
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text variant="titleLg" weight="extrabold">Recent Expenses</Text>
              {allExpenses.length > 5 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
                  <Text variant="label" weight="semibold" style={{ color: colors.primary }}>
                    View all
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {recentExpenses.length === 0 ? (
              <EmptyState
                icon={<Receipt size={28} color={colors.mutedSubtle} strokeWidth={2} />}
                title="No expenses yet"
                description="Add your first expense to start splitting bills with your group."
                action={{ label: 'Add Expense', onPress: () => router.push('/new-expense') }}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {recentExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    currency={currency}
                    onPress={() => router.push(`/expenses/${expense.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
