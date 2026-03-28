import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { Button } from '../primitives/Button';
import { Stack } from '../layout/Stack';
import { spacing } from '../tokens/spacing';
import type { IconName } from '../primitives/Icon';

type Props = {
  icon: IconName;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({ icon, title, body, ctaLabel, onCta }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Stack gap={4} align="center">
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.bgSurfaceAlt }]}>
          <Icon name={icon} size="xl" color="textMuted" />
        </View>
        <Text variant="heading4" align="center" color="textPrimary">{title}</Text>
        {body && (
          <Text variant="body" align="center" color="textSecondary">
            {body}
          </Text>
        )}
        {ctaLabel && onCta && (
          <Button label={ctaLabel} onPress={onCta} variant="primary" />
        )}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
});
