import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  LogOut,
  Mail,
  ChevronRight,
  Bell,
  HelpCircle,
  Wallet,
  Globe,
  Palette,
  ShieldCheck,
  FileText,
  Info,
} from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { PageHero } from '../../src/slate/PageHero';
import { Avatar, Breath, MemberBadge, Callout } from '../../src/slate/atoms';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { AppButton } from '../../src/slate/AppButton';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/api/client';
import * as Haptics from 'expo-haptics';
import { colors, radii, spacing } from '../../src/theme/tokens';

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  testID?: string;
}

function MenuRow({ icon, label, sublabel, onPress, destructive, testID }: MenuRowProps) {
  const handlePress = () => {
    // Secondary actions still get a light haptic — feedback is a design principle.
    Haptics.selectionAsync();
    onPress?.();
  };
  return (
    <InteractiveSurface
      compact
      onPress={handlePress}
      style={{ marginBottom: spacing.sm }}
      testID={testID}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: destructive ? colors.dangerSoft : colors.soft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            variant="title"
            weight="semibold"
            style={{ color: destructive ? colors.danger : colors.foreground }}
          >
            {label}
          </Text>
          {sublabel ? (
            <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
              {sublabel}
            </Text>
          ) : null}
        </View>
        <ChevronRight size={16} color={colors.mutedSubtle} strokeWidth={2} />
      </View>
    </InteractiveSurface>
  );
}

export default function YouScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [hasUpi, setHasUpi] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const accs = await api.get('/upi/accounts');
        if (!cancelled) setHasUpi(Array.isArray(accs) && accs.length > 0);
      } catch {
        if (!cancelled) setHasUpi(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  return (
    <AppShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          <PageHero eyebrow="Account" title="You" compact />

          {/* Profile card */}
          <AppSurface variant="solid" style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={user?.name ?? 'U'} size="lg" tone="primary" />
              <View style={{ flex: 1 }}>
                <Text variant="titleLg" weight="extrabold" numberOfLines={1}>
                  {user?.name}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    marginTop: spacing.xs,
                  }}
                >
                  <Mail size={13} color={colors.mutedSubtle} strokeWidth={2} />
                  <Text variant="label" tone="subtle" numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>

            {hasUpi ? (
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <MemberBadge active>UPI linked</MemberBadge>
              </View>
            ) : null}
          </AppSurface>

          {/* Payment & linking */}
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
            PAYMENT & LINKING
          </Text>

          {hasUpi === false ? (
            <Callout tone="info" style={{ marginBottom: spacing.s12 }}>
              Link a UPI app to settle faster — one tap to send or request.
            </Callout>
          ) : null}

          <MenuRow
            icon={<Wallet size={18} color={colors.primary} strokeWidth={2.2} />}
            label="UPI Apps"
            sublabel="Linked bank accounts & UPI IDs"
            onPress={() => router.push('/(upi)')}
            testID="you-upi-row"
          />
          <MenuRow
            icon={<Globe size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Default Currency"
            sublabel="Used for new groups"
            onPress={() => {}}
          />

          <Breath size="sm" />

          {/* Preferences */}
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
            PREFERENCES
          </Text>
          <MenuRow
            icon={<Bell size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Notifications"
            sublabel="Push & email preferences"
            onPress={() => {}}
          />
          <MenuRow
            icon={<Palette size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Appearance"
            sublabel="Theme & display"
            onPress={() => {}}
          />
          <MenuRow
            icon={<ShieldCheck size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Privacy & data"
            onPress={() => {}}
          />

          <Breath size="sm" />

          {/* Help & legal */}
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
            HELP & LEGAL
          </Text>
          <MenuRow
            icon={<HelpCircle size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Help & FAQ"
            onPress={() => {}}
          />
          <MenuRow
            icon={<FileText size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Terms of service"
            onPress={() => {}}
          />
          <MenuRow
            icon={<FileText size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Privacy policy"
            onPress={() => {}}
          />
          <MenuRow
            icon={<Info size={18} color={colors.primary} strokeWidth={2.2} />}
            label="About"
            onPress={() => {}}
          />

          <Breath />

          <AppButton
            variant="danger"
            size="md"
            leftIcon={<LogOut size={18} color={colors.primaryForeground} strokeWidth={2.2} />}
            onPress={handleLogout}
            haptic
            testID="you-signout"
          >
            Sign Out
          </AppButton>

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
