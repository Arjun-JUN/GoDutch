/**
 * Thin wrapper around expo-secure-store with a localStorage fallback on web.
 *
 * expo-secure-store is native-only (iOS Keychain / Android Keystore). On web,
 * calls throw because the native bridge isn't present. This wrapper exposes the
 * same three methods we actually use (getItemAsync / setItemAsync / deleteItemAsync)
 * and routes to `window.localStorage` when `Platform.OS === 'web'`.
 *
 * Web storage is intentionally less secure than the native keystore — use this
 * for dev and QA. Production web would need cookie-based auth or an equivalent.
 */

import { Platform } from 'react-native';
import * as NativeSecureStore from 'expo-secure-store';

const hasLocalStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return hasLocalStorage ? window.localStorage.getItem(key) : null;
  }
  return NativeSecureStore.getItemAsync(key);
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (hasLocalStorage) window.localStorage.setItem(key, value);
    return;
  }
  await NativeSecureStore.setItemAsync(key, value);
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (hasLocalStorage) window.localStorage.removeItem(key);
    return;
  }
  await NativeSecureStore.deleteItemAsync(key);
};
