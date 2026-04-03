import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Must mock api BEFORE importing AuthContext
vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

import React from 'react';
import { AuthProvider, useAuth, AuthContext } from '../contexts/AuthContext';
import { api } from '../lib/api';

// Helper: a component that consumes AuthContext for testing
function TestConsumer() {
  const { user, isAuthenticated, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it('provides unauthenticated state when no saved user', async () => {
    localStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('restores user from localStorage on mount', async () => {
    const savedUser = { id: 'u1', name: 'Alice', email: 'alice@test.com' };
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(savedUser);
      if (key === 'token') return 'saved-token';
      return null;
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Alice');
  });

  it('login calls api and updates state', async () => {
    localStorage.getItem.mockReturnValue(null);
    const fakeUser = { id: 'u1', name: 'Alice' };
    api.post.mockResolvedValueOnce({ token: 'new-token', user: fakeUser });

    let loginFn;
    function Capture() {
      const { login } = useAuth();
      loginFn = login;
      return null;
    }

    render(
      <AuthProvider>
        <TestConsumer />
        <Capture />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      await loginFn('alice@test.com', 'password');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'alice@test.com', password: 'password' });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('throws if useAuth is used outside AuthProvider', () => {
    // Suppress React's error boundary output in the console
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
