import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Camera,
  ChevronDown,
  Tag,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { AppShell, PageContent } from '../src/slate/AppShell';
import { Text } from '../src/slate/Text';
import { Header } from '../src/slate/Header';
import { AppButton } from '../src/slate/AppButton';
import { AppInput, AppTextarea, Field } from '../src/slate/AppInput';
import { AppSurface, InteractiveSurface } from '../src/slate/AppSurface';
import { MemberBadge, Callout, Breath } from '../src/slate/atoms';
import { PaidByModal, type Payer } from '../src/components/Expense/PaidByModal';
import { SplitOptionsModal } from '../src/components/Expense/SplitOptionsModal';
import { useGroupsStore, useExpensesStore } from '../src/stores';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/api/client';
import {
  calculateSplitDetails,
  type SplitMode,
  type SplitBetweenItem,
  type LineItem,
} from '../src/utils/splitting';
import { getCurrencySymbol, EXPENSE_CATEGORIES } from '../src/utils/constants';
import { colors, radii, spacing } from '../src/theme/tokens';

export default function NewExpenseScreen() {
  const { groupId: paramGroupId } = useLocalSearchParams<{ groupId?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { groups, fetch: fetchGroups } = useGroupsStore();
  const { addOptimistic, replace, remove, invalidate } = useExpensesStore();

  // ── Form state ───────────────────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState<string>(paramGroupId ?? '');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('General');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // ── Split state ──────────────────────────────────────────────────────────────
  const [paidBy, setPaidBy] = useState<Payer[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equally');
  const [splitBetween, setSplitBetween] = useState<SplitBetweenItem[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showPaidBy, setShowPaidBy] = useState(false);
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── AI Smart Split state ──────────────────────────────────────────────────────
  const [showSmartSplit, setShowSmartSplit] = useState(false);
  const [smartSplitInstruction, setSmartSplitInstruction] = useState('');
  const [smartSplitting, setSmartSplitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Initialise group + defaults once groups are available
  useEffect(() => {
    if (groups.length === 0) return;
    const target =
      groups.find((g) => g.id === (paramGroupId || selectedGroupId)) ?? groups[0];
    if (!target) return;
    if (selectedGroupId !== target.id) setSelectedGroupId(target.id);
    if (paidBy.length === 0 && user) setPaidBy([{ user_id: user.id, amount: '' }]);
    if (splitBetween.length === 0)
      setSplitBetween(target.members.map((m) => ({ user_id: m.id })));
  }, [groups]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const members = selectedGroup?.members ?? [];
  const currency = selectedGroup?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  const paidByNames = paidBy
    .map((p) => members.find((m) => m.id === p.user_id)?.name)
    .filter(Boolean)
    .join(', ');

  const splitModeLabel: Record<SplitMode, string> = {
    equally: 'Equally',
    unequally: 'Unequally',
    byshares: 'By Shares',
    'item-based': 'By Item',
  };

  // ── Receipt OCR ──────────────────────────────────────────────────────────────
  const handlePickReceipt = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission denied', 'Camera roll access is needed to scan receipts.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      base64: true,
      quality: 0.6,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const base64 = result.assets[0].base64!;

    setScanningReceipt(true);
    setError(null);
    try {
      const response = await api.post('/ai/ocr/scan', { image_base64: base64 });
      if (response?.merchant) setMerchant(response.merchant);
      if (response?.total_amount) setTotalAmount(String(response.total_amount));
      if (response?.items?.length) {
        setItems(
          response.items.map((it: any) => ({
            name: it.name,
            price: String(it.price ?? it.amount ?? 0),
            quantity: it.quantity ?? 1,
            assigned_to: [],
            split_type: 'equal',
          }))
        );
        setSplitMode('item-based');
      }
      setReceiptImage(`data:image/jpeg;base64,${base64}`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Receipt scan failed — you can enter details manually.');
    } finally {
      setScanningReceipt(false);
    }
  };

  // ── AI Smart Split ────────────────────────────────────────────────────────────
  const handleSmartSplit = async () => {
    if (!smartSplitInstruction.trim()) return;
    setSmartSplitting(true);
    setError(null);
    try {
      const response = await api.post('/ai/smart-split', {
        group_id: selectedGroupId,
        instruction: smartSplitInstruction.trim(),
        expense_context: merchant
          ? { merchant, total_amount: parseFloat(totalAmount) || 0 }
          : undefined,
      });

      if (response.clarification_needed) {
        Alert.alert(
          'Clarification needed',
          response.clarification_question ?? 'Please clarify your split.'
        );
        return;
      }

      const plan = response.split_plan;
      if (plan.items?.length) {
        setItems(
          plan.items.map((it: any) => ({
            name: it.name,
            price: String(it.price ?? 0),
            quantity: it.quantity ?? 1,
            assigned_to: it.assigned_to ?? [],
            split_type: 'equal',
          }))
        );
      }

      const modeMap: Record<string, SplitMode> = {
        'item-based': 'item-based',
        'equal': 'equally',
        'custom': 'unequally',
      };
      const mode: SplitMode = modeMap[plan.split_type] ?? 'equally';
      setSplitMode(mode);
      setShowSmartSplit(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Smart split failed — you can configure it manually.');
    } finally {
      setSmartSplitting(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!selectedGroupId) return 'Please select a group.';
    if (!merchant.trim()) return 'Please enter a merchant or description.';
    const amt = parseFloat(totalAmount);
    if (isNaN(amt) || amt <= 0) return 'Please enter a valid amount greater than zero.';
    if (paidBy.length === 0) return 'Please select who paid.';
    if (splitBetween.length === 0) return 'Please select who to split with.';
    return null;
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setSavingExpense(true);
    setError(null);

    const totalAmtNum = parseFloat(totalAmount);
    const splitDetails = calculateSplitDetails({
      totalAmount,
      splitMode,
      members: members.map((m) => ({ id: m.id, name: m.name })),
      splitBetween,
      items,
    });

    const payload: Record<string, any> = {
      group_id: selectedGroupId,
      merchant: merchant.trim(),
      total_amount: totalAmtNum,
      date,
      category,
      split_type: splitMode,
      split_details: splitDetails,
      items:
        splitMode === 'item-based'
          ? items.map((it) => ({
              name: it.name,
              amount:
                parseFloat(it.price.toString()) *
                (parseInt(it.quantity.toString()) || 1),
              quantity: parseInt(it.quantity.toString()) || 1,
              split_among: it.assigned_to ?? [],
            }))
          : [],
    };
    if (notes.trim()) payload.notes = notes.trim();
    if (receiptImage) payload.receipt_image = receiptImage;

    const tempId = `optimistic-${Date.now()}`;
    addOptimistic({
      id: tempId,
      ...payload,
      created_at: new Date().toISOString(),
      created_by: user?.id ?? '',
    } as any);

    try {
      const saved = await api.post('/expenses', payload);
      replace(tempId, saved);
      invalidate(selectedGroupId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      remove(selectedGroupId, tempId);
      setError(e?.message ?? 'Failed to save expense. Please try again.');
      setSavingExpense(false);
    }
  };

  return (
    <AppShell>
      <Header title="New Expense" eyebrow={selectedGroup?.name} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <PageContent>
            {error && (
              <Callout tone="danger" style={{ marginBottom: spacing.s20 }}>
                {error}
              </Callout>
            )}

            {/* Group selector */}
            {!paramGroupId && groups.length > 1 && (
              <View style={{ marginBottom: spacing.lg }}>
                <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
                  GROUP
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.sm }}
                >
                  {groups.map((g) => (
                    <MemberBadge
                      key={g.id}
                      active={selectedGroupId === g.id}
                      onPress={() => {
                        setSelectedGroupId(g.id);
                        setSplitBetween(g.members.map((m) => ({ user_id: m.id })));
                        if (user) setPaidBy([{ user_id: user.id, amount: '' }]);
                      }}
                    >
                      {g.name}
                    </MemberBadge>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Receipt scan */}
            <InteractiveSurface
              compact
              onPress={handlePickReceipt}
              testID="scan-receipt-surface"
              style={{ marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.md,
                  backgroundColor: colors.soft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {scanningReceipt ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Camera size={20} color={colors.primary} strokeWidth={2.2} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="title" weight="semibold">
                  {scanningReceipt ? 'Scanning receipt…' : 'Scan Receipt'}
                </Text>
                <Text variant="label" tone="subtle" style={{ marginTop: spacing.xs }}>
                  AI reads merchant, amount and items
                </Text>
              </View>
              {receiptImage ? (
                <View
                  style={{ width: spacing.s40, height: spacing.s40, borderRadius: radii.sm + spacing.xs, overflow: 'hidden' }}
                >
                  <Image
                    source={{ uri: receiptImage }}
                    style={{ width: spacing.s40, height: spacing.s40 }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
            </InteractiveSurface>

            {/* Core fields */}
            <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
              <Field label="Merchant / Description">
                <AppInput
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="Swiggy, Petrol, Groceries…"
                />
              </Field>

              <Field label={`Amount (${sym})`}>
                <AppInput
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </Field>

              <Field label="Date">
                <AppInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
              </Field>

              <Field label="Notes (optional)">
                <AppTextarea
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add a note…"
                />
              </Field>
            </View>

            {/* Category */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
                CATEGORY
              </Text>
              <InteractiveSurface
                compact
                onPress={() => setShowCategories(!showCategories)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}
              >
                <Tag size={18} color={colors.primary} strokeWidth={2.2} />
                <Text variant="title" weight="semibold" style={{ flex: 1 }}>
                  {category}
                </Text>
                <ChevronDown size={16} color={colors.mutedSubtle} strokeWidth={2} />
              </InteractiveSurface>

              {showCategories && (
                <AppSurface
                  variant="solid"
                  style={{
                    marginTop: spacing.sm,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: spacing.sm,
                    padding: spacing.md,
                  }}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <MemberBadge
                      key={cat}
                      active={category === cat}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategories(false);
                      }}
                    >
                      {cat}
                    </MemberBadge>
                  ))}
                </AppSurface>
              )}
            </View>

            {/* Paid by + split options */}
            <View style={{ gap: spacing.s12, marginBottom: spacing.xl }}>
              <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.xs }}>
                SPLIT DETAILS
              </Text>

              <InteractiveSurface
                compact
                onPress={() => setShowPaidBy(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}
              >
                <Users size={18} color={colors.primary} strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" tone="subtle">Paid by</Text>
                  <Text variant="title" weight="semibold" style={{ marginTop: spacing.xs }}>
                    {paidByNames || 'Select payer'}
                  </Text>
                </View>
                <ChevronDown size={16} color={colors.mutedSubtle} />
              </InteractiveSurface>

              <InteractiveSurface
                compact
                onPress={() => setShowSplitOptions(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}
              >
                <Zap size={18} color={colors.primary} strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" tone="subtle">Split method</Text>
                  <Text variant="title" weight="semibold" style={{ marginTop: spacing.xs }}>
                    {splitModeLabel[splitMode]} · {splitBetween.length} people
                  </Text>
                </View>
                <ChevronDown size={16} color={colors.mutedSubtle} />
              </InteractiveSurface>

              {/* AI Smart Split */}
              <InteractiveSurface
                compact
                onPress={() => setShowSmartSplit(!showSmartSplit)}
                testID="ai-split-surface"
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}
              >
                <Sparkles size={18} color={colors.primary} strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" tone="subtle">AI Smart Split</Text>
                  <Text variant="title" weight="semibold" style={{ marginTop: spacing.xs }}>
                    Describe how to split in plain words
                  </Text>
                </View>
                <ChevronDown size={16} color={colors.mutedSubtle} />
              </InteractiveSurface>

              {showSmartSplit && (
                <AppSurface variant="solid" style={{ gap: spacing.s12, padding: spacing.md }}>
                  <AppInput
                    value={smartSplitInstruction}
                    onChangeText={setSmartSplitInstruction}
                    placeholder="e.g. Alice pays for everything, or split pizza equally but Bob pays for drinks"
                    autoFocus
                  />
                  <AppButton
                    variant="primary"
                    size="md"
                    onPress={handleSmartSplit}
                    loading={smartSplitting}
                    haptic
                    leftIcon={<Sparkles size={16} color={colors.primaryForeground} strokeWidth={2.2} />}
                  >
                    Apply AI Split
                  </AppButton>
                </AppSurface>
              )}
            </View>

            {/* Save */}
            <AppButton
              variant="primary"
              size="lg"
              onPress={handleSave}
              loading={savingExpense}
              haptic
              style={{ marginBottom: spacing.md }}
            >
              Save Expense
            </AppButton>

            <Breath size="lg" />
          </PageContent>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom sheets */}
      <PaidByModal
        visible={showPaidBy}
        onClose={(result) => {
          setPaidBy(result);
          setShowPaidBy(false);
        }}
        members={members}
        paidBy={paidBy}
        totalAmount={totalAmount}
        currencySymbol={sym}
      />
      <SplitOptionsModal
        visible={showSplitOptions}
        onClose={({ splitMode: m, splitBetween: sb, items: it }) => {
          setSplitMode(m);
          setSplitBetween(sb);
          setItems(it);
          setShowSplitOptions(false);
        }}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
        splitBetween={splitBetween}
        splitMode={splitMode}
        totalAmount={totalAmount}
        currencySymbol={sym}
        items={items}
      />
    </AppShell>
  );
}
