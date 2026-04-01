import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { ArrowsLeftRight, ChartLineUp, Plus, Receipt } from '@phosphor-icons/react';
import Header from '../components/Header';
import { AppButton, AppShell, AppSurface, EmptyState, IconBadge, MemberBadge, PageContent, PageHero, StatCard } from '../components/app';

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youreOwed, setYoureOwed] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupsRes = await axios.get(`${API}/groups`, {
          headers: getAuthHeader(),
        });

        if (groupsRes.data.length > 0) {
          const allExpenses = [];
          let totalOwed = 0;
          let totalOwe = 0;

          for (const group of groupsRes.data) {
            const [expensesRes, settlementsRes] = await Promise.all([
              axios.get(`${API}/groups/${group.id}/expenses`, { headers: getAuthHeader() }),
              axios.get(`${API}/groups/${group.id}/settlements`, { headers: getAuthHeader() }),
            ]);
            allExpenses.push(...expensesRes.data);
            for (const s of settlementsRes.data) {
              if (s.to_user_id === user?.id) totalOwed += s.amount;
              if (s.from_user_id === user?.id) totalOwe += s.amount;
            }
          }

          setExpenses(allExpenses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          setYoureOwed(totalOwed);
          setYouOwe(totalOwe);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

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
                label="You're owed"
                value={`Rs ${youreOwed.toFixed(2)}`}
                description="Total pending across all groups where you paid."
                valueClassName="text-[var(--app-primary-strong)]"
              />
              <StatCard
                label="You owe"
                value={`Rs ${youOwe.toFixed(2)}`}
                description="Your outstanding share of expenses others have paid."
                indicatorClassName="bg-[var(--app-danger)]"
                valueClassName="text-[var(--app-danger)]"
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

        <AppSurface className="p-6 md:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <h2 className="text-[32px] md:text-4xl font-extrabold tracking-[-0.02em] text-[var(--app-foreground)] leading-[1.1]">
              Recent<br />Expenses
            </h2>
            <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border border-[var(--app-border)] bg-transparent flex-shrink-0">
              <span className="text-xl font-extrabold leading-none text-[var(--app-foreground)] mb-1 mt-1">{expenses.length}</span>
              <span className="text-[11px] font-bold tracking-wide text-[var(--app-foreground)] opacity-70 leading-none">tracked</span>
            </div>
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
            <div className="space-y-4" data-testid="expenses-list">
              {groupedExpenses.map((expense) => {
                const myShare = expense.split_details?.find(
                  (s) => s.user_id === user?.id,
                );
                return (
                  <button
                    key={expense.id}
                    data-testid={`expense-${expense.id}`}
                    onClick={() => navigate(`/expenses/${expense.id}`, { state: { from: '/dashboard', fromLabel: 'Dashboard' } })}
                    className="w-full flex items-stretch justify-between gap-3 p-4 md:p-5 rounded-[2rem] border border-[var(--app-border)] bg-white text-left transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e9efee] text-[var(--app-foreground)]">
                        <Receipt size={24} weight="regular" />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-[17px] sm:text-lg font-extrabold text-[var(--app-foreground)] leading-tight whitespace-normal break-words line-clamp-2" data-testid={`expense-merchant-${expense.id}`}>
                          {expense.merchant}
                        </h3>
                        <p className="mt-1.5 text-[13px] font-semibold text-[var(--app-foreground)] opacity-60">{expense.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center text-right pl-2 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-extrabold text-[var(--app-foreground)] leading-none mb-1 opacity-80">Rs</span>
                        <span className="text-[22px] sm:text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)] leading-none" data-testid={`expense-amount-${expense.id}`}>
                          {myShare ? Number(myShare.amount).toFixed(2) : Number(expense.total_amount).toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] font-bold tracking-[0.15em] text-[var(--app-foreground)] opacity-50 uppercase text-right max-w-[60px] sm:max-w-none leading-tight">
                        YOUR<br className="sm:hidden" /> SHARE
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </AppSurface>
      </PageContent>
    </AppShell>
  );
}

export default Dashboard;
