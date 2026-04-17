import React from 'react';
import { View, Pressable } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { colors, shadows } from '../theme/tokens';
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
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        padding: 16,
        borderRadius: 32,
        backgroundColor: pressed ? colors.soft : colors.surfaceSolid,
        ...shadows.cardSm,
      })}
    >
      {/* Left: icon tile + title column */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: '#e9efee',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon ?? <Receipt size={24} color={colors.foreground} strokeWidth={2} />}
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <Text
            weight="extrabold"
            numberOfLines={2}
            style={{ fontSize: 17, lineHeight: 20, letterSpacing: -0.3 }}
          >
            {title}
          </Text>
          {date ? (
            <Text
              weight="semibold"
              style={{ marginTop: 6, fontSize: 13, color: colors.foreground, opacity: 0.6 }}
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
          paddingLeft: 8,
          flexShrink: 0,
        }}
      >
        <Text
          weight="extrabold"
          style={{
            fontSize: 13,
            lineHeight: 14,
            color: colors.foreground,
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          {sym}
        </Text>
        <Text
          weight="extrabold"
          style={{
            fontSize: 24,
            lineHeight: 24,
            letterSpacing: -1,
            color: colors.foreground,
          }}
        >
          {displayAmount.toFixed(2)}
        </Text>
        <Text
          weight="bold"
          style={{
            marginTop: 8,
            fontSize: 10,
            lineHeight: 12,
            letterSpacing: 1.5,
            color: colors.foreground,
            opacity: 0.5,
            textAlign: 'right',
            maxWidth: 64,
            textTransform: 'uppercase',
          }}
        >
          {amountLabel ?? 'Your share'}
        </Text>
      </View>
    </Pressable>
  );
};
