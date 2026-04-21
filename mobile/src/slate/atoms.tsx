import React, { useEffect, useState } from 'react';
import { View, ViewProps, Pressable, AccessibilityInfo } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { Text } from './Text';
import { AppSurface } from './AppSurface';
import { AppButton } from './AppButton';
import { cn } from './cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ---------- IconBadge ---------- */

interface IconBadgeProps {
  icon: React.ReactNode;
  tone?: 'soft' | 'white' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconBadge: React.FC<IconBadgeProps> = ({ icon, tone = 'soft', size = 'md' }) => {
  const dim = size === 'sm' ? 36 : size === 'lg' ? 56 : 44;
  const bg =
    tone === 'white'
      ? colors.surfaceSolid
      : tone === 'primary'
      ? colors.primary
      : tone === 'danger'
      ? colors.dangerSoft
      : colors.soft;
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </View>
  );
};

/* ---------- MemberBadge ---------- */

interface MemberBadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
}

/**
 * Pill chip for group members / filter selection. Active state uses a weight shift
 * (semibold → extrabold) + a check-mark in addition to color fill — never color alone.
 * Press animation is a scale spring + light haptic.
 */
export const MemberBadge: React.FC<MemberBadgeProps> = ({ children, active, onPress }) => {
  const scale = useSharedValue(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pressable = !!onPress;
  const handlePressIn = () => {
    if (pressable && !reducedMotion) {
      scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
    }
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };
  const handlePress = () => {
    if (pressable) {
      Haptics.selectionAsync();
      onPress?.();
    }
  };

  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      {active ? (
        <Check size={14} color={colors.primaryForeground} strokeWidth={3} />
      ) : null}
      <Text
        variant="label"
        weight={active ? 'extrabold' : 'semibold'}
        style={{ color: active ? colors.primaryForeground : colors.foreground }}
      >
        {children}
      </Text>
    </View>
  );

  const boxStyle = {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: active ? colors.primary : colors.soft,
    alignSelf: 'flex-start' as const,
  };

  if (!pressable) {
    return (
      <View
        style={boxStyle}
        accessibilityRole="text"
        accessibilityState={{ selected: active }}
      >
        {inner}
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[animatedStyle, boxStyle]}
    >
      {inner}
    </AnimatedPressable>
  );
};

/* ---------- StatCard ---------- */

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  /** tone drives both indicator dot + value color. Mirrors web StatCard. */
  tone?: 'default' | 'positive' | 'negative';
  /** Override indicator color (e.g. red for "You owe"). */
  indicatorColor?: string;
  /** Override value color. */
  valueColor?: string;
  /** Kept for compatibility with legacy call sites — rendered in the label row. */
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  tone = 'default',
  indicatorColor,
  valueColor,
  icon,
}) => {
  const dot = indicatorColor ?? (tone === 'negative' ? colors.danger : colors.primary);
  const vColor = valueColor ?? (tone === 'negative' ? colors.danger : colors.primaryStrong);
  return (
    <AppSurface variant="solid" style={{ flex: 1, padding: spacing.s20, borderRadius: radii.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.s12 }}>
        {icon ?? (
          <View
            style={{
              width: spacing.s12,
              height: spacing.s12,
              borderRadius: radii.pill,
              backgroundColor: dot,
            }}
          />
        )}
        <Text variant="label" weight="semibold" tone="muted">
          {label}
        </Text>
      </View>
      <Text variant="amountLg" style={{ color: vColor }}>
        {value}
      </Text>
      {description ? (
        <Text variant="label" tone="muted" style={{ marginTop: spacing.sm }}>
          {description}
        </Text>
      ) : null}
    </AppSurface>
  );
};

/* ---------- EmptyState ---------- */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.s40,
      paddingHorizontal: spacing.lg,
    }}
  >
    {icon ? <IconBadge icon={icon} size="lg" tone="soft" /> : null}
    <Text variant="titleLg" style={{ marginTop: spacing.md, textAlign: 'center' }}>
      {title}
    </Text>
    {description ? (
      <Text
        variant="body"
        tone="muted"
        style={{ marginTop: spacing.sm, textAlign: 'center', maxWidth: 280 }}
      >
        {description}
      </Text>
    ) : null}
    {action ? (
      <View style={{ marginTop: spacing.s20 }}>
        <AppButton variant="primary" size="md" onPress={action.onPress}>
          {action.label}
        </AppButton>
      </View>
    ) : null}
  </View>
);

/* ---------- Callout ---------- */

interface CalloutProps extends ViewProps {
  tone?: 'info' | 'danger' | 'success';
  className?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  tone = 'info',
  className,
  children,
  style,
  ...rest
}) => {
  const bg =
    tone === 'danger' ? colors.dangerSoft : tone === 'success' ? colors.successSoft : colors.soft;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          padding: spacing.md,
          borderRadius: radii.lg,
        },
        style,
      ]}
      className={cn(className)}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          variant="label"
          tone={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'muted'}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

/* ---------- Avatar ---------- */

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'primary';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', tone = 'default' }) => {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 56 : 44;
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: tone === 'primary' ? colors.primary : colors.softStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        variant="label"
        weight="bold"
        style={{ color: tone === 'primary' ? colors.primaryForeground : colors.primary }}
      >
        {initials}
      </Text>
    </View>
  );
};

/* ---------- Divider (invisible spacing marker for list groups) ---------- */

export const Breath: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
  <View style={{ height: size === 'sm' ? spacing.md : size === 'lg' ? 56 : spacing.xl }} />
);
