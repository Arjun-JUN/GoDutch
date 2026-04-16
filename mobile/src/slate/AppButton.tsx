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
import { colors, gradients, shadows } from '../theme/tokens';
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

const sizeStyles: Record<Size, { height: number; paddingX: number; textSize: number }> = {
  sm: { height: 40, paddingX: 18, textSize: 14 },
  md: { height: 52, paddingX: 24, textSize: 15 },
  lg: { height: 60, paddingX: 32, textSize: 17 },
  icon: { height: 48, paddingX: 0, textSize: 14 },
};

/**
 * Slate primary button — gradient pill, Reanimated press scale, reduced-motion aware.
 * The gradient primary is the visual signature of the design system.
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
  const { height, paddingX, textSize } = sizeStyles[size];

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

  const content = (
    <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.primaryForeground : colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          {children ? (
            <Text
              weight="bold"
              style={{
                fontSize: textSize,
                color:
                  variant === 'primary' || variant === 'danger'
                    ? colors.primaryForeground
                    : variant === 'secondary'
                    ? colors.primary
                    : variant === 'ghost'
                    ? colors.primary
                    : colors.primary,
              }}
            >
              {children}
            </Text>
          ) : null}
          {rightIcon}
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        style={[
          animatedStyle,
          {
            borderRadius: 999,
            overflow: 'hidden',
            ...shadows.button,
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        className={cn(className)}
        {...rest}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height,
            paddingHorizontal: paddingX,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {content}
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
        style={[
          animatedStyle,
          {
            height,
            paddingHorizontal: paddingX,
            borderRadius: 999,
            backgroundColor: colors.danger,
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

  if (variant === 'secondary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        style={[
          animatedStyle,
          {
            height,
            paddingHorizontal: paddingX,
            borderRadius: 999,
            backgroundColor: colors.primaryContainer,
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
        style={[
          animatedStyle,
          {
            width: height,
            height,
            borderRadius: 999,
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
