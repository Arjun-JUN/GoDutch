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
import { colors } from '../../theme/tokens';

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
          borderRadius: 16,
          padding: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.softStrong,
        }}
      >
        <View
          style={{
            backgroundColor: colors.softStrong,
            padding: 8,
            borderRadius: 999,
            marginRight: 10,
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
                borderRadius: 16,
                marginBottom: 10,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <TextInput
                  style={{
                    flex: 1,
                    color: colors.foreground,
                    fontSize: 15,
                    fontFamily: 'Manrope_600SemiBold',
                    marginRight: 8,
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
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
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
                  style={{ marginLeft: 10 }}
                  onPress={() => removeItem(idx)}
                >
                  <Trash size={18} color={colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 8 }}
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
                    padding: 14,
                    paddingTop: 0,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {/* Quantity row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text variant="label" tone="muted">Quantity</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.soft,
                        borderRadius: 10,
                      }}
                    >
                      <TouchableOpacity
                        style={{ padding: 8 }}
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
                        style={{ padding: 8 }}
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

                  <Text variant="label" tone="muted" style={{ marginBottom: 8 }}>Split with</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {members.map((member) => {
                      const isSelected = item.assigned_to?.includes(member.id);
                      return (
                        <TouchableOpacity
                          key={member.id}
                          onPress={() => toggleParticipant(idx, member.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 999,
                            backgroundColor: isSelected ? colors.primary : colors.soft,
                            gap: 4,
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
            padding: 16,
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.softStrong,
            marginBottom: 16,
            gap: 8,
          }}
        >
          <Plus size={18} color={colors.mutedSubtle} />
          <Text variant="label" tone="subtle">Add another item</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Running total bar */}
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: Math.abs(diff) < 0.01 ? colors.successSoft : colors.soft,
          marginTop: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Check size={13} color={colors.success} strokeWidth={3} />
            <Text variant="label" style={{ color: colors.success }}>Matches expense total</Text>
          </View>
        )}
      </View>
    </View>
  );
};
