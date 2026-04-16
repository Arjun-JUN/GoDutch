import React from 'react';
import { View } from 'react-native';
import { Receipt, CaretRight } from 'lucide-react-native';
import { colors } from '../theme/tokens';
import { Text } from './Text';
import { InteractiveSurface } from './AppSurface';
import { IconBadge } from './atoms';
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
  amountLabel?: string;
  amount?: number;
  icon?: React.ReactNode;
  currency?: string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  amountLabel = 'Total',
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
    <InteractiveSurface onPress={onPress} compact variant="solid">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <IconBadge
          tone="soft"
          size="md"
          icon={icon ?? <Receipt size={20} color={colors.primary} strokeWidth={2.2} />}
        />
        <View style={{ flex: 1 }}>
          <Text variant="title" weight="bold" numberOfLines={1}>
            {title}
          </Text>
          {date ? (
            <Text variant="label" tone="subtle" style={{ marginTop: 2 }}>
              {date}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="eyebrow" tone="subtle">
            {amountLabel}
          </Text>
          <Text variant="title" weight="extrabold" style={{ marginTop: 2 }}>
            {sym}
            {displayAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </InteractiveSurface>
  );
};
