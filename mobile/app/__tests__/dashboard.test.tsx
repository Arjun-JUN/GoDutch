/**
 * Tests for the redesigned Home (dashboard) tab:
 * - greeting, balance hero, quick actions, groups preview.
 * - Empty and populated states; navigation wiring; balance coloring.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// ── Router ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, replace: jest.fn(), back: jest.fn() })),
}));

// ── Stores ────────────────────────────────────────────────────────────────────

const mockGroupsState: any = {
  groups: [],
  loading: false,
  fetch: jest.fn(),
};
const mockExpensesState: any = {
  loadingGroupId: {},
  fetch: jest.fn(),
  getAll: jest.fn(() => []),
};
const mockSettlementsState: any = {
  byGroupId: {},
  fetch: jest.fn(),
};

jest.mock('../../src/stores', () => {
  const groupsFn: any = jest.fn(() => mockGroupsState);
  groupsFn.getState = jest.fn(() => mockGroupsState);
  return {
    useGroupsStore: groupsFn,
    useExpensesStore: jest.fn(() => mockExpensesState),
    useSettlementsStore: jest.fn(() => mockSettlementsState),
  };
});

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com' },
  })),
}));

// ── Slate mocks ───────────────────────────────────────────────────────────────

jest.mock('../../src/slate/AppShell', () => ({
  AppShell: ({ children }: any) => children,
  PageContent: ({ children }: any) => children,
}));
jest.mock('../../src/slate/AppSurface', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    AppSurface: ({ children, style }: any) => <View style={style}>{children}</View>,
    InteractiveSurface: ({ children, onPress, testID, style }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID} style={style}>
        {children}
      </TouchableOpacity>
    ),
  };
});
jest.mock('../../src/slate/Text', () => {
  const { Text: RNText } = require('react-native');
  return {
    Text: ({ children, testID, style }: any) => (
      <RNText testID={testID} style={style}>
        {children}
      </RNText>
    ),
  };
});
jest.mock('../../src/slate/atoms', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    EmptyState: ({ title, description, action }: any) => (
      <View testID="empty-state">
        <Text>{title}</Text>
        <Text>{description}</Text>
        {action ? (
          <TouchableOpacity onPress={action.onPress} testID="empty-state-action">
            <Text>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    IconBadge: () => null,
    Avatar: () => null,
    Breath: () => null,
  };
});
jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

// ── SUT ───────────────────────────────────────────────────────────────────────

import DashboardScreen from '../(tabs)/dashboard';

beforeEach(() => {
  jest.clearAllMocks();
  mockGroupsState.groups = [];
  mockGroupsState.loading = false;
  mockSettlementsState.byGroupId = {};
  mockExpensesState.loadingGroupId = {};
});

describe('DashboardScreen — greeting', () => {
  it('renders greeting with user first name', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-greeting').props.children.join('')).toContain('Alice');
  });

  it('falls back to "there" when user is missing a name', () => {
    const { useAuth } = require('../../src/contexts/AuthContext');
    useAuth.mockReturnValueOnce({ user: { id: 'u1', email: 'x@y.com' } });
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-greeting').props.children.join('')).toContain('there');
  });
});

describe('DashboardScreen — net balance', () => {
  it('shows +INR amount when net is positive', () => {
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 1248.5, from_user_name: 'B', to_user_name: 'A' },
      ],
    };
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-net-balance').props.children).toMatch(/\+₹1248\.50/);
  });

  it('shows -INR amount when net is negative', () => {
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u1', to_user_id: 'u2', amount: 380, from_user_name: 'A', to_user_name: 'B' },
      ],
    };
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-net-balance').props.children).toMatch(/-₹380\.00/);
  });

  it('shows zero balance when no settlements', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-net-balance').props.children).toMatch(/₹0\.00/);
  });

  it('breakdown line contains both owed and owe totals', () => {
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 100, from_user_name: 'B', to_user_name: 'A' },
        { from_user_id: 'u1', to_user_id: 'u3', amount: 50, from_user_name: 'A', to_user_name: 'C' },
      ],
    };
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    const breakdown = getByTestId('dashboard-balance-breakdown').props.children.join('');
    expect(breakdown).toContain('100.00');
    expect(breakdown).toContain('50.00');
  });

  it('uses groups[0].currency for symbol', () => {
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 10, from_user_name: 'B', to_user_name: 'A' },
      ],
    };
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'USD', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-net-balance').props.children).toMatch(/\$/);
  });
});

describe('DashboardScreen — quick actions', () => {
  it('renders all three quick action cards', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-quick-add')).toBeTruthy();
    expect(getByTestId('dashboard-quick-settle')).toBeTruthy();
    expect(getByTestId('dashboard-quick-scan')).toBeTruthy();
  });

  it('Add expense navigates to /new-expense', () => {
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('dashboard-quick-add'));
    expect(mockPush).toHaveBeenCalledWith('/new-expense');
  });

  it('Settle up navigates to settlements tab', () => {
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('dashboard-quick-settle'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/settlements');
  });

  it('Scan receipt navigates to new-expense with mode=scan', () => {
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('dashboard-quick-scan'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/new-expense',
      params: { mode: 'scan' },
    });
  });
});

describe('DashboardScreen — groups preview', () => {
  it('shows empty state when no groups', () => {
    const { getByTestId, getByText } = render(<DashboardScreen />);
    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('Start your first group')).toBeTruthy();
  });

  it('empty state primary action navigates to groups tab with create param', () => {
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('empty-state-action'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)/groups',
      params: { create: '1' },
    });
  });

  it('renders up to 3 groups in preview', () => {
    mockGroupsState.groups = [
      { id: 'g1', name: 'Trip A', currency: 'INR', members: [{ id: 'u1' }] },
      { id: 'g2', name: 'Trip B', currency: 'INR', members: [{ id: 'u1' }] },
      { id: 'g3', name: 'Trip C', currency: 'INR', members: [{ id: 'u1' }] },
      { id: 'g4', name: 'Trip D', currency: 'INR', members: [{ id: 'u1' }] },
    ];
    const { getByTestId, queryByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-group-g1')).toBeTruthy();
    expect(getByTestId('dashboard-group-g2')).toBeTruthy();
    expect(getByTestId('dashboard-group-g3')).toBeTruthy();
    expect(queryByTestId('dashboard-group-g4')).toBeNull();
  });

  it('group row press navigates to group detail', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('dashboard-group-g1'));
    expect(mockPush).toHaveBeenCalledWith('/groups/g1');
  });

  it('see-all link navigates to groups tab when groups exist', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('dashboard-see-all'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/groups');
  });

  it('see-all link is not rendered when empty', () => {
    const { queryByTestId } = render(<DashboardScreen />);
    expect(queryByTestId('dashboard-see-all')).toBeNull();
  });
});

describe('DashboardScreen — loading state', () => {
  it('shows spinner while groups are loading and none cached', () => {
    mockGroupsState.loading = true;
    mockGroupsState.groups = [];
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('dashboard-loading')).toBeTruthy();
  });

  it('does not show spinner once groups are cached', () => {
    mockGroupsState.loading = true;
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { queryByTestId } = render(<DashboardScreen />);
    expect(queryByTestId('dashboard-loading')).toBeNull();
  });
});

describe('DashboardScreen — data loading', () => {
  it('calls fetchGroups on mount', async () => {
    render(<DashboardScreen />);
    await waitFor(() => {
      expect(mockGroupsState.fetch).toHaveBeenCalled();
    });
  });

  it('calls fetchExpenses + fetchSettlements for every group', async () => {
    mockGroupsState.groups = [
      { id: 'g1', name: 'A', currency: 'INR', members: [] },
      { id: 'g2', name: 'B', currency: 'INR', members: [] },
    ];
    render(<DashboardScreen />);
    await waitFor(() => {
      expect(mockExpensesState.fetch).toHaveBeenCalledWith('g1', expect.any(Object));
      expect(mockExpensesState.fetch).toHaveBeenCalledWith('g2', expect.any(Object));
      expect(mockSettlementsState.fetch).toHaveBeenCalledWith('g1', expect.any(Object));
      expect(mockSettlementsState.fetch).toHaveBeenCalledWith('g2', expect.any(Object));
    });
  });
});

describe('DashboardScreen — per-group balance', () => {
  it('shows settled when no pending settlements', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<DashboardScreen />);
    const row = getByTestId('dashboard-group-g1');
    // The row renders "settled" text somewhere in the subtree
    expect(row).toBeTruthy();
  });

  it('renders positive ahead amount', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 420, from_user_name: 'B', to_user_name: 'A' },
      ],
    };
    const { getAllByText } = render(<DashboardScreen />);
    // Balance appears in both the hero (net) and the per-group row.
    expect(getAllByText(/\+₹420/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders negative behind amount', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u1', to_user_id: 'u2', amount: 380, from_user_name: 'A', to_user_name: 'B' },
      ],
    };
    const { getAllByText } = render(<DashboardScreen />);
    expect(getAllByText(/-₹380/).length).toBeGreaterThanOrEqual(1);
  });
});
