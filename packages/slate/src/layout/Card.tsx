import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import type { TouchableOpacityProps, ViewProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import type { SpacingKey } from '../tokens/spacing';

type Props = (TouchableOpacityProps | ViewProps) & {
  onPress?: () => void;
  padding?: SpacingKey;
  /** elevated uses shadow; outlined uses border; flat has neither */
  variant?: 'elevated' | 'outlined' | 'flat';
  children: React.ReactNode;
};

export function Card({ onPress, padding = 4, variant = 'elevated', style, children, ...rest }: Props) {
  const theme = useTheme();

  const containerStyle = [
    styles.base,
    {
      padding: spacing[padding],
      backgroundColor: theme.colors.bgSurface,
      borderRadius: radius.xl,
    },
    variant === 'elevated' && theme.shadows.md,
    variant === 'outlined' && {
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={containerStyle}
        {...(rest as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} {...(rest as ViewProps)}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
