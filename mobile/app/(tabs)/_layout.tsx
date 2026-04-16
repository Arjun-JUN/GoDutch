import { Tabs } from 'expo-router';
import { Home, Receipt, ArrowUpDown, User } from 'lucide-react-native';
import { colors } from '../../src/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedSubtle,
        tabBarStyle: {
          backgroundColor: colors.surfaceSolid,
          borderTopWidth: 0, // no-line rule
          height: 64,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#2a3434',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.04,
          shadowRadius: 16,
          elevation: 8,
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
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="settlements"
        options={{
          title: 'Settle',
          tabBarIcon: ({ color }) => <ArrowUpDown size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
