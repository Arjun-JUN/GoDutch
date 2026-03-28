import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { Row } from '../layout/Row';
import { Stack } from '../layout/Stack';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import type { BannerType } from './Banner';
import type { IconName } from '../primitives/Icon';

type Props = {
  type?: BannerType;
  title?: string;
  body: string;
  icon?: IconName;
};

const DEFAULT_ICON: Record<BannerType, IconName> = {
  info: 'info',
  success: 'check-circle-outline',
  warning: 'warning',
  error: 'error',
};

export function Callout({ type = 'info', title, body, icon }: Props) {
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

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Row gap={3} align="flex-start">
        <Icon name={icon ?? DEFAULT_ICON[type]} size="md" color={iconColor} />
        <Stack gap={1} style={styles.textArea}>
          {title && (
            <Text variant="label" color={iconColor} style={{ fontWeight: '700' }}>
              {title}
            </Text>
          )}
          <Text variant="body" color={iconColor}>
            {body}
          </Text>
        </Stack>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  textArea: {
    flex: 1,
  },
});
