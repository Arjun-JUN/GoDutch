import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { Plus, Trash, ChevronDown, ChevronUp, Check, Zap } from 'lucide-react-native';
import { LineItem, Participant } from '../../utils/splitting';
import { api } from '../../api/client';
import { Text } from '../../slate/Text';
import { colors, radii, spacing } from '../../theme/tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ItemSplitSectionProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  members: Participant[];
  currencySymbol: string;
  totalAmount: string;
}

export const ItemSplitSection: React.FC<ItemSplitSectionProps> = ({
  items,
  onItemsChange,
  members,
  currencySymbol,
  totalAmount,
}) => {
  const [smartInput, setSmartInput] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const addItem = () => {
    const newItem: LineItem = {
      name: '',
      price: '',
      quantity: 1,
      assigned_to: [],
      split_type: 'equal',
    };
    onItemsChange([...items, newItem]);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIdx(items.length);
  };

  const removeItem = (idx: number) => {
    onItemsChange(items.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    onItemsChange(next);
  };

  const toggleParticipant = (itemIdx: number, memberId: string) => {
    const next = [...items];
    const item = { ...next[itemIdx] };
    const assigned = item.assigned_to ?? [];
    item.assigned_to = assigned.includes(memberId)
      ? assigned.filter((id) => id !== memberId)
      : [...assigned, memberId];
    next[itemIdx] = item;
    onItemsChange(next);
  };

  /** Smart split via backend — replaces the deleted direct Gemini call. */
  const handleAIQuery = async () => {
    if (!smartInput.trim()) return;
    setLoadingAI(true);
    try {
      const result = await api.post('/ai/smart-split', {
        prompt: smartInput,
        members: members.map((m) => ({ id: m.id, name: m.name })),
        context: { total_amount: totalAmount, current_items: items },
      });

      if (result?.split_plan?.items) {
        const next = [...items];
        result.split_plan.items.forEach((newItem: any) => {
          const idx = next.findIndex(
            (i) => i.name.toLowerCase() === newItem.name.toLowerCase()
          );
          if (idx > -1) {
            next[idx] = { ...next[idx], ...newItem };
          } else {
            next.push({
              ...newItem,
              assigned_to: newItem.assigned_to ?? [],
              split_type: 'equal',
            });
          }
        });
        onItemsChange(next);
        setSmartInput('');
      }
    } catch (e) {
      console.error('AI Split failed:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  const itemsTotal = items.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.price.toString()) || 0) *
        (parseInt(item.quantity.toString()) || 1),
    0
  );
  const diff = (parseFloat(totalAmount) || 0) - itemsTotal;

  return (
    <View style={{ flex: 1 }}>
      {/* Smart split input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.soft,
          borderRadius: radii.md,
          padding: spacing.s12,
          marginBottom: spacing.s20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.softStrong,
            padding: spacing.sm,
            borderRadius: radii.pill,
            marginRight: spacing.s12,
          }}
        >
          <Zap size={16} color={colors.primary} fill={colors.primary} />
        </View>
        <TextInput
          style={{ flex: 1, color: colors.foreground, fontSize: 14, fontFamily: 'Manrope_400Regular' }}
          placeholder="e.g. 'Split pizza between Arjun…'"
          placeholderTextColor={colors.mutedSubtle}
          value={smartInput}
          onChangeText={setSmartInput}
          onSubmitEditing={handleAIQuery}
        />
        {smartInput.length > 0 && (
          <TouchableOpacity onPress={handleAIQuery} disabled={loadingAI}>
            {loadingAI ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text variant="label" weight="semibold" style={{ color: colors.primary, paddingHorizontal: 8 }}>
                Split
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {items.map((item, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <View
              key={idx}
              style={{
                backgroundColor: colors.surfaceSolid,
                borderRadius: radii.md,
                marginBottom: spacing.s12,
                overflow: 'hidden',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md }}>
                <TextInput
                  style={{
                    flex: 1,
                    color: colors.foreground,
                    fontSize: 15,
                    fontFamily: 'Manrope_600SemiBold',
                    marginRight: spacing.sm,
                  }}
                  placeholder="Item name"
                  placeholderTextColor={colors.mutedSubtle}
                  value={item.name}
                  onChangeText={(val) => updateItem(idx, 'name', val)}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.soft,
                    borderRadius: radii.md,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                  }}
                >
                  <Text variant="label" tone="subtle">{currencySymbol}</Text>
                  <TextInput
                    style={{
                      color: colors.foreground,
                      fontSize: 15,
                      fontFamily: 'Manrope_700Bold',
                      width: 60,
                      textAlign: 'right',
                    }}
                    placeholder="0.00"
                    placeholderTextColor={colors.mutedSubtle}
                    keyboardType="numeric"
                    value={item.price.toString()}
                    onChangeText={(val) => updateItem(idx, 'price', val)}
                  />
                </View>
                <TouchableOpacity
                  style={{ marginLeft: spacing.s12 }}
                  onPress={() => removeItem(idx)}
                >
                  <Trash size={18} color={colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: spacing.sm }}
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setExpandedIdx(isExpanded ? null : idx);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.muted} />
                  ) : (
                    <ChevronDown size={20} color={colors.muted} />
                  )}
                </TouchableOpacity>
              </View>

              {isExpanded && (
                <View
                  style={{
                    padding: spacing.md,
                    paddingTop: 0,
                  }}
                >
                  {/* Quantity row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: spacing.s12,
                      marginBottom: spacing.s12,
                    }}
                  >
                    <Text variant="label" tone="muted">Quantity</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.soft,
                        borderRadius: radii.md,
                      }}
                    >
                      <TouchableOpacity
                        style={{ padding: spacing.sm }}
                        onPress={() =>
                          updateItem(
                            idx,
                            'quantity',
                            Math.max(1, (parseInt(item.quantity.toString()) || 1) - 1)
                          )
                        }
                      >
                        <Text variant="label" weight="bold">–</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={{
                          color: colors.foreground,
                          width: 32,
                          textAlign: 'center',
                          fontFamily: 'Manrope_700Bold',
                          fontSize: 14,
                        }}
                        value={item.quantity.toString()}
                        keyboardType="numeric"
                        onChangeText={(val) => updateItem(idx, 'quantity', val)}
                      />
                      <TouchableOpacity
                        style={{ padding: spacing.sm }}
                        onPress={() =>
                          updateItem(
                            idx,
                            'quantity',
                            (parseInt(item.quantity.toString()) || 1) + 1
                          )
                        }
                      >
                        <Text variant="label" weight="bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>Split with</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {members.map((member) => {
                      const isSelected = item.assigned_to?.includes(member.id);
                      return (
                        <TouchableOpacity
                          key={member.id}
                          onPress={() => toggleParticipant(idx, member.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: spacing.s12,
                            paddingVertical: spacing.sm,
                            borderRadius: radii.pill,
                            backgroundColor: isSelected ? colors.primary : colors.soft,
                            gap: spacing.xs,
                          }}
                        >
                          <Text
                            variant="label"
                            weight="semibold"
                            style={{ color: isSelected ? colors.primaryForeground : colors.muted }}
                          >
                            {member.name}
                          </Text>
                          {isSelected && (
                            <Check size={12} color={colors.primaryForeground} strokeWidth={3} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          onPress={addItem}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
            borderRadius: radii.md,
            backgroundColor: colors.soft,
            marginBottom: spacing.md,
            gap: spacing.sm,
          }}
        >
          <Plus size={18} color={colors.mutedSubtle} />
          <Text variant="label" tone="subtle">Add another item</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Running total bar */}
      <View
        style={{
          padding: spacing.md,
          borderRadius: radii.md,
          backgroundColor: Math.abs(diff) < 0.01 ? colors.successSoft : colors.soft,
          marginTop: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text variant="label" tone="muted">Items total</Text>
          <Text variant="label" weight="bold">
            {currencySymbol}{itemsTotal.toFixed(2)}
          </Text>
        </View>
        {Math.abs(diff) >= 0.01 ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="label" tone="muted">{diff > 0 ? 'Remaining' : 'Over by'}</Text>
            <Text
              variant="label"
              weight="bold"
              style={{ color: diff < 0 ? colors.danger : colors.muted }}
            >
              {currencySymbol}{Math.abs(diff).toFixed(2)}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Check size={13} color={colors.success} strokeWidth={3} />
            <Text variant="label" style={{ color: colors.success }}>Matches expense total</Text>
          </View>
        )}
      </View>
    </View>
  );
};
