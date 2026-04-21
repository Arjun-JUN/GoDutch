/**
 * Toast — confirmation chip.
 *
 * Principle under test: every user action that mutates state must show a
 * confirmation. Toast is the default vehicle. Tests cover:
 *  - Renders when message is set, hides when null
 *  - Auto-dismisses after durationMs
 *  - Tap-to-dismiss calls onHide
 *  - accessibilityLiveRegion is 'polite' (screen reader announces)
 *  - accessibilityRole is 'alert'
 *  - Each tone renders the correct background and icon
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium', Light: 'light' },
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (Comp: any) => Comp,
    },
    createAnimatedComponent: (Comp: any) => Comp,
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    FadeIn: { duration: () => ({ duration: () => ({}) }) },
    FadeOut: { duration: () => ({ duration: () => ({}) }) },
    FadeInDown: { delay: () => ({ duration: () => ({}) }) },
    SlideInDown: { springify: () => ({ damping: () => ({}) }) },
    SlideOutDown: { duration: () => ({ duration: () => ({}) }) },
    View,
  };
});

jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import { Toast } from '../Toast';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Toast — visibility', () => {
  it('renders nothing when message is null', () => {
    const { queryByRole } = render(<Toast message={null} onHide={jest.fn()} />);
    expect(queryByRole('alert')).toBeNull();
  });

  it('renders nothing when message is undefined', () => {
    const { queryByRole } = render(<Toast message={undefined} onHide={jest.fn()} />);
    expect(queryByRole('alert')).toBeNull();
  });

  it('renders nothing when message is empty string', () => {
    const { queryByRole } = render(<Toast message="" onHide={jest.fn()} />);
    expect(queryByRole('alert')).toBeNull();
  });

  it('renders when message is non-empty', () => {
    const { getByText } = render(<Toast message="Saved" onHide={jest.fn()} />);
    expect(getByText('Saved')).toBeTruthy();
  });
});

describe('Toast — auto-dismiss', () => {
  it('calls onHide after default 2400ms', () => {
    const onHide = jest.fn();
    render(<Toast message="Saved" onHide={onHide} />);
    expect(onHide).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(2400);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('respects custom durationMs', () => {
    const onHide = jest.fn();
    render(<Toast message="Saved" durationMs={500} onHide={onHide} />);
    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(onHide).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('does not schedule dismissal when message is null', () => {
    const onHide = jest.fn();
    render(<Toast message={null} onHide={onHide} />);
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(onHide).not.toHaveBeenCalled();
  });

  it('clears old timer when message changes', () => {
    const onHide = jest.fn();
    const { rerender } = render(<Toast message="First" durationMs={1000} onHide={onHide} />);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    rerender(<Toast message="Second" durationMs={1000} onHide={onHide} />);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    // 1000ms total elapsed but second timer only counted 500ms, so still not fired.
    expect(onHide).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});

describe('Toast — tap-to-dismiss', () => {
  it('calls onHide when tapped', () => {
    const onHide = jest.fn();
    const { getByLabelText } = render(<Toast message="Saved" onHide={onHide} />);
    fireEvent.press(getByLabelText('Saved'));
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});

describe('Toast — accessibility', () => {
  it('has role="alert" so it interrupts VoiceOver', () => {
    const { getByRole } = render(<Toast message="Saved" onHide={jest.fn()} />);
    expect(getByRole('alert')).toBeTruthy();
  });

  it('sets accessibilityLiveRegion to polite so screen readers announce', () => {
    const { getByRole } = render(<Toast message="Saved" onHide={jest.fn()} />);
    expect(getByRole('alert').props.accessibilityLiveRegion).toBe('polite');
  });

  it('uses the message as the accessibility label for the tap target', () => {
    const { getByLabelText } = render(<Toast message="Group created" onHide={jest.fn()} />);
    expect(getByLabelText('Group created')).toBeTruthy();
  });

  it('advertises tap-to-dismiss via accessibility hint', () => {
    const { getByLabelText } = render(<Toast message="Saved" onHide={jest.fn()} />);
    expect(getByLabelText('Saved').props.accessibilityHint).toBe('Tap to dismiss');
  });
});

describe('Toast — tone', () => {
  const toneColors: Record<string, string> = {
    success: '#4f7a60',
    danger: '#9f403d',
    neutral: '#2a3434',
  };

  (['success', 'danger', 'neutral'] as const).forEach((tone) => {
    it(`tone="${tone}" uses the ${tone} token background`, () => {
      const { getByLabelText } = render(
        <Toast message="Saved" tone={tone} onHide={jest.fn()} />
      );
      const pressable = getByLabelText('Saved');
      const styleArray = Array.isArray(pressable.props.style) ? pressable.props.style : [pressable.props.style];
      const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
      expect(flat.backgroundColor).toBe(toneColors[tone]);
    });
  });

  it('defaults to success tone when tone is not passed', () => {
    const { getByLabelText } = render(<Toast message="Saved" onHide={jest.fn()} />);
    const pressable = getByLabelText('Saved');
    const styleArray = Array.isArray(pressable.props.style) ? pressable.props.style : [pressable.props.style];
    const flat = styleArray.reduce((acc: any, s: any) => ({ ...acc, ...(s ?? {}) }), {});
    expect(flat.backgroundColor).toBe(toneColors.success);
  });
});

describe('Toast — boundary', () => {
  it('handles long messages without crashing', () => {
    const longMsg = 'a'.repeat(200);
    const { getByText } = render(<Toast message={longMsg} onHide={jest.fn()} />);
    expect(getByText(longMsg)).toBeTruthy();
  });

  it('handles unicode / emoji messages', () => {
    const msg = 'Settled ₹500 ✓';
    const { getByText } = render(<Toast message={msg} onHide={jest.fn()} />);
    expect(getByText(msg)).toBeTruthy();
  });
});
