import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  ArrowLeftRight,
  Camera,
  Bell,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { EmptyState, IconBadge, Avatar, Breath } from '../../src/slate/atoms';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { useAuth } from '../../src/contexts/AuthContext';
import { useGroupsStore, useExpensesStore, useSettlementsStore } from '../../src/stores';
import { colors, radii, spacing } from '../../src/theme/tokens';
import { getCurrencySymbol } from '../../src/utils/constants';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    groups,
    loading: groupsLoading,
    fetch: fetchGroups,
  } = useGroupsStore();

  const { fetch: fetchExpenses, loadingGroupId } = useExpensesStore();

  const { fetch: fetchSettlements, byGroupId: settlementsByGroup } = useSettlementsStore();

  const isRefreshing =
    groupsLoading || Object.values(loadingGroupId).some(Boolean);

  const { youreOwed, youOwe, perGroupBalance } = useMemo(() => {
    let owed = 0;
    let owe = 0;
    const perGroup: Record<string, number> = {};
    for (const groupId of Object.keys(settlementsByGroup)) {
      let net = 0;
      for (const s of settlementsByGroup[groupId]) {
        if (s.to_user_id === user?.id) {
          owed += s.amount;
          net += s.amount;
        }
        if (s.from_user_id === user?.id) {
          owe += s.amount;
          net -= s.amount;
        }
      }
      perGroup[groupId] = net;
    }
    return { youreOwed: owed, youOwe: owe, perGroupBalance: perGroup };
  }, [settlementsByGroup, user?.id]);

  const netBalance = youreOwed - youOwe;
  // Multi-currency simplification (known limitation, tracked separately)
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

  if (groupsLoading && groups.length === 0) {
    return (
      <AppShell>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            testID="dashboard-loading"
          />
        </View>
      </AppShell>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const previewGroups = groups.slice(0, 3);

  const formatSigned = (value: number) =>
    `${value >= 0 ? '+' : '-'}${sym}${Math.abs(value).toFixed(2)}`;

  return (
    <AppShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.s40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAll(true)}
            tintColor={colors.primary}
          />
        }
      >
        <PageContent>
          {/* Greeting row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.md,
              marginBottom: spacing.s20,
            }}
          >
            <Text
              variant="titleXl"
              weight="extrabold"
              style={{ color: colors.foreground }}
              testID="dashboard-greeting"
            >
              Hey {firstName} 👋
            </Text>
            <Pressable
              accessibilityLabel="Notifications"
              onPress={() => {}}
              style={{
                width: spacing.s40,
                height: spacing.s40,
                borderRadius: radii.pill,
                backgroundColor: colors.soft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} color={colors.foreground} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Balance hero */}
          <AppSurface
            variant="solid"
            style={{ padding: spacing.lg, borderRadius: radii['2xl'], marginBottom: spacing.s20 }}
          >
            <Text
              variant="eyebrow"
              tone="muted"
              style={{ marginBottom: spacing.s12 }}
            >
              NET BALANCE
            </Text>
            <Text
              variant="displayLg"
              weight="extrabold"
              testID="dashboard-net-balance"
              style={{
                color:
                  Math.abs(netBalance) < 0.005
                    ? colors.foreground
                    : netBalance > 0
                    ? colors.success
                    : colors.danger,
              }}
            >
              {Math.abs(netBalance) < 0.005
                ? `${sym}0.00`
                : formatSigned(netBalance)}
            </Text>
            <Text
              variant="label"
              tone="muted"
              style={{ marginTop: spacing.s12 }}
              testID="dashboard-balance-breakdown"
            >
              you're owed {sym}
              {youreOwed.toFixed(2)} · you owe {sym}
              {youOwe.toFixed(2)}
            </Text>
          </AppSurface>

          {/* Quick actions — related controls grouped in a soft tonal container */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.s12,
              padding: spacing.xs,
              backgroundColor: colors.soft,
              borderRadius: radii.xl,
              marginBottom: spacing.lg,
            }}
          >
            <QuickAction
              icon={<Plus size={20} color={colors.primary} strokeWidth={2.4} />}
              label="Add expense"
              onPress={() => router.push('/new-expense')}
              testID="dashboard-quick-add"
            />
            <QuickAction
              icon={<ArrowLeftRight size={20} color={colors.primary} strokeWidth={2.4} />}
              label="Settle up"
              onPress={() => router.push('/(tabs)/settlements')}
              testID="dashboard-quick-settle"
            />
            <QuickAction
              icon={<Camera size={20} color={colors.primary} strokeWidth={2.4} />}
              label="Scan receipt"
              onPress={() =>
                router.push({ pathname: '/new-expense', params: { mode: 'scan' } })
              }
              testID="dashboard-quick-scan"
            />
          </View>

          {/* Groups preview */}
          <AppSurface variant="solid" style={{ padding: spacing.lg, borderRadius: radii['2xl'] }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.md,
              }}
            >
              <Text variant="titleLg" weight="extrabold">
                Your groups
              </Text>
              {groups.length > 0 ? (
                <Pressable
                  onPress={() => router.push('/(tabs)/groups')}
                  accessibilityLabel="See all groups"
                  testID="dashboard-see-all"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
                >
                  <Text variant="label" weight="semibold" tone="primary">
                    see all
                  </Text>
                  <ChevronRight size={14} color={colors.primary} strokeWidth={2.4} />
                </Pressable>
              ) : null}
            </View>

            {previewGroups.length === 0 ? (
              <EmptyState
                icon={<Users size={28} color={colors.mutedSubtle} strokeWidth={2} />}
                title="Start your first group"
                description="Split expenses with friends, roommates, or trips."
                action={{
                  label: 'Create group',
                  onPress: () =>
                    router.push({ pathname: '/(tabs)/groups', params: { create: '1' } }),
                }}
              />
            ) : (
              <View style={{ gap: spacing.s12 }}>
                {previewGroups.map((g) => {
                  const net = perGroupBalance[g.id] ?? 0;
                  const gSym = getCurrencySymbol(g.currency);
                  const isSettled = Math.abs(net) < 0.005;
                  // Settled state uses the success accent — a positive signal, not neutral grey.
                  const balColor = isSettled
                    ? colors.success
                    : net > 0
                    ? colors.success
                    : colors.danger;
                  const balText = isSettled
                    ? 'settled'
                    : `${net > 0 ? '+' : '-'}${gSym}${Math.abs(net).toFixed(0)}`;
                  return (
                    <InteractiveSurface
                      key={g.id}
                      compact
                      onPress={() => router.push(`/groups/${g.id}`)}
                      testID={`dashboard-group-${g.id}`}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}>
                        <Avatar name={g.name} size="md" tone="primary" />
                        <View style={{ flex: 1 }}>
                          <Text variant="title" weight="bold" numberOfLines={1}>
                            {g.name}
                          </Text>
                          <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
                            {g.members.length} members
                          </Text>
                        </View>
                        <Text
                          variant="title"
                          weight="extrabold"
                          style={{ color: balColor }}
                        >
                          {balText}
                        </Text>
                      </View>
                    </InteractiveSurface>
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

/* ---------- QuickAction card ---------- */

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  testID?: string;
}

function QuickAction({ icon, label, onPress, testID }: QuickActionProps) {
  return (
    <InteractiveSurface
      compact
      onPress={onPress}
      testID={testID}
      style={{ flex: 1, paddingVertical: spacing.md, alignItems: 'center' }}
    >
      <IconBadge icon={icon} tone="soft" size="md" />
      <Text
        variant="label"
        weight="semibold"
        style={{ marginTop: spacing.s12, textAlign: 'center' }}
      >
        {label}
      </Text>
    </InteractiveSurface>
  );
}
