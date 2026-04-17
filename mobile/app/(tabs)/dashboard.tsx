import React, { useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ArrowLeftRight, TrendingUp, Receipt } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
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

  const allExpenses = getAllExpenses();
  const recentExpenses = allExpenses.slice(0, 8);

  const currency = groups[0]?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  const loadAll = useCallback(
    async (force = false) => {
      await fetchGroups({ force });
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
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <PageContent>
          {/* ──────────── Hero surface ──────────── */}
          <AppSurface variant="solid" style={{ padding: 24, borderRadius: 32, marginTop: 12, marginBottom: 20 }}>
            <Text
              variant="eyebrow"
              weight="extrabold"
              style={{ color: colors.muted, opacity: 0.78, marginBottom: 12 }}
            >
              Total Ledger
            </Text>
            <Text
              weight="extrabold"
              style={{
                fontSize: 36,
                lineHeight: 38,
                letterSpacing: -1.6,
                color: colors.foreground,
              }}
            >
              Welcome back,{'\n'}
              {user?.name?.split(' ')[0] ?? 'there'}
            </Text>
            <Text
              variant="body"
              style={{ marginTop: 12, color: colors.muted, lineHeight: 22 }}
            >
              Your group money flow is calm, organized, and ready to settle.
            </Text>

            <View style={{ marginTop: 20 }}>
              <AppButton
                variant="primary"
                size="md"
                leftIcon={<Plus size={18} color={colors.primaryForeground} strokeWidth={2.6} />}
                onPress={() => router.push('/new-expense')}
                haptic
              >
                Add Expense
              </AppButton>
            </View>

            <View style={{ marginTop: 24, gap: 14 }}>
              <StatCard
                label="You're owed"
                value={`${sym}${youreOwed.toFixed(2)}`}
                description="Total pending across all groups where you paid."
              />
              <StatCard
                label="You owe"
                value={`${sym}${youOwe.toFixed(2)}`}
                tone="negative"
                description="Your outstanding share of expenses others have paid."
              />
            </View>
          </AppSurface>

          {/* ──────────── Settlement insights card ──────────── */}
          <InteractiveSurface
            variant="soft"
            onPress={() => router.push('/(tabs)/settlements')}
            style={{
              padding: 24,
              borderRadius: 32,
              marginBottom: 20,
              backgroundColor: colors.soft,
            }}
          >
            <IconBadge
              icon={<TrendingUp size={22} color={colors.primaryStrong} strokeWidth={2.4} />}
              tone="white"
              size="lg"
            />
            <Text
              weight="extrabold"
              style={{
                marginTop: 18,
                fontSize: 24,
                lineHeight: 26,
                letterSpacing: -1,
                color: colors.primaryStrong,
              }}
            >
              Settlement insights
            </Text>
            <Text
              variant="body"
              style={{ marginTop: 10, color: colors.muted, lineHeight: 22 }}
            >
              Review what is still pending, compare group activity, and move money with less back-and-forth.
            </Text>
            <View
              style={{
                marginTop: 24,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text
                weight="extrabold"
                style={{ fontSize: 14, color: colors.primaryStrong }}
              >
                View settlements
              </Text>
              <ArrowLeftRight size={16} color={colors.primaryStrong} strokeWidth={2.6} />
            </View>
          </InteractiveSurface>

          {/* ──────────── Recent Expenses surface ──────────── */}
          <AppSurface variant="solid" style={{ padding: 24, borderRadius: 32 }}>
            {/* Header row: big 2-line title + circular "N tracked" counter */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <Text
                weight="extrabold"
                style={{
                  fontSize: 32,
                  lineHeight: 34,
                  letterSpacing: -0.8,
                  color: colors.foreground,
                  flex: 1,
                }}
              >
                Recent{'\n'}Expenses
              </Text>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text
                  weight="extrabold"
                  style={{
                    fontSize: 20,
                    lineHeight: 22,
                    color: colors.foreground,
                    marginBottom: 2,
                  }}
                >
                  {allExpenses.length}
                </Text>
                <Text
                  weight="extrabold"
                  style={{
                    fontSize: 10,
                    lineHeight: 10,
                    letterSpacing: 0.6,
                    color: colors.foreground,
                    opacity: 0.7,
                  }}
                >
                  tracked
                </Text>
              </View>
            </View>

            {recentExpenses.length === 0 ? (
              <EmptyState
                icon={<Receipt size={28} color={colors.mutedSubtle} strokeWidth={2} />}
                title="No expenses yet"
                action={{ label: 'Create Your First Expense', onPress: () => router.push('/new-expense') }}
              />
            ) : (
              <View style={{ gap: 14 }}>
                {recentExpenses.map((expense) => {
                  const myShare = (expense as any).split_details?.find(
                    (s: any) => s.user_id === user?.id,
                  );
                  return (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      currency={currency}
                      amount={myShare ? myShare.amount : expense.total_amount}
                      amountLabel="Your share"
                      onPress={() => router.push(`/expenses/${expense.id}`)}
                    />
                  );
                })}
              </View>
            )}
          </AppSurface>

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
