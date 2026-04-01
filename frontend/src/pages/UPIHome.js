import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, getAuthHeader, getCurrentUser } from '../App';
import {
  PaperPlaneTilt,
  Money,
  QrCode,
  CurrencyInr,
  Phone,
  Receipt as ReceiptIcon,
  ArrowsDownUp,
  Wallet
} from '@/slate/icons';
import { Header, InDevelopmentOverlay, AppButton, AppShell, AppSurface, Callout, EmptyState, IconBadge, PageContent, PageHero } from '@/slate';

function UPIHome({ onLogout }) {
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsRes, transactionsRes] = await Promise.all([
          axios.get(`${API}/upi/accounts`, { headers: getAuthHeader() }),
          axios.get(`${API}/upi/transactions?limit=5`, { headers: getAuthHeader() })
        ]);

        const primaryAccount = accountsRes.data.find((acc) => acc.is_primary);
        if (primaryAccount) {
          setAccount(primaryAccount);
          setBalance(primaryAccount.balance);
        }

        setRecentTransactions(transactionsRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const quickActions = [
    {
      id: 'send',
      label: 'Send Money',
      icon: PaperPlaneTilt,
      toneClass: 'bg-[var(--app-soft-strong)]',
      route: '/upi/send'
    },
    {
      id: 'request',
      label: 'Request',
      icon: Money,
      toneClass: 'bg-[#e4f1db]',
      route: '/upi/request'
    },
    {
      id: 'scan',
      label: 'Scan QR',
      icon: QrCode,
      toneClass: 'bg-[#f8dfe8]',
      route: '/upi/scan'
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: QrCode,
      toneClass: 'bg-[#e1efef]',
      route: '/upi/receive'
    }
  ];

  const services = [
    {
      id: 'recharge',
      label: 'Recharge',
      icon: Phone,
      route: '/upi/recharge'
    },
    {
      id: 'bills',
      label: 'Bills',
      icon: ReceiptIcon,
      route: '/upi/bills'
    },
    {
      id: 'history',
      label: 'History',
      icon: ArrowsDownUp,
      route: '/upi/transactions'
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: Wallet,
      route: '/upi/accounts'
    }
  ];

  if (!account && !loading) {
    return (
      <AppShell>
        <Header onLogout={onLogout} />

        <PageContent className="max-w-5xl relative">
          <InDevelopmentOverlay 
            marketingText="Revolutionizing how you settle up. Our UPI integration is coming soon to simplify your life."
            pmText="We are currently perfecting the secure UPI integration and real-time bank syncing to ensure 100% accuracy for your financial transactions."
          />
          <AppSurface className="p-8 text-center blur-xl opacity-30 pointer-events-none select-none">
            <EmptyState
              icon={Wallet}
              title="Link Bank Account"
              description="Link your bank account to start using UPI payments."
              action={(
                <AppButton onClick={() => navigate('/upi/accounts/add')}>
                  Add Bank Account
                </AppButton>
              )}
            />
          </AppSurface>
        </PageContent>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent className="max-w-5xl relative">
        <InDevelopmentOverlay 
          marketingText="Revolutionizing how you settle up. Our UPI integration is coming soon to simplify your life."
          pmText="We are currently perfecting the secure UPI integration and real-time bank syncing to ensure 100% accuracy for your financial transactions."
        />
        <div className="blur-[18px] opacity-[0.35] pointer-events-none select-none transition-all duration-1000">
          <PageHero
            eyebrow="Payments Hub"
            title="UPI"
            description="Move from tracking to payment with the same calmer design language across balances, actions, and transaction history."
          />

          <AppSurface className="mb-6 overflow-hidden p-6 md:p-8">
            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(209,232,221,0.95)_0%,rgba(231,244,239,0.96)_100%)] p-6 md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="app-eyebrow mb-2">Available Balance</p>
                  <h1 className="text-4xl font-extrabold tracking-[-0.05em] text-[var(--app-foreground)] md:text-5xl">
                    Rs {balance.toFixed(2)}
                  </h1>
                </div>
                <IconBadge icon={CurrencyInr} tone="white" className="h-16 w-16 rounded-full text-[var(--app-primary)]" />
              </div>
              {account ? (
                <div className="text-sm text-[var(--app-primary-strong)]">
                  <p className="font-bold">{account.bank_name}</p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">{account.upi_id}</p>
                </div>
              ) : null}
            </div>
          </AppSurface>

          <section className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="app-eyebrow mb-2">Quick Actions</p>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Move money fast</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.route)}
                    className="app-surface-interactive p-4 text-center"
                    data-testid={`action-${action.id}`}
                  >
                    <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-[var(--app-primary-strong)] ${action.toneClass}`}>
                      <Icon size={24} weight="bold" />
                    </div>
                    <p className="text-sm font-bold text-[var(--app-foreground)]">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-4">
              <p className="app-eyebrow mb-2">Services</p>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">UPI tools</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => navigate(service.route)}
                    className="app-surface-solid p-4 text-center transition-all hover:-translate-y-1"
                    data-testid={`service-${service.id}`}
                  >
                    <Icon size={28} weight="bold" className="mx-auto mb-3 text-[var(--app-primary-strong)]" />
                    <p className="text-sm font-bold text-[var(--app-foreground)]">{service.label}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <AppSurface className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="app-eyebrow mb-2">History</p>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">
                  Recent Transactions
                </h2>
              </div>
              <AppButton
                onClick={() => navigate('/upi/transactions')}
                variant="secondary"
                size="sm"
              >
                View All
              </AppButton>
            </div>

            {loading ? (
              <p className="text-[var(--app-muted)]">Loading...</p>
            ) : recentTransactions.length === 0 ? (
              <EmptyState
                icon={ArrowsDownUp}
                title="No transactions yet"
                description="Your latest UPI payments and collections will appear here."
              />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((txn) => {
                  const isDebit = txn.from_user_id === user.id;
                  return (
                    <div
                      key={txn.id}
                      className="app-list-row flex items-center justify-between gap-4 p-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                          isDebit ? 'bg-[#f8dfe8] text-[#8a3b53]' : 'bg-[#e4f1db] text-[var(--app-primary-strong)]'
                        }`}>
                          {isDebit ? (
                            <PaperPlaneTilt size={18} weight="bold" />
                          ) : (
                            <Money size={18} weight="bold" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--app-foreground)]">
                            {isDebit ? 'Sent to' : 'Received from'} {isDebit ? txn.to_upi_id : txn.from_upi_id}
                          </p>
                          <p className="text-xs text-[var(--app-muted)]">{new Date(txn.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`text-lg font-extrabold tracking-[-0.04em] ${
                        isDebit ? 'text-[#b24b4a]' : 'text-[var(--app-primary)]'
                      }`}>
                        {isDebit ? '-' : '+'}Rs {txn.amount.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </AppSurface>

          <Callout className="mt-6">
            <p className="text-sm text-[var(--app-muted)]">
              Keep your payment flows consistent with the rest of the app by using the same shared surfaces, actions, and ledger styling here.
            </p>
          </Callout>
        </div>
      </PageContent>
    </AppShell>
  );
}

export default UPIHome;
