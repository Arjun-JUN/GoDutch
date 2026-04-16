import React, { useState } from 'react';
import { View, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';
import { Text } from './Text';
import { cn } from './cn';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Form field wrapper — label above, hint/error below.
 * Icons are handled by AppInput directly via leftIcon/rightIcon props.
 */
export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  className,
  style,
  children,
}) => (
  <View style={style} className={cn(className)}>
    {label ? (
      <Text variant="label" weight="semibold" tone="muted" style={{ marginBottom: 8, paddingHorizontal: 4 }}>
        {label}
      </Text>
    ) : null}
    {children}
    {error ? (
      <Text variant="label" tone="danger" style={{ marginTop: 4, paddingHorizontal: 4 }}>
        {error}
      </Text>
    ) : hint ? (
      <Text variant="label" tone="subtle" style={{ marginTop: 4, paddingHorizontal: 4 }}>
        {hint}
      </Text>
    ) : null}
  </View>
);

interface AppInputProps extends TextInputProps {
  /** Optional icon rendered on the left side inside the input. */
  leftIcon?: React.ReactNode;
  /** Optional icon rendered on the right side inside the input. */
  rightIcon?: React.ReactNode;
  invalid?: boolean;
  className?: string;
}

/**
 * Soft-fill input, no border (no-line rule). Focus shifts bg to soft-strong.
 * Accepts leftIcon / rightIcon which are absolutely positioned inside the field.
 */
export const AppInput = React.forwardRef<TextInput, AppInputProps>(
  ({ leftIcon, rightIcon, invalid, className, style, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasLeft = !!leftIcon;
    const hasRight = !!rightIcon;

    return (
      <View style={{ position: 'relative' }}>
        {hasLeft && (
          <View
            style={{
              position: 'absolute',
              left: 14,
              top: 0,
              bottom: 0,
              zIndex: 10,
              justifyContent: 'center',
            }}
          >
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.mutedSubtle}
          style={[
            {
              height: 52,
              borderRadius: 14,
              backgroundColor: invalid
                ? colors.dangerSoft
                : focused
                ? colors.softStrong
                : colors.soft,
              paddingLeft: hasLeft ? 46 : 16,
              paddingRight: hasRight ? 46 : 16,
              color: colors.foreground,
              fontFamily: 'Manrope_500Medium',
              fontSize: 15,
            },
            style,
          ]}
          className={cn(className)}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {hasRight && (
          <View
            style={{
              position: 'absolute',
              right: 14,
              top: 0,
              bottom: 0,
              zIndex: 10,
              justifyContent: 'center',
            }}
          >
            {rightIcon}
          </View>
        )}
      </View>
    );
  }
);
AppInput.displayName = 'AppInput';

interface AppTextareaProps extends TextInputProps {
  rows?: number;
  invalid?: boolean;
}

export const AppTextarea = React.forwardRef<TextInput, AppTextareaProps>(
  ({ rows = 4, invalid, style, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <TextInput
        ref={ref}
        multiline
        placeholderTextColor={colors.mutedSubtle}
        textAlignVertical="top"
        style={[
          {
            minHeight: rows * 22 + 24,
            borderRadius: 14,
            backgroundColor: invalid
              ? colors.dangerSoft
              : focused
              ? colors.softStrong
              : colors.soft,
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: colors.foreground,
            fontFamily: 'Manrope_500Medium',
            fontSize: 15,
          },
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        {...rest}
      />
    );
  }
);
AppTextarea.displayName = 'AppTextarea';
