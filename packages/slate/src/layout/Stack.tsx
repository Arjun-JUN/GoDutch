import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewProps } from 'react-native';
import { spacing } from '../tokens/spacing';
import type { SpacingKey } from '../tokens/spacing';

type Props = ViewProps & {
  gap?: SpacingKey;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  padding?: SpacingKey;
  paddingHorizontal?: SpacingKey;
  paddingVertical?: SpacingKey;
};

export function Stack({
  gap = 0,
  align = 'stretch',
  justify = 'flex-start',
  padding,
  paddingHorizontal,
  paddingVertical,
  style,
  children,
  ...rest
}: Props) {
  return (
    <View
      style={[
        styles.base,
        {
          gap: spacing[gap],
          alignItems: align,
          justifyContent: justify,
          padding: padding !== undefined ? spacing[padding] : undefined,
          paddingHorizontal: paddingHorizontal !== undefined ? spacing[paddingHorizontal] : undefined,
          paddingVertical: paddingVertical !== undefined ? spacing[paddingVertical] : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },
});
