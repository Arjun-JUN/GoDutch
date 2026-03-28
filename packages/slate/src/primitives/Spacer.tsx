import React from 'react';
import { View } from 'react-native';
import { spacing } from '../tokens/spacing';
import type { SpacingKey } from '../tokens/spacing';

type Props =
  | { size: SpacingKey; flex?: never }
  | { flex: true; size?: never };

export function Spacer({ size, flex }: Props) {
  if (flex) return <View style={{ flex: 1 }} />;
  const px = size !== undefined ? spacing[size] : 0;
  return <View style={{ width: px, height: px }} />;
}
