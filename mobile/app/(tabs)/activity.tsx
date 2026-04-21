import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, CheckCircle, Activity as ActivityIcon } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { PageHero } from '../../src/slate/PageHero';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import {
  MemberBadge,
  EmptyState,
  IconBadge,
  Breath,
} from '../../src/slate/atoms';
import { useGroupsStore, useExpensesStore, useSettlementsStore } from '../../src/stores';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing } from '../../src/theme/tokens';
import { getCurrencySymbol } from '../../src/utils/constants';
import type { Expense, SettlementItem } from '../../src/stores/types';

type FilterType = 'all' | 'expenses' | 'settlements';

interface ExpenseActivityItem {
  kind: 'expense';
  id: string;
  groupId: string;
  date: string;
  expense: Expense;
}

interface SettlementActivityItem {
  kind: 'settlement';
  id: string;
  groupId: string;
  settlement: SettlementItem;
}

type ActivityItem = ExpenseActivityItem | SettlementActivityItem;

/** Parse a date string defensively; return null if it resolves to NaN. */
function safeDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Return "Today", "Yesterday", or a human-readable date section label. */
export function formatDateSection(iso: string): string {
  const d = safeDate(iso);
  if (!d) return 'Recently';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatTime(iso: string): string {
  const d = safeDate(iso);
  if (!d) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function ActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, fetch: fetchGroups, loading: groupsLoading } = useGroupsStore();
  const {
    byGroupId: expensesByGroup,
    fetch: fetchExpenses,
    loadingGroupId,
  } = useExpensesStore();
  const { byGroupId: settlementsByGroup, fetch: fetchSettlements } = useSettlementsStore();

  const [filter, setFilter] = useState<FilterType>('all');

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

  const isRefreshing =
    groupsLoading || Object.values(loadingGroupId).some(Boolean);

  const groupById = useMemo(() => {
    const m: Record<string, { name: string; currency: string }> = {};
    for (const g of groups) m[g.id] = { name: g.name, currency: g.currency };
    return m;
  }, [groups]);

  // Expense items — sorted by date desc, cap at 50 to keep the feed fast.
  const expenseItems: ExpenseActivityItem[] = useMemo(() => {
    const all: ExpenseActivityItem[] = [];
    for (const [gid, list] of Object.entries(expensesByGroup)) {
      for (const exp of list) {
        const dateStr = exp.date || exp.created_at || '';
        all.push({
          kind: 'expense',
          id: exp.id,
          groupId: gid,
          date: dateStr,
          expense: exp,
        });
      }
    }
    return all
      .filter((i) => safeDate(i.date) !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50);
  }, [expensesByGroup]);

  // Settlement items — SettlementItem has no date field (pending computed
  // balances, not historical events). We expose them as outstanding items.
  const settlementItems: SettlementActivityItem[] = useMemo(() => {
    const all: SettlementActivityItem[] = [];
    for (const [gid, list] of Object.entries(settlementsByGroup)) {
      list.forEach((s, i) => {
        all.push({
          kind: 'settlement',
          id: `${gid}-${i}-${s.from_user_id}-${s.to_user_id}`,
          groupId: gid,
          settlement: s,
        });
      });
    }
    return all;
  }, [settlementsByGroup]);

  const showExpenses = filter === 'all' || filter === 'expenses';
  const showSettlements = filter === 'all' || filter === 'settlements';

  const filteredExpenses = showExpenses ? expenseItems : [];
  const filteredSettlements = showSettlements ? settlementItems : [];

  const isEmpty = filteredExpenses.length === 0 && filteredSettlements.length === 0;

  // Group expenses by date section
  const expenseSections = useMemo(() => {
    const sections: { label: string; items: ExpenseActivityItem[] }[] = [];
    let current: { label: string; items: ExpenseActivityItem[] } | null = null;
    for (const item of filteredExpenses) {
      const label = formatDateSection(item.date);
      if (!current || current.label !== label) {
        current = { label, items: [] };
        sections.push(current);
      }
      current.items.push(item);
    }
    return sections;
  }, [filteredExpenses]);

  const isLoading = groupsLoading && groups.length === 0;

  if (isLoading) {
    return (
      <AppShell>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} testID="activity-loading" />
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
            onRefresh={() => loadAll(true)}
            tintColor={colors.primary}
          />
        }
      >
        <PageContent>
          <PageHero eyebrow="Recent" title="Activity" compact />

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: spacing.lg }}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.sm }}
          >
            <MemberBadge active={filter === 'all'} onPress={() => setFilter('all')}>
              All
            </MemberBadge>
            <MemberBadge active={filter === 'expenses'} onPress={() => setFilter('expenses')}>
              Expenses
            </MemberBadge>
            <MemberBadge
              active={filter === 'settlements'}
              onPress={() => setFilter('settlements')}
            >
              Settlements
            </MemberBadge>
          </ScrollView>

          {isEmpty ? (
            <EmptyState
              icon={<ActivityIcon size={28} color={colors.mutedSubtle} strokeWidth={2} />}
              title="No activity yet"
              description="Your expenses and settlements will appear here."
              action={{ label: 'Add Expense', onPress: () => router.push('/new-expense') }}
            />
          ) : (
            <View style={{ gap: spacing.lg }}>
              {/* Pending settlements — always shown at top when visible */}
              {showSettlements && filteredSettlements.length > 0 ? (
                <View>
                  <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
                    PENDING
                  </Text>
                  <View style={{ gap: spacing.s12 }}>
                    {filteredSettlements.map((item) => (
                      <SettlementRow
                        key={item.id}
                        item={item}
                        userId={user?.id}
                        groupInfo={groupById[item.groupId]}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Expenses grouped by date */}
              {showExpenses &&
                expenseSections.map((section) => (
                  <View key={section.label}>
                    <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
                      {section.label.toUpperCase()}
                    </Text>
                    <View style={{ gap: spacing.s12 }}>
                      {section.items.map((item) => (
                        <ExpenseRow
                          key={item.id}
                          item={item}
                          groupInfo={groupById[item.groupId]}
                          onPress={() => router.push(`/expenses/${item.expense.id}`)}
                        />
                      ))}
                    </View>
                  </View>
                ))}
            </View>
          )}

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}

/* ---------- Row components ---------- */

interface ExpenseRowProps {
  item: ExpenseActivityItem;
  groupInfo?: { name: string; currency: string };
  onPress: () => void;
}

function ExpenseRow({ item, groupInfo, onPress }: ExpenseRowProps) {
  const currency = groupInfo?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);
  const title = item.expense.description || item.expense.merchant || 'Expense';
  return (
    <InteractiveSurface
      compact
      onPress={onPress}
      testID={`activity-expense-${item.id}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}>
        <IconBadge
          icon={<Receipt size={18} color={colors.primary} strokeWidth={2.2} />}
          tone="soft"
          size="md"
        />
        <View style={{ flex: 1 }}>
          <Text variant="title" weight="bold" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
            {(groupInfo?.name ?? 'Group')}
            {item.date ? ` · ${formatTime(item.date)}` : ''}
          </Text>
        </View>
        <Text variant="title" weight="extrabold" style={{ color: colors.foreground }}>
          {sym}
          {item.expense.total_amount.toFixed(2)}
        </Text>
      </View>
    </InteractiveSurface>
  );
}

interface SettlementRowProps {
  item: SettlementActivityItem;
  userId: string | undefined;
  groupInfo?: { name: string; currency: string };
}

function SettlementRow({ item, userId, groupInfo }: SettlementRowProps) {
  const s = item.settlement;
  const sym = getCurrencySymbol(groupInfo?.currency ?? s.currency ?? 'INR');
  const youOwe = s.from_user_id === userId;
  const youreOwed = s.to_user_id === userId;
  const tone = youOwe ? colors.danger : youreOwed ? colors.success : colors.foreground;
  const label = youOwe
    ? `You owe ${s.to_user_name}`
    : youreOwed
    ? `${s.from_user_name} owes you`
    : `${s.from_user_name} owes ${s.to_user_name}`;

  return (
    <AppSurface variant="solid" compact testID={`activity-settlement-${item.id}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}>
        <IconBadge
          icon={<CheckCircle size={18} color={colors.success} strokeWidth={2.2} />}
          tone="soft"
          size="md"
        />
        <View style={{ flex: 1 }}>
          <Text variant="title" weight="bold" numberOfLines={1}>
            {label}
          </Text>
          <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
            {groupInfo?.name ?? 'Group'}
          </Text>
        </View>
        <Text variant="title" weight="extrabold" style={{ color: tone }}>
          {sym}
          {s.amount.toFixed(2)}
        </Text>
      </View>
    </AppSurface>
  );
}
