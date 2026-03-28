import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import type { TouchableOpacityProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'positive';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = TouchableOpacityProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg = {
    primary: theme.colors.brand,
    secondary: theme.colors.bgSurface,
    ghost: theme.colors.transparent,
    danger: theme.colors.negative,
    positive: theme.colors.positive,
  }[variant];

  const textColor = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.textBrand,
    ghost: theme.colors.textBrand,
    danger: theme.colors.textInverse,
    positive: theme.colors.textInverse,
  }[variant] as 'textPrimary' | 'textSecondary' | 'textMuted' | 'textInverse' | 'textDisabled' | 'textPositive' | 'textNegative' | 'textWarning' | 'textBrand';

  const borderColor = {
    primary: 'transparent',
    secondary: theme.colors.brand,
    ghost: 'transparent',
    danger: 'transparent',
    positive: 'transparent',
  }[variant];

  const pad = size === 'sm'
    ? { paddingVertical: spacing[2], paddingHorizontal: spacing[3] }
    : size === 'lg'
    ? { paddingVertical: spacing[4], paddingHorizontal: spacing[6] }
    : { paddingVertical: spacing[3], paddingHorizontal: spacing[5] };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={[
        styles.base,
        pad,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? theme.colors.brand : theme.colors.textInverse}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            variant={size === 'sm' ? 'label' : 'body'}
            color={textColor}
            style={{ fontWeight: '600' }}
          >
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
});
