import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/tokens';
import '../global.css';

// Keep the splash visible until fonts + auth bootstrap both finish.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop — safe to call more than once */
});

/**
 * Routes the user based on auth state. Sits inside AuthProvider so it can
 * observe `loading` and `isAuthenticated`, and inside Stack so it has access
 * to the router + segments.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const first = segments[0];
    // Routes that don't require auth. `undefined` = the root `index` route,
    // which itself handles redirecting onward.
    const onPublicRoute = first === 'auth' || first === undefined;

    if (!isAuthenticated && !onPublicRoute) {
      router.replace('/auth');
    } else if (isAuthenticated && first === 'auth') {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, loading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        /* noop */
      });
    }
  }, [fontsLoaded, fontError]);

  // Hold render until fonts are ready — prevents a flash of the system font.
  // If loading errored, continue anyway so the user isn't locked out.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.backgroundStart }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <AuthGate>
            <View style={{ flex: 1, backgroundColor: colors.backgroundStart }}>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen
                  name="new-expense"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="groups/index" />
                <Stack.Screen name="groups/[groupId]" />
                <Stack.Screen name="expenses/[expenseId]" />
                <Stack.Screen name="reports/[groupId]" />
                <Stack.Screen name="(upi)" />
              </Stack>
            </View>
          </AuthGate>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
