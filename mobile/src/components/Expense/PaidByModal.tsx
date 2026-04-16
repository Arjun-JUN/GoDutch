import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Check, AlertCircle } from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text } from '../../slate/Text';
import { AppButton } from '../../slate/AppButton';
import { Avatar } from '../../slate/atoms';
import { Callout } from '../../slate/atoms';
import { colors } from '../../theme/tokens';

export interface Payer {
  user_id: string;
  amount: string;
}

interface PaidByModalProps {
  visible: boolean;
  onClose: (paidBy: Payer[]) => void;
  members: Array<{ id: string; name: string }>;
  paidBy: Payer[];
  totalAmount: string;
  currencySymbol: string;
}

export const PaidByModal: React.FC<PaidByModalProps> = ({
  visible,
  onClose,
  members,
  paidBy,
  totalAmount,
  currencySymbol,
}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [localPaidBy, setLocalPaidBy] = useState<Payer[]>([]);
  const [showUnequal, setShowUnequal] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalPaidBy(paidBy);
      setShowUnequal(paidBy.length > 1);
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible, paidBy]);

  const toggleMember = (memberId: string) => {
    const existing = localPaidBy.find((p) => p.user_id === memberId);
    if (existing) {
      setLocalPaidBy(localPaidBy.filter((p) => p.user_id !== memberId));
    } else {
      setLocalPaidBy([...localPaidBy, { user_id: memberId, amount: '' }]);
    }
  };

  const updateAmount = (memberId: string, amount: string) => {
    setLocalPaidBy(
      localPaidBy.map((p) => (p.user_id === memberId ? { ...p, amount } : p))
    );
  };

  const handleDone = useCallback(() => {
    onClose(localPaidBy);
  }, [onClose, localPaidBy]);

  const totalEntered = localPaidBy.reduce(
    (s, p) => s + (parseFloat(p.amount) || 0),
    0
  );
  const totalRaw = parseFloat(totalAmount) || 0;
  const remaining = totalRaw - totalEntered;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['65%', '85%']}
      enablePanDownToClose
      onClose={() => onClose(paidBy)}
      backgroundStyle={{ backgroundColor: colors.surfaceSolid }}
      handleIndicatorStyle={{ backgroundColor: colors.softStrong, width: 36 }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text variant="titleLg" weight="extrabold">Who paid?</Text>
          <Text variant="label" tone="subtle" style={{ marginTop: 2 }}>
            {localPaidBy.length} selected
          </Text>
        </View>
        <AppButton variant="secondary" size="sm" onPress={handleDone} haptic>
          Done
        </AppButton>
      </View>

      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {localPaidBy.length === 0 && (
          <Callout tone="danger" style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color={colors.danger} />
              <Text variant="label" tone="danger">Select at least one person.</Text>
            </View>
          </Callout>
        )}

        <View style={{ gap: 8 }}>
          {members.map((member) => {
            const payer = localPaidBy.find((p) => p.user_id === member.id);
            const isSelected = !!payer;

            return (
              <TouchableOpacity
                key={member.id}
                onPress={() => toggleMember(member.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: isSelected ? colors.soft : colors.backgroundStart,
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected ? colors.softStrong : colors.border,
                  gap: 12,
                }}
              >
                <Avatar name={member.name} size="sm" tone={isSelected ? 'primary' : 'default'} />
                <Text variant="title" weight="semibold" style={{ flex: 1 }}>
                  {member.name}
                </Text>

                {showUnequal && isSelected && (
                  <TextInput
                    style={{
                      backgroundColor: colors.surfaceSolid,
                      color: colors.foreground,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                      width: 80,
                      textAlign: 'right',
                      fontFamily: 'Manrope_600SemiBold',
                      fontSize: 14,
                    }}
                    placeholder="0.00"
                    placeholderTextColor={colors.mutedSubtle}
                    keyboardType="numeric"
                    value={payer?.amount}
                    onChangeText={(val) => updateAmount(member.id, val)}
                  />
                )}

                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: isSelected ? 0 : 1.5,
                    borderColor: colors.softStrong,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Check size={14} color={colors.primaryForeground} strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {localPaidBy.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowUnequal(!showUnequal)}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 16,
              backgroundColor: colors.soft,
              alignItems: 'center',
            }}
          >
            <Text variant="label" weight="semibold" style={{ color: colors.primary }}>
              {showUnequal ? 'Hide amounts' : 'Set unequal amounts'}
            </Text>
          </TouchableOpacity>
        )}

        {showUnequal && localPaidBy.length > 1 && (
          <View
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: remaining < -0.01 ? colors.dangerSoft : colors.successSoft,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="label" tone="muted">Remaining</Text>
            <Text
              variant="title"
              weight="extrabold"
              style={{ color: remaining < -0.01 ? colors.danger : colors.success }}
            >
              {currencySymbol}{Math.abs(remaining).toFixed(2)}
              {remaining < -0.01 ? ' over' : ''}
            </Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
