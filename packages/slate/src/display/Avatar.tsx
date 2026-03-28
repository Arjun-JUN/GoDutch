import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../primitives/Text';
import { radius } from '../tokens/radius';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<AvatarSize, number> = { xs: 20, sm: 28, md: 36, lg: 48, xl: 64 };
const FONT_SIZE: Record<AvatarSize, number> = { xs: 8, sm: 11, md: 14, lg: 18, xl: 24 };

type Props = {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  /** Renders a dashed border to indicate guest status */
  isGuest?: boolean;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  return ((parts[0] ?? '')[0] ?? '') + ((parts[parts.length - 1] ?? '')[0] ?? '').toUpperCase();
}

export function Avatar({ uri, name = '', size = 'md', isGuest = false }: Props) {
  const theme = useTheme();
  const px = SIZE_PX[size];
  const fontSize = FONT_SIZE[size];
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: px,
          height: px,
          borderRadius: radius.full,
          backgroundColor: theme.colors.bgSurfaceAlt,
          borderWidth: isGuest ? 1.5 : 0,
          borderStyle: isGuest ? 'dashed' : 'solid',
          borderColor: isGuest ? theme.colors.textMuted : 'transparent',
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius.full }]}
        />
      ) : (
        <Text
          style={{ fontSize, fontWeight: '600', color: theme.colors.textSecondary }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
