/**
 * Tests for new-expense screen — covers AI Smart Split wiring and regression
 * tests for the existing OCR receipt-scan flow.
 *
 * All native modules and the API client are mocked.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ groupId: 'group-1' })),
  useRouter: jest.fn(() => ({ back: jest.fn() })),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaType: { Images: 'images' },
}));

jest.mock('../../src/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGroupsState = {
  groups: [
    {
      id: 'group-1',
      name: 'Roommates',
      currency: 'INR',
      members: [
        { id: 'u1', name: 'Alice', email: 'alice@example.com' },
        { id: 'u2', name: 'Bob', email: 'bob@example.com' },
      ],
      created_by: 'u1',
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  fetch: jest.fn(),
};

const mockExpensesState = {
  addOptimistic: jest.fn(),
  replace: jest.fn(),
  remove: jest.fn(),
  invalidate: jest.fn(),
};

jest.mock('../../src/stores', () => ({
  useGroupsStore: jest.fn(() => mockGroupsState),
  useExpensesStore: jest.fn(() => mockExpensesState),
}));

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } })),
}));

// Slate mocks
jest.mock('../../src/slate/AppShell', () => ({
  AppShell: ({ children }: any) => children,
  PageContent: ({ children }: any) => children,
}));
jest.mock('../../src/slate/Header', () => ({
  Header: ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));
jest.mock('../../src/slate/AppButton', () => ({
  AppButton: ({ onPress, children, testID, loading, leftIcon }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID} disabled={loading}>
        <Text>{children || 'btn'}</Text>
      </TouchableOpacity>
    );
  },
}));
jest.mock('../../src/slate/AppSurface', () => ({
  AppSurface: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
  InteractiveSurface: ({ children, onPress, testID }: any) => {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        {children}
      </TouchableOpacity>
    );
  },
}));
jest.mock('../../src/slate/AppInput', () => ({
  AppInput: ({ value, onChangeText, placeholder, testID }: any) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID || placeholder}
      />
    );
  },
  AppTextarea: ({ value, onChangeText, placeholder, testID }: any) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID || placeholder}
        multiline
      />
    );
  },
  Field: ({ children, label }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>{label}</Text>
        {children}
      </View>
    );
  },
}));
jest.mock('../../src/slate/Text', () => ({
  Text: ({ children }: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText>{children}</RNText>;
  },
}));
jest.mock('../../src/slate/atoms', () => ({
  MemberBadge: ({ children, onPress, active }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={`member-badge-${children}`}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  },
  Callout: ({ children, tone }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`callout-${tone}`}>{children}</Text>;
  },
  Breath: () => null,
}));

// Sub-components
jest.mock('../../src/components/Expense/PaidByModal', () => ({
  PaidByModal: () => null,
}));
jest.mock('../../src/components/Expense/SplitOptionsModal', () => ({
  SplitOptionsModal: () => null,
}));

jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return {
    Camera: MockIcon, ChevronDown: MockIcon, Tag: MockIcon, Users: MockIcon,
    Zap: MockIcon, Sparkles: MockIcon,
  };
});

// ── Test data ─────────────────────────────────────────────────────────────────

import { api } from '../../src/api/client';
import * as ImagePicker from 'expo-image-picker';
const mockApi = api as jest.Mocked<typeof api>;
const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

import NewExpenseScreen from '../new-expense';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// AI Smart Split — panel visibility
// ─────────────────────────────────────────────────────────────────────────────

describe('AI Smart Split — panel', () => {
  it('smart split instruction input is hidden by default', () => {
    const { queryByPlaceholderText } = render(<NewExpenseScreen />);
    expect(
      queryByPlaceholderText(
        'e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks'
      )
    ).toBeNull();
  });

  it('shows instruction input after tapping the AI split surface', async () => {
    const { getByTestId, findByPlaceholderText } = render(<NewExpenseScreen />);

    fireEvent.press(getByTestId('ai-split-surface'));

    const input = await findByPlaceholderText(
      'e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks'
    );
    expect(input).toBeTruthy();
  });

  it('hides instruction input after tapping the surface again (toggle)', async () => {
    const { getByTestId, queryByPlaceholderText } = render(<NewExpenseScreen />);

    fireEvent.press(getByTestId('ai-split-surface'));
    fireEvent.press(getByTestId('ai-split-surface'));

    await waitFor(() => {
      expect(
        queryByPlaceholderText(
          'e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks'
        )
      ).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AI Smart Split — API call
// ─────────────────────────────────────────────────────────────────────────────

describe('AI Smart Split — API behaviour', () => {
  async function openAndFillInstruction(getByTestId: any, getByPlaceholderText: any, instruction: string) {
    fireEvent.press(getByTestId('ai-split-surface'));
    await waitFor(() =>
      getByPlaceholderText(
        'e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks'
      )
    );
    fireEvent.changeText(
      getByPlaceholderText(
        'e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks'
      ),
      instruction
    );
  }

  it('does NOT call API when instruction is empty', async () => {
    const { getByTestId, getByText } = render(<NewExpenseScreen />);
    fireEvent.press(getByTestId('ai-split-surface'));
    await waitFor(() => getByText('Apply AI Split'));

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    expect(mockApi.post).not.toHaveBeenCalledWith(
      '/ai/smart-split',
      expect.anything()
    );
  });

  it('calls POST /ai/smart-split with group_id and instruction', async () => {
    mockApi.post.mockResolvedValue({
      split_plan: { items: [], split_type: 'equal' },
      clarification_needed: false,
    });

    const { getByTestId, getByText, getByPlaceholderText } = render(<NewExpenseScreen />);
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'Alice pays for everything');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/ai/smart-split',
        expect.objectContaining({
          group_id: 'group-1',
          instruction: 'Alice pays for everything',
        })
      );
    });
  });

  it('sets splitMode to item-based on item-based response', async () => {
    mockApi.post.mockResolvedValue({
      split_plan: {
        items: [
          { name: 'Pizza', price: 300, quantity: 1, assigned_to: ['u1'] },
          { name: 'Beer', price: 200, quantity: 2, assigned_to: ['u2'] },
        ],
        split_type: 'item-based',
      },
      clarification_needed: false,
    });

    const { getByTestId, getByText, getByPlaceholderText } = render(<NewExpenseScreen />);
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'Split by items');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    // Panel should close after successful apply
    await waitFor(() => {
      expect(
        require('../../src/api/client').api.post
      ).toHaveBeenCalledWith('/ai/smart-split', expect.anything());
    });
  });

  it('sets splitMode to equally on equal response', async () => {
    mockApi.post.mockResolvedValue({
      split_plan: { items: [], split_type: 'equal' },
      clarification_needed: false,
    });

    const { getByTestId, getByText, getByPlaceholderText } = render(<NewExpenseScreen />);
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'Split equally');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  it('sets splitMode to unequally on custom response', async () => {
    mockApi.post.mockResolvedValue({
      split_plan: { items: [], split_type: 'custom' },
      clarification_needed: false,
    });

    const { getByTestId, getByText, getByPlaceholderText } = render(<NewExpenseScreen />);
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'Custom split');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  it('shows Alert when clarification_needed is true', async () => {
    const { Alert } = require('react-native');
    jest.spyOn(Alert, 'alert');

    mockApi.post.mockResolvedValue({
      split_plan: { items: [], split_type: 'equal' },
      clarification_needed: true,
      clarification_question: 'Who paid for the drinks?',
    });

    const { getByTestId, getByText, getByPlaceholderText } = render(<NewExpenseScreen />);
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'something ambiguous');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Clarification needed',
        'Who paid for the drinks?'
      );
    });
  });

  it('shows error callout on API failure', async () => {
    mockApi.post.mockRejectedValue(new Error('Network error'));

    const { getByTestId, getByText, getByPlaceholderText, findByTestId } = render(
      <NewExpenseScreen />
    );
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'split equally');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    const callout = await findByTestId('callout-danger');
    expect(callout).toBeTruthy();
  });

  it('closes the smart split panel after a successful apply', async () => {
    mockApi.post.mockResolvedValue({
      split_plan: { items: [], split_type: 'equal' },
      clarification_needed: false,
    });

    const { getByTestId, getByText, getByPlaceholderText, queryByPlaceholderText } = render(
      <NewExpenseScreen />
    );
    await openAndFillInstruction(getByTestId, getByPlaceholderText, 'split equally');

    await act(async () => {
      fireEvent.press(getByText('Apply AI Split'));
    });

    await waitFor(() => {
      expect(
        queryByPlaceholderText(
          'e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks'
        )
      ).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OCR receipt scan — regression tests
// ─────────────────────────────────────────────────────────────────────────────

describe('OCR receipt scan (regression)', () => {
  it('calls /ai/ocr/scan and populates merchant and amount', async () => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
      canAskAgain: true,
      expires: 'never',
      status: 'granted',
    });
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'abc123', uri: 'file://test.jpg', width: 100, height: 100, type: 'image' }],
    } as any);
    mockApi.post.mockResolvedValue({
      merchant: 'Pizza Palace',
      total_amount: 750,
      date: '2024-03-10',
      items: [{ name: 'Margherita', price: 350, quantity: 1 }],
    });

    const { getByTestId, findByDisplayValue } = render(<NewExpenseScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('scan-receipt-surface'));
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/ai/ocr/scan',
        expect.objectContaining({ image_base64: 'abc123' })
      );
    });

    expect(await findByDisplayValue('Pizza Palace')).toBeTruthy();
    expect(await findByDisplayValue('750')).toBeTruthy();
  });

  it('shows error callout when OCR API fails', async () => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
      canAskAgain: true,
      expires: 'never',
      status: 'granted',
    });
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'abc123', uri: 'file://test.jpg', width: 100, height: 100, type: 'image' }],
    } as any);
    mockApi.post.mockRejectedValue(new Error('OCR service unavailable'));

    const { getByTestId, findByTestId } = render(<NewExpenseScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('scan-receipt-surface'));
    });

    const callout = await findByTestId('callout-danger');
    expect(callout).toBeTruthy();
  });

  it('does not call OCR when user cancels image picker', async () => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
      canAskAgain: true,
      expires: 'never',
      status: 'granted',
    });
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: [],
    } as any);

    const { getByTestId } = render(<NewExpenseScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('scan-receipt-surface'));
    });

    expect(mockApi.post).not.toHaveBeenCalledWith(
      '/ai/ocr/scan',
      expect.anything()
    );
  });
});
