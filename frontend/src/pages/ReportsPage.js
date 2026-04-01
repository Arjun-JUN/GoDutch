import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { ChartBar, TrendUp, Users } from '@phosphor-icons/react';
import Header from '../components/Header';
import { AppShell, AppSurface, Callout, EmptyState, IconBadge, PageBackButton, PageContent, PageHero, StatCard } from '../components/app';

function ReportsPage({ onLogout }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groupsRes, reportsRes] = await Promise.all([
          axios.get(`${API}/groups`, { headers: getAuthHeader() }),
          axios.get(`${API}/groups/${groupId}/reports`, { headers: getAuthHeader() })
        ]);

        const foundGroup = groupsRes.data.find(g => g.id === groupId);
        setGroup(foundGroup);
        setReports(reportsRes.data);
      } catch (error) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  const categoryData = Object.entries(reports?.category_breakdown || {});

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent>
        <PageBackButton
          data-testid="back-button"
          onClick={() => navigate('/settlements')}
        >
          Back to Settlements
        </PageBackButton>

        <PageHero
          eyebrow={group?.name || 'Group'}
          title="Expense Reports"
          description="A breakdown of spending by category, member, and month for this group."
          className="mb-6 md:mb-8"
        />

        {loading ? (
          <p className="text-[var(--app-muted)]">Loading reports...</p>
        ) : !reports || !group ? (
          <EmptyState
            icon={ChartBar}
            title="No report data"
            description="Add some expenses to this group to see spending insights."
          />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3 md:mb-6">
              <StatCard
                label="Total Expenses"
                value={String(reports.total_expenses)}
                description="Number of expenses recorded"
                icon={ChartBar}
              />
              <StatCard
                label="Total Spent"
                value={`Rs ${reports.total_amount.toFixed(2)}`}
                description="Combined spend across all members"
                icon={TrendUp}
                valueClassName="text-[var(--app-primary-strong)]"
              />
              <StatCard
                label="Avg Expense"
                value={`Rs ${reports.average_expense.toFixed(2)}`}
                description="Average per expense entry"
                icon={ChartBar}
              />
            </div>

            <div className="space-y-5 md:space-y-6">
              {categoryData.length > 0 && (
                <AppSurface className="p-5 md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <IconBadge icon={ChartBar} />
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Spending by Category</h2>
                      <p className="text-sm text-[var(--app-muted)]">How your budget breaks down.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categoryData.map(([category, amount]) => {
                      const percentage = reports.total_amount > 0
                        ? (amount / reports.total_amount) * 100
                        : 0;
                      return (
                        <div key={category} className="app-list-row p-4">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="font-bold text-[var(--app-foreground)]">{category}</span>
                            <span className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]">
                              Rs {Number(amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-[var(--app-soft)]">
                            <div
                              className="h-full rounded-full bg-[var(--app-primary)]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="app-eyebrow mt-1">{percentage.toFixed(1)}% of total</p>
                        </div>
                      );
                    })}
                  </div>
                </AppSurface>
              )}

              {reports.user_spending?.length > 0 && (
                <AppSurface className="p-5 md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <IconBadge icon={Users} />
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Spending by Member</h2>
                      <p className="text-sm text-[var(--app-muted)]">Who paid the most.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reports.user_spending.map((user, index) => (
                      <div key={index} className="app-list-row flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--app-soft)] text-sm font-bold text-[var(--app-primary-strong)]">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-[var(--app-foreground)]">{user.name}</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]">
                          Rs {Number(user.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </AppSurface>
              )}

              {Object.keys(reports.monthly_trend || {}).length > 0 && (
                <AppSurface className="p-5 md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <IconBadge icon={TrendUp} />
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Monthly Trend</h2>
                      <p className="text-sm text-[var(--app-muted)]">Spending over time.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(reports.monthly_trend).map(([month, amount]) => (
                      <div key={month} className="app-list-row flex items-center justify-between gap-4 p-4">
                        <span className="font-bold text-[var(--app-foreground)]">{month}</span>
                        <span className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]">
                          Rs {Number(amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </AppSurface>
              )}

              {categoryData.length === 0 && !reports.user_spending?.length && (
                <Callout>
                  <p className="text-sm text-[var(--app-muted)]">No detailed breakdown available yet. Add more expenses to see category and member insights.</p>
                </Callout>
              )}
            </div>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}

export default ReportsPage;
