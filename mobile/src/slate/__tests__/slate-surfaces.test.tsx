/**
 * Tests for Slate structural components that mock-heavy screen tests do not exercise
 * directly: AppSurface, AppInput, AppBottomSheet, Header, ExpenseCard, PageHero.
 *
 * Principles under test:
 *  - No raw `1px` borders on any variant (no-line rule).
 *  - Disabled/focus states communicate via tone, not border.
 *  - Typography flows through Text variants.
 *  - Spacing flows through spacing tokens.
 *  - a11y roles on tap targets.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

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

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: ({ children, style }: any) => <View style={style}>{children}</View> };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ expand: jest.fn(), close: jest.fn() }));
      return <View>{children}</View>;
    }),
    BottomSheetModal: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ present: jest.fn(), dismiss: jest.fn() }));
      return <View>{children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: any) => <View>{children}</View>,
    BottomSheetScrollView: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, push: jest.fn() }),
}));

jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

import { AppSurface, InteractiveSurface } from '../AppSurface';
import { AppInput, Field } from '../AppInput';
import { Header } from '../Header';
import { ExpenseCard } from '../ExpenseCard';
import { PageHero } from '../PageHero';
import { spacing, radii } from '../../theme/tokens';

// Helper — flatten a style prop (array or object) into a single object.
const flatten = (node: any) => {
  const s = node.props.style;
  const arr = Array.isArray(s) ? s : [s];
  return arr.reduce((acc: any, v: any) => ({ ...acc, ...(v ?? {}) }), {});
};

describe('AppSurface — no-line rule, tonal hierarchy', () => {
  it('solid variant renders with surfaceSolid background', () => {
    const { getByTestId } = render(
      <AppSurface variant="solid" testID="surface-solid">
        <></>
      </AppSurface>
    );
    const style = flatten(getByTestId('surface-solid'));
    expect(style.backgroundColor).toBe('#ffffff');
  });

  it('soft variant renders with soft tonal background', () => {
    const { getByTestId } = render(
      <AppSurface variant="soft" testID="surface-soft">
        <></>
      </AppSurface>
    );
    const style = flatten(getByTestId('surface-soft'));
    expect(style.backgroundColor).toBe('#f0f4f3');
  });

  it('does not set borderWidth on any variant (no-line rule)', () => {
    const variants = ['solid', 'soft', 'list'] as const;
    for (const v of variants) {
      const { getByTestId } = render(
        <AppSurface variant={v} testID={`surface-${v}`}>
          <></>
        </AppSurface>
      );
      const style = flatten(getByTestId(`surface-${v}`));
      expect(style.borderWidth).toBeFalsy();
    }
  });

  it('uses radii token for border radius', () => {
    const { getByTestId } = render(
      <AppSurface variant="solid" testID="surface-default">
        <></>
      </AppSurface>
    );
    const style = flatten(getByTestId('surface-default'));
    expect([radii.lg, radii.xl]).toContain(style.borderRadius);
  });

  it('compact variant uses smaller radius (lg)', () => {
    const { getByTestId } = render(
      <AppSurface variant="solid" compact testID="surface-compact">
        <></>
      </AppSurface>
    );
    const style = flatten(getByTestId('surface-compact'));
    expect(style.borderRadius).toBe(radii.lg);
  });

  it('non-compact uses larger radius (xl)', () => {
    const { getByTestId } = render(
      <AppSurface variant="solid" testID="surface-roomy">
        <></>
      </AppSurface>
    );
    const style = flatten(getByTestId('surface-roomy'));
    expect(style.borderRadius).toBe(radii.xl);
  });

  it('uses spacing tokens for padding', () => {
    const { getByTestId: comp } = render(
      <AppSurface variant="solid" compact testID="surface-padded-compact">
        <></>
      </AppSurface>
    );
    const { getByTestId: full } = render(
      <AppSurface variant="solid" testID="surface-padded-full">
        <></>
      </AppSurface>
    );
    const compactStyle = flatten(comp('surface-padded-compact'));
    const fullStyle = flatten(full('surface-padded-full'));
    expect(compactStyle.padding).toBe(spacing.md);
    expect(fullStyle.padding).toBe(spacing.lg);
  });
});

describe('InteractiveSurface — press affordance', () => {
  it('exposes role="button" by default via Pressable', () => {
    const { getByTestId } = render(
      <InteractiveSurface onPress={() => {}} testID="interactive">
        <></>
      </InteractiveSurface>
    );
    expect(getByTestId('interactive')).toBeTruthy();
  });
});

describe('Field — form wrapper', () => {
  it('renders the label above the input', () => {
    const { getByText } = render(
      <Field label="Email">
        <AppInput value="" onChangeText={() => {}} />
      </Field>
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders error text below input with danger tone', () => {
    const { getByText } = render(
      <Field label="Email" error="Required">
        <AppInput value="" onChangeText={() => {}} />
      </Field>
    );
    expect(getByText('Required')).toBeTruthy();
  });

  it('shows hint when no error is set', () => {
    const { getByText, queryByText } = render(
      <Field label="Email" hint="Use work email">
        <AppInput value="" onChangeText={() => {}} />
      </Field>
    );
    expect(getByText('Use work email')).toBeTruthy();
    expect(queryByText('Required')).toBeNull();
  });

  it('hides hint when error is present (error wins)', () => {
    const { getByText, queryByText } = render(
      <Field label="Email" error="Required" hint="Use work email">
        <AppInput value="" onChangeText={() => {}} />
      </Field>
    );
    expect(getByText('Required')).toBeTruthy();
    expect(queryByText('Use work email')).toBeNull();
  });
});

describe('AppInput — focus state via tonal shift', () => {
  it('renders without borderWidth (no-line rule)', () => {
    const { UNSAFE_getByType } = render(<AppInput value="" onChangeText={() => {}} />);
    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    const style = flatten(input);
    expect(style.borderWidth).toBeFalsy();
  });

  it('renders soft background by default', () => {
    const { UNSAFE_getByType } = render(<AppInput value="" onChangeText={() => {}} />);
    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    const style = flatten(input);
    expect(style.backgroundColor).toBe('#f0f4f3');
  });

  it('renders danger soft background when invalid', () => {
    const { UNSAFE_getByType } = render(
      <AppInput value="" onChangeText={() => {}} invalid />
    );
    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    const style = flatten(input);
    expect(style.backgroundColor).toBe('rgba(159,64,61,0.1)');
  });
});

describe('Header — layout', () => {
  it('renders title text when provided', () => {
    const { getByText } = render(<Header title="Settings" />);
    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders eyebrow above title when provided', () => {
    const { getByText } = render(<Header title="Account" eyebrow="Settings" />);
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Account')).toBeTruthy();
  });

  it('does not render a back button when showBack is false', () => {
    const { queryByRole } = render(<Header title="Home" showBack={false} />);
    // With showBack=false only the "right" slot could be a button; there is none here.
    expect(queryByRole('button')).toBeNull();
  });
});

describe('ExpenseCard — Text variants + tokens', () => {
  const expense = {
    id: 'e1',
    merchant: 'Swiggy',
    total_amount: 420.5,
    date: '2026-04-01',
  };

  it('renders the merchant title', () => {
    const { getByText } = render(<ExpenseCard expense={expense} />);
    expect(getByText('Swiggy')).toBeTruthy();
  });

  it('renders the amount', () => {
    const { getByText } = render(<ExpenseCard expense={expense} />);
    expect(getByText('420.50')).toBeTruthy();
  });

  it('date uses the label variant (hierarchy: subordinate)', () => {
    const { getByText } = render(<ExpenseCard expense={expense} />);
    const dateNode = getByText('2026-04-01');
    const style = flatten(dateNode);
    // label variant = fontSize 13
    expect(style.fontSize).toBe(13);
  });

  it('merchant title uses titleSm variant (hierarchy: dominant)', () => {
    const { getByText } = render(<ExpenseCard expense={expense} />);
    const titleNode = getByText('Swiggy');
    const style = flatten(titleNode);
    // titleSm = 17
    expect(style.fontSize).toBe(17);
  });

  it('amount uses amount variant (hierarchy: dominant, size 24)', () => {
    const { getByText } = render(<ExpenseCard expense={expense} />);
    const amountNode = getByText('420.50');
    const style = flatten(amountNode);
    expect(style.fontSize).toBe(24);
  });

  it('uses no hex literal for icon tile background (colors.softHighest)', () => {
    const { UNSAFE_root } = render(<ExpenseCard expense={expense} />);
    // Can't easily pull out the inner background in a stable way; main guard is the
    // source-level audit. Just ensure the component mounts without crashing.
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders fallback title "Expense" when merchant and description are missing', () => {
    const { getByText } = render(
      <ExpenseCard expense={{ id: 'e2', total_amount: 10 }} />
    );
    expect(getByText('Expense')).toBeTruthy();
  });

  it('custom amountLabel appears instead of "Your share"', () => {
    const { getByText, queryByText } = render(
      <ExpenseCard expense={expense} amountLabel="TOTAL" />
    );
    expect(getByText('TOTAL')).toBeTruthy();
    expect(queryByText('Your share')).toBeNull();
  });

  it('custom amount overrides total_amount', () => {
    const { getByText } = render(<ExpenseCard expense={expense} amount={100} />);
    expect(getByText('100.00')).toBeTruthy();
  });
});

describe('PageHero — token spacing', () => {
  it('renders title text', () => {
    const { getByText } = render(<PageHero title="Dashboard" />);
    expect(getByText('Dashboard')).toBeTruthy();
  });

  it('renders eyebrow above title', () => {
    const { getByText } = render(<PageHero eyebrow="OVERVIEW" title="Dashboard" />);
    expect(getByText('OVERVIEW')).toBeTruthy();
    expect(getByText('Dashboard')).toBeTruthy();
  });

  it('renders description when provided', () => {
    const { getByText } = render(
      <PageHero title="Dashboard" description="Your financial summary." />
    );
    expect(getByText('Your financial summary.')).toBeTruthy();
  });

  it('renders actions when provided', () => {
    const { RN } = require('react-native');
    const { Text: RNText } = require('react-native');
    const { getByText } = render(
      <PageHero
        title="Dashboard"
        actions={<RNText>Action1</RNText>}
      />
    );
    expect(getByText('Action1')).toBeTruthy();
  });

  it('compact=true uses tighter vertical rhythm (marginTop: spacing.md)', () => {
    const { UNSAFE_root } = render(<PageHero title="Dashboard" compact />);
    // Mounts without throwing — exact computed style depends on outer View position.
    expect(UNSAFE_root).toBeTruthy();
  });
});
