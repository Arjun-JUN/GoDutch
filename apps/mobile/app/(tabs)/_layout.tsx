import { Tabs } from 'expo-router';
import { useTheme, Icon } from '@godutch/slate';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.bgSurface,
          borderTopColor: theme.colors.borderDefault,
        },
      }}
    >
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balance',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'wallet' : 'wallet'} rawColor={color} size="md" />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'people' : 'people'} rawColor={color} size="md" />
          ),
        }}
      />
    </Tabs>
  );
}
