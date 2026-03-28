import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
};

export function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  clearable = false,
  value,
  onChangeText,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.borderNegative
    : focused
    ? theme.colors.borderFocus
    : theme.colors.borderDefault;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputRow,
          {
            borderColor,
            borderWidth: focused || error ? 1.5 : 1,
            backgroundColor: theme.colors.bgSurface,
          },
        ]}
      >
        {leftIcon && <View style={styles.adornment}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              flex: 1,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          {...rest}
        />
        {clearable && value ? (
          <TouchableOpacity onPress={() => onChangeText?.('')} style={styles.adornment}>
            <Icon name="close" size="sm" color="textMuted" />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.adornment}>{rightIcon}</View>
        ) : null}
      </View>
      {(error || helper) && (
        <Text
          variant="caption"
          color={error ? 'textNegative' : 'textMuted'}
          style={styles.hint}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  label: {
    marginBottom: spacing[1],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    minHeight: 48,
    paddingHorizontal: spacing[3],
  },
  input: {
    fontSize: 15,
    paddingVertical: spacing[3],
  },
  adornment: {
    paddingHorizontal: spacing[1],
  },
  hint: {
    marginTop: spacing[1],
  },
});
