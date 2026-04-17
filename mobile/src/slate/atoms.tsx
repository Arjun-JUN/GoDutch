import React from 'react';
import { View, ViewProps, Pressable } from 'react-native';
import { colors } from '../theme/tokens';
import { Text } from './Text';
import { AppSurface } from './AppSurface';
import { AppButton } from './AppButton';
import { cn } from './cn';

/* ---------- IconBadge ---------- */

interface IconBadgeProps {
  icon: React.ReactNode;
  tone?: 'soft' | 'white' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconBadge: React.FC<IconBadgeProps> = ({ icon, tone = 'soft', size = 'md' }) => {
  const dim = size === 'sm' ? 36 : size === 'lg' ? 56 : 44;
  const bg =
    tone === 'white'
      ? colors.surfaceSolid
      : tone === 'primary'
      ? colors.primary
      : tone === 'danger'
      ? colors.dangerSoft
      : colors.soft;
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </View>
  );
};

/* ---------- MemberBadge ---------- */

interface MemberBadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
}

export const MemberBadge: React.FC<MemberBadgeProps> = ({ children, active, onPress }) => {
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? colors.primary : colors.soft,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        variant="label"
        weight="semibold"
        style={{ color: active ? colors.primaryForeground : colors.foreground }}
      >
        {children}
      </Text>
    </Wrapper>
  );
};

/* ---------- StatCard ---------- */

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  /** tone drives both indicator dot + value color. Mirrors web StatCard. */
  tone?: 'default' | 'positive' | 'negative';
  /** Override indicator color (e.g. red for "You owe"). */
  indicatorColor?: string;
  /** Override value color. */
  valueColor?: string;
  /** Kept for compatibility with legacy call sites — rendered in the label row. */
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  tone = 'default',
  indicatorColor,
  valueColor,
  icon,
}) => {
  const dot = indicatorColor ?? (tone === 'negative' ? colors.danger : colors.primary);
  const vColor = valueColor ?? (tone === 'negative' ? colors.danger : colors.primaryStrong);
  return (
    <AppSurface variant="solid" style={{ flex: 1, padding: 20, borderRadius: 28 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon ?? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: dot,
            }}
          />
        )}
        <Text variant="label" weight="semibold" tone="muted">
          {label}
        </Text>
      </View>
      <Text
        weight="extrabold"
        style={{ fontSize: 30, lineHeight: 34, letterSpacing: -1.2, color: vColor }}
      >
        {value}
      </Text>
      {description ? (
        <Text variant="label" tone="muted" style={{ marginTop: 8 }}>
          {description}
        </Text>
      ) : null}
    </AppSurface>
  );
};

/* ---------- EmptyState ---------- */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
    }}
  >
    {icon ? <IconBadge icon={icon} size="lg" tone="soft" /> : null}
    <Text variant="titleLg" style={{ marginTop: 16, textAlign: 'center' }}>
      {title}
    </Text>
    {description ? (
      <Text
        variant="body"
        tone="muted"
        style={{ marginTop: 8, textAlign: 'center', maxWidth: 280 }}
      >
        {description}
      </Text>
    ) : null}
    {action ? (
      <View style={{ marginTop: 20 }}>
        <AppButton variant="primary" size="md" onPress={action.onPress}>
          {action.label}
        </AppButton>
      </View>
    ) : null}
  </View>
);

/* ---------- Callout ---------- */

interface CalloutProps extends ViewProps {
  tone?: 'info' | 'danger' | 'success';
  className?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  tone = 'info',
  className,
  children,
  style,
  ...rest
}) => {
  const bg =
    tone === 'danger' ? colors.dangerSoft : tone === 'success' ? colors.successSoft : colors.soft;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          padding: 16,
          borderRadius: 16,
        },
        style,
      ]}
      className={cn(className)}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          variant="label"
          tone={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'muted'}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

/* ---------- Avatar ---------- */

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'primary';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', tone = 'default' }) => {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 56 : 44;
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: tone === 'primary' ? colors.primary : colors.softStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        variant="label"
        weight="bold"
        style={{ color: tone === 'primary' ? colors.primaryForeground : colors.primary }}
      >
        {initials}
      </Text>
    </View>
  );
};

/* ---------- Divider (invisible spacing marker for list groups) ---------- */

export const Breath: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
  <View style={{ height: size === 'sm' ? 16 : size === 'lg' ? 56 : 32 }} />
);
