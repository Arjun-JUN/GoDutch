import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { CATEGORY_ICONS } from '../lib/constants';
import {
  ArrowsLeftRight,
  Receipt,
  Users,
} from '@/slate/icons';
import { Header, AppShell, AppSurface, ExpenseCard, MemberBadge, PageBackButton, PageContent, StatCard } from '@/slate';

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGroupData = useCallback(async () => {
    try {
      const groups = await api.get('/groups');
      const foundGroup = groups.find((g) => g.id === groupId);

      if (!foundGroup) {
        toast.error('Group not found');
        navigate('/groups');
        return;
      }

      setGroup(foundGroup);

      const [expensesData, settlementsData] = await Promise.all([
        api.get(`/groups/${groupId}/expenses`),
        api.get(`/groups/${groupId}/settlements`),
      ]);

      setExpenses(expensesData);
      setSettlements(settlementsData);
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
        <Header />
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
      <Header />

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
            <div className="space-y-4" data-testid="group-expenses-list">
                {expenses.map((expense) => {
                  const Icon = CATEGORY_ICONS[expense.category] || Receipt;
                  return (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      amount={expense.total_amount}
                      amountLabel={<>DETAILS <span className="text-[12px] leading-none mb-[-2px] inline-block">&rarr;</span></>}
                      icon={Icon}
                      onClick={() =>
                        navigate(`/expenses/${expense.id}`, {
                          state: { from: `/groups/${groupId}`, fromLabel: group.name },
                        })
                      }
                    />
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
