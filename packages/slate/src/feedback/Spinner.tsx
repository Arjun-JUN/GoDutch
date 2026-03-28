import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'inverse' | 'muted';
};

const RN_SIZE: Record<'sm' | 'md' | 'lg', 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

export function Spinner({ size = 'md', color = 'brand' }: Props) {
  const theme = useTheme();

  const resolvedColor = {
    brand: theme.colors.brand,
    inverse: theme.colors.textInverse,
    muted: theme.colors.textMuted,
  }[color];

  return <ActivityIndicator size={RN_SIZE[size]} color={resolvedColor} />;
}
