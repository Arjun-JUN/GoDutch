import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Dashboard, {
  iconForExpense,
  formatActivityDate,
  formatAmount,
} from '../pages/Dashboard';
import {
  Coffee,
  FilmStrip,
  ForkKnife,
  Receipt,
  ShoppingCart,
} from '@/slate/icons';

// ──────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    message: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock framer-motion so AnimatePresence exits synchronously and motion.* tags
// render as plain DOM elements without unknown-prop warnings.
vi.mock('framer-motion', () => {
  const stripFramerProps = (props) => {
    const {
      initial, animate, exit, variants, transition,
      whileHover, whileTap, whileFocus, whileInView,
      layout, layoutId, drag, dragConstraints,
      onAnimationStart, onAnimationComplete,
      ...rest
    } = props;
    return rest;
  };
  const motion = new Proxy(
    {},
    {
      get: (_t, tag) => {
        const C = React.forwardRef(({ children, ...props }, ref) =>
          React.createElement(tag, { ref, ...stripFramerProps(props) }, children),
        );
        C.displayName = `motion.${String(tag)}`;
        return C;
      },
    },
  );
  return {
    motion,
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  };
});

const mockNavigate = vi.fn();
const mockLocation = { pathname: '/dashboard' };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// ──────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────
const me = { id: 'u-alice', name: 'Alice' };
const friend = { id: 'u-bob', name: 'Bob' };

const makeExpense = (overrides = {}) => ({
  id: `exp-${Math.random().toString(36).slice(2, 8)}`,
  merchant: 'Whole Foods Market',
  total_amount: 840,
  paid_by_id: me.id,
  date: '2026-04-10',
  created_at: '2026-04-10T10:00:00Z',
  category: 'shopping',
  split_details: [
    { user_id: me.id, amount: 420 },
    { user_id: friend.id, amount: 420 },
  ],
  ...overrides,
});

const defaultGroups = [{ id: 'grp-1', name: 'Flatmates' }];

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function mockApi({ groups = defaultGroups, expenses = [], settlements = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/groups') return Promise.resolve(groups);
    if (url.endsWith('/expenses')) return Promise.resolve(expenses);
    if (url.endsWith('/settlements')) return Promise.resolve(settlements);
    return Promise.resolve([]);
  });
}

async function renderDashboard() {
  const utils = render(<Dashboard />);
  // Wait for initial data load to settle
  await waitFor(() => expect(screen.queryByTestId('activity-loading')).not.toBeInTheDocument());
  return utils;
}

// ──────────────────────────────────────────────────────────────
// Setup
// ──────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockLocation.pathname = '/dashboard';
  useAuth.mockReturnValue({
    user: me,
    isAuthenticated: true,
    logout: vi.fn(),
  });
  mockApi();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ──────────────────────────────────────────────────────────────
// formatAmount (pure unit)
// ──────────────────────────────────────────────────────────────
describe('formatAmount', () => {
  it('formats positive integers with rupee sign', () => {
    expect(formatAmount(2340)).toBe('\u20B92,340');
  });
  it('formats negative numbers using absolute value', () => {
    expect(formatAmount(-1200)).toBe('\u20B91,200');
  });
  it('rounds to nearest rupee (no decimals)', () => {
    expect(formatAmount(840.49)).toBe('\u20B9840');
    expect(formatAmount(840.99)).toBe('\u20B9841');
  });
  it('handles zero', () => {
    expect(formatAmount(0)).toBe('\u20B90');
  });
  it('handles non-finite values by returning zero', () => {
    expect(formatAmount(NaN)).toBe('\u20B90');
    expect(formatAmount(Infinity)).toBe('\u20B90');
    expect(formatAmount('not a number')).toBe('\u20B90');
    expect(formatAmount(undefined)).toBe('\u20B90');
    expect(formatAmount(null)).toBe('\u20B90');
  });
  it('formats large Indian-grouped values', () => {
    expect(formatAmount(1000000)).toBe('\u20B910,00,000');
  });
});

// ──────────────────────────────────────────────────────────────
// formatActivityDate
// ──────────────────────────────────────────────────────────────
describe('formatActivityDate', () => {
  it('formats ISO date to contain the month abbreviation and full year', () => {
    const out = formatActivityDate('2023-10-24T00:00:00Z');
    expect(out).toMatch(/Oct/);
    expect(out).toMatch(/2023/);
    expect(out).toMatch(/2[34]/);
  });
  it('returns empty string for null/undefined/empty', () => {
    expect(formatActivityDate(null)).toBe('');
    expect(formatActivityDate(undefined)).toBe('');
    expect(formatActivityDate('')).toBe('');
  });
  it('returns original string for unparseable input', () => {
    expect(formatActivityDate('not a date')).toBe('not a date');
  });
  it('handles Date objects', () => {
    const out = formatActivityDate(new Date('2024-01-05T00:00:00Z'));
    expect(out).toMatch(/Jan/);
    expect(out).toMatch(/2024/);
    expect(out).toMatch(/[45]/);
  });
});

// ──────────────────────────────────────────────────────────────
// iconForExpense
// ──────────────────────────────────────────────────────────────
describe('iconForExpense', () => {
  it('returns Coffee for coffee-ish merchants', () => {
    expect(iconForExpense({ merchant: 'Blue Tokai Coffee' })).toBe(Coffee);
    expect(iconForExpense({ category: 'cafe' })).toBe(Coffee);
  });
  it('returns FilmStrip for movies/cinemas', () => {
    expect(iconForExpense({ merchant: 'PVR Cinema' })).toBe(FilmStrip);
    expect(iconForExpense({ category: 'movie' })).toBe(FilmStrip);
  });
  it('returns ForkKnife for restaurants', () => {
    expect(iconForExpense({ merchant: 'Pizzeria Da Loro' })).toBe(ForkKnife);
    expect(iconForExpense({ category: 'restaurant' })).toBe(ForkKnife);
  });
  it('returns ShoppingCart for groceries / markets', () => {
    expect(iconForExpense({ merchant: 'Whole Foods Market' })).toBe(ShoppingCart);
    expect(iconForExpense({ category: 'grocery' })).toBe(ShoppingCart);
  });
  it('returns Receipt as the default fallback', () => {
    expect(iconForExpense({ merchant: 'Mystery Merchant' })).toBe(Receipt);
    expect(iconForExpense({})).toBe(Receipt);
    expect(iconForExpense(null)).toBe(Receipt);
    expect(iconForExpense(undefined)).toBe(Receipt);
  });
  it('is case insensitive and strips whitespace implicitly', () => {
    expect(iconForExpense({ merchant: 'STARBUCKS' })).toBe(Coffee);
    expect(iconForExpense({ category: 'Shopping' })).toBe(ShoppingCart);
  });
});

// ──────────────────────────────────────────────────────────────
// Initial render / loading
// ──────────────────────────────────────────────────────────────
describe('Dashboard — layout', () => {
  it('renders the top bar with GoDutch title and menu button', async () => {
    await renderDashboard();
    expect(screen.getByText('GoDutch')).toBeInTheDocument();
    expect(screen.getByTestId('menu-btn')).toBeInTheDocument();
  });

  it('renders the avatar with the user initial', async () => {
    await renderDashboard();
    const initial = screen.getByTestId('avatar-initial');
    expect(initial).toHaveTextContent('A');
  });

  it('falls back to a generic user icon when the user has no name', async () => {
    useAuth.mockReturnValue({ user: { id: 'u-x' }, logout: vi.fn() });
    await renderDashboard();
    expect(screen.queryByTestId('avatar-initial')).not.toBeInTheDocument();
    expect(screen.getByTestId('avatar-btn')).toBeInTheDocument();
  });

  it('shows the Current Balance eyebrow', async () => {
    await renderDashboard();
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
  });

  it('renders the bottom navigation with 5 items', async () => {
    await renderDashboard();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    ['home', 'groups', 'settle', 'reports', 'profile'].forEach((key) => {
      expect(screen.getByTestId(`bottom-nav-${key}`)).toBeInTheDocument();
    });
  });

  it('marks the Home tab as the active page', async () => {
    await renderDashboard();
    expect(screen.getByTestId('bottom-nav-home')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('bottom-nav-groups')).not.toHaveAttribute('aria-current');
  });

  it('shows a loading placeholder while data is fetching', async () => {
    // Return a never-resolving promise to keep loading state
    let resolveGroups;
    api.get.mockImplementation(
      () => new Promise((resolve) => {
        resolveGroups = resolve;
      }),
    );
    render(<Dashboard />);
    expect(screen.getByTestId('activity-loading')).toBeInTheDocument();
    // cleanup
    resolveGroups?.([]);
  });
});

// ──────────────────────────────────────────────────────────────
// Balance hero
// ──────────────────────────────────────────────────────────────
describe('Dashboard — balance hero', () => {
  it('shows "You\'re owed" and amount when net > 0', async () => {
    mockApi({
      settlements: [{ from_user_id: friend.id, to_user_id: me.id, amount: 2340 }],
    });
    await renderDashboard();
    const heading = screen.getByTestId('balance-amount');
    expect(heading).toHaveTextContent(/You're owed/);
    expect(heading).toHaveTextContent(/\u20B92,340/);
    expect(heading.className).toContain('app-primary-strong');
  });

  it('shows "You owe" and amount when net < 0', async () => {
    mockApi({
      settlements: [{ from_user_id: me.id, to_user_id: friend.id, amount: 500 }],
    });
    await renderDashboard();
    const heading = screen.getByTestId('balance-amount');
    expect(heading).toHaveTextContent(/You owe/);
    expect(heading).toHaveTextContent(/\u20B9500/);
    expect(heading.className).toContain('app-danger');
  });

  it('shows "All settled" when net is zero', async () => {
    mockApi({
      settlements: [
        { from_user_id: friend.id, to_user_id: me.id, amount: 100 },
        { from_user_id: me.id, to_user_id: friend.id, amount: 100 },
      ],
    });
    await renderDashboard();
    expect(screen.getByTestId('balance-amount')).toHaveTextContent(/All settled/);
  });

  it('shows "All settled" when there are no groups at all', async () => {
    mockApi({ groups: [] });
    await renderDashboard();
    expect(screen.getByTestId('balance-amount')).toHaveTextContent(/All settled/);
  });

  it('renders the primary Add Expense button', async () => {
    await renderDashboard();
    const btn = screen.getByTestId('add-expense-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent(/Add Expense/);
  });

  it('navigates to /new-expense when Add Expense is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('add-expense-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/new-expense');
  });
});

// ──────────────────────────────────────────────────────────────
// Recent Activity
// ──────────────────────────────────────────────────────────────
describe('Dashboard — recent activity', () => {
  it('renders an empty state when there are no expenses', async () => {
    mockApi({ expenses: [] });
    await renderDashboard();
    expect(screen.getByTestId('activity-empty')).toBeInTheDocument();
    expect(screen.getByText(/No expenses yet/)).toBeInTheDocument();
  });

  it('renders up to 4 recent activity rows', async () => {
    const expenses = Array.from({ length: 8 }, (_, i) =>
      makeExpense({ id: `exp-${i}`, merchant: `Merchant ${i}`, created_at: `2026-04-${10 + i}T00:00:00Z` }),
    );
    mockApi({ expenses });
    await renderDashboard();
    const list = screen.getByTestId('activity-list');
    // 4 children = 4 expense rows
    expect(within(list).getAllByRole('button')).toHaveLength(4);
  });

  it('sorts activities by most recent first', async () => {
    const older = makeExpense({ id: 'exp-old', merchant: 'Older', created_at: '2026-01-01T00:00:00Z' });
    const newer = makeExpense({ id: 'exp-new', merchant: 'Newer', created_at: '2026-04-01T00:00:00Z' });
    mockApi({ expenses: [older, newer] });
    await renderDashboard();
    const merchants = screen.getAllByTestId(/activity-merchant-/);
    expect(merchants[0]).toHaveTextContent('Newer');
    expect(merchants[1]).toHaveTextContent('Older');
  });

  it('labels "You Paid" with primary color when user paid', async () => {
    mockApi({ expenses: [makeExpense({ id: 'e1', paid_by_id: me.id, total_amount: 1200 })] });
    await renderDashboard();
    const row = screen.getByTestId('activity-row-e1');
    expect(row).toHaveTextContent(/You Paid/i);
    const amt = screen.getByTestId('activity-amount-e1');
    expect(amt.className).toContain('app-primary');
    expect(amt).toHaveTextContent(/\u20B91,200/);
  });

  it('labels "Your Share" with muted color when someone else paid', async () => {
    mockApi({
      expenses: [
        makeExpense({
          id: 'e2',
          paid_by_id: friend.id,
          total_amount: 320,
          split_details: [
            { user_id: me.id, amount: 160 },
            { user_id: friend.id, amount: 160 },
          ],
        }),
      ],
    });
    await renderDashboard();
    const row = screen.getByTestId('activity-row-e2');
    expect(row).toHaveTextContent(/Your Share/i);
    const amt = screen.getByTestId('activity-amount-e2');
    expect(amt.className).toContain('app-muted');
    expect(amt).toHaveTextContent(/\u20B9160/);
  });

  it('falls back to total_amount when split_details are missing', async () => {
    mockApi({
      expenses: [
        makeExpense({ id: 'e3', paid_by_id: friend.id, total_amount: 900, split_details: null }),
      ],
    });
    await renderDashboard();
    const amt = screen.getByTestId('activity-amount-e3');
    expect(amt).toHaveTextContent(/\u20B9900/);
  });

  it('handles expenses with no merchant gracefully', async () => {
    mockApi({ expenses: [makeExpense({ id: 'e4', merchant: '' })] });
    await renderDashboard();
    expect(screen.getByTestId('activity-merchant-e4')).toHaveTextContent(/Untitled expense/);
  });

  it('opens expense detail with navigation state when a row is clicked', async () => {
    mockApi({ expenses: [makeExpense({ id: 'e5' })] });
    await renderDashboard();
    fireEvent.click(screen.getByTestId('activity-row-e5'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/expenses/e5',
      expect.objectContaining({ state: expect.objectContaining({ from: '/dashboard', fromLabel: 'Home' }) }),
    );
  });

  it('navigates to /groups when "View all" is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('view-all-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });
});

// ──────────────────────────────────────────────────────────────
// Settlements banner
// ──────────────────────────────────────────────────────────────
describe('Dashboard — settlements banner', () => {
  it('reads "All settlements cleared" when none are pending', async () => {
    await renderDashboard();
    expect(screen.getByTestId('settlements-banner-label')).toHaveTextContent(/All settlements cleared/);
  });

  it('shows singular "1 settlement waiting" when exactly one', async () => {
    mockApi({ settlements: [{ from_user_id: friend.id, to_user_id: me.id, amount: 100 }] });
    await renderDashboard();
    expect(screen.getByTestId('settlements-banner-label')).toHaveTextContent(/^1 settlement waiting$/);
  });

  it('shows plural "N settlements waiting" when multiple', async () => {
    mockApi({
      settlements: [
        { from_user_id: friend.id, to_user_id: me.id, amount: 100 },
        { from_user_id: me.id, to_user_id: friend.id, amount: 50 },
        { from_user_id: friend.id, to_user_id: me.id, amount: 30 },
      ],
    });
    await renderDashboard();
    expect(screen.getByTestId('settlements-banner-label')).toHaveTextContent(/3 settlements waiting/);
  });

  it('navigates to /settlements when the banner is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('settlements-banner'));
    expect(mockNavigate).toHaveBeenCalledWith('/settlements');
  });
});

// ──────────────────────────────────────────────────────────────
// Bottom navigation
// ──────────────────────────────────────────────────────────────
describe('Dashboard — bottom nav', () => {
  it('navigates to /dashboard when Home is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('bottom-nav-home'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to /groups when Groups is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('bottom-nav-groups'));
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('navigates to /settlements when Settle is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('bottom-nav-settle'));
    expect(mockNavigate).toHaveBeenCalledWith('/settlements');
  });

  it('navigates to /reports/:groupId when Reports is clicked with existing groups', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('bottom-nav-reports'));
    expect(mockNavigate).toHaveBeenCalledWith('/reports/grp-1');
  });

  it('redirects to /groups and toasts when Reports is clicked without groups', async () => {
    mockApi({ groups: [] });
    await renderDashboard();
    fireEvent.click(screen.getByTestId('bottom-nav-reports'));
    expect(toast.message).toHaveBeenCalledWith(expect.stringMatching(/group first/i));
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('opens the account menu when Profile tab is clicked', async () => {
    await renderDashboard();
    expect(screen.queryByTestId('menu-popover')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('bottom-nav-profile'));
    expect(screen.getByTestId('menu-popover')).toBeInTheDocument();
  });

  it('highlights the Groups tab when pathname is /groups', async () => {
    mockLocation.pathname = '/groups';
    await renderDashboard();
    expect(screen.getByTestId('bottom-nav-groups')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('bottom-nav-home')).not.toHaveAttribute('aria-current');
  });
});

// ──────────────────────────────────────────────────────────────
// Account menu
// ──────────────────────────────────────────────────────────────
describe('Dashboard — account menu', () => {
  it('is closed by default', async () => {
    await renderDashboard();
    expect(screen.queryByTestId('menu-popover')).not.toBeInTheDocument();
    expect(screen.getByTestId('menu-btn')).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles open when the menu button is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    expect(screen.getByTestId('menu-popover')).toBeInTheDocument();
    expect(screen.getByTestId('menu-btn')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByTestId('menu-btn'));
    expect(screen.queryByTestId('menu-popover')).not.toBeInTheDocument();
  });

  it('toggles open when the avatar is clicked', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('avatar-btn'));
    expect(screen.getByTestId('menu-popover')).toBeInTheDocument();
  });

  it('shows the user name in the popover', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    const popover = screen.getByTestId('menu-popover');
    expect(within(popover).getByText('Alice')).toBeInTheDocument();
  });

  it('shows "You" when the user has no name', async () => {
    useAuth.mockReturnValue({ user: { id: 'u-x' }, logout: vi.fn() });
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    expect(within(screen.getByTestId('menu-popover')).getByText('You')).toBeInTheDocument();
  });

  it('invokes logout and closes when Logout is clicked', async () => {
    const logout = vi.fn();
    useAuth.mockReturnValue({ user: me, logout });
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('menu-popover')).not.toBeInTheDocument();
  });

  it('does not crash if logout is undefined', async () => {
    useAuth.mockReturnValue({ user: me });
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    expect(() => fireEvent.click(screen.getByTestId('logout-btn'))).not.toThrow();
  });

  it('closes on Escape', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    expect(screen.getByTestId('menu-popover')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('menu-popover')).not.toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByTestId('menu-btn'));
    expect(screen.getByTestId('menu-popover')).toBeInTheDocument();
    // click somewhere outside the menu
    fireEvent.mouseDown(screen.getByTestId('recent-activity'));
    expect(screen.queryByTestId('menu-popover')).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────
// Error handling
// ──────────────────────────────────────────────────────────────
describe('Dashboard — errors', () => {
  it('surfaces a toast when the groups request fails', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'));
    render(<Dashboard />);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to load data'));
  });

  it('does not crash when the groups API returns a non-array', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/groups') return Promise.resolve(null);
      return Promise.resolve([]);
    });
    await renderDashboard();
    expect(screen.getByTestId('activity-empty')).toBeInTheDocument();
    expect(screen.getByTestId('balance-amount')).toHaveTextContent(/All settled/);
  });

  it('defends against non-array expenses / settlements', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/groups') return Promise.resolve(defaultGroups);
      if (url.endsWith('/expenses')) return Promise.resolve(null);
      if (url.endsWith('/settlements')) return Promise.resolve(undefined);
      return Promise.resolve([]);
    });
    await renderDashboard();
    expect(screen.getByTestId('activity-empty')).toBeInTheDocument();
  });

  it('coerces non-numeric settlement amounts to zero', async () => {
    mockApi({
      settlements: [
        { from_user_id: friend.id, to_user_id: me.id, amount: 'nope' },
        { from_user_id: friend.id, to_user_id: me.id, amount: 200 },
      ],
    });
    await renderDashboard();
    expect(screen.getByTestId('balance-amount')).toHaveTextContent(/\u20B9200/);
  });
});

// ──────────────────────────────────────────────────────────────
// Regression — ensure we only slice top 4 & load triggers API once per group
// ──────────────────────────────────────────────────────────────
describe('Dashboard — regression', () => {
  it('fetches expenses and settlements for every group exactly once', async () => {
    const twoGroups = [
      { id: 'grp-1', name: 'A' },
      { id: 'grp-2', name: 'B' },
    ];
    mockApi({ groups: twoGroups });
    await renderDashboard();
    expect(api.get).toHaveBeenCalledWith('/groups');
    expect(api.get).toHaveBeenCalledWith('/groups/grp-1/expenses');
    expect(api.get).toHaveBeenCalledWith('/groups/grp-1/settlements');
    expect(api.get).toHaveBeenCalledWith('/groups/grp-2/expenses');
    expect(api.get).toHaveBeenCalledWith('/groups/grp-2/settlements');
    // 1 groups + 2 * (expenses + settlements) = 5
    expect(api.get).toHaveBeenCalledTimes(5);
  });

  it('aggregates expenses across groups and still caps at 4', async () => {
    const groups = [
      { id: 'g1' },
      { id: 'g2' },
    ];
    const many = Array.from({ length: 5 }, (_, i) =>
      makeExpense({ id: `e${i}`, created_at: `2026-04-${10 + i}T00:00:00Z` }),
    );
    api.get.mockImplementation((url) => {
      if (url === '/groups') return Promise.resolve(groups);
      if (url === '/groups/g1/expenses') return Promise.resolve(many.slice(0, 3));
      if (url === '/groups/g2/expenses') return Promise.resolve(many.slice(3));
      return Promise.resolve([]);
    });
    await renderDashboard();
    const list = screen.getByTestId('activity-list');
    expect(within(list).getAllByRole('button')).toHaveLength(4);
  });
});
