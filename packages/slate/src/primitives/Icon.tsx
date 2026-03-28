import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import type { Colors } from '../theme/types';

/** Semantic icon names mapped to Ionicons. Add here as needed. */
const ICON_MAP = {
  // Navigation
  'arrow-back': 'arrow-back',
  'arrow-forward': 'arrow-forward',
  'close': 'close',
  'chevron-right': 'chevron-forward',
  'chevron-down': 'chevron-down',
  'menu': 'menu',

  // Actions
  'add': 'add',
  'add-circle': 'add-circle',
  'edit': 'create-outline',
  'delete': 'trash-outline',
  'copy': 'copy-outline',
  'share': 'share-outline',
  'search': 'search',
  'filter': 'filter',
  'more': 'ellipsis-horizontal',
  'check': 'checkmark',
  'check-circle': 'checkmark-circle',
  'check-circle-outline': 'checkmark-circle-outline',
  'refresh': 'refresh',

  // Domain
  'receipt': 'receipt-outline',
  'wallet': 'wallet-outline',
  'people': 'people-outline',
  'person': 'person-outline',
  'person-add': 'person-add-outline',
  'mic': 'mic-outline',
  'mic-active': 'mic',
  'camera': 'camera-outline',
  'image': 'image-outline',
  'dollar': 'cash-outline',
  'settle': 'arrow-forward-circle-outline',

  // Status / feedback
  'info': 'information-circle-outline',
  'info-filled': 'information-circle',
  'warning': 'warning-outline',
  'warning-filled': 'warning',
  'error': 'close-circle-outline',
  'error-filled': 'close-circle',
  'success': 'checkmark-circle',
  'question': 'help-circle-outline',

  // UI chrome
  'home': 'home-outline',
  'home-active': 'home',
  'settings': 'settings-outline',
  'eye': 'eye-outline',
  'eye-off': 'eye-off-outline',
  'calendar': 'calendar-outline',
  'clock': 'time-outline',
  'link': 'link-outline',
  'star': 'star-outline',
  'star-filled': 'star',
  'celebrate': 'trophy-outline',
  'notification': 'notifications-outline',
} as const;

export type IconName = keyof typeof ICON_MAP;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

type TextColorKey = keyof Pick<Colors, 'textPrimary' | 'textSecondary' | 'textMuted' | 'textInverse' | 'textBrand' | 'textPositive' | 'textNegative' | 'textWarning'>;

type Props = {
  name: IconName;
  size?: IconSize | number;
  color?: TextColorKey;
  /** Override with a raw color string */
  rawColor?: string;
};

export function Icon({ name, size = 'md', color = 'textPrimary', rawColor }: Props) {
  const theme = useTheme();
  const resolvedSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const resolvedColor = rawColor ?? theme.colors[color];

  return (
    <Ionicons
      name={ICON_MAP[name] as React.ComponentProps<typeof Ionicons>['name']}
      size={resolvedSize}
      color={resolvedColor}
    />
  );
}
