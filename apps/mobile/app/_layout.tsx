import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { ThemeProvider, ToastProvider } from '@godutch/slate';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    // GestureHandlerRootView must wrap the entire app for @gorhom/bottom-sheet gestures to work on Android
    <GestureHandlerRootView style={styles.fill}>
      <ThemeProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
