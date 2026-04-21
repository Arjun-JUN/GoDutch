import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing } from '../theme/tokens';
import { Text } from './Text';

interface PageHeroProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  /** Tight vertical rhythm for secondary screens. */
  compact?: boolean;
}

/**
 * Editorial-voice hero section — eyebrow label, oversized title, optional body + actions.
 * Uses "generous breath" per DESIGN_RULES/user-interface/guides/spacing-and-rhythm.md
 */
export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
}) => (
  <View style={{ marginTop: compact ? spacing.md : spacing.lg, marginBottom: compact ? spacing.lg : spacing.xl }}>
    {eyebrow ? (
      <Animated.View entering={FadeInDown.delay(0).duration(300)}>
        <Text variant="eyebrow" tone="primary" style={{ marginBottom: spacing.sm }}>
          {eyebrow}
        </Text>
      </Animated.View>
    ) : null}
    <Animated.View entering={FadeInDown.delay(60).duration(350)}>
      {typeof title === 'string' ? (
        <Text variant={compact ? 'titleXl' : 'display'} weight="extrabold">
          {title}
        </Text>
      ) : (
        title
      )}
    </Animated.View>
    {description ? (
      <Animated.View entering={FadeInDown.delay(120).duration(400)}>
        <Text variant="body" tone="muted" style={{ marginTop: spacing.sm }}>
          {description}
        </Text>
      </Animated.View>
    ) : null}
    {actions ? (
      <Animated.View
        entering={FadeInDown.delay(180).duration(400)}
        style={{ marginTop: spacing.s20, flexDirection: 'row', gap: spacing.s12 }}
      >
        {actions}
      </Animated.View>
    ) : null}
  </View>
);
