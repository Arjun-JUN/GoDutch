import React, { useCallback, useEffect, useMemo } from 'react';
import { SectionList, View, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { PageHero } from '../../src/slate/PageHero';
import { EmptyState, Breath } from '../../src/slate/atoms';
import { ExpenseCard } from '../../src/slate/ExpenseCard';
import { useGroupsStore, useExpensesStore } from '../../src/stores';
import { colors } from '../../src/theme/tokens';
import type { Expense } from '../../src/stores/types';

/** Group a flat list of expenses into date-based sections (e.g. "Apr 2026"). */
function buildSections(expenses: Expense[]): { title: string; data: Expense[] }[] {
  const map = new Map<string, Expense[]>();
  for (const e of expenses) {
    const raw = e.date || e.created_at || '';
    let label = 'Unknown date';
    if (raw) {
      try {
        label = new Date(raw).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        });
      } catch {
        label = raw.slice(0, 7);
      }
    }
    const bucket = map.get(label) ?? [];
    bucket.push(e);
    map.set(label, bucket);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export default function ExpensesScreen() {
  const router = useRouter();
  const { groups, fetch: fetchGroups, loading: groupsLoading } = useGroupsStore();
  const { getAll, fetch: fetchExpenses, loadingGroupId } = useExpensesStore();

  const isRefreshing =
    groupsLoading || Object.values(loadingGroupId).some(Boolean);

  const loadAll = useCallback(
    async (force = false) => {
      await fetchGroups({ force });
      for (const g of useGroupsStore.getState().groups) {
        fetchExpenses(g.id, { force });
      }
    },
    [fetchGroups, fetchExpenses]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sections = useMemo(() => buildSections(getAll()), [getAll]);

  // Derive a per-expense currency from its group
  const groupCurrencyMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of groups) map[g.id] = g.currency;
    return map;
  }, [groups]);

  const isLoading = groupsLoading && groups.length === 0;

  if (isLoading) {
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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAll(true)}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <PageContent style={{ paddingBottom: 0 }}>
            <PageHero eyebrow="All Activity" title="Expenses" compact />
          </PageContent>
        }
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 10,
              backgroundColor: colors.backgroundStart,
            }}
          >
            <Text variant="eyebrow" tone="muted">
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 24, marginBottom: 10 }}>
            <ExpenseCard
              expense={item}
              currency={groupCurrencyMap[item.group_id] ?? 'INR'}
              onPress={() => router.push(`/expenses/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <PageContent>
            <EmptyState
              icon={<Receipt size={28} color={colors.mutedSubtle} strokeWidth={2} />}
              title="No expenses yet"
              description="Once you add expenses across your groups they'll all appear here."
              action={{ label: 'Add Expense', onPress: () => router.push('/new-expense') }}
            />
          </PageContent>
        }
        ListFooterComponent={<Breath size="lg" />}
      />
    </AppShell>
  );
}
