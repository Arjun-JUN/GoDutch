import { useState, useEffect, useCallback } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { CATEGORIES, CATEGORY_ICONS } from '../lib/constants';
import { calculateSplitDetails } from '../utils/calculateShare';
import {
  CalendarBlank,
  PencilSimple,
  Receipt,
  Trash,
  Users,
  X,
} from '@/slate/icons';
import {
  Header,
  AppButton,
  AppInput,
  AppModal,
  AppSelect,
  AppShell,
  AppSurface,
  AppTextarea,
  Callout,
  Field,
  MemberBadge,
  ModalHeader,
  PageBackButton,
  PageContent,
  PageHero,
} from '@/slate';

function ExpenseDetail() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();

  // Determine where to go back — passed via navigation state from caller
  const fromPath = location.state?.from || '/dashboard';
  const fromLabel = location.state?.fromLabel || 'Dashboard';

  const [expense, setExpense] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [items, setItems] = useState([]);

  const loadExpense = useCallback(async () => {
    try {
      const [exp, groups] = await Promise.all([
        api.get(`/expenses/${expenseId}`),
        api.get('/groups'),
      ]);
      setExpense(exp);
      const grp = groups.find((g) => g.id === exp.group_id);
      setGroup(grp || null);
    } catch (error) {
      toast.error('Failed to load expense');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [expenseId, navigate]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const startEditing = () => {
    setMerchant(expense.merchant);
    setDate(expense.date);
    setTotalAmount(String(expense.total_amount));
    setCategory(expense.category || 'Food & Dining');
    setNotes(expense.notes || '');
    setSplitType(expense.split_type);
    setItems(expense.items || []);
    setEditing(true);
  };

  const addItem = () => {
    setItems([...items, { name: '', price: '', category: 'Other', assigned_to: [] }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const toggleMemberAssignment = (itemIndex, memberId) => {
    const updated = [...items];
    const assignedTo = updated[itemIndex].assigned_to || [];
    if (assignedTo.includes(memberId)) {
      updated[itemIndex].assigned_to = assignedTo.filter((id) => id !== memberId);
    } else {
      updated[itemIndex].assigned_to = [...assignedTo, memberId];
    }
    setItems(updated);
  };



  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        merchant,
        date,
        total_amount: parseFloat(totalAmount),
        category,
        notes: notes || null,
        split_type: splitType,
        items: items.map((i) => ({
          ...i,
          price: parseFloat(i.price),
        })),
        split_details: calculateSplitDetails({
          totalAmount,
          splitMode: splitType,
          members: group?.members || [],
          items,
        }),
      };
      const data = await api.put(`/expenses/${expenseId}`, payload);
      setExpense(data);
      setEditing(false);
      toast.success('Expense updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/expenses/${expenseId}`);
      toast.success('Expense deleted');
      navigate(fromPath);
    } catch (error) {
      toast.error(error.message || 'Failed to delete expense');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const myShare = expense?.split_details?.find(
    (s) => s.user_id === currentUser?.id,
  );
  const isMember = group?.members?.some(m => m.id === currentUser?.id);

  if (loading) {
    return (
      <AppShell>
        <Header />
        <PageContent>
          <p className="text-[var(--app-muted)]">Loading...</p>
        </PageContent>
      </AppShell>
    );
  }

  if (!expense) return null;

  return (
    <AppShell>
      <Header />

      <PageContent>
        <PageBackButton onClick={() => navigate(fromPath)}>
          Back to {fromLabel}
        </PageBackButton>

        <PageHero
          eyebrow="Expense Detail"
          title={expense.merchant}
          description={group ? `Logged in ${group.name}` : undefined}
          actions={
            isMember && !editing ? (
              <>
                <AppButton
                  onClick={startEditing}
                  variant="secondary"
                  data-testid="edit-expense-btn"
                >
                  <PencilSimple size={18} weight="bold" />
                  Edit
                </AppButton>
                <AppButton
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="secondary"
                  data-testid="delete-expense-btn"
                  className="!text-[var(--app-danger)] !bg-[color-mix(in_srgb,var(--app-danger)_10%,var(--app-soft))] hover:!bg-[color-mix(in_srgb,var(--app-danger)_16%,var(--app-soft-strong))]"
                >
                  <Trash size={18} weight="bold" />
                  Delete
                </AppButton>
              </>
            ) : null
          }
        />

        {/* ── Edit form ── */}
        {editing ? (
          <AppSurface className="mb-6 p-5 md:p-6" data-testid="edit-form">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">
                Edit Expense
              </h2>
              <button
                type="button"
                onClick={cancelEditing}
                className="text-[var(--app-muted)] transition-colors hover:text-[var(--app-foreground)]"
                aria-label="Cancel editing"
              >
                <X size={22} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Merchant">
                  <AppInput
                    data-testid="edit-merchant"
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Store or restaurant"
                    required
                  />
                </Field>
                <AppSelect
                  label="Category"
                  data-testid="edit-category"
                  value={category}
                  onValueChange={setCategory}
                  options={CATEGORIES.map((c) => ({
                    label: c,
                    value: c,
                    icon: CATEGORY_ICONS[c],
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date">
                  <AppInput
                    data-testid="edit-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Total (Rs)">
                  <AppInput
                    data-testid="edit-total"
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </Field>
              </div>

              <AppSelect
                label="Split Type"
                data-testid="edit-split-type"
                value={splitType}
                onValueChange={setSplitType}
                options={[
                  { label: 'Equal Split', value: 'equal' },
                  { label: 'Item-Based', value: 'item-based' },
                  { label: 'Custom Split', value: 'custom' },
                ]}
                className="mb-4"
              />

              <Field label="Notes (Optional)">
                <AppTextarea
                  data-testid="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Add any notes..."
                />
              </Field>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-muted)]">
                  Items
                </label>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[1.25rem] border border-[var(--app-soft-strong)] p-3"
                    data-testid={`edit-item-${index}`}
                  >
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <AppInput
                          data-testid={`edit-item-name-${index}`}
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-1 border border-[var(--app-soft-strong)]">
                        <span className="text-[10px] font-bold text-[var(--app-muted)] uppercase">Qty</span>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-8 bg-transparent text-center text-sm font-extrabold text-[var(--app-primary)] focus:outline-none"
                          min="1"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--app-muted)]">×</span>
                        <AppInput
                          data-testid={`edit-item-price-${index}`}
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          className="w-20 text-sm font-extrabold text-right pr-6"
                          placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--app-primary)]">Rs</span>
                      </div>
                      {items.length > 1 && (
                        <AppButton
                          type="button"
                          variant="secondary"
                          onClick={() => removeItem(index)}
                          className="!p-0 h-8 w-8 flex items-center justify-center !rounded-full bg-white text-[var(--app-danger)] border border-[var(--app-soft-strong)]"
                        >
                          ×
                        </AppButton>
                      )}
                    </div>

                    {splitType === 'item-based' && group && (
                      <div className="mt-2">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
                          Assign to:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {group.members.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => toggleMemberAssignment(index, member.id)}
                              className={`rounded-full px-2 py-1 text-[10px] font-bold transition-all border ${(item.assigned_to || []).includes(member.id)
                                  ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)] border-[var(--app-primary)]'
                                  : 'bg-[var(--app-soft)] text-[var(--app-muted)] border-transparent'
                                }`}
                            >
                              {member.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={addItem}
                  className="w-full text-xs"
                >
                  + Add Item
                </AppButton>
              </div>

              <div className="flex gap-3 pt-1">
                <AppButton
                  type="submit"
                  disabled={saving}
                  data-testid="save-expense-btn"
                  className="flex-1 justify-center"
                >
                  {saving ? (
                    <>
                      <span className="spinner" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </AppButton>
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={cancelEditing}
                >
                  Cancel
                </AppButton>
              </div>
            </form>
          </AppSurface>
        ) : null}

        {/* ── Summary statistics consolidated ── */}
        {!editing && (
          <AppSurface className="mb-8 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative shadow-xl border-none">
            {/* Background Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--app-primary-strong)] to-[var(--app-primary)] opacity-[0.98]" />

            {/* Decorative Pattern / Large Icon */}
            <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none transform rotate-12">
              {(() => {
                const Icon = CATEGORY_ICONS[expense.category] || DotsThreeCircle;
                return <Icon size={280} weight="fill" />;
              })()}
            </div>

            <div className="relative z-10 flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-lg">
                {(() => {
                  const Icon = CATEGORY_ICONS[expense.category] || DotsThreeCircle;
                  return <Icon size={40} weight="bold" />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-white/50 mb-3">
                  <CalendarBlank size={16} weight="bold" />
                  {expense.date}
                </div>
                <h3 className="text-3xl font-black tracking-tighter text-white md:text-4xl">
                  {expense.category || 'Other'}
                </h3>
                <p className="mt-1 text-sm font-bold text-white/60 uppercase tracking-widest">
                  {expense.split_type} Split
                </p>
              </div>
            </div>

            <div className="relative z-10 text-left md:text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50 mb-1">Your Personal Share</p>
              <p className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-md">
                <span className="text-2xl md:text-3xl mr-1 opacity-60 font-medium tracking-tight">Rs</span>
                {myShare ? Number(myShare.amount).toFixed(2) : '0.00'}
              </p>
              <div className="flex items-center md:justify-end gap-3 mt-4">
                <div className="h-px w-8 bg-white/20 hidden md:block" />
                <span className="text-sm font-bold text-white/70">
                  Total bill <span className="text-white">Rs {Number(expense.total_amount).toFixed(2)}</span>
                </span>
              </div>
            </div>
          </AppSurface>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr,1fr]">
          {/* ── Line items ── */}
          <AppSurface className="p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--app-soft)] text-[var(--app-primary)]">
                <Receipt size={18} weight="bold" />
              </div>
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">
                Items
              </h2>
            </div>

            {expense.items?.length > 0 ? (
              <div className="space-y-2" data-testid="items-list">
                {expense.items.map((item, i) => {
                  const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                  let itemShare = 0;
                  if (expense.split_type === 'item-based') {
                    const assignedTo = item.assigned_to || [];
                    if (assignedTo.length > 0) {
                      if (assignedTo.includes(currentUser?.id)) {
                        itemShare = itemTotal / assignedTo.length;
                      }
                    } else if (group?.members?.some(m => m.id === currentUser?.id)) {
                      itemShare = itemTotal / group.members.length;
                    }
                  } else {
                    const mySplitDetail = expense.split_details?.find(s => s.user_id === currentUser?.id);
                    if (mySplitDetail) {
                      const myTotalShare = Number(mySplitDetail.amount) || 0;
                      const expenseTotal = Number(expense.total_amount) || 1;
                      const ratio = myTotalShare / expenseTotal;
                      itemShare = itemTotal * ratio;
                    }
                  }

                  const shareColorClass = itemShare === 0 ? 'text-emerald-500' : 'text-amber-500';

                  return (
                    <div
                      key={i}
                      className="app-list-row flex items-center gap-3 p-3 w-full"
                      data-testid={`item-row-${i}`}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--app-soft)] font-black text-xs text-[var(--app-primary)]">
                        {item.quantity || 1}x
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[var(--app-foreground)]">
                          {item.name || '—'}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-[var(--app-muted)] mt-0.5">
                            Rs {Number(item.price).toFixed(2)} each
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-extrabold tracking-[-0.03em] text-[var(--app-primary)]">
                          Rs {itemTotal.toFixed(2)}
                        </p>
                        <p className={`text-[10px] font-bold ${shareColorClass} mt-0.5`}>
                          {itemShare === 0 ? 'No share' : `Your share: Rs ${itemShare.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-[var(--app-muted)]">
                No line items recorded.
              </p>
            )}

            {expense.notes ? (
              <Callout className="mt-4">
                <div className="flex items-start gap-2">
                  <Note size={16} weight="bold" className="mt-0.5 flex-shrink-0 text-[var(--app-primary)]" />
                  <p className="text-sm text-[var(--app-foreground)]">{expense.notes}</p>
                </div>
              </Callout>
            ) : null}
          </AppSurface>

          {/* ── Split breakdown ── */}
          <AppSurface variant="soft" className="p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]">
                <Users size={18} weight="bold" />
              </div>
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">
                Split
              </h2>
            </div>

            {expense.split_details?.length > 0 ? (
              <div className="space-y-2" data-testid="split-list">
                {expense.split_details.map((split, i) => {
                  const isMe = split.user_id === currentUser?.id;
                  const isPayer = split.user_id === expense.created_by;
                  return (
                    <div
                      key={i}
                      data-testid={`split-row-${i}`}
                      className={`flex items-center justify-between gap-3 rounded-[1.25rem] p-3 ${isMe
                          ? 'bg-[var(--app-soft-strong)]'
                          : 'bg-white dark:bg-[var(--app-surface)]'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <MemberBadge active={isMe}>{split.user_name}</MemberBadge>
                        {isPayer && (
                          <span className="app-eyebrow text-[10px]">paid</span>
                        )}
                      </div>
                      <p
                        className={`text-base font-extrabold tracking-[-0.03em] ${isMe
                            ? 'text-[var(--app-primary-strong)]'
                            : 'text-[var(--app-foreground)]'
                          }`}
                      >
                        Rs {Number(split.amount).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-[var(--app-muted)]">
                No split details available.
              </p>
            )}
          </AppSurface>
        </div>

        {/* ── Receipt image ── */}
        {expense.receipt_image ? (
          <AppSurface className="mt-5 p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--app-soft)] text-[var(--app-primary)]">
                <Receipt size={18} weight="bold" />
              </div>
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">
                Receipt
              </h2>
            </div>
            <img
              src={expense.receipt_image}
              alt="Receipt"
              className="mx-auto max-h-96 rounded-[1.5rem] object-contain"
              data-testid="receipt-image"
            />
          </AppSurface>
        ) : null}
      </PageContent>

      {/* ── Delete confirmation modal ── */}
      <AppModal open={showDeleteConfirm} data-testid="delete-modal">
        <ModalHeader
          title="Delete this expense?"
          description={`"${expense.merchant}" — Rs ${Number(expense.total_amount).toFixed(2)} — will be permanently removed. This cannot be undone.`}
          onClose={() => !deleting && setShowDeleteConfirm(false)}
        />
        <div className="flex gap-3">
          <AppButton
            onClick={handleDelete}
            disabled={deleting}
            data-testid="confirm-delete-btn"
            className="flex-1 justify-center !bg-[var(--app-danger)] !text-white hover:!brightness-105"
          >
            {deleting ? (
              <>
                <span className="spinner" />
                Deleting...
              </>
            ) : (
              <>
                <Trash size={18} weight="bold" />
                Delete Expense
              </>
            )}
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            data-testid="cancel-delete-btn"
          >
            Cancel
          </AppButton>
        </div>
      </AppModal>
    </AppShell>
  );
}

export default ExpenseDetail;
