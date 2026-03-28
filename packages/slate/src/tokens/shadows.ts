import { Platform } from 'react-native';

const shadow = (offsetY: number, radius: number, opacity: number) =>
  Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: Math.round(offsetY * 2 + radius),
    },
    default: {},
  }) ?? {};

export const shadows = {
  none: {},
  sm: shadow(1, 2, 0.06),
  md: shadow(2, 6, 0.08),
  lg: shadow(4, 12, 0.12),
  xl: shadow(8, 24, 0.16),
} as const;

export type ShadowKey = keyof typeof shadows;
