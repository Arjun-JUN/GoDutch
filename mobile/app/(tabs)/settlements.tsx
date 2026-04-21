import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowUpDown, CheckCircle } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { PageHero } from '../../src/slate/PageHero';
import { MemberBadge, EmptyState, Avatar, Breath, StatCard, Callout } from '../../src/slate/atoms';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { useGroupsStore, useSettlementsStore } from '../../src/stores';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, radii, spacing } from '../../src/theme/tokens';
import { getCurrencySymbol } from '../../src/utils/constants';
import type { SettlementItem } from '../../src/stores/types';

export default function SettlementsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { groups, fetch: fetchGroups, loading: groupsLoading } = useGroupsStore();
  const { byGroupId, fetch: fetchSettlements, loadingGroupId } = useSettlementsStore();

  // Track which group the user is filtering on (null = all)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const isRefreshing =
    groupsLoading || Object.values(loadingGroupId).some(Boolean);

  const loadAll = useCallback(
    async (force = false) => {
      await fetchGroups({ force });
      for (const g of useGroupsStore.getState().groups) {
        fetchSettlements(g.id, { force });
      }
    },
    [fetchGroups, fetchSettlements]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Active settlements — filter by selected group if set
  const settlements: (SettlementItem & { groupName: string; currency: string })[] =
    useMemo(() => {
      const groupCurrencyMap: Record<string, string> = {};
      const groupNameMap: Record<string, string> = {};
      for (const g of groups) {
        groupCurrencyMap[g.id] = g.currency;
        groupNameMap[g.id] = g.name;
      }

      const targetGroups = selectedGroupId
        ? [selectedGroupId]
        : Object.keys(byGroupId);

      return targetGroups.flatMap((gid) =>
        (byGroupId[gid] ?? []).map((s) => ({
          ...s,
          groupName: groupNameMap[gid] ?? gid,
          currency: groupCurrencyMap[gid] ?? 'INR',
        }))
      );
    }, [byGroupId, groups, selectedGroupId]);

  // Split into "you owe" and "you're owed" for the current user
  const youOwe = settlements.filter((s) => s.from_user_id === user?.id);
  const youreOwed = settlements.filter((s) => s.to_user_id === user?.id);

  const totalOwe = youOwe.reduce((acc, s) => acc + s.amount, 0);
  const totalOwed = youreOwed.reduce((acc, s) => acc + s.amount, 0);
  const primaryCurrency = groups[0]?.currency ?? 'INR';
  const sym = getCurrencySymbol(primaryCurrency);

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
          <PageHero eyebrow="Balance Sheet" title="Settlements" compact />

          {/* Summary row */}
          <View style={{ flexDirection: 'row', gap: spacing.s12, marginBottom: spacing.lg }}>
            <StatCard
              label="You owe"
              value={`${sym}${totalOwe.toFixed(2)}`}
              tone={totalOwe > 0 ? 'negative' : 'default'}
            />
            <StatCard
              label="You're owed"
              value={`${sym}${totalOwed.toFixed(2)}`}
              tone={totalOwed > 0 ? 'positive' : 'default'}
            />
          </View>

          {/* Group filter chips */}
          {groups.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: spacing.lg }}
              contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.sm }}
            >
              <MemberBadge
                active={selectedGroupId === null}
                onPress={() => setSelectedGroupId(null)}
              >
                All groups
              </MemberBadge>
              {groups.map((g) => (
                <MemberBadge
                  key={g.id}
                  active={selectedGroupId === g.id}
                  onPress={() => setSelectedGroupId(g.id)}
                >
                  {g.name}
                </MemberBadge>
              ))}
            </ScrollView>
          )}

          {settlements.length === 0 ? (
            <EmptyState
              icon={<CheckCircle size={28} color={colors.success} strokeWidth={2} />}
              title="All settled up!"
              description="No pending balances across your groups. Nice work."
            />
          ) : (
            <View style={{ gap: spacing.lg }}>
              {/* You owe */}
              {youOwe.length > 0 && (
                <View>
                  <Text
                    variant="eyebrow"
                    tone="muted"
                    style={{ marginBottom: spacing.s12 }}
                  >
                    YOU OWE
                  </Text>
                  <View style={{ gap: spacing.s12 }}>
                    {youOwe.map((s, i) => (
                      <SettlementRow
                        key={i}
                        settlement={s}
                        direction="owe"
                        onPayPress={() => router.push('/(upi)/send')}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* You're owed */}
              {youreOwed.length > 0 && (
                <View>
                  <Text
                    variant="eyebrow"
                    tone="muted"
                    style={{ marginBottom: spacing.s12 }}
                  >
                    YOU'RE OWED
                  </Text>
                  <View style={{ gap: spacing.s12 }}>
                    {youreOwed.map((s, i) => (
                      <SettlementRow
                        key={i}
                        settlement={s}
                        direction="owed"
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Third-party settlements */}
              {settlements.filter(
                (s) => s.from_user_id !== user?.id && s.to_user_id !== user?.id
              ).length > 0 && (
                <View>
                  <Text
                    variant="eyebrow"
                    tone="muted"
                    style={{ marginBottom: spacing.s12 }}
                  >
                    BETWEEN OTHERS
                  </Text>
                  <View style={{ gap: spacing.s12 }}>
                    {settlements
                      .filter(
                        (s) =>
                          s.from_user_id !== user?.id && s.to_user_id !== user?.id
                      )
                      .map((s, i) => (
                        <SettlementRow key={i} settlement={s} direction="other" />
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}

/* ---------- SettlementRow ---------- */

interface SettlementRowProps {
  settlement: SettlementItem & { groupName: string; currency: string };
  direction: 'owe' | 'owed' | 'other';
  onPayPress?: () => void;
}

function SettlementRow({ settlement, direction, onPayPress }: SettlementRowProps) {
  const sym = getCurrencySymbol(settlement.currency);
  const isOwe = direction === 'owe';
  const amountColor = isOwe ? colors.danger : direction === 'owed' ? colors.success : colors.foreground;

  return (
    <AppSurface variant="solid" compact>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}>
        <Avatar name={isOwe ? settlement.to_user_name : settlement.from_user_name} size="md" />
        <View style={{ flex: 1 }}>
          <Text variant="title" weight="bold" numberOfLines={1}>
            {isOwe ? settlement.to_user_name : settlement.from_user_name}
          </Text>
          <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
            {settlement.groupName}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
          <Text variant="amount" style={{ color: amountColor }}>
            {sym}{settlement.amount.toFixed(2)}
          </Text>
          {isOwe && onPayPress ? (
            <InteractiveSurface
              compact
              onPress={onPayPress}
              style={{
                paddingHorizontal: spacing.s12,
                paddingVertical: spacing.xs,
                borderRadius: radii.pill,
                backgroundColor: colors.soft,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Text variant="label" weight="semibold" style={{ color: colors.primary }}>
                Pay Now
              </Text>
              <ArrowRight size={12} color={colors.primary} strokeWidth={2.5} />
            </InteractiveSurface>
          ) : null}
        </View>
      </View>
    </AppSurface>
  );
}
