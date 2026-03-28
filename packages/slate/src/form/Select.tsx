import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { Row } from '../layout/Row';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  label?: string;
  options: SelectOption<T>[];
  value?: T;
  onSelect: (value: T) => void;
  placeholder?: string;
  error?: string;
};

export function Select<T extends string>({ label, options, value, onSelect, placeholder = 'Select...', error }: Props<T>) {
  const theme = useTheme();
  const selected = options.find(o => o.value === value);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.control,
          {
            backgroundColor: theme.colors.bgSurface,
            borderColor: error ? theme.colors.borderNegative : theme.colors.borderDefault,
          },
        ]}
      >
        <Row justify="space-between" align="center" style={styles.inner}>
          <Text variant="body" color={selected ? 'textPrimary' : 'textMuted'}>
            {selected?.label ?? placeholder}
          </Text>
          <Icon name="chevron-down" size="sm" color="textMuted" />
        </Row>
      </TouchableOpacity>
      {error && (
        <Text variant="caption" color="textNegative" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing[1] },
  label: { marginBottom: spacing[1] },
  control: {
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
  },
  inner: { flex: 1 },
  error: { marginTop: spacing[1] },
});
