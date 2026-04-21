import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { PageContent } from '../slate/AppShell';
import { Text } from '../slate/Text';
import { Header } from '../slate/Header';
import { PageHero } from '../slate/PageHero';
import { AppButton } from '../slate/AppButton';
import { AppInput, Field } from '../slate/AppInput';
import { InteractiveSurface } from '../slate/AppSurface';
import { EmptyState, Avatar, Breath, Callout } from '../slate/atoms';
import { SheetHeader } from '../slate/AppBottomSheet';
import { Toast } from '../slate/Toast';
import { useGroupsStore, useSettlementsStore } from '../stores';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { colors, spacing } from '../theme/tokens';
import { getCurrencySymbol } from '../utils/constants';

interface GroupsListProps {
  /** Override navigation when a group row is pressed. Defaults to /groups/[id]. */
  onGroupPress?: (groupId: string) => void;
  /** Open the create-group sheet on mount (used when invoked with ?create=1). */
  autoOpenCreate?: boolean;
  /** Header title + eyebrow. Defaults to the standard Groups copy. */
  title?: string;
  eyebrow?: string;
  /** Whether to render the in-page Header row. The legacy /groups screen keeps it; the tab can opt out. */
  showHeader?: boolean;
}

export function GroupsList({
  onGroupPress,
  autoOpenCreate = false,
  title = 'Groups',
  eyebrow = 'Your circles',
  showHeader = true,
}: GroupsListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, loading, fetch: fetchGroups, upsert, invalidate } = useGroupsStore();
  const { byGroupId, fetch: fetchSettlements } = useSettlementsStore();

  const sheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: 'success' | 'danger' } | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    for (const g of groups) {
      fetchSettlements(g.id);
    }
  }, [groups, fetchSettlements]);

  useEffect(() => {
    if (autoOpenCreate) openSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenCreate]);

  const openSheet = () => {
    setGroupName('');
    setMemberEmails('');
    setCurrency('INR');
    setCreateError(null);
    setSheetOpen(true);
    sheetRef.current?.expand();
  };

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    sheetRef.current?.close();
  }, []);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setCreateError('Group name is required');
      return;
    }
    const emails = memberEmails
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    setCreating(true);
    setCreateError(null);
    try {
      const newGroup = await api.post('/groups', {
        name: groupName.trim(),
        member_emails: emails,
        currency,
      });
      upsert(newGroup);
      invalidate();
      closeSheet();
      setToast({ text: 'Group created', tone: 'success' });
      // Let the toast land before navigating.
      setTimeout(() => router.push(`/groups/${newGroup.id}`), 400);
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to create group';
      setCreateError(msg);
      setToast({ text: msg, tone: 'danger' });
    } finally {
      setCreating(false);
    }
  };

  const perGroupBalance = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of groups) {
      const setts = byGroupId[g.id] ?? [];
      let net = 0;
      for (const s of setts) {
        if (s.to_user_id === user?.id) net += s.amount;
        else if (s.from_user_id === user?.id) net -= s.amount;
      }
      map[g.id] = net;
    }
    return map;
  }, [groups, byGroupId, user?.id]);

  const renderBalanceLabel = (groupId: string, groupCurrency: string) => {
    const net = perGroupBalance[groupId] ?? 0;
    const sym = getCurrencySymbol(groupCurrency);
    if (Math.abs(net) < 0.005) {
      // Settled state uses success accent — positive signal, not muted grey.
      return { text: 'settled', color: colors.success };
    }
    if (net > 0) {
      return {
        text: `+${sym}${net.toFixed(0)} ahead`,
        color: colors.success,
      };
    }
    return {
      text: `-${sym}${Math.abs(net).toFixed(0)} behind`,
      color: colors.danger,
    };
  };

  const handleRowPress = (groupId: string) => {
    if (onGroupPress) onGroupPress(groupId);
    else router.push(`/groups/${groupId}`);
  };

  return (
    <>
      {showHeader ? (
        <Header
          title={title}
          showBack={false}
          right={
            <AppButton
              variant="icon"
              size="sm"
              onPress={openSheet}
              haptic
              leftIcon={<Plus size={18} color={colors.foreground} strokeWidth={2.4} />}
              accessibilityLabel="Create group"
              testID="groups-create-button"
            />
          }
        />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchGroups({ force: true })}
            tintColor={colors.primary}
          />
        }
      >
        <PageContent>
          <PageHero eyebrow={eyebrow} title={title} compact />

          {loading && groups.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: spacing.s40 }}
              testID="groups-loading"
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.mutedSubtle} strokeWidth={2} />}
              title="No groups yet"
              description="Create a group and invite friends to start splitting expenses."
              action={{ label: 'Create Group', onPress: openSheet }}
            />
          ) : (
            <View style={{ gap: spacing.s12 }}>
              {groups.map((group) => {
                const bal = renderBalanceLabel(group.id, group.currency);
                return (
                  <InteractiveSurface
                    key={group.id}
                    compact
                    onPress={() => handleRowPress(group.id)}
                    testID={`groups-row-${group.id}`}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Avatar name={group.name} size="md" tone="primary" />
                      <View style={{ flex: 1 }}>
                        <Text variant="title" weight="bold" numberOfLines={1}>
                          {group.name}
                        </Text>
                        <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
                          {group.members.length} members · {group.currency}
                        </Text>
                      </View>
                      <Text
                        variant="label"
                        weight="bold"
                        style={{ color: bal.color }}
                        testID={`groups-balance-${group.id}`}
                      >
                        {bal.text}
                      </Text>
                    </View>
                  </InteractiveSurface>
                );
              })}
            </View>
          )}
          <Breath size="lg" />
        </PageContent>
      </ScrollView>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['60%', '85%']}
        enablePanDownToClose
        onClose={() => setSheetOpen(false)}
        backgroundStyle={{ backgroundColor: colors.surfaceSolid }}
        handleIndicatorStyle={{ backgroundColor: colors.softStrong, width: 36 }}
      >
        <View style={{ flex: 1 }}>
          <SheetHeader title="Create Group" onClose={closeSheet} />
          <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.md }}>
            {createError ? <Callout tone="danger">{createError}</Callout> : null}

            <Field label="Group Name">
              <AppInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Goa Trip, Flat mates…"
                autoCapitalize="words"
                testID="groups-input-name"
              />
            </Field>

            <Field label="Member Emails" hint="Comma-separated. You're added automatically.">
              <AppInput
                value={memberEmails}
                onChangeText={setMemberEmails}
                placeholder="alice@email.com, bob@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                testID="groups-input-emails"
              />
            </Field>

            <Field label="Currency">
              <AppInput
                value={currency}
                onChangeText={setCurrency}
                placeholder="INR"
                autoCapitalize="characters"
                testID="groups-input-currency"
              />
            </Field>

            <AppButton
              variant="primary"
              size="lg"
              onPress={handleCreate}
              loading={creating}
              haptic
              style={{ marginTop: spacing.sm }}
              testID="groups-submit"
            >
              Create Group
            </AppButton>
          </ScrollView>
        </View>
      </BottomSheet>

      <Toast
        message={toast?.text ?? null}
        tone={toast?.tone ?? 'success'}
        onHide={() => setToast(null)}
      />
    </>
  );
}
