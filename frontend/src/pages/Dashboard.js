import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { ArrowsLeftRight, ChartLineUp, Plus, Receipt } from '@/slate/icons';
import { Header, AppButton, AppShell, AppSurface, EmptyState, ExpenseCard, IconBadge, MemberBadge, PageContent, PageHero, StatCard } from '@/slate';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youreOwed, setYoureOwed] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const groups = await api.get('/groups');

        if (groups.length > 0) {
          const allExpenses = [];
          let totalOwed = 0;
          let totalOwe = 0;

          for (const group of groups) {
            const [expensesData, settlementsData] = await Promise.all([
              api.get(`/groups/${group.id}/expenses`),
              api.get(`/groups/${group.id}/settlements`),
            ]);
            allExpenses.push(...expensesData);
            for (const s of settlementsData) {
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
      <Header />

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
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    amount={myShare ? myShare.amount : expense.total_amount}
                    amountLabel={<>YOUR<br className="sm:hidden" /> SHARE</>}
                    onClick={() => navigate(`/expenses/${expense.id}`, { state: { from: '/dashboard', fromLabel: 'Dashboard' } })}
                  />
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
