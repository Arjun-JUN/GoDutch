import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewProps } from 'react-native';
import { spacing } from '../tokens/spacing';
import type { SpacingKey } from '../tokens/spacing';

type Props = ViewProps & {
  gap?: SpacingKey;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  padding?: SpacingKey;
  paddingHorizontal?: SpacingKey;
  paddingVertical?: SpacingKey;
};

export function Row({
  gap = 0,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
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
          flexWrap: wrap ? 'wrap' : 'nowrap',
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
    flexDirection: 'row',
  },
});
