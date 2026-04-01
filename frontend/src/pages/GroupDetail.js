import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import {
  Airplane,
  ArrowsLeftRight,
  CalendarBlank,
  Car,
  DotsThreeCircle,
  ForkKnife,
  Lightbulb,
  Note,
  PencilSimple,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Tag,
  Ticket,
  Trash,
  Users,
  X,
} from '@phosphor-icons/react';
import Header from '../components/Header';
import { AppShell, AppSurface, MemberBadge, PageBackButton, PageContent, StatCard } from '../components/app';

const CATEGORY_ICONS = {
  'Food & Dining': ForkKnife,
  'Transportation': Car,
  'Entertainment': Ticket,
  'Shopping': ShoppingBag,
  'Groceries': ShoppingCart,
  'Utilities': Lightbulb,
  'Healthcare': Stethoscope,
  'Travel': Airplane,
  'Other': DotsThreeCircle,
};

function GroupDetail({ onLogout }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGroupData = useCallback(async () => {
    try {
      const groupsRes = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      const foundGroup = groupsRes.data.find((g) => g.id === groupId);

      if (!foundGroup) {
        toast.error('Group not found');
        navigate('/groups');
        return;
      }

      setGroup(foundGroup);

      const [expensesRes, settlementsRes] = await Promise.all([
        axios.get(`${API}/groups/${groupId}/expenses`, {
          headers: getAuthHeader(),
        }),
        axios.get(`${API}/groups/${groupId}/settlements`, {
          headers: getAuthHeader(),
        }),
      ]);

      setExpenses(expensesRes.data);
      setSettlements(settlementsRes.data);
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  if (loading) {
    return (
      <AppShell>
        <Header onLogout={onLogout} />
        <PageContent className="text-center">
          <p>Loading...</p>
        </PageContent>
      </AppShell>
    );
  }

  if (!group) return null;

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.total_amount || 0), 0);

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent>
        <PageBackButton data-testid="back-button" onClick={() => navigate('/groups')}>
          Back to Groups
        </PageBackButton>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,0.9fr]">
          <AppSurface className="p-5 md:p-6">
            <p className="app-eyebrow mb-2">Group Detail</p>
            <h1 className="mb-3 text-4xl font-extrabold tracking-[-0.05em] text-[var(--app-foreground)]">{group.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
              A calmer ledger for shared moments. Review who is involved, what was spent, and how the remaining balances should settle.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <StatCard label="Members" value={group.members.length} description="Friends participating in this shared tab." icon={Users} />
              <StatCard label="Total Expenses" value={`Rs ${totalExpenses.toFixed(2)}`} description={`Across ${expenses.length} expense entries in this group.`} icon={Receipt} />
            </div>
          </AppSurface>

          <AppSurface variant="soft" className="p-5 md:p-6">
            <p className="app-eyebrow mb-4">Members</p>
            <div className="flex flex-wrap gap-2.5">
              {group.members.map((member) => (
                <MemberBadge key={member.id} data-testid={`member-badge-${member.id}`}>
                  {member.name}
                </MemberBadge>
              ))}
            </div>
          </AppSurface>
        </section>

        <AppSurface className="mb-6 p-5 md:p-6">
          <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">
            Expenses
          </h2>

          {expenses.length === 0 ? (
            <p className="py-8 text-center text-[var(--app-muted)]">No expenses yet</p>
          ) : (
            <div className="space-y-3" data-testid="group-expenses-list">
                {expenses.map((expense) => {
                  const Icon = CATEGORY_ICONS[expense.category] || Receipt;
                  return (
                    <button
                      key={expense.id}
                      className="app-list-row group flex w-full items-center justify-between gap-4 p-4 text-left transition-all active:scale-[0.98] sm:p-5"
                      data-testid={`expense-${expense.id}`}
                      onClick={() =>
                        navigate(`/expenses/${expense.id}`, {
                          state: { from: `/groups/${groupId}`, fromLabel: group.name },
                        })
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.5rem] bg-[var(--app-soft)] text-[var(--app-primary)] transition-all group-hover:bg-[var(--app-primary-soft)] group-hover:text-[var(--app-primary-strong)]">
                          <Icon size={26} weight="bold" />
                        </div>
                        <div>
                          <h3 className="text-base font-black tracking-tight text-[var(--app-foreground)] md:text-lg">
                            {expense.merchant}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-widest text-[var(--app-primary-strong)]">
                              {expense.category || 'Other'}
                            </span>
                            <span className="hidden h-1 w-1 rounded-full bg-[var(--app-border-soft)] md:block" />
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--app-muted)]">
                              <CalendarBlank size={12} weight="bold" />
                              {expense.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black tracking-tighter text-[var(--app-primary-strong)] md:text-2xl">
                          <span className="mr-0.5 text-xs font-bold opacity-40">Rs</span>
                          {Number(expense.total_amount).toFixed(2)}
                        </p>
                        <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--app-muted)] transition-colors group-hover:text-[var(--app-primary)]">
                          Details &rarr;
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </AppSurface>

        <AppSurface className="p-5 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]">
              <ArrowsLeftRight size={20} weight="bold" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">
              Settlements
            </h2>
          </div>

          {settlements.length === 0 ? (
            <p className="py-8 text-center text-[var(--app-muted)]">All settled up!</p>
          ) : (
            <div className="space-y-3" data-testid="group-settlements-list">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="app-list-row flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                  data-testid={`settlement-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--app-foreground)]">{settlement.from_user_name}</span>
                    <span className="text-xs text-[var(--app-muted)]">owes</span>
                    <span className="text-sm font-bold text-[var(--app-foreground)]">{settlement.to_user_name}</span>
                  </div>
                  <p className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]">
                    Rs {Number(settlement.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </PageContent>
    </AppShell>
  );
}

export default GroupDetail;
