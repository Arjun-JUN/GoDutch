/**
 * Smoke test for the Groups tab wrapper. Real behavior is tested in
 * `src/components/__tests__/GroupsList.test.tsx`.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('../../src/slate/AppShell', () => {
  const { View } = require('react-native');
  return { AppShell: ({ children }: any) => <View testID="app-shell">{children}</View> };
});

const mockGroupsList = jest.fn();
jest.mock('../../src/components/GroupsList', () => ({
  GroupsList: (props: any) => {
    mockGroupsList(props);
    const { View } = require('react-native');
    return <View testID="groups-list-stub" />;
  },
}));

import GroupsTab from '../(tabs)/groups';
const { useLocalSearchParams } = jest.requireMock('expo-router');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GroupsTab', () => {
  it('renders AppShell with GroupsList', () => {
    useLocalSearchParams.mockReturnValue({});
    const { getByTestId } = render(<GroupsTab />);
    expect(getByTestId('app-shell')).toBeTruthy();
    expect(getByTestId('groups-list-stub')).toBeTruthy();
  });

  it('passes autoOpenCreate=false when no create param', () => {
    useLocalSearchParams.mockReturnValue({});
    render(<GroupsTab />);
    expect(mockGroupsList).toHaveBeenCalledWith(
      expect.objectContaining({ autoOpenCreate: false })
    );
  });

  it('passes autoOpenCreate=true when create=1', () => {
    useLocalSearchParams.mockReturnValue({ create: '1' });
    render(<GroupsTab />);
    expect(mockGroupsList).toHaveBeenCalledWith(
      expect.objectContaining({ autoOpenCreate: true })
    );
  });
});
