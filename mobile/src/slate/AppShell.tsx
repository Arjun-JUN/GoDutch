import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/tokens';
import { cn } from './cn';

interface AppShellProps extends ViewProps {
  edges?: Edge[];
  /** Disable the gradient background (for screens with their own bg). */
  flat?: boolean;
}

/**
 * Full-screen page wrapper. Applies the Slate ambient-luminosity gradient and
 * safe-area insets. Honors no-line rule (no border, just color shifts).
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  className,
  edges = ['top'],
  flat = false,
  ...rest
}) => {
  const inner = (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1 }}
      className={cn('flex-1', className)}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );

  if (flat) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.backgroundStart }}>{inner}</View>
    );
  }

  return (
    <LinearGradient
      colors={gradients.background}
      style={{ flex: 1 }}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {inner}
    </LinearGradient>
  );
};

interface PageContentProps extends ViewProps {
  /** Horizontal padding preset. */
  padded?: boolean;
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  className,
  padded = true,
  ...rest
}) => (
  <View
    className={cn('flex-1', padded && 'px-6', className)}
    {...rest}
  >
    {children}
  </View>
);
