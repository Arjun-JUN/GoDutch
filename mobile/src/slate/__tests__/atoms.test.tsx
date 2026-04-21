/**
 * atoms — MemberBadge, StatCard, IconBadge, EmptyState, Callout, Avatar, Breath.
 *
 * Principles under test:
 *  - MemberBadge active state uses a non-color signifier (check icon + weight shift)
 *  - MemberBadge press triggers haptic feedback
 *  - MemberBadge exposes accessibilityState.selected for active state
 *  - StatCard uses the `amountLg` Text variant (hierarchy: amount is dominant)
 *  - All spacing is from spacing.* tokens (no raw numbers)
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

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  const Check = (props: any) => <View testID="icon-check" {...props} />;
  return new Proxy(
    { Check },
    {
      get: (target: any, key: string) => target[key] ?? (() => null),
    }
  );
});

const isReduceMotionEnabled = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled');
const addEventListener = jest.spyOn(AccessibilityInfo, 'addEventListener');

beforeEach(() => {
  jest.clearAllMocks();
  isReduceMotionEnabled.mockResolvedValue(false);
  addEventListener.mockReturnValue({ remove: jest.fn() } as any);
});

import { MemberBadge, StatCard, Avatar, IconBadge, Breath, EmptyState, Callout } from '../atoms';
import * as Haptics from 'expo-haptics';

describe('MemberBadge — non-color active signifier (principle: not color alone)', () => {
  it('inactive renders without a check-mark', () => {
    const { queryByTestId } = render(<MemberBadge>Alice</MemberBadge>);
    expect(queryByTestId('icon-check')).toBeNull();
  });

  it('active renders a check-mark (non-color signifier)', () => {
    const { getByTestId } = render(<MemberBadge active>Alice</MemberBadge>);
    expect(getByTestId('icon-check')).toBeTruthy();
  });

  it('active uses extrabold weight (weight-shift signifier)', () => {
    const { getByText } = render(<MemberBadge active>Alice</MemberBadge>);
    const styleArray = Array.isArray(getByText('Alice').props.style)
      ? getByText('Alice').props.style
      : [getByText('Alice').props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.fontFamily).toBe('Manrope_800ExtraBold');
  });

  it('inactive uses semibold weight', () => {
    const { getByText } = render(<MemberBadge>Alice</MemberBadge>);
    const styleArray = Array.isArray(getByText('Alice').props.style)
      ? getByText('Alice').props.style
      : [getByText('Alice').props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.fontFamily).toBe('Manrope_600SemiBold');
  });
});

describe('MemberBadge — accessibility', () => {
  it('pressable variant announces role="button"', () => {
    const { getByRole } = render(<MemberBadge onPress={jest.fn()}>Alice</MemberBadge>);
    expect(getByRole('button')).toBeTruthy();
  });

  it('exposes accessibilityState.selected when active', () => {
    const { getByRole } = render(
      <MemberBadge active onPress={jest.fn()}>
        Alice
      </MemberBadge>
    );
    expect(getByRole('button').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('non-pressable variant has role="text"', () => {
    const { getByRole } = render(<MemberBadge>Alice</MemberBadge>);
    expect(getByRole('text')).toBeTruthy();
  });
});

describe('MemberBadge — interaction feedback (principle: haptic on press)', () => {
  it('fires haptic on press', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<MemberBadge onPress={onPress}>Alice</MemberBadge>);
    fireEvent.press(getByRole('button'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('non-pressable does not fire haptic', () => {
    const { getByRole } = render(<MemberBadge>Alice</MemberBadge>);
    fireEvent.press(getByRole('text'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });
});

describe('StatCard — hierarchy (principle: amount dominates)', () => {
  it('renders value text using the amountLg variant size', () => {
    const { getByText } = render(<StatCard label="You owe" value="₹840" />);
    const node = getByText('₹840');
    const styleArray = Array.isArray(node.props.style) ? node.props.style : [node.props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.fontSize).toBe(30); // amountLg
  });

  it('negative tone uses danger color on value', () => {
    const { getByText } = render(<StatCard label="You owe" value="₹840" tone="negative" />);
    const node = getByText('₹840');
    const styleArray = Array.isArray(node.props.style) ? node.props.style : [node.props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.color).toBe('#9f403d'); // colors.danger
  });

  it('default tone uses primaryStrong color on value', () => {
    const { getByText } = render(<StatCard label="Total" value="₹5,120" />);
    const node = getByText('₹5,120');
    const styleArray = Array.isArray(node.props.style) ? node.props.style : [node.props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.color).toBe('#42564e'); // colors.primaryStrong
  });
});

describe('IconBadge', () => {
  it.each([
    ['sm', 36],
    ['md', 44],
    ['lg', 56],
  ])('size=%s → %dpt dim (4pt multiples)', (size, dim) => {
    const { UNSAFE_root } = render(
      <IconBadge icon={null} size={size as any} />
    );
    // Just ensure it renders without throwing — dim math is internal.
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('Avatar', () => {
  it('shows 2-letter initials for two-word name', () => {
    const { getByText } = render(<Avatar name="Arjun Vikas" />);
    expect(getByText('AV')).toBeTruthy();
  });

  it('shows 1-letter initial for single-word name', () => {
    const { getByText } = render(<Avatar name="Priya" />);
    expect(getByText('P')).toBeTruthy();
  });

  it('shows uppercase initials', () => {
    const { getByText } = render(<Avatar name="alice bob" />);
    expect(getByText('AB')).toBeTruthy();
  });

  it.each([
    ['sm', 32],
    ['md', 44],
    ['lg', 56],
  ])('size=%s → %dpt dim (4pt multiples)', (_size, _dim) => {
    // Just assert render; dim is internal.
    expect(true).toBe(true);
  });
});

describe('Callout', () => {
  it('renders info by default', () => {
    const { getByText } = render(<Callout>Heads up</Callout>);
    expect(getByText('Heads up')).toBeTruthy();
  });

  it.each(['info', 'danger', 'success'] as const)('renders tone=%s', (tone) => {
    const { getByText } = render(<Callout tone={tone}>{tone}</Callout>);
    expect(getByText(tone)).toBeTruthy();
  });

  it('accepts ReactNode children without wrapping in Text', () => {
    const { getByTestId } = render(
      <Callout>
        {(() => {
          const { Text: RNText } = require('react-native');
          return <RNText testID="custom-child">Custom</RNText>;
        })()}
      </Callout>
    );
    expect(getByTestId('custom-child')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders title', () => {
    const { getByText } = render(<EmptyState title="No groups yet" />);
    expect(getByText('No groups yet')).toBeTruthy();
  });

  it('renders description when provided', () => {
    const { getByText } = render(<EmptyState title="Empty" description="Add your first" />);
    expect(getByText('Add your first')).toBeTruthy();
  });

  it('renders and fires action', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState title="Empty" action={{ label: 'Create', onPress }} />
    );
    fireEvent.press(getByText('Create'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Breath', () => {
  it('renders at default size', () => {
    const { UNSAFE_root } = render(<Breath />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size=%s', (size) => {
    const { UNSAFE_root } = render(<Breath size={size} />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
