import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { Row } from '../layout/Row';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { zIndex } from '../tokens/z-index';
import type { IconName } from '../primitives/Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastData = {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
};

type Props = ToastData & {
  onHide: (id: string) => void;
};

const ICON: Record<ToastType, IconName> = {
  success: 'check-circle',
  error: 'error-filled',
  info: 'info-filled',
  warning: 'warning-filled',
};

export function Toast({ id, message, type = 'info', duration = 3000, onHide }: Props) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => onHide(id));
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const iconColor = {
    success: 'textPositive',
    error: 'textNegative',
    info: 'textBrand',
    warning: 'textWarning',
  }[type] as 'textPositive' | 'textNegative' | 'textBrand' | 'textWarning';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgSurface,
          transform: [{ translateY }],
          opacity,
        },
        theme.shadows.lg,
      ]}
    >
      <Row gap={3} align="center">
        <Icon name={ICON[type]} size="md" color={iconColor} />
        <Text variant="label" color="textPrimary" style={styles.message}>
          {message}
        </Text>
      </Row>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    padding: spacing[4],
    borderRadius: radius.xl,
    zIndex: zIndex.toast,
  },
  message: { flex: 1 },
});
