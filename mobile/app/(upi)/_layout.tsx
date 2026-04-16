import { Stack } from 'expo-router';

export default function UpiLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="send" />
      <Stack.Screen name="accounts/add" />
    </Stack>
  );
}
