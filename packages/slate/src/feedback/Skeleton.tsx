import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius } from '../tokens/radius';
import type { RadiusKey } from '../tokens/radius';

type Props = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: RadiusKey;
};

export function Skeleton({ width, height, borderRadius = 'md' }: Props) {
  const theme = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius[borderRadius],
          backgroundColor: theme.colors.borderDefault,
          opacity,
        },
      ]}
    />
  );
}
