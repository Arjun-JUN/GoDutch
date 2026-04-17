import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MainRoutes } from '../MainRoutes';
import { AuthContext } from '../contexts/AuthContext';

// Mocking components to simplify integration tests
vi.mock('../pages/Dashboard', () => ({ default: () => <div data-testid="dashboard-page">Dashboard Content</div> }));
vi.mock('../pages/NewExpenseRedesign', () => ({ default: () => <div data-testid="new-expense-page">New Expense Content</div> }));
vi.mock('../pages/GroupsPage', () => ({ default: () => <div data-testid="groups-page">Groups Content</div> }));
vi.mock('../pages/SettlementsPageRedesign', () => ({ default: () => <div data-testid="settlements-page">Settlements Content</div> }));
vi.mock('../pages/UPIHome', () => ({ default: () => <div data-testid="upi-page">UPI Home Content</div> }));
vi.mock('../pages/AuthPageRedesign', () => ({ default: () => <div data-testid="auth-page">Auth Page Content</div> }));

// Mock Header to test navigation triggers
vi.mock('../slate/components/Header', () => ({
  default: function MockHeader() {
    const { useNavigate } = require('react-router-dom');
    const navigate = useNavigate();
    return (
      <nav data-testid="mock-header">
        <button onClick={() => navigate('/dashboard')}>Home</button>
        <button onClick={() => navigate('/new-expense')}>Split</button>
        <button onClick={() => navigate('/upi')}>UPI</button>
      </nav>
    );
  }
}));

describe('Navigation Integration', () => {
  const authValue = {
    isAuthenticated: true,
    loading: false,
    user: { id: 'u1', name: 'Alice' },
  };

  const renderRoutes = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthContext.Provider value={authValue}>
          <MainRoutes />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('redirects to dashboard from root when authenticated', async () => {
    renderRoutes('/');
    expect(screen.getByTestId('dashboard-page')).toBeDefined();
  });

  it('navigates to New Expense page when route changes', async () => {
    renderRoutes('/new-expense');
    expect(screen.getByTestId('new-expense-page')).toBeDefined();
  });

  it('navigates to UPI page when route changes', async () => {
    renderRoutes('/upi');
    expect(screen.getByTestId('upi-page')).toBeDefined();
  });

  it('redirects to auth if not authenticated', async () => {
    const unauthValue = { isAuthenticated: false, loading: false };
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={unauthValue}>
          <MainRoutes />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('auth-page')).toBeDefined();
  });
});
