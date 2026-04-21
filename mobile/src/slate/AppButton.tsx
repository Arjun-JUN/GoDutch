import React, { useEffect, useState } from 'react';
import {
  Pressable,
  PressableProps,
  ActivityIndicator,
  View,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radii, shadows, spacing } from '../theme/tokens';
import { Text } from './Text';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface AppButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Emit light haptic on press. Defaults to true for primary. */
  haptic?: boolean;
  children?: React.ReactNode;
  className?: string;
  /** Extra ViewStyle applied to the outermost animated wrapper. */
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Heights are 4pt multiples; paddingX uses spacing tokens.
const sizeStyles: Record<Size, { height: number; paddingX: number; variant: 'label' | 'body' | 'titleSm' }> = {
  sm: { height: 40, paddingX: spacing.md, variant: 'label' },
  md: { height: 52, paddingX: spacing.lg, variant: 'body' },
  lg: { height: 60, paddingX: spacing.xl, variant: 'titleSm' },
  icon: { height: 48, paddingX: 0, variant: 'label' },
};

/**
 * Slate primary button — gradient pill, Reanimated press scale, reduced-motion aware.
 * The gradient primary is the visual signature of the design system.
 *
 * Disabled state uses opacity AND tonal mute (bg swap + shadow drop) per foundational
 * principles — opacity alone reads as loading.
 */
export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  haptic,
  children,
  className,
  style,
  onPress,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;
  const enableHaptic = haptic ?? variant === 'primary';
  const { height, paddingX, variant: textVariant } = sizeStyles[size];

  const handlePressIn = () => {
    if (!reducedMotion && !isDisabled) {
      scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
    }
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 300 });
  };
  const handlePress = (e: any) => {
    if (enableHaptic && !isDisabled) {
      Haptics.selectionAsync();
    }
    onPress?.(e);
  };

  // Text color resolves per variant, with disabled tonal mute.
  const textColor = isDisabled && variant !== 'primary' && variant !== 'danger'
    ? colors.mutedSubtle
    : variant === 'primary' || variant === 'danger'
    ? colors.primaryForeground
    : colors.primary;

  const a11y = {
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: isDisabled, busy: loading },
  };

  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.primaryForeground : colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          {children ? (
            <Text variant={textVariant} weight="bold" style={{ color: textColor }}>
              {children}
            </Text>
          ) : null}
          {rightIcon}
        </>
      )}
    </View>
  );

  // Primary — gradient pill. When disabled, swap to flat soft background (tonal mute).
  if (variant === 'primary') {
    const gradientColors = isDisabled
      ? ([colors.soft, colors.soft] as [string, string])
      : gradients.primary;
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        {...a11y}
        style={[
          animatedStyle,
          {
            borderRadius: radii.pill,
            overflow: 'hidden',
            ...shadows.button,
            shadowOpacity: isDisabled ? 0 : shadows.button.shadowOpacity,
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        className={cn(className)}
        {...rest}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height,
            paddingHorizontal: paddingX,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDisabled ? (
            // Render muted text over flat soft bg when disabled.
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.mutedSubtle} />
              ) : (
                <>
                  {leftIcon}
                  {children ? (
                    <Text variant={textVariant} weight="bold" style={{ color: colors.mutedSubtle }}>
                      {children}
                    </Text>
                  ) : null}
                  {rightIcon}
                </>
              )}
            </View>
          ) : (
            content
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'danger') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        {...a11y}
        style={[
          animatedStyle,
          {
            height,
            paddingHorizontal: paddingX,
            borderRadius: radii.pill,
            backgroundColor: isDisabled ? colors.soft : colors.danger,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        className={cn(className)}
        {...rest}
      >
        {isDisabled ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.mutedSubtle} />
            ) : (
              <>
                {leftIcon}
                {children ? (
                  <Text variant={textVariant} weight="bold" style={{ color: colors.mutedSubtle }}>
                    {children}
                  </Text>
                ) : null}
                {rightIcon}
              </>
            )}
          </View>
        ) : (
          content
        )}
      </AnimatedPressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        {...a11y}
        style={[
          animatedStyle,
          {
            height,
            paddingHorizontal: paddingX,
            borderRadius: radii.pill,
            backgroundColor: isDisabled ? colors.soft : colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        className={cn(className)}
        {...rest}
      >
        {content}
      </AnimatedPressable>
    );
  }

  if (variant === 'icon') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        {...a11y}
        style={[
          animatedStyle,
          {
            width: height,
            height,
            borderRadius: radii.pill,
            backgroundColor: colors.soft,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDisabled ? 0.5 : 1,
          },
          style,
        ]}
        className={cn(className)}
        {...rest}
      >
        {leftIcon ?? rightIcon ?? children}
      </AnimatedPressable>
    );
  }

  // ghost
  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      {...a11y}
      style={[
        animatedStyle,
        {
          height,
          paddingHorizontal: paddingX,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      className={cn(className)}
      {...rest}
    >
      {content}
    </AnimatedPressable>
  );
};
