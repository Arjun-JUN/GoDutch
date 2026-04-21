/**
 * Tests for the Activity feed tab.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { formatDateSection } from '../(tabs)/activity';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

const mockGroupsState: any = { groups: [], loading: false, fetch: jest.fn() };
const mockExpensesState: any = { byGroupId: {}, loadingGroupId: {}, fetch: jest.fn() };
const mockSettlementsState: any = { byGroupId: {}, fetch: jest.fn() };

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
  useAuth: jest.fn(() => ({ user: { id: 'u1', name: 'Alice' } })),
}));

jest.mock('../../src/slate/AppShell', () => ({
  AppShell: ({ children }: any) => children,
  PageContent: ({ children }: any) => children,
}));
jest.mock('../../src/slate/PageHero', () => {
  const { Text } = require('react-native');
  return {
    PageHero: ({ title }: any) => <Text testID="page-hero-title">{title}</Text>,
  };
});
jest.mock('../../src/slate/Text', () => {
  const { Text: RNText } = require('react-native');
  return {
    Text: ({ children, testID }: any) => <RNText testID={testID}>{children}</RNText>,
  };
});
jest.mock('../../src/slate/AppSurface', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    AppSurface: ({ children, testID }: any) => <View testID={testID}>{children}</View>,
    InteractiveSurface: ({ children, onPress, testID }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID}>
        {children}
      </TouchableOpacity>
    ),
  };
});
jest.mock('../../src/slate/atoms', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    MemberBadge: ({ children, onPress, active }: any) => (
      <TouchableOpacity
        onPress={onPress}
        testID={`chip-${String(children).toLowerCase()}${active ? '-active' : ''}`}
      >
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
    EmptyState: ({ title, action }: any) => (
      <View testID="activity-empty">
        <Text>{title}</Text>
        {action ? (
          <TouchableOpacity testID="activity-empty-action" onPress={action.onPress}>
            <Text>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    IconBadge: () => null,
    Breath: () => null,
  };
});
jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import ActivityScreen from '../(tabs)/activity';

beforeEach(() => {
  jest.clearAllMocks();
  mockGroupsState.groups = [];
  mockGroupsState.loading = false;
  mockExpensesState.byGroupId = {};
  mockExpensesState.loadingGroupId = {};
  mockSettlementsState.byGroupId = {};
});

describe('ActivityScreen — empty state', () => {
  it('renders empty state when no expenses or settlements', () => {
    const { getByTestId } = render(<ActivityScreen />);
    expect(getByTestId('activity-empty')).toBeTruthy();
  });

  it('empty state action navigates to /new-expense', () => {
    const { getByTestId } = render(<ActivityScreen />);
    fireEvent.press(getByTestId('activity-empty-action'));
    expect(mockPush).toHaveBeenCalledWith('/new-expense');
  });
});

describe('ActivityScreen — filter chips', () => {
  it('renders all three filter chips', () => {
    const { getByTestId } = render(<ActivityScreen />);
    expect(getByTestId('chip-all-active')).toBeTruthy();
    expect(getByTestId('chip-expenses')).toBeTruthy();
    expect(getByTestId('chip-settlements')).toBeTruthy();
  });

  it('clicking Expenses activates it', () => {
    const { getByTestId } = render(<ActivityScreen />);
    fireEvent.press(getByTestId('chip-expenses'));
    expect(getByTestId('chip-expenses-active')).toBeTruthy();
  });

  it('clicking Settlements activates it', () => {
    const { getByTestId } = render(<ActivityScreen />);
    fireEvent.press(getByTestId('chip-settlements'));
    expect(getByTestId('chip-settlements-active')).toBeTruthy();
  });
});

describe('ActivityScreen — expense items', () => {
  beforeEach(() => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    mockExpensesState.byGroupId = {
      g1: [
        {
          id: 'exp-1',
          group_id: 'g1',
          description: 'Dinner',
          total_amount: 2400,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          created_by: 'u1',
        },
      ],
    };
  });

  it('renders an expense row', () => {
    const { getByTestId } = render(<ActivityScreen />);
    expect(getByTestId('activity-expense-exp-1')).toBeTruthy();
  });

  it('pressing expense row navigates to detail', () => {
    const { getByTestId } = render(<ActivityScreen />);
    fireEvent.press(getByTestId('activity-expense-exp-1'));
    expect(mockPush).toHaveBeenCalledWith('/expenses/exp-1');
  });

  it('filtering to settlements hides expense rows', () => {
    const { getByTestId, queryByTestId } = render(<ActivityScreen />);
    fireEvent.press(getByTestId('chip-settlements'));
    expect(queryByTestId('activity-expense-exp-1')).toBeNull();
  });

  it('filters out expenses with invalid dates', () => {
    mockExpensesState.byGroupId = {
      g1: [
        {
          id: 'exp-bad',
          group_id: 'g1',
          description: 'Bad',
          total_amount: 100,
          date: 'not-a-date',
          created_at: 'nope',
          created_by: 'u1',
        },
      ],
    };
    const { queryByTestId } = render(<ActivityScreen />);
    expect(queryByTestId('activity-expense-exp-bad')).toBeNull();
  });

  it('caps at 50 expenses', () => {
    const many = Array.from({ length: 100 }, (_, i) => ({
      id: `exp-${i}`,
      group_id: 'g1',
      description: `E${i}`,
      total_amount: 10,
      date: new Date(Date.now() - i * 1000).toISOString(),
      created_at: new Date(Date.now() - i * 1000).toISOString(),
      created_by: 'u1',
    }));
    mockExpensesState.byGroupId = { g1: many };
    const { queryByTestId } = render(<ActivityScreen />);
    expect(queryByTestId('activity-expense-exp-0')).toBeTruthy();
    expect(queryByTestId('activity-expense-exp-49')).toBeTruthy();
    expect(queryByTestId('activity-expense-exp-50')).toBeNull();
  });
});

describe('ActivityScreen — settlement items', () => {
  beforeEach(() => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 500, from_user_name: 'Bob', to_user_name: 'Alice' },
      ],
    };
  });

  it('renders a settlement row', () => {
    const { getByText } = render(<ActivityScreen />);
    expect(getByText('Bob owes you')).toBeTruthy();
  });

  it('filtering to expenses hides settlement rows', () => {
    const { getByTestId, queryByText } = render(<ActivityScreen />);
    fireEvent.press(getByTestId('chip-expenses'));
    expect(queryByText('Bob owes you')).toBeNull();
  });

  it('labels settlement as "You owe X" when current user is payer', () => {
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u1', to_user_id: 'u2', amount: 100, from_user_name: 'Alice', to_user_name: 'Bob' },
      ],
    };
    const { getByText } = render(<ActivityScreen />);
    expect(getByText('You owe Bob')).toBeTruthy();
  });

  it('labels third-party settlement neutrally', () => {
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u3', to_user_id: 'u2', amount: 100, from_user_name: 'Carla', to_user_name: 'Bob' },
      ],
    };
    const { getByText } = render(<ActivityScreen />);
    expect(getByText('Carla owes Bob')).toBeTruthy();
  });
});

describe('ActivityScreen — loading state', () => {
  it('renders loading spinner when no groups cached', () => {
    mockGroupsState.loading = true;
    const { getByTestId } = render(<ActivityScreen />);
    expect(getByTestId('activity-loading')).toBeTruthy();
  });

  it('does not render spinner when groups are cached', () => {
    mockGroupsState.loading = true;
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { queryByTestId } = render(<ActivityScreen />);
    expect(queryByTestId('activity-loading')).toBeNull();
  });
});

describe('formatDateSection', () => {
  it('returns Today for current date', () => {
    const today = new Date().toISOString();
    expect(formatDateSection(today)).toBe('Today');
  });

  it('returns Yesterday for -1 day', () => {
    const y = new Date(Date.now() - 86_400_000).toISOString();
    expect(formatDateSection(y)).toBe('Yesterday');
  });

  it('returns a locale date string for older dates', () => {
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const result = formatDateSection(old);
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Yesterday');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns Recently for invalid input', () => {
    expect(formatDateSection('not-a-date')).toBe('Recently');
    expect(formatDateSection('')).toBe('Recently');
  });
});
