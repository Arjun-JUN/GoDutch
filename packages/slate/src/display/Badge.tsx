import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { radius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';

export type BadgeVariant = 'default' | 'brand' | 'positive' | 'negative' | 'warning' | 'info' | 'neutral';

type Props = {
  label?: string;
  variant?: BadgeVariant;
  /** Render as a small dot with no text */
  dot?: boolean;
};

export function Badge({ label, variant = 'default', dot = false }: Props) {
  const theme = useTheme();

  const bg = {
    default: theme.colors.bgSurfaceAlt,
    brand: theme.colors.brandLight,
    positive: theme.colors.bgPositive,
    negative: theme.colors.bgNegative,
    warning: theme.colors.bgWarning,
    info: theme.colors.brandLight,
    neutral: theme.colors.bgSurfaceAlt,
  }[variant];

  const textColor = {
    default: 'textSecondary',
    brand: 'textBrand',
    positive: 'textPositive',
    negative: 'textNegative',
    warning: 'textWarning',
    info: 'textBrand',
    neutral: 'textMuted',
  }[variant] as 'textSecondary' | 'textBrand' | 'textPositive' | 'textNegative' | 'textWarning' | 'textMuted';

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: bg === theme.colors.bgSurfaceAlt ? theme.colors.textMuted : bg },
        ]}
      />
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text variant="caption" color={textColor} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
});
