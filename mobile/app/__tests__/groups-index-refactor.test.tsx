/**
 * Regression test: the legacy /groups route must still render the shared
 * GroupsList component so existing deep links keep working.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('../../src/slate/AppShell', () => {
  const { View } = require('react-native');
  return { AppShell: ({ children }: any) => <View testID="app-shell">{children}</View> };
});

jest.mock('../../src/components/GroupsList', () => ({
  GroupsList: () => {
    const { View } = require('react-native');
    return <View testID="groups-list-stub" />;
  },
}));

import GroupsIndex from '../groups/index';

describe('groups/index (legacy)', () => {
  it('renders AppShell wrapping GroupsList', () => {
    const { getByTestId } = render(<GroupsIndex />);
    expect(getByTestId('app-shell')).toBeTruthy();
    expect(getByTestId('groups-list-stub')).toBeTruthy();
  });
});
