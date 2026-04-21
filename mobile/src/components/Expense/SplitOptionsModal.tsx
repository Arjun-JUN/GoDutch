import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Users, Percent, ListTodo, Equal, Check } from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  Participant,
  SplitMode,
  SplitBetweenItem,
  LineItem,
} from '../../utils/splitting';
import { ItemSplitSection } from './ItemSplitSection';
import { Text } from '../../slate/Text';
import { AppButton } from '../../slate/AppButton';
import { Avatar } from '../../slate/atoms';
import { colors, radii, spacing } from '../../theme/tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SplitOptionsModalProps {
  visible: boolean;
  onClose: (data: {
    splitMode: SplitMode;
    splitBetween: SplitBetweenItem[];
    items: LineItem[];
  }) => void;
  members: Participant[];
  splitBetween: SplitBetweenItem[];
  splitMode: SplitMode;
  totalAmount: string;
  currencySymbol: string;
  items: LineItem[];
}

export const SplitOptionsModal: React.FC<SplitOptionsModalProps> = ({
  visible,
  onClose,
  members,
  splitBetween,
  splitMode,
  totalAmount,
  currencySymbol,
  items,
}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [localMode, setLocalMode] = useState<SplitMode>(splitMode);
  const [localSplit, setLocalSplit] = useState<SplitBetweenItem[]>([]);
  const [localItems, setLocalItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (visible) {
      setLocalMode(splitMode);
      setLocalSplit(splitBetween);
      setLocalItems(items);
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible, splitBetween, splitMode, items]);

  const toggleMember = (memberId: string) => {
    const existing = localSplit.find((s) => s.user_id === memberId);
    if (existing) {
      setLocalSplit(localSplit.filter((s) => s.user_id !== memberId));
    } else {
      setLocalSplit([...localSplit, { user_id: memberId, amount: '', shares: 1 }]);
    }
  };

  const updateField = (memberId: string, field: keyof SplitBetweenItem, value: any) => {
    setLocalSplit(
      localSplit.map((s) => (s.user_id === memberId ? { ...s, [field]: value } : s))
    );
  };

  const handleDone = useCallback(() => {
    onClose({ splitMode: localMode, splitBetween: localSplit, items: localItems });
  }, [onClose, localMode, localSplit, localItems]);

  const totalRaw = parseFloat(totalAmount) || 0;
  const selectedCount = localSplit.length;

  const totalEntered = localSplit.reduce(
    (s, p) => s + (parseFloat(p.amount?.toString() || '0') || 0),
    0
  );
  const remaining = totalRaw - totalEntered;
  const totalShares = localSplit.reduce(
    (s, p) => s + (parseInt(p.shares?.toString() || '1') || 1),
    0
  );

  const tabs: { label: string; mode: SplitMode; Icon: any }[] = [
    { label: 'Equally', mode: 'equally', Icon: Equal },
    { label: 'Unequally', mode: 'unequally', Icon: Percent },
    { label: 'Shares', mode: 'byshares', Icon: Users },
    { label: 'Items', mode: 'item-based', Icon: ListTodo },
  ];

  const modeDescription: Record<SplitMode, string> = {
    equally: 'Everyone owes the same amount.',
    unequally: "Set each person's exact share.",
    byshares: 'More shares = bigger slice of the bill.',
    'item-based': 'Assign each item to whoever ordered it.',
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['70%', '92%']}
      enablePanDownToClose
      onClose={() => onClose({ splitMode, splitBetween, items })}
      backgroundStyle={{ backgroundColor: colors.surfaceSolid }}
      handleIndicatorStyle={{ backgroundColor: colors.softStrong, width: 36 }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text variant="titleLg" weight="extrabold">Split options</Text>
          <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
            {selectedCount} of {members.length} people
          </Text>
        </View>
        <AppButton variant="secondary" size="sm" onPress={handleDone} haptic>
          Done
        </AppButton>
      </View>

      {/* Mode tabs */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: spacing.lg,
          backgroundColor: colors.soft,
          borderRadius: radii.md,
          padding: spacing.xs,
          marginBottom: spacing.md,
          gap: spacing.xs,
        }}
      >
        {tabs.map(({ label, mode, Icon }) => {
          const isActive = localMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setLocalMode(mode);
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.sm,
                borderRadius: radii.md,
                backgroundColor: isActive ? colors.primary : 'transparent',
                gap: spacing.xs,
              }}
            >
              <Icon
                size={14}
                color={isActive ? colors.primaryForeground : colors.mutedSubtle}
                strokeWidth={2.4}
              />
              <Text
                variant="label"
                weight="semibold"
                style={{
                  color: isActive ? colors.primaryForeground : colors.mutedSubtle,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing['2xl'],
          flexGrow: 1,
        }}
      >
        <Text variant="label" tone="subtle" style={{ marginBottom: spacing.md, fontStyle: 'italic' }}>
          {modeDescription[localMode]}
        </Text>

        {localMode === 'item-based' ? (
          <ItemSplitSection
            items={localItems}
            onItemsChange={setLocalItems}
            members={members}
            currencySymbol={currencySymbol}
            totalAmount={totalAmount}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {members.map((member) => {
              const splitEntry = localSplit.find((s) => s.user_id === member.id);
              const isSelected = !!splitEntry;

              return (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => toggleMember(member.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderRadius: radii.md,
                    backgroundColor: isSelected ? colors.soft : colors.backgroundStart,
                    gap: spacing.s12,
                  }}
                >
                  <Avatar name={member.name} size="sm" tone={isSelected ? 'primary' : 'default'} />
                  <View style={{ flex: 1 }}>
                    <Text variant="title" weight="semibold">{member.name}</Text>
                    {localMode === 'equally' && isSelected && (
                      <Text variant="label" style={{ color: colors.primary, marginTop: spacing.xs }}>
                        {currencySymbol}
                        {(totalRaw / Math.max(1, selectedCount)).toFixed(2)}
                      </Text>
                    )}
                    {localMode === 'byshares' && isSelected && (
                      <Text variant="label" style={{ color: colors.primary, marginTop: spacing.xs }}>
                        {currencySymbol}
                        {(
                          totalShares > 0
                            ? ((parseInt(splitEntry!.shares?.toString() || '1') / totalShares) *
                                totalRaw)
                            : 0
                        ).toFixed(2)}
                      </Text>
                    )}
                  </View>

                  {localMode === 'unequally' && isSelected && (
                    <TextInput
                      style={{
                        backgroundColor: colors.surfaceSolid,
                        color: colors.foreground,
                        paddingHorizontal: spacing.s12,
                        paddingVertical: spacing.sm,
                        borderRadius: radii.md,
                        width: 80,
                        textAlign: 'right',
                        fontFamily: 'Manrope_600SemiBold',
                        fontSize: 14,
                      }}
                      placeholder="0.00"
                      placeholderTextColor={colors.mutedSubtle}
                      keyboardType="numeric"
                      value={splitEntry?.amount?.toString() || ''}
                      onChangeText={(val) => updateField(member.id, 'amount', val)}
                    />
                  )}

                  {localMode === 'byshares' && isSelected && (
                    <TextInput
                      style={{
                        backgroundColor: colors.surfaceSolid,
                        color: colors.foreground,
                        paddingHorizontal: spacing.s12,
                        paddingVertical: spacing.sm,
                        borderRadius: radii.md,
                        width: 56,
                        textAlign: 'center',
                        fontFamily: 'Manrope_600SemiBold',
                        fontSize: 14,
                      }}
                      placeholder="1"
                      placeholderTextColor={colors.mutedSubtle}
                      keyboardType="numeric"
                      value={splitEntry?.shares?.toString() || '1'}
                      onChangeText={(val) => updateField(member.id, 'shares', val)}
                    />
                  )}

                  <View
                    style={{
                      width: spacing.lg,
                      height: spacing.lg,
                      borderRadius: radii.md,
                      backgroundColor: isSelected ? colors.primary : colors.soft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Check size={14} color={colors.primaryForeground} strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Balance indicator for unequal / byshares */}
            {(localMode === 'unequally' || localMode === 'byshares') && (
              <View
                style={{
                  marginTop: spacing.sm,
                  padding: spacing.md,
                  borderRadius: radii.md,
                  backgroundColor:
                    localMode === 'unequally' && Math.abs(remaining) >= 0.01
                      ? colors.dangerSoft
                      : colors.soft,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text variant="label" tone="muted">
                  {localMode === 'unequally' ? 'Remaining' : 'Total shares'}
                </Text>
                <Text
                  variant="title"
                  weight="extrabold"
                  style={{
                    color:
                      localMode === 'unequally' && Math.abs(remaining) >= 0.01
                        ? colors.danger
                        : colors.foreground,
                  }}
                >
                  {localMode === 'unequally'
                    ? `${currencySymbol}${Math.abs(remaining).toFixed(2)}${remaining < -0.01 ? ' over' : ''}`
                    : totalShares}
                </Text>
              </View>
            )}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
