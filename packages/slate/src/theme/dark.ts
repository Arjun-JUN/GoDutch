import { palette } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { zIndex } from '../tokens/z-index';
import type { Theme } from './types';

export const darkTheme: Theme = {
  isDark: true,
  spacing,
  radius,
  shadows,
  zIndex,
  colors: {
    brand: palette.brand400,
    brandLight: palette.brand900,
    brandDark: palette.brand300,

    positive: palette.positive400,
    positiveLight: palette.positive700,
    negative: palette.negative400,
    negativeLight: palette.negative700,
    warning: palette.warning400,
    warningLight: palette.warning700,

    textPrimary: palette.slate100,
    textSecondary: palette.slate400,
    textMuted: palette.slate600,
    textInverse: palette.gray900,
    textDisabled: palette.slate700,
    textPositive: palette.positive400,
    textNegative: palette.negative400,
    textWarning: palette.warning400,
    textBrand: palette.brand400,

    bgBase: palette.slate900,
    bgSurface: palette.slate800,
    bgSurfaceAlt: palette.slate700,
    bgInverse: palette.slate100,
    bgBrand: palette.brand600,
    bgPositive: palette.positive700,
    bgNegative: palette.negative700,
    bgWarning: palette.warning700,
    bgOverlay: 'rgba(0,0,0,0.7)',

    borderDefault: palette.slate700,
    borderStrong: palette.slate600,
    borderFocus: palette.brand400,
    borderNegative: palette.negative500,
    borderWarning: palette.warning500,
  },
};
