import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../slate/components/Header';
import { AuthContext } from '../contexts/AuthContext';

// Mocking useReducedMotion from framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header Component', () => {
  const mockLogout = vi.fn();
  const authValue = { logout: mockLogout };

  const renderHeader = (initialEntry = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthContext.Provider value={authValue}>
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderHeader();
    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByText('GoDutch')).toBeDefined();
  });

  it('navigates to dashboard when logo is clicked', () => {
    renderHeader();
    const logo = screen.getByTestId('app-title');
    fireEvent.click(logo);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('highlights the active navigation item', () => {
    renderHeader('/upi');
    // In desktop nav
    const upiButton = screen.getByTestId('nav-upi');
    expect(upiButton.className).toContain('text-[var(--app-primary-strong)]');
    
    // In mobile nav
    const mobileUpi = screen.getByTestId('mobile-nav-upi');
    expect(mobileUpi.className).toContain('text-[var(--app-primary-strong)]');
  });

  it('calls logout when logout button is clicked', () => {
    renderHeader();
    const logoutBtn = screen.getByTestId('nav-logout');
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('navigates to different pages on nav item click', () => {
    renderHeader();
    const splitBtn = screen.getByTestId('nav-new-expense');
    fireEvent.click(splitBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/new-expense');
  });

  it('renders mobile navigation', () => {
    renderHeader();
    expect(screen.getByTestId('mobile-nav')).toBeDefined();
    expect(screen.getByTestId('mobile-nav-dashboard')).toBeDefined();
    expect(screen.getByTestId('mobile-nav-new-expense')).toBeDefined();
  });
});
