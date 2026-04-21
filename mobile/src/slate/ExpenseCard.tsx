import React from 'react';
import { View, Pressable } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import { Text } from './Text';
import { getCurrencySymbol } from '../utils/constants';

interface ExpenseCardProps {
  expense: {
    id: string;
    merchant?: string;
    description?: string;
    total_amount: number;
    date?: string;
    created_at?: string;
    category?: string;
  };
  onPress?: () => void;
  /** Eyebrow label above the amount. Defaults to "YOUR SHARE" (matches web). */
  amountLabel?: React.ReactNode;
  /** Override the displayed amount (e.g. user's share rather than total). */
  amount?: number;
  icon?: React.ReactNode;
  currency?: string;
}

/**
 * Mirrors the web ExpenseCard: rounded-square soft icon tile on the left,
 * two-line merchant + date in the center, right-aligned "Rs / amount / eyebrow".
 *
 * Uses Text variants for all typography — no inline fontSize.
 */
export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  amountLabel,
  amount,
  icon,
  currency = 'INR',
}) => {
  const displayAmount = amount ?? expense.total_amount ?? 0;
  const title = expense.merchant || expense.description || 'Expense';
  const date =
    expense.date ||
    (expense.created_at ? new Date(expense.created_at).toLocaleDateString() : '');
  const sym = getCurrencySymbol(currency);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: spacing.s12,
        padding: spacing.md,
        borderRadius: radii['2xl'],
        backgroundColor: pressed ? colors.soft : colors.surfaceSolid,
        ...shadows.cardSm,
      })}
    >
      {/* Left: icon tile + title column */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radii.md + spacing.xs,
            backgroundColor: colors.softHighest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon ?? <Receipt size={24} color={colors.foreground} strokeWidth={2} />}
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingRight: spacing.sm }}>
          <Text variant="titleSm" weight="extrabold" numberOfLines={2}>
            {title}
          </Text>
          {date ? (
            <Text
              variant="label"
              weight="semibold"
              tone="subtle"
              style={{ marginTop: spacing.xs }}
            >
              {date}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right: Rs / amount / YOUR SHARE eyebrow */}
      <View
        style={{
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingLeft: spacing.sm,
          flexShrink: 0,
        }}
      >
        <Text
          variant="label"
          weight="extrabold"
          style={{ color: colors.foreground, opacity: 0.8, marginBottom: spacing.xs }}
        >
          {sym}
        </Text>
        <Text variant="amount" style={{ color: colors.foreground }}>
          {displayAmount.toFixed(2)}
        </Text>
        <Text
          variant="eyebrowSm"
          weight="bold"
          style={{
            marginTop: spacing.sm,
            color: colors.foreground,
            opacity: 0.5,
            textAlign: 'right',
            maxWidth: 64,
          }}
        >
          {amountLabel ?? 'Your share'}
        </Text>
      </View>
    </Pressable>
  );
};
