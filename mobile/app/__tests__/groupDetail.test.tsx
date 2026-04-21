/**
 * Tests for the redesigned group detail screen — colored header block,
 * balance sentence, action buttons, empty/populated states.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn(() => true);

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ groupId: 'g1' })),
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
  })),
}));

const mockGroupsState: any = {
  getById: jest.fn(),
  fetch: jest.fn(),
};
const mockExpensesState: any = {
  getForGroup: jest.fn(() => []),
  fetch: jest.fn(),
  loadingGroupId: {},
};
const mockSettlementsState: any = {
  getForGroup: jest.fn(() => []),
  fetch: jest.fn(),
};

jest.mock('../../src/stores', () => ({
  useGroupsStore: jest.fn(() => mockGroupsState),
  useExpensesStore: jest.fn(() => mockExpensesState),
  useSettlementsStore: jest.fn(() => mockSettlementsState),
}));

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'u1', name: 'Alice' } })),
}));

jest.mock('../../src/slate/AppShell', () => ({
  AppShell: ({ children }: any) => children,
  PageContent: ({ children }: any) => children,
}));
jest.mock('../../src/slate/Header', () => {
  const { Text } = require('react-native');
  return {
    Header: ({ title }: any) => <Text>{title}</Text>,
  };
});
jest.mock('../../src/slate/AppButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    AppButton: ({ onPress, children, testID }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});
jest.mock('../../src/slate/AppSurface', () => {
  const { View } = require('react-native');
  return {
    AppSurface: ({ children }: any) => <View>{children}</View>,
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
    EmptyState: ({ title, action }: any) => (
      <View testID="empty-state">
        <Text>{title}</Text>
        {action ? (
          <TouchableOpacity onPress={action.onPress} testID="empty-action">
            <Text>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    Avatar: () => null,
    Breath: () => null,
  };
});
jest.mock('../../src/slate/ExpenseCard', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    ExpenseCard: ({ expense, onPress }: any) => (
      <TouchableOpacity onPress={onPress} testID={`expense-${expense.id}`}>
        <Text>{expense.description}</Text>
      </TouchableOpacity>
    ),
  };
});
jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import GroupDetailScreen from '../groups/[groupId]';

const makeGroup = (overrides: any = {}) => ({
  id: 'g1',
  name: 'Trip',
  currency: 'INR',
  members: [{ id: 'u1', name: 'Alice', email: 'a@x' }],
  created_by: 'u1',
  created_at: '2026-01-15T00:00:00Z',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGroupsState.getById.mockReturnValue(makeGroup());
  mockExpensesState.getForGroup.mockReturnValue([]);
  mockExpensesState.loadingGroupId = {};
  mockSettlementsState.getForGroup.mockReturnValue([]);
});

describe('GroupDetailScreen — header block', () => {
  it('renders the colored header block', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    expect(getByTestId('group-detail-header-block')).toBeTruthy();
  });

  it('shows group name in the header', () => {
    const { getByText } = render(<GroupDetailScreen />);
    expect(getByText('Trip')).toBeTruthy();
  });

  it('back button goes back when canGoBack', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('group-detail-back'));
    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('back button falls back to /(tabs)/groups when cannot go back', () => {
    mockCanGoBack.mockReturnValueOnce(false);
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('group-detail-back'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/groups');
  });
});

describe('GroupDetailScreen — balance sentence', () => {
  it('shows settled message when no settlements', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    expect(getByTestId('group-detail-balance-sentence').props.children).toMatch(
      /settled/
    );
  });

  it('shows "+ ahead" when user is owed', () => {
    mockSettlementsState.getForGroup.mockReturnValue([
      { from_user_id: 'u2', to_user_id: 'u1', amount: 420, from_user_name: 'B', to_user_name: 'A' },
    ]);
    const { getByTestId } = render(<GroupDetailScreen />);
    const text = getByTestId('group-detail-balance-sentence').props.children;
    expect(text).toMatch(/\+₹420/);
    expect(text).toMatch(/ahead/);
  });

  it('shows "- you owe" when user owes', () => {
    mockSettlementsState.getForGroup.mockReturnValue([
      { from_user_id: 'u1', to_user_id: 'u2', amount: 380, from_user_name: 'A', to_user_name: 'B' },
    ]);
    const { getByTestId } = render(<GroupDetailScreen />);
    const text = getByTestId('group-detail-balance-sentence').props.children;
    expect(text).toMatch(/-₹380/);
    expect(text).toMatch(/you owe/);
  });
});

describe('GroupDetailScreen — action row', () => {
  it('renders Settle, Reports, Add action buttons', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    expect(getByTestId('group-detail-action-settle')).toBeTruthy();
    expect(getByTestId('group-detail-action-reports')).toBeTruthy();
    expect(getByTestId('group-detail-action-add')).toBeTruthy();
  });

  it('Settle action navigates to settlements tab', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('group-detail-action-settle'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/settlements');
  });

  it('Reports action navigates to /reports/[id]', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('group-detail-action-reports'));
    expect(mockPush).toHaveBeenCalledWith('/reports/g1');
  });

  it('Add action navigates to /new-expense with groupId param', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('group-detail-action-add'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/new-expense',
      params: { groupId: 'g1' },
    });
  });
});

describe('GroupDetailScreen — body', () => {
  it('renders empty state when no expenses', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('empty-state action navigates to /new-expense', () => {
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('empty-action'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/new-expense',
      params: { groupId: 'g1' },
    });
  });

  it('renders expense rows when present', () => {
    mockExpensesState.getForGroup.mockReturnValue([
      {
        id: 'exp-1',
        group_id: 'g1',
        description: 'Dinner',
        total_amount: 100,
        created_by: 'u1',
      },
    ]);
    const { getByTestId } = render(<GroupDetailScreen />);
    expect(getByTestId('expense-exp-1')).toBeTruthy();
  });

  it('expense press navigates to detail', () => {
    mockExpensesState.getForGroup.mockReturnValue([
      { id: 'exp-1', group_id: 'g1', description: 'D', total_amount: 10, created_by: 'u1' },
    ]);
    const { getByTestId } = render(<GroupDetailScreen />);
    fireEvent.press(getByTestId('expense-exp-1'));
    expect(mockPush).toHaveBeenCalledWith('/expenses/exp-1');
  });
});

describe('GroupDetailScreen — not-found', () => {
  it('renders not-found state when group is missing and not loading', () => {
    mockGroupsState.getById.mockReturnValue(undefined);
    const { getAllByText } = render(<GroupDetailScreen />);
    // "Group not found" appears as Header title and inside EmptyState.
    expect(getAllByText('Group not found').length).toBeGreaterThanOrEqual(1);
  });
});
