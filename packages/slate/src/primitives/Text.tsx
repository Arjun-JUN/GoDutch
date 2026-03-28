import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import type { TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { textVariants } from '../tokens/typography';
import type { TextVariant } from '../tokens/typography';
import type { Colors } from '../theme/types';

type TextColor = keyof Pick<
  Colors,
  | 'textPrimary'
  | 'textSecondary'
  | 'textMuted'
  | 'textInverse'
  | 'textDisabled'
  | 'textPositive'
  | 'textNegative'
  | 'textWarning'
  | 'textBrand'
>;

type Props = RNTextProps & {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

export function Text({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();
  const variantStyle = textVariants[variant];

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: variantStyle.fontSize,
          fontWeight: variantStyle.fontWeight,
          lineHeight: variantStyle.lineHeight,
          color: theme.colors[color],
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
