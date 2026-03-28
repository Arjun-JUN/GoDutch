import type { palette } from '../tokens/colors';
import type { spacing } from '../tokens/spacing';
import type { radius } from '../tokens/radius';
import type { shadows } from '../tokens/shadows';
import type { zIndex } from '../tokens/z-index';

export type Colors = {
  // Brand
  brand: string;
  brandLight: string;
  brandDark: string;

  // Semantic
  positive: string;
  positiveLight: string;
  negative: string;
  negativeLight: string;
  warning: string;
  warningLight: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textDisabled: string;
  textPositive: string;
  textNegative: string;
  textWarning: string;
  textBrand: string;

  // Backgrounds
  bgBase: string;
  bgSurface: string;
  bgSurfaceAlt: string;
  bgInverse: string;
  bgBrand: string;
  bgPositive: string;
  bgNegative: string;
  bgWarning: string;
  bgOverlay: string;

  // Borders
  borderDefault: string;
  borderStrong: string;
  borderFocus: string;
  borderNegative: string;
  borderWarning: string;
};

export type Theme = {
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
  isDark: boolean;
};
