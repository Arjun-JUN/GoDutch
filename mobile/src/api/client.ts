import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Standardized API client for React Native using fetch and SecureStore for tokens.
 */

let API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
console.log('🌐 API_BASE resolved to:', API_BASE);

// Automatic mapping for Android Emulator to host localhost
if (__DEV__ && API_BASE.includes('localhost')) {
  if (Platform.OS === 'android') {
    API_BASE = API_BASE.replace('localhost', '10.0.2.2');
  }
}

const getAuthToken = async () => await SecureStore.getItemAsync('token');

/**
 * Global 401 handler — registered by AuthProvider at mount.
 * When a request returns 401, the client clears the stored credentials and
 * notifies the auth layer so screens can route back to /auth.
 */
type UnauthorizedHandler = () => void | Promise<void>;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

/** Wipe the stored JWT token so subsequent requests won't retry as authenticated. */
const clearCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync('token');
  } catch {
    // best-effort cleanup — swallow errors so 401 handling never throws
  }
};

const request = async (endpoint: string, options: any = {}) => {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const defaultHeaders: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = await getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: any = {
    method,
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  };

  if (body && !options.headers?.['Content-Type']) {
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body; // Assume it's already properly formatted or FormData
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      await clearCredentials();
      if (unauthorizedHandler) {
        try {
          await unauthorizedHandler();
        } catch {
          // never let logout handler errors mask the 401
        }
      }
    }

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(data.detail || data.message || 'API Request Failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    // Distinguish network-level failures (no response) from HTTP errors
    if (error?.name === 'TypeError' && error?.message === 'Network request failed') {
      const networkError: any = new Error(
        `Network unreachable — check that the backend is running and that ${API_BASE} is reachable from this device.`
      );
      networkError.name = 'NetworkError';
      networkError.cause = error;
      console.error(`API Error [${method} ${endpoint}]:`, networkError.message);
      throw networkError;
    }
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint: string, options?: any) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint: string, body: any, options?: any) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint: string, body: any, options?: any) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint: string, body: any, options?: any) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint: string, options?: any) => request(endpoint, { method: 'DELETE', ...options }),
};
