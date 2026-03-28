import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export function Chip({ label, selected = false, onPress, disabled = false }: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.brand : theme.colors.bgSurface,
          borderColor: selected ? theme.colors.brand : theme.colors.borderDefault,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        variant="label"
        color={selected ? 'textInverse' : 'textSecondary'}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
  },
});
