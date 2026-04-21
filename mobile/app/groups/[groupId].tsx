import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Plus,
  Receipt,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { AppButton } from '../../src/slate/AppButton';
import { EmptyState, Avatar, Breath } from '../../src/slate/atoms';
import { AppSurface } from '../../src/slate/AppSurface';
import { ExpenseCard } from '../../src/slate/ExpenseCard';
import { useGroupsStore, useExpensesStore, useSettlementsStore } from '../../src/stores';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, radii, spacing } from '../../src/theme/tokens';
import { getCurrencySymbol } from '../../src/utils/constants';

function formatMonth(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

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

  // Net balance for current user in this group (+ = ahead, - = owes)
  const myOwe = settlements
    .filter((s) => s.from_user_id === user?.id)
    .reduce((a, s) => a + s.amount, 0);
  const myOwed = settlements
    .filter((s) => s.to_user_id === user?.id)
    .reduce((a, s) => a + s.amount, 0);
  const netBalance = myOwed - myOwe;
  const isSettled = Math.abs(netBalance) < 0.005;

  if (!group && !isLoading) {
    return (
      <AppShell>
        <Header title="Group not found" />
        <PageContent>
          <EmptyState
            title="Group not found"
            description="This group doesn't exist or you don't have access."
          />
        </PageContent>
      </AppShell>
    );
  }

  const balanceSentence = isSettled
    ? "You're all settled"
    : netBalance > 0
    ? `+${sym}${netBalance.toFixed(0)} — you're ahead`
    : `-${sym}${Math.abs(netBalance).toFixed(0)} — you owe`;

  const balanceColor = isSettled
    ? colors.muted
    : netBalance > 0
    ? colors.success
    : colors.danger;

  return (
    <AppShell edges={['top']}>
      {/* ──────────── Colored header block ──────────── */}
      <View
        style={{
          backgroundColor: colors.soft,
          paddingHorizontal: spacing.s20,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          borderBottomLeftRadius: radii.xl,
          borderBottomRightRadius: radii.xl,
        }}
        testID="group-detail-header-block"
      >
        {/* Back + more row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.s12,
          }}
        >
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/groups'))}
            accessibilityLabel="Go back"
            hitSlop={12}
            testID="group-detail-back"
            style={{
              width: spacing.s40,
              height: spacing.s40,
              borderRadius: radii.pill,
              backgroundColor: colors.surfaceSolid,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} color={colors.foreground} strokeWidth={2.4} />
          </Pressable>
          <Pressable
            onPress={() => {}}
            accessibilityLabel="More options"
            hitSlop={12}
            style={{
              width: spacing.s40,
              height: spacing.s40,
              borderRadius: radii.pill,
              backgroundColor: colors.surfaceSolid,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreHorizontal size={18} color={colors.foreground} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Identity row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
          <Avatar name={group?.name ?? ''} size="lg" tone="primary" />
          <View style={{ flex: 1 }}>
            <Text variant="titleXl" weight="extrabold" numberOfLines={1}>
              {group?.name ?? ''}
            </Text>
            <Text variant="label" tone="muted" style={{ marginTop: spacing.xs }}>
              {group?.members.length ?? 0} people
              {group?.created_at ? ` · started ${formatMonth(group.created_at)}` : ''}
            </Text>
          </View>
        </View>

        {/* Balance sentence */}
        <Text
          variant="titleLg"
          weight="extrabold"
          testID="group-detail-balance-sentence"
          style={{
            color: balanceColor,
            marginBottom: spacing.md,
          }}
        >
          {balanceSentence}
        </Text>

        {/* Action row */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <AppButton
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/settlements')}
            testID="group-detail-action-settle"
          >
            Settle up
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onPress={() => router.push(`/reports/${groupId}`)}
            testID="group-detail-action-reports"
          >
            Reports
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            leftIcon={<Plus size={16} color={colors.primary} strokeWidth={2.4} />}
            onPress={() => router.push({ pathname: '/new-expense', params: { groupId } })}
            testID="group-detail-action-add"
          >
            Add
          </AppButton>
        </View>
      </View>

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
            <Breath size="md" />

            {/* Members */}
            <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
              MEMBERS ({group?.members.length ?? 0})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: spacing.lg }}
              contentContainerStyle={{ gap: spacing.s12 }}
            >
              {group?.members.map((m) => (
                <View key={m.id} style={{ alignItems: 'center', gap: spacing.sm }}>
                  <Avatar
                    name={m.name}
                    size="md"
                    tone={m.id === user?.id ? 'primary' : 'default'}
                  />
                  <Text variant="label" weight="semibold" tone="muted">
                    {m.id === user?.id ? 'You' : m.name.split(' ')[0]}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Pending settlements */}
            {settlements.length > 0 ? (
              <>
                <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
                  PENDING SETTLEMENTS
                </Text>
                <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                  {settlements.map((s, i) => (
                    <AppSurface key={i} variant="solid" compact>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}>
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
                          {sym}
                          {s.amount.toFixed(2)}
                        </Text>
                      </View>
                    </AppSurface>
                  ))}
                </View>
              </>
            ) : null}

            {/* Expenses */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text variant="titleLg" weight="extrabold">
                Expenses
              </Text>
              <Text variant="eyebrow" tone="muted">
                {expenses.length} TOTAL
              </Text>
            </View>

            {expenses.length === 0 ? (
              <EmptyState
                icon={<Receipt size={28} color={colors.mutedSubtle} strokeWidth={2} />}
                title="No expenses yet"
                description="Add the first expense to start tracking."
                action={{
                  label: 'Add Expense',
                  onPress: () =>
                    router.push({ pathname: '/new-expense', params: { groupId } }),
                }}
              />
            ) : (
              <View style={{ gap: spacing.s12 }}>
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
