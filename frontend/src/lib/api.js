/**
 * Standardized API client using native fetch.
 * Replaces Axios for better security and native robustness.
 */

const API_BASE = (
  process.env?.REACT_APP_BACKEND_URL || 
  'http://localhost:8000'
) + '/api';

const getAuthToken = () => localStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
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

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.detail || data.message || 'API Request Failed');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', { endpoint, method, error });
    throw error;
  }
};

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};
