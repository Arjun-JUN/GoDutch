import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing } from '../theme/tokens';
import { AppButton } from './AppButton';
import { Text } from './Text';

interface HeaderProps {
  title?: string;
  eyebrow?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

/**
 * In-page header with back button, title, optional right action.
 * Lives inside the page — not a native stack header (those are disabled globally).
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  eyebrow,
  showBack = true,
  onBack,
  right,
}) => {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
      }}
    >
      <View style={{ width: 44 }}>
        {showBack ? (
          <AppButton
            variant="icon"
            size="sm"
            onPress={handleBack}
            haptic
            leftIcon={<ArrowLeft size={18} color={colors.foreground} strokeWidth={2.4} />}
          />
        ) : null}
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {eyebrow ? (
          <Text variant="eyebrow" tone="muted">
            {eyebrow}
          </Text>
        ) : null}
        {title ? (
          <Text variant="title" weight="bold">
            {title}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
};
