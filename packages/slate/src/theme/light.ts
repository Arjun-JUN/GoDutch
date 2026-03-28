import { palette } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { zIndex } from '../tokens/z-index';
import type { Theme } from './types';

export const lightTheme: Theme = {
  isDark: false,
  spacing,
  radius,
  shadows,
  zIndex,
  colors: {
    brand: palette.brand500,
    brandLight: palette.brand100,
    brandDark: palette.brand700,

    positive: palette.positive500,
    positiveLight: palette.positive100,
    negative: palette.negative500,
    negativeLight: palette.negative100,
    warning: palette.warning500,
    warningLight: palette.warning100,

    textPrimary: palette.gray900,
    textSecondary: palette.gray600,
    textMuted: palette.gray400,
    textInverse: palette.white,
    textDisabled: palette.gray300,
    textPositive: palette.positive600,
    textNegative: palette.negative600,
    textWarning: palette.warning700,
    textBrand: palette.brand600,

    bgBase: palette.gray50,
    bgSurface: palette.white,
    bgSurfaceAlt: palette.gray100,
    bgInverse: palette.gray900,
    bgBrand: palette.brand500,
    bgPositive: palette.positive100,
    bgNegative: palette.negative100,
    bgWarning: palette.warning100,
    bgOverlay: 'rgba(0,0,0,0.5)',

    borderDefault: palette.gray200,
    borderStrong: palette.gray300,
    borderFocus: palette.brand500,
    borderNegative: palette.negative500,
    borderWarning: palette.warning500,
  },
};
