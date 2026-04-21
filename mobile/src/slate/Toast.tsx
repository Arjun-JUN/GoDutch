import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Check, AlertCircle } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import { Text } from './Text';

type Tone = 'success' | 'danger' | 'neutral';

interface ToastProps {
  /** When set, the toast is visible. When null/undefined, it is hidden. */
  message: string | null | undefined;
  tone?: Tone;
  /** Auto-dismiss after this many ms. Defaults to 2400. */
  durationMs?: number;
  /** Called when the toast auto-dismisses or the user taps to dismiss. */
  onHide: () => void;
}

const toneIcon: Record<Tone, React.ReactNode> = {
  success: <Check size={18} color={colors.primaryForeground} strokeWidth={3} />,
  danger: <AlertCircle size={18} color={colors.primaryForeground} strokeWidth={2.4} />,
  neutral: null,
};

const toneBg: Record<Tone, string> = {
  success: colors.success,
  danger: colors.danger,
  neutral: colors.foreground,
};

/**
 * Slate Toast — confirmation chip. Slides up from the bottom, auto-dismisses in 2.4s.
 * Respects reduce-motion (fades instead of sliding). Screen-reader announces politely.
 *
 * Use for every user action that mutates state: create, save, send, copy, settle.
 * Silent success is a bug — see DESIGN_RULES/components/interaction-states.md.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  tone = 'success',
  durationMs = 2400,
  onHide,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (message) {
      timer.current = setTimeout(onHide, durationMs);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [message, durationMs, onHide]);

  if (!message) return null;

  const Entering = reducedMotion ? FadeIn.duration(200) : SlideInDown.springify().damping(18);
  const Exiting = reducedMotion ? FadeOut.duration(200) : SlideOutDown.duration(250);

  return (
    <Animated.View
      entering={Entering}
      exiting={Exiting}
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: spacing.xl,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
      }}
    >
      <Pressable
        onPress={onHide}
        accessible
        accessibilityLabel={message}
        accessibilityHint="Tap to dismiss"
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.s12,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.s12,
          borderRadius: radii.pill,
          backgroundColor: toneBg[tone],
          maxWidth: 420,
          ...shadows.card,
        }}
      >
        {toneIcon[tone] ? (
          <View
            style={{
              width: spacing.lg,
              height: spacing.lg,
              borderRadius: radii.pill,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {toneIcon[tone]}
          </View>
        ) : null}
        <Text variant="label" weight="bold" style={{ color: colors.primaryForeground, flexShrink: 1 }}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
