import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = {
  /** Inset adds left padding so the divider aligns with content (e.g. below an avatar) */
  inset?: number;
  /** Vertical divider for use in rows */
  vertical?: boolean;
};

export function Divider({ inset = 0, vertical = false }: Props) {
  const theme = useTheme();

  if (vertical) {
    return (
      <View
        style={[styles.vertical, { backgroundColor: theme.colors.borderDefault }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: theme.colors.borderDefault,
          marginLeft: inset,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
