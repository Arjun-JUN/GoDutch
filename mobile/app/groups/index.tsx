import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { PageHero } from '../../src/slate/PageHero';
import { AppButton } from '../../src/slate/AppButton';
import { AppInput, Field } from '../../src/slate/AppInput';
import { InteractiveSurface } from '../../src/slate/AppSurface';
import { EmptyState, Avatar, Breath, Callout } from '../../src/slate/atoms';
import { SheetHeader } from '../../src/slate/AppBottomSheet';
import { useGroupsStore } from '../../src/stores';
import { api } from '../../src/api/client';
import { colors } from '../../src/theme/tokens';

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, loading, fetch: fetchGroups, upsert, invalidate } = useGroupsStore();

  // Create group sheet
  const sheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onRefresh = () => fetchGroups({ force: true });

  const openSheet = () => {
    setGroupName('');
    setMemberEmails('');
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
      router.push(`/groups/${newGroup.id}`);
    } catch (e: any) {
      setCreateError(e?.message ?? 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell>
      <Header title="Groups" right={
        <AppButton variant="icon" size="sm" onPress={openSheet} haptic
          leftIcon={<Plus size={18} color={colors.foreground} strokeWidth={2.4} />}
        />
      } />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <PageContent>
          <PageHero eyebrow="Your circles" title="Groups" compact />

          {loading && groups.length === 0 ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.mutedSubtle} strokeWidth={2} />}
              title="No groups yet"
              description="Create a group and invite friends to start splitting expenses."
              action={{ label: 'Create Group', onPress: openSheet }}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {groups.map((group) => (
                <InteractiveSurface
                  key={group.id}
                  compact
                  onPress={() => router.push(`/groups/${group.id}`)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <Avatar name={group.name} size="md" tone="primary" />
                    <View style={{ flex: 1 }}>
                      <Text variant="title" weight="bold" numberOfLines={1}>{group.name}</Text>
                      <Text variant="label" tone="subtle" style={{ marginTop: 2 }}>
                        {group.members.length} members · {group.currency}
                      </Text>
                    </View>
                  </View>
                </InteractiveSurface>
              ))}
            </View>
          )}
          <Breath size="lg" />
        </PageContent>
      </ScrollView>

      {/* Create Group Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['60%', '85%']}
        enablePanDownToClose
        onClose={() => setSheetOpen(false)}
        backgroundStyle={{ backgroundColor: colors.surfaceSolid }}
        handleIndicatorStyle={{ backgroundColor: colors.softStrong, width: 36 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <SheetHeader title="Create Group" onClose={closeSheet} />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, gap: 16 }}>
            {createError && <Callout tone="danger">{createError}</Callout>}

            <Field label="Group Name">
              <AppInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Goa Trip, Flat mates…"
                autoCapitalize="words"
              />
            </Field>

            <Field label="Member Emails" hint="Comma-separated. You're added automatically.">
              <AppInput
                value={memberEmails}
                onChangeText={setMemberEmails}
                placeholder="alice@email.com, bob@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>

            <Field label="Currency">
              <AppInput
                value={currency}
                onChangeText={setCurrency}
                placeholder="INR"
                autoCapitalize="characters"
              />
            </Field>

            <AppButton
              variant="primary"
              size="lg"
              onPress={handleCreate}
              loading={creating}
              haptic
              style={{ marginTop: 8 }}
            >
              Create Group
            </AppButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    </AppShell>
  );
}
