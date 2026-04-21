import React from 'react';
import { View, ViewProps, Pressable, PressableProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import { cn } from './cn';

type Variant = 'glass' | 'soft' | 'solid' | 'interactive' | 'list';

interface AppSurfaceProps extends ViewProps {
  variant?: Variant;
  /** Use rounded pill (for list rows). */
  compact?: boolean;
  className?: string;
}

/**
 * Slate card/surface. Variant maps to the tonal hierarchy:
 * - `glass`: translucent white + backdrop blur (hero cards, floating overlays)
 * - `soft`: soft-green fill, no shadow (secondary content)
 * - `solid`: pure white + subtle shadow (elevated content)
 * - `interactive`: Pressable, lifts via background shift on press
 * - `list`: list row (less round, no shadow)
 *
 * All variants obey the no-line rule — hierarchy through tone & shadow, not borders.
 */
export const AppSurface: React.FC<AppSurfaceProps> = ({
  variant = 'solid',
  compact = false,
  className,
  style,
  children,
  ...rest
}) => {
  const radius = compact || variant === 'list' ? radii.lg : radii.xl;

  if (variant === 'glass') {
    return (
      <View
        style={[
          {
            borderRadius: radius,
            overflow: 'hidden',
            backgroundColor: colors.surface, // fallback when blur fails
            ...shadows.cardSm,
          },
          style,
        ]}
        className={cn(className)}
        {...rest}
      >
        <BlurView
          intensity={Platform.OS === 'android' ? 30 : 40}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={{ padding: compact ? spacing.md : spacing.lg }}
        >
          {children}
        </BlurView>
      </View>
    );
  }

  const bgStyle =
    variant === 'soft'
      ? { backgroundColor: colors.soft }
      : variant === 'list'
      ? { backgroundColor: colors.surfaceSolid }
      : { backgroundColor: colors.surfaceSolid, ...shadows.cardSm };

  return (
    <View
      style={[
        {
          borderRadius: radius,
          padding: compact ? spacing.md : spacing.lg,
        },
        bgStyle,
        style,
      ]}
      className={cn(className)}
      {...rest}
    >
      {children}
    </View>
  );
};

interface InteractiveSurfaceProps extends Omit<PressableProps, 'style' | 'children'> {
  compact?: boolean;
  variant?: 'solid' | 'soft';
  className?: string;
  children?: React.ReactNode;
  /** Extra styles merged on top of the base surface style. */
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

/**
 * Touchable card. Tonal press state, no borders.
 */
export const InteractiveSurface: React.FC<InteractiveSurfaceProps> = ({
  compact = false,
  variant = 'solid',
  className,
  children,
  style,
  ...rest
}) => {
  const radius = compact ? radii.lg : radii.xl;
  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: radius,
          padding: compact ? spacing.md : spacing.lg,
          backgroundColor: pressed
            ? colors.soft
            : variant === 'soft'
            ? colors.soft
            : colors.surfaceSolid,
          ...(variant === 'soft' ? {} : shadows.cardSm),
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
        style,
      ]}
      className={cn(className)}
      {...rest}
    >
      {children}
    </Pressable>
  );
};
