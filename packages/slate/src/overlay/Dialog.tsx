import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { Button } from '../primitives/Button';
import { Stack } from '../layout/Stack';
import { Row } from '../layout/Row';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { zIndex } from '../tokens/z-index';

type Action = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

type Props = {
  visible: boolean;
  title: string;
  body?: string;
  confirm: Action;
  cancel?: Action;
  onDismiss?: () => void;
};

export function Dialog({ visible, title, body, confirm, cancel, onDismiss }: Props) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: theme.colors.bgOverlay }]}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <TouchableOpacity activeOpacity={1}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.bgSurface,
              },
              theme.shadows.xl,
            ]}
          >
            <Stack gap={2}>
              <Text variant="heading4" color="textPrimary">
                {title}
              </Text>
              {body && (
                <Text variant="body" color="textSecondary">
                  {body}
                </Text>
              )}
            </Stack>
            <Row gap={2} justify="flex-end" style={styles.actions}>
              {cancel && (
                <Button
                  label={cancel.label}
                  variant={cancel.variant ?? 'ghost'}
                  onPress={cancel.onPress}
                />
              )}
              <Button
                label={confirm.label}
                variant={confirm.variant ?? 'primary'}
                onPress={confirm.onPress}
              />
            </Row>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    zIndex: zIndex.modal,
  },
  card: {
    borderRadius: radius['2xl'],
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
  },
  actions: {
    marginTop: spacing[6],
  },
});
