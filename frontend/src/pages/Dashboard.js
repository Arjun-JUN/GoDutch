import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { ArrowsLeftRight, ChartLineUp, Plus, Receipt, Users } from '@phosphor-icons/react';
import Header from '../components/Header';
import { AppButton, AppShell, AppSurface, EmptyState, IconBadge, MemberBadge, PageContent, PageHero, StatCard } from '../components/app';

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsRes = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      setGroups(groupsRes.data);

      if (groupsRes.data.length > 0) {
        const allExpenses = [];
        for (const group of groupsRes.data) {
          const expensesRes = await axios.get(
            `${API}/groups/${group.id}/expenses`,
            { headers: getAuthHeader() }
          );
          allExpenses.push(...expensesRes.data);
        }
        setExpenses(allExpenses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = expenses.reduce((sum, expense) => sum + Number(expense.total_amount || 0), 0);
  const groupedExpenses = expenses.slice(0, 8);

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent>
        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <AppSurface className="lg:col-span-8 p-6 md:p-8">
            <PageHero
              eyebrow="Total Ledger"
              title={`Welcome back, ${user?.name || 'there'}`}
              description="Your group money flow is calm, organized, and ready to settle. Review the latest balances and jump back into shared expenses."
              className="mb-8"
              actions={(
                <AppButton
                  data-testid="new-expense-btn"
                  onClick={() => navigate('/new-expense')}
                  className="justify-center whitespace-nowrap"
                >
                  <Plus size={18} weight="bold" />
                  Add Expense
                </AppButton>
              )}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <StatCard
                label="Active Groups"
                value={groups.length}
                description="Shared spaces currently tracking expenses together."
              />
              <StatCard
                label="Recent Volume"
                value={`Rs ${totalSpend.toFixed(2)}`}
                description="Across the latest shared expenses in your account."
                indicatorClassName="bg-[var(--app-danger)]"
                valueClassName="text-[var(--app-foreground)]"
              />
            </div>
          </AppSurface>

          <button
            data-testid="settlements-btn"
            onClick={() => navigate('/settlements')}
            className="app-surface-soft lg:col-span-4 flex flex-col justify-between p-6 text-left transition-all hover:-translate-y-1"
          >
            <div>
              <IconBadge icon={ChartLineUp} className="mb-5 h-14 w-14" />
              <h2 className="mb-3 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-primary-strong)]">Settlement insights</h2>
              <p className="text-sm leading-6 text-[var(--app-muted)]">
                Review what is still pending, compare group activity, and move money with less back-and-forth.
              </p>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--app-primary-strong)]">
              View settlements
              <ArrowsLeftRight size={16} weight="bold" />
            </div>
          </button>
        </section>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            data-testid="groups-btn"
            onClick={() => navigate('/groups')}
            className="app-surface-solid p-6 text-left transition-all hover:-translate-y-1"
          >
            <IconBadge icon={Users} className="mb-4" />
            <h3 className="mb-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">Groups</h3>
            <p className="text-sm text-[var(--app-muted)]">{groups.length} active groups with shared balances and recent bills.</p>
          </button>

          <button
            onClick={() => navigate('/upi')}
            className="app-surface-solid p-6 text-left transition-all hover:-translate-y-1"
          >
            <IconBadge icon={ArrowsLeftRight} className="mb-4" />
            <h3 className="mb-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">Fast transfers</h3>
            <p className="text-sm text-[var(--app-muted)]">Move from tracking to payment with UPI-friendly flows when it is time to settle.</p>
          </button>

          <button
            onClick={() => navigate('/new-expense')}
            className="app-surface-solid p-6 text-left transition-all hover:-translate-y-1"
          >
            <IconBadge icon={Receipt} className="mb-4 bg-[#e9efee]" />
            <h3 className="mb-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">Receipt capture</h3>
            <p className="text-sm text-[var(--app-muted)]">Scan paper bills or enter them manually with the new alpine-styled composer.</p>
          </button>
        </div>

        <AppSurface className="p-5 md:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">
              Recent Expenses
            </h2>
            <MemberBadge>{expenses.length} tracked</MemberBadge>
          </div>

          {loading ? (
            <p className="text-[var(--app-muted)]">Loading...</p>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              action={(
                <AppButton
                  data-testid="create-first-expense-btn"
                  onClick={() => navigate('/new-expense')}
                >
                  Create Your First Expense
                </AppButton>
              )}
            />
          ) : (
            <div className="space-y-3" data-testid="expenses-list">
              {groupedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  data-testid={`expense-${expense.id}`}
                  className="app-list-row flex items-center justify-between gap-4 p-4 md:p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9efee] text-[var(--app-primary)]">
                      <Receipt size={20} weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--app-foreground)]" data-testid={`expense-merchant-${expense.id}`}>
                        {expense.merchant}
                      </h3>
                      <p className="text-sm text-[var(--app-muted)]">{expense.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)] md:text-2xl" data-testid={`expense-amount-${expense.id}`}>
                      Rs {Number(expense.total_amount).toFixed(2)}
                    </p>
                    <p className="app-eyebrow mt-1">{expense.split_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </PageContent>
    </AppShell>
  );
}

export default Dashboard;
