import { Platform } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  semibold: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
} as const;

/** Named text variants — maps to font size + weight combos */
export const textVariants = {
  heading1: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.bold, lineHeight: fontSizes['4xl'] * lineHeights.tight },
  heading2: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold, lineHeight: fontSizes['3xl'] * lineHeights.tight },
  heading3: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.semibold, lineHeight: fontSizes['2xl'] * lineHeights.snug },
  heading4: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: fontSizes.xl * lineHeights.snug },
  bodyLarge: { fontSize: fontSizes.lg, fontWeight: fontWeights.regular, lineHeight: fontSizes.lg * lineHeights.normal },
  body: { fontSize: fontSizes.md, fontWeight: fontWeights.regular, lineHeight: fontSizes.md * lineHeights.normal },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, lineHeight: fontSizes.sm * lineHeights.normal },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.regular, lineHeight: fontSizes.xs * lineHeights.normal },
  mono: { fontSize: fontSizes.sm, fontWeight: fontWeights.regular, lineHeight: fontSizes.sm * lineHeights.normal },
} as const;

export type TextVariant = keyof typeof textVariants;
export type FontWeight = keyof typeof fontWeights;
