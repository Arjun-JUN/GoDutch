import React from 'react';
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { ScrollViewProps, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

type BaseProps = {
  children: React.ReactNode;
  /** Avoid header/tab/bottom insets. Defaults to all sides. */
  edges?: React.ComponentProps<typeof SafeAreaView>['edges'];
  /** Avoid keyboard for forms */
  keyboardAvoiding?: boolean;
};

type ScrollProps = BaseProps & ScrollViewProps & { scrollable: true };
type StaticProps = BaseProps & ViewProps & { scrollable?: false };
type Props = ScrollProps | StaticProps;

export function Screen({ children, edges = ['top', 'bottom'], keyboardAvoiding = false, scrollable = false, style, ...rest }: Props) {
  const theme = useTheme();

  const bg = { backgroundColor: theme.colors.bgBase };

  const content = scrollable ? (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={[styles.fill, bg]}
      contentContainerStyle={styles.scrollContent}
      {...(rest as ScrollViewProps)}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, bg, style as ViewProps['style']]}>
      {children}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  return (
    <SafeAreaView style={[styles.fill, bg]} edges={edges}>
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
