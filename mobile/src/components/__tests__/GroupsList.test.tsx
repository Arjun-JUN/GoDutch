/**
 * Tests for the shared GroupsList component used by both the Groups tab and
 * the legacy /groups route.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock('../../api/client', () => ({
  api: { post: jest.fn() },
}));

const mockGroupsState: any = {
  groups: [],
  loading: false,
  fetch: jest.fn(),
  upsert: jest.fn(),
  invalidate: jest.fn(),
};
const mockSettlementsState: any = {
  byGroupId: {},
  fetch: jest.fn(),
};

jest.mock('../../stores', () => ({
  useGroupsStore: jest.fn(() => mockGroupsState),
  useSettlementsStore: jest.fn(() => mockSettlementsState),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'u1', name: 'Alice' } })),
}));

// Slate mocks
jest.mock('../../slate/AppShell', () => {
  const { View } = require('react-native');
  return {
    AppShell: ({ children }: any) => <View>{children}</View>,
    PageContent: ({ children }: any) => <View>{children}</View>,
  };
});
jest.mock('../../slate/Header', () => {
  const { View } = require('react-native');
  return {
    Header: ({ title, right }: any) => (
      <View testID="header">
        {right}
      </View>
    ),
  };
});
jest.mock('../../slate/PageHero', () => {
  const { Text } = require('react-native');
  return {
    PageHero: ({ title }: any) => <Text testID="page-hero-title">{title}</Text>,
  };
});
jest.mock('../../slate/AppButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    AppButton: ({ onPress, children, testID, loading }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID} disabled={loading}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});
jest.mock('../../slate/AppInput', () => {
  const { TextInput, View, Text } = require('react-native');
  return {
    AppInput: ({ value, onChangeText, placeholder, testID }: any) => (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
      />
    ),
    Field: ({ children, label }: any) => (
      <View>
        <Text>{label}</Text>
        {children}
      </View>
    ),
  };
});
jest.mock('../../slate/AppSurface', () => {
  const { TouchableOpacity, View } = require('react-native');
  return {
    AppSurface: ({ children }: any) => <View>{children}</View>,
    InteractiveSurface: ({ children, onPress, testID }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID}>
        {children}
      </TouchableOpacity>
    ),
  };
});
jest.mock('../../slate/atoms', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Avatar: () => null,
    Breath: () => null,
    Callout: ({ children, tone }: any) => <Text testID={`callout-${tone}`}>{children}</Text>,
    EmptyState: ({ title, action }: any) => (
      <View testID="empty-state">
        <Text>{title}</Text>
        {action ? (
          <TouchableOpacity testID="empty-action" onPress={action.onPress}>
            <Text>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
  };
});
jest.mock('../../slate/AppBottomSheet', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    SheetHeader: ({ title, onClose }: any) => (
      <View>
        <Text>{title}</Text>
        <TouchableOpacity testID="sheet-close" onPress={onClose}>
          <Text>close</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});
jest.mock('../../slate/Toast', () => {
  const { Text, View } = require('react-native');
  return {
    Toast: ({ message, tone, onHide }: any) => {
      if (!message) return null;
      return (
        <View testID={`toast-${tone ?? 'success'}`}>
          <Text>{message}</Text>
        </View>
      );
    },
  };
});
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ expand: jest.fn(), close: jest.fn() }));
      return <View>{children}</View>;
    }),
  };
});
jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import { GroupsList } from '../GroupsList';
import { api } from '../../api/client';
const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
  mockGroupsState.groups = [];
  mockGroupsState.loading = false;
  mockSettlementsState.byGroupId = {};
});

describe('GroupsList — list rendering', () => {
  it('renders header title', () => {
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('page-hero-title').props.children).toBe('Groups');
  });

  it('renders each group row', () => {
    mockGroupsState.groups = [
      { id: 'g1', name: 'Trip', currency: 'INR', members: [{ id: 'u1' }] },
      { id: 'g2', name: 'House', currency: 'USD', members: [{ id: 'u1' }] },
    ];
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('groups-row-g1')).toBeTruthy();
    expect(getByTestId('groups-row-g2')).toBeTruthy();
  });

  it('row press defaults to /groups/[id] navigation', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-row-g1'));
    expect(mockPush).toHaveBeenCalledWith('/groups/g1');
  });

  it('row press uses onGroupPress prop when provided', () => {
    const onGroupPress = jest.fn();
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<GroupsList onGroupPress={onGroupPress} />);
    fireEvent.press(getByTestId('groups-row-g1'));
    expect(onGroupPress).toHaveBeenCalledWith('g1');
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('GroupsList — balance label', () => {
  it('shows "settled" when net is zero', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('groups-balance-g1').props.children).toBe('settled');
  });

  it('shows ahead with + for positive balance', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 420, from_user_name: 'B', to_user_name: 'A' },
      ],
    };
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('groups-balance-g1').props.children).toMatch(/\+₹420 ahead/);
  });

  it('shows behind with - for negative balance', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u1', to_user_id: 'u2', amount: 380, from_user_name: 'A', to_user_name: 'B' },
      ],
    };
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('groups-balance-g1').props.children).toMatch(/-₹380 behind/);
  });

  it('respects group currency', () => {
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'USD', members: [] }];
    mockSettlementsState.byGroupId = {
      g1: [
        { from_user_id: 'u2', to_user_id: 'u1', amount: 10, from_user_name: 'B', to_user_name: 'A' },
      ],
    };
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('groups-balance-g1').props.children).toMatch(/\$/);
  });
});

describe('GroupsList — empty state', () => {
  it('renders empty state when no groups and not loading', () => {
    const { getByTestId, getByText } = render(<GroupsList />);
    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No groups yet')).toBeTruthy();
  });

  it('empty-state action opens the sheet (no crash)', () => {
    const { getByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('empty-action'));
    // The sheet ref expand() is called; we just assert no error path reached.
    expect(true).toBe(true);
  });
});

describe('GroupsList — loading state', () => {
  it('shows loading indicator when loading and no cached groups', () => {
    mockGroupsState.loading = true;
    const { getByTestId } = render(<GroupsList />);
    expect(getByTestId('groups-loading')).toBeTruthy();
  });

  it('hides loading indicator once groups are cached', () => {
    mockGroupsState.loading = true;
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    const { queryByTestId } = render(<GroupsList />);
    expect(queryByTestId('groups-loading')).toBeNull();
  });
});

describe('GroupsList — create group', () => {
  it('requires a non-empty name', async () => {
    const { getByTestId } = render(<GroupsList />);
    // Open sheet first
    fireEvent.press(getByTestId('groups-create-button'));
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('shows validation error when name is blank', async () => {
    const { getByTestId, findByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(await findByTestId('callout-danger')).toBeTruthy();
  });

  it('POSTs to /groups and navigates on success', async () => {
    mockApi.post.mockResolvedValue({ id: 'new-id', name: 'Trip', currency: 'INR', members: [] });
    const { getByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    fireEvent.changeText(getByTestId('groups-input-name'), 'Trip');
    fireEvent.changeText(getByTestId('groups-input-emails'), 'a@x.com, b@x.com');
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(mockApi.post).toHaveBeenCalledWith(
      '/groups',
      expect.objectContaining({
        name: 'Trip',
        member_emails: ['a@x.com', 'b@x.com'],
        currency: 'INR',
      })
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/groups/new-id'));
  });

  it('upserts and invalidates on success', async () => {
    mockApi.post.mockResolvedValue({ id: 'gx', name: 'X', currency: 'INR', members: [] });
    const { getByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    fireEvent.changeText(getByTestId('groups-input-name'), 'X');
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(mockGroupsState.upsert).toHaveBeenCalled();
    expect(mockGroupsState.invalidate).toHaveBeenCalled();
  });

  it('shows error callout on API failure', async () => {
    mockApi.post.mockRejectedValue(new Error('server exploded'));
    const { getByTestId, findByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    fireEvent.changeText(getByTestId('groups-input-name'), 'X');
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    const callout = await findByTestId('callout-danger');
    expect(callout.props.children).toContain('server exploded');
  });

  it('trims empty emails before submit', async () => {
    mockApi.post.mockResolvedValue({ id: 'gy', name: 'Y', currency: 'INR', members: [] });
    const { getByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    fireEvent.changeText(getByTestId('groups-input-name'), 'Y');
    fireEvent.changeText(getByTestId('groups-input-emails'), 'a@x.com, , , b@x.com');
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(mockApi.post).toHaveBeenCalledWith(
      '/groups',
      expect.objectContaining({ member_emails: ['a@x.com', 'b@x.com'] })
    );
  });
});

describe('GroupsList — data loading', () => {
  it('calls fetchGroups on mount', () => {
    render(<GroupsList />);
    expect(mockGroupsState.fetch).toHaveBeenCalled();
  });

  it('fetches settlements for each group', () => {
    mockGroupsState.groups = [
      { id: 'g1', name: 'A', currency: 'INR', members: [] },
      { id: 'g2', name: 'B', currency: 'INR', members: [] },
    ];
    render(<GroupsList />);
    expect(mockSettlementsState.fetch).toHaveBeenCalledWith('g1');
    expect(mockSettlementsState.fetch).toHaveBeenCalledWith('g2');
  });
});

describe('GroupsList — confirmation toast (foundational principle: no silent success)', () => {
  it('shows a success toast after creating a group', async () => {
    mockApi.post.mockResolvedValue({ id: 'new-id', name: 'Trip', currency: 'INR', members: [] });
    const { getByTestId, findByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    fireEvent.changeText(getByTestId('groups-input-name'), 'Trip');
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(await findByTestId('toast-success')).toBeTruthy();
  });

  it('shows a danger toast on API failure', async () => {
    mockApi.post.mockRejectedValue(new Error('nope'));
    const { getByTestId, findByTestId } = render(<GroupsList />);
    fireEvent.press(getByTestId('groups-create-button'));
    fireEvent.changeText(getByTestId('groups-input-name'), 'Trip');
    await act(async () => {
      fireEvent.press(getByTestId('groups-submit'));
    });
    expect(await findByTestId('toast-danger')).toBeTruthy();
  });
});

describe('GroupsList — settled accent (foundational principle: color as signal)', () => {
  it('settled state uses success accent color (not muted grey)', () => {
    // Principle: settled is a positive signal; it should read as green, not neutral.
    mockGroupsState.groups = [{ id: 'g1', name: 'Trip', currency: 'INR', members: [] }];
    // No settlements → net is zero → "settled"
    const { getByTestId } = render(<GroupsList />);
    const balance = getByTestId('groups-balance-g1');
    expect(balance.props.children).toBe('settled');
    // Color is baked in via style prop — we assert it's the success color, not mutedSubtle.
    const styleArray = Array.isArray(balance.props.style) ? balance.props.style : [balance.props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.color).toBe('#4f7a60'); // colors.success
  });
});

describe('GroupsList — autoOpenCreate', () => {
  it('does not crash when autoOpenCreate=true (sheet opens via ref)', () => {
    const { getByTestId } = render(<GroupsList autoOpenCreate />);
    // Header still renders; opening the sheet is a ref call we can't observe here,
    // but the effect running without throwing is the assertion.
    expect(getByTestId('groups-create-button')).toBeTruthy();
  });
});
