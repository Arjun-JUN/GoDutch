import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import {
  CalendarBlank,
  CurrencyInr,
  Note,
  PencilSimple,
  Receipt,
  Tag,
  Trash,
  Users,
  X,
} from '@phosphor-icons/react';
import Header from '../components/Header';
import {
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
  StatCard,
} from '../components/app';

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Groceries',
  'Utilities',
  'Healthcare',
  'Travel',
  'Other',
];

function ExpenseDetail({ onLogout }) {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

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

  const loadExpense = useCallback(async () => {
    try {
      const [expenseRes, groupsRes] = await Promise.all([
        axios.get(`${API}/expenses/${expenseId}`, { headers: getAuthHeader() }),
        axios.get(`${API}/groups`, { headers: getAuthHeader() }),
      ]);
      const exp = expenseRes.data;
      setExpense(exp);
      const grp = groupsRes.data.find((g) => g.id === exp.group_id);
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
    setEditing(true);
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
      };
      const res = await axios.put(`${API}/expenses/${expenseId}`, payload, {
        headers: getAuthHeader(),
      });
      setExpense(res.data);
      setEditing(false);
      toast.success('Expense updated');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/expenses/${expenseId}`, {
        headers: getAuthHeader(),
      });
      toast.success('Expense deleted');
      navigate(fromPath);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete expense');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const myShare = expense?.split_details?.find(
    (s) => s.user_id === currentUser?.id,
  );
  const isCreator = expense?.created_by === currentUser?.id;

  if (loading) {
    return (
      <AppShell>
        <Header onLogout={onLogout} />
        <PageContent>
          <p className="text-[var(--app-muted)]">Loading...</p>
        </PageContent>
      </AppShell>
    );
  }

  if (!expense) return null;

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent>
        <PageBackButton onClick={() => navigate(fromPath)}>
          Back to {fromLabel}
        </PageBackButton>

        <PageHero
          eyebrow="Expense Detail"
          title={expense.merchant}
          description={group ? `Logged in ${group.name}` : undefined}
          actions={
            isCreator && !editing ? (
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
                <Field label="Category">
                  <AppSelect
                    data-testid="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </AppSelect>
                </Field>
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

              <Field label="Split Type">
                <AppSelect
                  data-testid="edit-split-type"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                >
                  <option value="equal">Equal Split</option>
                  <option value="item-based">Item-Based</option>
                  <option value="custom">Custom Split</option>
                </AppSelect>
              </Field>

              <Field label="Notes (Optional)">
                <AppTextarea
                  data-testid="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Add any notes..."
                />
              </Field>

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

        {/* ── Summary stats ── */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Amount"
            value={`Rs ${Number(expense.total_amount).toFixed(2)}`}
            description="Full bill before splitting."
            icon={CurrencyInr}
          />
          <StatCard
            label="Your Share"
            value={
              myShare ? `Rs ${Number(myShare.amount).toFixed(2)}` : '—'
            }
            description={myShare ? 'Your portion of this expense.' : 'You are not in the split.'}
            valueClassName="text-[var(--app-primary-strong)]"
          />
          <StatCard
            label="Date"
            value={expense.date}
            description="When the expense occurred."
            icon={CalendarBlank}
          />
          <StatCard
            label="Category"
            value={expense.category || 'Other'}
            description={`Split: ${expense.split_type}`}
            icon={Tag}
          />
        </section>

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
                {expense.items.map((item, i) => (
                  <div
                    key={i}
                    className="app-list-row flex items-center justify-between gap-3 p-3"
                    data-testid={`item-row-${i}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-[var(--app-foreground)]">
                        {item.name || '—'}
                      </p>
                      <p className="text-xs text-[var(--app-muted)]">
                        {item.category || 'Other'}
                      </p>
                    </div>
                    <p className="text-base font-extrabold tracking-[-0.03em] text-[var(--app-primary)]">
                      Rs {Number(item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
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
                      className={`flex items-center justify-between gap-3 rounded-[1.25rem] p-3 ${
                        isMe
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
                        className={`text-base font-extrabold tracking-[-0.03em] ${
                          isMe
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
