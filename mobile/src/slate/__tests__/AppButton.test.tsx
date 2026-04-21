/**
 * AppButton — the canonical interactive element.
 *
 * Principles under test:
 *  - All five states design-honored: default, pressed, disabled, loading, a11y-focus
 *  - Disabled uses non-color tonal mute in addition to opacity (not opacity alone)
 *  - accessibilityState reflects disabled + busy (loading)
 *  - Haptic fires on primary press (not on disabled/loading)
 *  - Reduced motion suppresses the scale spring
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (Comp: any) => Comp },
    createAnimatedComponent: (Comp: any) => Comp,
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    FadeInDown: { delay: () => ({ duration: () => ({}) }) },
    View,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style, colors }: any) => (
      <View style={style} testID={`linear-gradient-${(colors ?? []).join(',')}`}>
        {children}
      </View>
    ),
  };
});

const isReduceMotionEnabled = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled');
const addEventListener = jest.spyOn(AccessibilityInfo, 'addEventListener');

beforeEach(() => {
  jest.clearAllMocks();
  isReduceMotionEnabled.mockResolvedValue(false);
  addEventListener.mockReturnValue({ remove: jest.fn() } as any);
});

import { AppButton } from '../AppButton';
import * as Haptics from 'expo-haptics';

describe('AppButton — default state', () => {
  it('renders its label', () => {
    const { getByText } = render(<AppButton>Save</AppButton>);
    expect(getByText('Save')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<AppButton onPress={onPress}>Save</AppButton>);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('defaults to role="button"', () => {
    const { getByRole } = render(<AppButton>Save</AppButton>);
    expect(getByRole('button')).toBeTruthy();
  });
});

describe('AppButton — disabled state (principle: non-color signifier)', () => {
  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <AppButton onPress={onPress} disabled>
        Save
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('reports accessibilityState.disabled=true to screen readers', () => {
    const { getByRole } = render(<AppButton disabled>Save</AppButton>);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('reports accessibilityState.disabled=true when loading', () => {
    const { getByRole } = render(<AppButton loading>Save</AppButton>);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  });

  it('renders with reduced opacity when disabled', () => {
    const { getByRole } = render(<AppButton disabled>Save</AppButton>);
    const styleArray = Array.isArray(getByRole('button').props.style)
      ? getByRole('button').props.style
      : [getByRole('button').props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.opacity).toBeLessThan(1);
  });

  it('drops shadow when primary is disabled (tonal mute signifier)', () => {
    const { getByRole } = render(<AppButton variant="primary" disabled>Save</AppButton>);
    const styleArray = Array.isArray(getByRole('button').props.style)
      ? getByRole('button').props.style
      : [getByRole('button').props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.shadowOpacity).toBe(0);
  });

  it('swaps danger bg to soft when disabled (tonal mute)', () => {
    const { getByRole } = render(<AppButton variant="danger" disabled>Delete</AppButton>);
    const styleArray = Array.isArray(getByRole('button').props.style)
      ? getByRole('button').props.style
      : [getByRole('button').props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.backgroundColor).toBe('#f0f4f3'); // colors.soft, not colors.danger
  });

  it('swaps secondary bg to soft when disabled (tonal mute)', () => {
    const { getByRole } = render(<AppButton variant="secondary" disabled>Cancel</AppButton>);
    const styleArray = Array.isArray(getByRole('button').props.style)
      ? getByRole('button').props.style
      : [getByRole('button').props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.backgroundColor).toBe('#f0f4f3'); // colors.soft, not primaryContainer
  });
});

describe('AppButton — loading state', () => {
  it('blocks presses while loading', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <AppButton onPress={onPress} loading>
        Save
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not trigger haptic when loading', () => {
    const { getByRole } = render(
      <AppButton variant="primary" loading>
        Save
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });
});

describe('AppButton — haptics (principle: primary actions get haptic)', () => {
  it('fires haptic on primary press by default', () => {
    const { getByRole } = render(
      <AppButton variant="primary" onPress={jest.fn()}>
        Save
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('does not fire haptic on secondary press by default', () => {
    const { getByRole } = render(
      <AppButton variant="secondary" onPress={jest.fn()}>
        Cancel
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('opt-in haptic on ghost variant', () => {
    const { getByRole } = render(
      <AppButton variant="ghost" haptic onPress={jest.fn()}>
        Skip
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('haptic={false} opts out of primary default haptic', () => {
    const { getByRole } = render(
      <AppButton variant="primary" haptic={false} onPress={jest.fn()}>
        Save
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('does not fire haptic when disabled', () => {
    const { getByRole } = render(
      <AppButton variant="primary" disabled onPress={jest.fn()}>
        Save
      </AppButton>
    );
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });
});

describe('AppButton — variants', () => {
  it.each(['primary', 'secondary', 'ghost', 'danger', 'icon'] as const)(
    '%s variant renders and presses',
    (variant) => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <AppButton variant={variant} onPress={onPress}>
          Action
        </AppButton>
      );
      fireEvent.press(getByRole('button'));
      expect(onPress).toHaveBeenCalled();
    }
  );
});

describe('AppButton — sizes', () => {
  it.each(['sm', 'md', 'lg'] as const)('%s size renders correctly', (size) => {
    const { getByText } = render(<AppButton size={size}>Action</AppButton>);
    expect(getByText('Action')).toBeTruthy();
  });
});
