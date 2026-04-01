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
              {groupedExpenses.map((expense) => {
                const myShare = expense.split_details?.find(
                  (s) => s.user_id === user?.id,
                );
                return (
                  <button
                    key={expense.id}
                    data-testid={`expense-${expense.id}`}
                    onClick={() => navigate(`/expenses/${expense.id}`, { state: { from: '/dashboard', fromLabel: 'Dashboard' } })}
                    className="app-list-row w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left hover:-translate-y-px transition-transform"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e9efee] text-[var(--app-primary)]">
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
                        Rs {myShare ? Number(myShare.amount).toFixed(2) : Number(expense.total_amount).toFixed(2)}
                      </p>
                      <p className="app-eyebrow mt-1">your share</p>
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
