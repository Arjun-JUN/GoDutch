import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Trash2,
  Edit3,
  Receipt,
  Calendar,
  Tag,
  Users,
  Check,
  X,
  ChevronDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { AppButton } from '../../src/slate/AppButton';
import { AppSurface, InteractiveSurface } from '../../src/slate/AppSurface';
import { AppInput, AppTextarea, Field } from '../../src/slate/AppInput';
import { Avatar, Callout, Breath, IconBadge, MemberBadge } from '../../src/slate/atoms';
import { useExpensesStore, useGroupsStore } from '../../src/stores';
import { api } from '../../src/api/client';
import { getCurrencySymbol, EXPENSE_CATEGORIES } from '../../src/utils/constants';
import { colors, spacing } from '../../src/theme/tokens';
import type { Expense } from '../../src/stores/types';

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();

  const { getAll, remove, update, invalidate } = useExpensesStore();
  const { getById: getGroup } = useGroupsStore();

  // ── Core state ───────────────────────────────────────────────────────────────
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showEditCategories, setShowEditCategories] = useState(false);

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadExpense = useCallback(async () => {
    // Check cache across all groups first
    const cached = getAll().find((e) => e.id === expenseId);
    if (cached) {
      setExpense(cached);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/expenses/${expenseId}`);
      setExpense(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load expense');
    } finally {
      setLoading(false);
    }
  }, [expenseId, getAll]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const group = expense ? getGroup(expense.group_id) : undefined;
  const currency = group?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/expenses/${expenseId}`);
              if (expense) {
                remove(expense.group_id, expenseId);
                invalidate(expense.group_id);
              }
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (e: any) {
              setError(e?.message ?? 'Failed to delete expense');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = () => {
    if (!expense) return;
    setEditMerchant(expense.merchant ?? expense.description ?? '');
    setEditAmount(String(expense.total_amount));
    setEditDate(expense.date ?? '');
    setEditCategory(expense.category ?? 'General');
    setEditNotes(expense.notes ?? '');
    setShowEditCategories(false);
    setError(null);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const handleSaveEdit = async () => {
    const amt = parseFloat(editAmount);
    if (!editMerchant.trim()) {
      setError('Please enter a merchant or description.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {
        merchant: editMerchant.trim(),
        total_amount: amt,
        date: editDate,
        category: editCategory,
      };
      if (editNotes.trim()) payload.notes = editNotes.trim();
      else payload.notes = null;

      const updated: Expense = await api.put(`/expenses/${expenseId}`, payload);
      update(expense!.group_id, expenseId, updated);
      setExpense(updated);
      invalidate(expense!.group_id);
      setEditing(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / error shells ───────────────────────────────────────────────────
  if (loading) {
    return (
      <AppShell>
        <Header title="Expense" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  if (!expense) {
    return (
      <AppShell>
        <Header title="Expense" />
        <PageContent>
          <Callout tone="danger">
            {error ?? 'Expense not found.'}
          </Callout>
        </PageContent>
      </AppShell>
    );
  }

  const title = expense.merchant || expense.description || 'Expense';
  const displayDate =
    expense.date ||
    (expense.created_at ? new Date(expense.created_at).toLocaleDateString() : '');

  // ── Header actions ───────────────────────────────────────────────────────────
  const headerRight = editing ? (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <AppButton
        variant="icon"
        size="sm"
        leftIcon={<X size={18} color={colors.muted} strokeWidth={2.2} />}
        onPress={handleCancelEdit}
        haptic
        testID="cancel-btn"
      />
      <AppButton
        variant="icon"
        size="sm"
        leftIcon={<Check size={18} color={colors.primary} strokeWidth={2.2} />}
        onPress={handleSaveEdit}
        loading={saving}
        haptic
        testID="save-btn-header"
      />
    </View>
  ) : (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <AppButton
        variant="icon"
        size="sm"
        leftIcon={<Edit3 size={18} color={colors.primary} strokeWidth={2.2} />}
        onPress={handleEdit}
        haptic
        testID="edit-btn"
      />
      <AppButton
        variant="icon"
        size="sm"
        leftIcon={<Trash2 size={18} color={colors.danger} strokeWidth={2.2} />}
        onPress={handleDelete}
        loading={deleting}
        haptic
        testID="delete-btn"
      />
    </View>
  );

  return (
    <AppShell>
      <Header
        title={editing ? 'Edit Expense' : 'Expense Detail'}
        eyebrow={group?.name}
        right={headerRight}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <PageContent>
            {error && (
              <Callout tone="danger" style={{ marginBottom: spacing.s20 }}>
                {error}
              </Callout>
            )}

            {editing ? (
              /* ── Edit form ──────────────────────────────────────────────── */
              <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
                <Field label="Merchant / Description">
                  <AppInput
                    value={editMerchant}
                    onChangeText={setEditMerchant}
                    placeholder="Swiggy, Petrol, Groceries…"
                    autoFocus
                  />
                </Field>

                <Field label={`Amount (${sym})`}>
                  <AppInput
                    value={editAmount}
                    onChangeText={setEditAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </Field>

                <Field label="Date">
                  <AppInput
                    value={editDate}
                    onChangeText={setEditDate}
                    placeholder="YYYY-MM-DD"
                  />
                </Field>

                {/* Category picker */}
                <Field label="Category">
                  <InteractiveSurface
                    compact
                    onPress={() => setShowEditCategories(!showEditCategories)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}
                  >
                    <Tag size={16} color={colors.primary} strokeWidth={2.2} />
                    <Text variant="title" weight="semibold" style={{ flex: 1 }}>
                      {editCategory}
                    </Text>
                    <ChevronDown size={16} color={colors.mutedSubtle} strokeWidth={2} />
                  </InteractiveSurface>
                  {showEditCategories && (
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
                          active={editCategory === cat}
                          onPress={() => {
                            setEditCategory(cat);
                            setShowEditCategories(false);
                          }}
                        >
                          {cat}
                        </MemberBadge>
                      ))}
                    </AppSurface>
                  )}
                </Field>

                <Field label="Notes (optional)">
                  <AppTextarea
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Add a note…"
                  />
                </Field>

                <AppButton
                  variant="primary"
                  size="lg"
                  onPress={handleSaveEdit}
                  loading={saving}
                  haptic
                  testID="save-btn"
                >
                  Save Changes
                </AppButton>
              </View>
            ) : (
              /* ── View mode ──────────────────────────────────────────────── */
              <>
                {/* Hero amount */}
                <AppSurface variant="soft" style={{ marginBottom: spacing.lg, alignItems: 'center', paddingVertical: spacing.lg }}>
                  <IconBadge
                    icon={<Receipt size={24} color={colors.primary} strokeWidth={2.2} />}
                    tone="soft"
                    size="lg"
                  />
                  <Text variant="titleLg" weight="extrabold" style={{ marginTop: spacing.md, textAlign: 'center' }}>
                    {title}
                  </Text>
                  <Text variant="display" weight="extrabold" style={{ marginTop: spacing.sm, color: colors.primary }}>
                    {sym}{expense.total_amount.toFixed(2)}
                  </Text>
                </AppSurface>

                {/* Meta rows */}
                <View style={{ gap: spacing.s12, marginBottom: spacing.lg }}>
                  {displayDate ? (
                    <AppSurface variant="solid" compact>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Calendar size={18} color={colors.mutedSubtle} strokeWidth={2} />
                        <View>
                          <Text variant="label" tone="subtle">Date</Text>
                          <Text variant="title" weight="semibold" style={{ marginTop: spacing.xs }}>{displayDate}</Text>
                        </View>
                      </View>
                    </AppSurface>
                  ) : null}

                  {expense.category ? (
                    <AppSurface variant="solid" compact>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Tag size={18} color={colors.mutedSubtle} strokeWidth={2} />
                        <View>
                          <Text variant="label" tone="subtle">Category</Text>
                          <Text variant="title" weight="semibold" style={{ marginTop: spacing.xs }}>{expense.category}</Text>
                        </View>
                      </View>
                    </AppSurface>
                  ) : null}

                  {expense.notes ? (
                    <AppSurface variant="solid" compact>
                      <Text variant="label" tone="subtle" style={{ marginBottom: spacing.xs }}>Notes</Text>
                      <Text variant="body">{expense.notes}</Text>
                    </AppSurface>
                  ) : null}
                </View>

                {/* Items */}
                {expense.items && expense.items.length > 0 && (
                  <>
                    <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>ITEMS</Text>
                    <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                      {expense.items.map((item, i) => (
                        <AppSurface key={i} variant="solid" compact>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="title" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                              {item.name}
                              {item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ''}
                            </Text>
                            <Text variant="title" weight="extrabold">
                              {sym}{(item.amount ?? 0).toFixed(2)}
                            </Text>
                          </View>
                        </AppSurface>
                      ))}
                    </View>
                  </>
                )}

                {/* Split details */}
                {expense.split_details && expense.split_details.length > 0 && (
                  <>
                    <Text variant="eyebrow" tone="muted" style={{ marginBottom: spacing.s12 }}>
                      SPLIT ({expense.split_type ?? 'equally'})
                    </Text>
                    <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                      {expense.split_details.map((split, i) => {
                        const member = group?.members.find((m) => m.id === split.user_id);
                        const name = member?.name ?? split.user_id;
                        return (
                          <AppSurface key={i} variant="solid" compact>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s12 }}>
                              <Avatar name={name} size="sm" />
                              <Text variant="title" weight="semibold" style={{ flex: 1 }}>{name}</Text>
                              <Text variant="title" weight="extrabold" style={{ color: colors.primary }}>
                                {sym}{split.amount.toFixed(2)}
                              </Text>
                            </View>
                          </AppSurface>
                        );
                      })}
                    </View>
                  </>
                )}
              </>
            )}

            <Breath size="lg" />
          </PageContent>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
