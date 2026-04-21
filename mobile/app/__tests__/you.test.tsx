/**
 * Tests for the You (account) tab.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, replace: mockReplace })),
}));

const mockLogout = jest.fn().mockResolvedValue(undefined);
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com' },
    logout: mockLogout,
  })),
}));

jest.mock('../../src/api/client', () => ({
  api: { get: jest.fn() },
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium', Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('../../src/slate/AppShell', () => ({
  AppShell: ({ children }: any) => children,
  PageContent: ({ children }: any) => children,
}));
jest.mock('../../src/slate/PageHero', () => {
  const { Text } = require('react-native');
  return {
    PageHero: ({ title }: any) => <Text>{title}</Text>,
  };
});
jest.mock('../../src/slate/Text', () => {
  const { Text: RNText } = require('react-native');
  return {
    Text: ({ children }: any) => <RNText>{children}</RNText>,
  };
});
jest.mock('../../src/slate/AppSurface', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    AppSurface: ({ children }: any) => <View>{children}</View>,
    InteractiveSurface: ({ children, onPress, testID }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID}>
        {children}
      </TouchableOpacity>
    ),
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
jest.mock('../../src/slate/atoms', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Avatar: () => null,
    Breath: () => null,
    MemberBadge: ({ children }: any) => <Text testID="upi-linked-chip">{children}</Text>,
    Callout: ({ children, tone }: any) => <Text testID={`callout-${tone}`}>{children}</Text>,
  };
});
jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import YouScreen from '../(tabs)/you';
import { api } from '../../src/api/client';
const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('YouScreen — identity', () => {
  it('renders user name', () => {
    mockApi.get.mockResolvedValue([]);
    const { getByText } = render(<YouScreen />);
    expect(getByText('Alice Johnson')).toBeTruthy();
  });

  it('renders user email', () => {
    mockApi.get.mockResolvedValue([]);
    const { getByText } = render(<YouScreen />);
    expect(getByText('alice@example.com')).toBeTruthy();
  });
});

describe('YouScreen — UPI status', () => {
  it('shows empty-state callout when no UPI accounts linked', async () => {
    mockApi.get.mockResolvedValue([]);
    const { findByTestId } = render(<YouScreen />);
    expect(await findByTestId('callout-info')).toBeTruthy();
  });

  it('shows UPI linked chip when accounts exist', async () => {
    mockApi.get.mockResolvedValue([{ id: 'a1', upi_id: 'x@y' }]);
    const { findByTestId } = render(<YouScreen />);
    expect(await findByTestId('upi-linked-chip')).toBeTruthy();
  });

  it('falls back to empty-state on API error', async () => {
    mockApi.get.mockRejectedValue(new Error('boom'));
    const { findByTestId } = render(<YouScreen />);
    expect(await findByTestId('callout-info')).toBeTruthy();
  });

  it('UPI row navigates to /(upi)', async () => {
    mockApi.get.mockResolvedValue([]);
    const { getByTestId } = render(<YouScreen />);
    await waitFor(() => expect(mockApi.get).toHaveBeenCalled());
    fireEvent.press(getByTestId('you-upi-row'));
    expect(mockPush).toHaveBeenCalledWith('/(upi)');
  });
});

describe('YouScreen — sign out', () => {
  it('shows confirmation alert when Sign Out pressed', () => {
    mockApi.get.mockResolvedValue([]);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<YouScreen />);
    fireEvent.press(getByTestId('you-signout'));
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('Confirm triggers logout and redirect', async () => {
    mockApi.get.mockResolvedValue([]);
    let confirmAction: (() => void) | undefined;
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, btns: any) => {
      confirmAction = btns?.find((b: any) => b.text === 'Sign Out')?.onPress;
    });

    const { getByTestId } = render(<YouScreen />);
    fireEvent.press(getByTestId('you-signout'));
    expect(confirmAction).toBeDefined();
    await confirmAction!();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/auth');
    alertSpy.mockRestore();
  });

  it('Cancel does not trigger logout', async () => {
    mockApi.get.mockResolvedValue([]);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<YouScreen />);
    fireEvent.press(getByTestId('you-signout'));
    expect(mockLogout).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('YouScreen — section headings', () => {
  it.each([
    'PAYMENT & LINKING',
    'PREFERENCES',
    'HELP & LEGAL',
  ])('renders section heading "%s"', (heading) => {
    mockApi.get.mockResolvedValue([]);
    const { getByText } = render(<YouScreen />);
    expect(getByText(heading)).toBeTruthy();
  });

  it.each([
    'UPI Apps',
    'Default Currency',
    'Notifications',
    'Appearance',
    'Privacy & data',
    'Help & FAQ',
    'Terms of service',
    'Privacy policy',
    'About',
  ])('renders menu row "%s"', (label) => {
    mockApi.get.mockResolvedValue([]);
    const { getByText } = render(<YouScreen />);
    expect(getByText(label)).toBeTruthy();
  });
});
