import * as SecureStore from '../utils/secureStore';
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
 * Extract a human-readable error message from a FastAPI response body.
 * FastAPI returns `detail` as a string for HTTPException and as an array of
 * `{loc, msg, type}` objects for validation errors — both must be flattened
 * to avoid the dreaded `[object Object]` in the UI.
 */
const extractErrorMessage = (data: any, status: number): string => {
  const detail = data?.detail;

  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const loc = Array.isArray(item.loc) ? item.loc.filter((s: any) => s !== 'body').join('.') : '';
          const msg = item.msg || item.message || '';
          return loc ? `${loc}: ${msg}` : msg;
        }
        return '';
      })
      .filter(Boolean);
    if (parts.length) return parts.join('; ');
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string') return detail.message;
    try {
      return JSON.stringify(detail);
    } catch {
      /* fall through */
    }
  }

  if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    return data.message;
  }

  return `API Request Failed (${status})`;
};

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

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
      const error: any = new Error(extractErrorMessage(data, response.status));
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
    const details = error?.data !== undefined ? ` data=${safeStringify(error.data)}` : '';
    console.error(
      `API Error [${method} ${endpoint}]: ${error?.message || error} (status=${error?.status ?? 'n/a'})${details}`
    );
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
