import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TrendingUp, PieChart, BarChart2 } from 'lucide-react-native';
import { AppShell, PageContent } from '../../src/slate/AppShell';
import { Text } from '../../src/slate/Text';
import { Header } from '../../src/slate/Header';
import { PageHero } from '../../src/slate/PageHero';
import { StatCard, Callout, Breath, IconBadge } from '../../src/slate/atoms';
import { AppSurface } from '../../src/slate/AppSurface';
import { useGroupsStore } from '../../src/stores';
import { api } from '../../src/api/client';
import { getCurrencySymbol } from '../../src/utils/constants';
import { colors } from '../../src/theme/tokens';

interface ReportData {
  total_expenses: number;
  total_amount: number;
  average_expense: number;
  category_breakdown: Record<string, number>;
  user_spending: { name: string; amount: number }[];
  monthly_trend: Record<string, number>;
}

export default function ReportsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { getById } = useGroupsStore();
  const group = getById(groupId);
  const currency = group?.currency ?? 'INR';
  const sym = getCurrencySymbol(currency);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/groups/${groupId}/reports`);
      setReport(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [groupId]);

  if (loading) {
    return (
      <AppShell>
        <Header title="Reports" eyebrow={group?.name} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header title="Reports" eyebrow={group?.name} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchReport} tintColor={colors.primary} />
        }
      >
        <PageContent>
          <PageHero eyebrow="Analytics" title="Spending Report" compact />

          {error && (
            <Callout tone="danger" style={{ marginBottom: 20 }}>{error}</Callout>
          )}

          {report && (
            <>
              {/* Summary stats */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <StatCard
                  label="Total spent"
                  value={`${sym}${report.total_amount.toFixed(2)}`}
                  icon={<TrendingUp size={16} color={colors.primary} strokeWidth={2.2} />}
                />
                <StatCard
                  label="Expenses"
                  value={String(report.total_expenses)}
                />
              </View>
              <View style={{ marginBottom: 32 }}>
                <StatCard
                  label="Avg per expense"
                  value={`${sym}${report.average_expense.toFixed(2)}`}
                />
              </View>

              {/* Category breakdown */}
              {Object.keys(report.category_breakdown).length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <IconBadge
                      icon={<PieChart size={16} color={colors.primary} strokeWidth={2.2} />}
                      tone="soft"
                      size="sm"
                    />
                    <Text variant="titleLg" weight="extrabold">By Category</Text>
                  </View>
                  <View style={{ gap: 8, marginBottom: 32 }}>
                    {Object.entries(report.category_breakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, amount]) => {
                        const pct = report.total_amount > 0
                          ? (amount / report.total_amount) * 100
                          : 0;
                        return (
                          <AppSurface key={cat} variant="solid" compact>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text variant="title" weight="semibold">{cat}</Text>
                              <Text variant="title" weight="extrabold" style={{ color: colors.primary }}>
                                {sym}{amount.toFixed(2)}
                              </Text>
                            </View>
                            {/* Simple progress bar */}
                            <View
                              style={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: colors.soft,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: colors.primary,
                                  width: `${pct}%`,
                                }}
                              />
                            </View>
                            <Text variant="label" tone="subtle" style={{ marginTop: 4 }}>
                              {pct.toFixed(0)}% of total
                            </Text>
                          </AppSurface>
                        );
                      })}
                  </View>
                </>
              )}

              {/* Member spending */}
              {report.user_spending.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <IconBadge
                      icon={<BarChart2 size={16} color={colors.primary} strokeWidth={2.2} />}
                      tone="soft"
                      size="sm"
                    />
                    <Text variant="titleLg" weight="extrabold">By Member</Text>
                  </View>
                  <View style={{ gap: 8, marginBottom: 32 }}>
                    {report.user_spending
                      .sort((a, b) => b.amount - a.amount)
                      .map((user) => (
                        <AppSurface key={user.name} variant="solid" compact>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text variant="title" weight="semibold">{user.name}</Text>
                            <Text variant="title" weight="extrabold">
                              {sym}{user.amount.toFixed(2)}
                            </Text>
                          </View>
                        </AppSurface>
                      ))}
                  </View>
                </>
              )}

              {/* Monthly trend */}
              {Object.keys(report.monthly_trend).length > 0 && (
                <>
                  <Text variant="titleLg" weight="extrabold" style={{ marginBottom: 14 }}>
                    Monthly Trend
                  </Text>
                  <View style={{ gap: 8, marginBottom: 32 }}>
                    {Object.entries(report.monthly_trend)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([month, amount]) => (
                        <AppSurface key={month} variant="solid" compact>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text variant="title" weight="semibold">{month}</Text>
                            <Text variant="title" weight="extrabold" style={{ color: colors.primary }}>
                              {sym}{(amount as number).toFixed(2)}
                            </Text>
                          </View>
                        </AppSurface>
                      ))}
                  </View>
                </>
              )}

              <Callout tone="info" style={{ marginBottom: 16 }}>
                Interactive charts coming soon — data tables above are fully accurate.
              </Callout>
            </>
          )}

          <Breath size="lg" />
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
