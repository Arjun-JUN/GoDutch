import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { Row } from '../layout/Row';
import { spacing } from '../tokens/spacing';
import type { IconName } from '../primitives/Icon';

export type BannerType = 'info' | 'success' | 'warning' | 'error';

type Props = {
  type?: BannerType;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: { label: string; onPress: () => void };
};

const BANNER_ICON: Record<BannerType, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  error: 'error',
};

export function Banner({ type = 'info', message, dismissible = false, onDismiss, action }: Props) {
  const theme = useTheme();

  const bg = {
    info: theme.colors.brandLight,
    success: theme.colors.bgPositive,
    warning: theme.colors.bgWarning,
    error: theme.colors.bgNegative,
  }[type];

  const iconColor = {
    info: 'textBrand',
    success: 'textPositive',
    warning: 'textWarning',
    error: 'textNegative',
  }[type] as 'textBrand' | 'textPositive' | 'textWarning' | 'textNegative';

  const textColor = iconColor;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Row gap={2} align="flex-start" style={styles.content}>
        <Icon name={BANNER_ICON[type]} size="sm" color={iconColor} />
        <Text variant="label" color={textColor} style={styles.message}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text variant="label" color={textColor} style={styles.actionLabel}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        {dismissible && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismiss}>
            <Icon name="close" size="xs" color={iconColor} />
          </TouchableOpacity>
        )}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  content: {
    flexWrap: 'wrap',
  },
  message: {
    flex: 1,
  },
  actionLabel: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  dismiss: {
    marginLeft: spacing[2],
  },
});
