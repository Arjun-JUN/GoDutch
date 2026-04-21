/**
 * Tests for the restructured (tabs) layout — 5 tabs + center FAB,
 * hidden expenses/settlements/profile.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  // `Tabs` is a component; `Tabs.Screen` records what's been registered.
  const registered: any[] = [];
  const Tabs = ({ children, screenOptions }: any) => {
    registered.length = 0;
    React.Children.forEach(children, (c: any) => {
      if (c?.props) registered.push(c.props);
    });
    // Render each screen's tabBarButton if present so we can drive FAB press.
    const { View } = require('react-native');
    return (
      <View testID="tabs-root">
        {registered.map((p, i) => {
          const btn = p?.options?.tabBarButton;
          return btn ? <View key={i}>{btn({})}</View> : null;
        })}
      </View>
    );
  };
  Tabs.Screen = (props: any) => {
    return null;
  };
  (Tabs as any).__registered = () => registered;
  return {
    Tabs,
    useRouter: jest.fn(() => ({ push: mockPush })),
  };
});

jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import TabLayout from '../(tabs)/_layout';
import { Tabs } from 'expo-router';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TabLayout', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<TabLayout />);
    expect(getByTestId('tabs-root')).toBeTruthy();
  });

  it('registers dashboard, groups, add, activity, you, and hidden legacy tabs', () => {
    render(<TabLayout />);
    const registered = (Tabs as any).__registered();
    const names = registered.map((r: any) => r.name);
    expect(names).toContain('dashboard');
    expect(names).toContain('groups');
    expect(names).toContain('add');
    expect(names).toContain('activity');
    expect(names).toContain('you');
    expect(names).toContain('expenses');
    expect(names).toContain('settlements');
    expect(names).toContain('profile');
  });

  it('hides legacy expenses/settlements/profile via href: null', () => {
    render(<TabLayout />);
    const registered = (Tabs as any).__registered();
    const hidden = registered.filter((r: any) =>
      ['expenses', 'settlements', 'profile'].includes(r.name)
    );
    for (const h of hidden) {
      expect(h.options.href).toBeNull();
    }
  });

  it('registers a custom tabBarButton for the add tab', () => {
    render(<TabLayout />);
    const registered = (Tabs as any).__registered();
    const add = registered.find((r: any) => r.name === 'add');
    expect(typeof add.options.tabBarButton).toBe('function');
  });

  it('FAB press navigates to /new-expense', () => {
    const { getByTestId } = render(<TabLayout />);
    fireEvent.press(getByTestId('fab-add-button'));
    expect(mockPush).toHaveBeenCalledWith('/new-expense');
  });

  it('visible tabs expose title and tabBarIcon', () => {
    render(<TabLayout />);
    const registered = (Tabs as any).__registered();
    const visible = registered.filter((r: any) =>
      ['dashboard', 'groups', 'activity', 'you'].includes(r.name)
    );
    for (const t of visible) {
      expect(t.options.title).toBeDefined();
      expect(t.options.tabBarIcon).toBeDefined();
    }
  });
});
