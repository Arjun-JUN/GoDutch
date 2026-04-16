import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { cn } from './cn';

type Variant =
  | 'display'
  | 'titleXl'
  | 'titleLg'
  | 'title'
  | 'body'
  | 'label'
  | 'eyebrow';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const fontFor = (weight: Weight): string => {
  switch (weight) {
    case 'medium':
      return 'Manrope_500Medium';
    case 'semibold':
      return 'Manrope_600SemiBold';
    case 'bold':
      return 'Manrope_700Bold';
    case 'extrabold':
      return 'Manrope_800ExtraBold';
    default:
      return 'Manrope_400Regular';
  }
};

const variantStyles = StyleSheet.create({
  display: { fontSize: 36, lineHeight: 40, letterSpacing: -1 },
  titleXl: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  titleLg: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  title: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  label: { fontSize: 13, lineHeight: 18 },
  eyebrow: { fontSize: 11, lineHeight: 14, letterSpacing: 2.4, textTransform: 'uppercase' },
});

interface SlateTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  className?: string;
  tone?: 'default' | 'muted' | 'subtle' | 'primary' | 'danger' | 'inverse' | 'success';
}

const toneClass: Record<NonNullable<SlateTextProps['tone']>, string> = {
  default: 'text-foreground',
  muted: 'text-muted',
  subtle: 'text-muted-subtle',
  primary: 'text-primary',
  danger: 'text-danger',
  inverse: 'text-primary-foreground',
  success: 'text-success',
};

/**
 * Manrope-wrapped Text with variant + tone props. Matches web typographic scale.
 */
export const Text: React.FC<SlateTextProps> = ({
  variant = 'body',
  weight,
  tone = 'default',
  className,
  style,
  children,
  ...rest
}) => {
  // Default weight per variant (matches editorial hierarchy).
  const resolvedWeight: Weight =
    weight ??
    (variant === 'display' || variant === 'titleXl' || variant === 'titleLg'
      ? 'extrabold'
      : variant === 'title'
      ? 'bold'
      : variant === 'eyebrow'
      ? 'bold'
      : variant === 'label'
      ? 'semibold'
      : 'regular');

  return (
    <RNText
      className={cn(toneClass[tone], className)}
      style={[variantStyles[variant], { fontFamily: fontFor(resolvedWeight) }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
