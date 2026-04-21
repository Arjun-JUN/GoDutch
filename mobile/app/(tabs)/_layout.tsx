import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, Users, Plus, Activity, User } from 'lucide-react-native';
import { colors, shadows, spacing } from '../../src/theme/tokens';

function FabTabButton() {
  const router = useRouter();
  return (
    <View
      pointerEvents="box-none"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pressable
        accessibilityLabel="Add expense"
        accessibilityRole="button"
        testID="fab-add-button"
        onPress={() => router.push('/new-expense')}
        style={({ pressed }) => ({
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -spacing.lg,
          transform: [{ scale: pressed ? 0.94 : 1 }],
          ...shadows.button,
        })}
      >
        <Plus size={26} color={colors.primaryForeground} strokeWidth={2.8} />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedSubtle,
        tabBarStyle: {
          backgroundColor: colors.surfaceSolid,
          borderTopWidth: 0, // no-line rule
          height: 72,
          paddingBottom: spacing.s12,
          paddingTop: spacing.sm,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 18,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: () => <FabTabButton />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Activity size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2.2} />,
        }}
      />

      {/* Hidden from tab bar — still accessible via deep-link / quick action */}
      <Tabs.Screen name="expenses" options={{ href: null }} />
      <Tabs.Screen name="settlements" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
