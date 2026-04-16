import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  LogOut,
  User,
  Mail,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  Wallet,
  Users,
} from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { PageHero } from '../../src/slate/PageHero';
import { Avatar, Breath } from '../../src/slate/atoms';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { AppButton } from '../../src/slate/AppButton';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/tokens';

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function MenuRow({ icon, label, sublabel, onPress, destructive }: MenuRowProps) {
  return (
    <InteractiveSurface compact onPress={onPress} style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
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
            <Text variant="label" tone="subtle" style={{ marginTop: 2 }}>
              {sublabel}
            </Text>
          ) : null}
        </View>
        <ChevronRight size={16} color={colors.mutedSubtle} strokeWidth={2} />
      </View>
    </InteractiveSurface>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  return (
    <AppShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          <PageHero eyebrow="Account" title="Profile" compact />

          {/* Identity card */}
          <AppSurface variant="solid" style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Avatar name={user?.name ?? 'U'} size="lg" tone="primary" />
              <View style={{ flex: 1 }}>
                <Text variant="titleLg" weight="extrabold" numberOfLines={1}>
                  {user?.name}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <Mail size={13} color={colors.mutedSubtle} strokeWidth={2} />
                  <Text variant="label" tone="subtle" numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>
          </AppSurface>

          {/* Account section */}
          <Text
            variant="eyebrow"
            tone="muted"
            style={{ marginBottom: 12 }}
          >
            ACCOUNT
          </Text>
          <MenuRow
            icon={<User size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Edit Profile"
            sublabel="Change name or email"
            onPress={() => {}}
          />
          <MenuRow
            icon={<Shield size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Security"
            sublabel="Password & biometrics"
            onPress={() => {}}
          />
          <MenuRow
            icon={<Bell size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Notifications"
            sublabel="Push & email preferences"
            onPress={() => {}}
          />

          <Breath size="sm" />

          {/* Activity section */}
          <Text
            variant="eyebrow"
            tone="muted"
            style={{ marginBottom: 12 }}
          >
            ACTIVITY
          </Text>
          <MenuRow
            icon={<Users size={18} color={colors.primary} strokeWidth={2.2} />}
            label="My Groups"
            onPress={() => router.push('/groups')}
          />
          <MenuRow
            icon={<Wallet size={18} color={colors.primary} strokeWidth={2.2} />}
            label="UPI Accounts"
            sublabel="Linked bank accounts & UPI IDs"
            onPress={() => router.push('/(upi)')}
          />

          <Breath size="sm" />

          {/* Support */}
          <Text
            variant="eyebrow"
            tone="muted"
            style={{ marginBottom: 12 }}
          >
            SUPPORT
          </Text>
          <MenuRow
            icon={<HelpCircle size={18} color={colors.primary} strokeWidth={2.2} />}
            label="Help & FAQ"
            onPress={() => {}}
          />

          <Breath />

          {/* Sign out */}
          <AppButton
            variant="danger"
            size="md"
            leftIcon={<LogOut size={18} color={colors.danger} strokeWidth={2.2} />}
            onPress={handleLogout}
            haptic
          >
            Sign Out
          </AppButton>

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
