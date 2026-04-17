import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import {
  ArrowsLeftRight,
  Bell,
  CaretRight,
  ChartBar,
  Coffee,
  FilmStrip,
  ForkKnife,
  House,
  List,
  Plus,
  Receipt,
  ShoppingCart,
  SignOut,
  User,
  Users,
} from '@/slate/icons';

const CURRENCY = '\u20B9';

export function iconForExpense(expense) {
  const haystack = `${expense?.category || ''} ${expense?.merchant || ''}`.toLowerCase();
  if (/(coffee|cafe|tea|starbucks|tokai)/.test(haystack)) return Coffee;
  if (/(movie|cinema|theatre|film|pvr|inox)/.test(haystack)) return FilmStrip;
  if (/(grocer|mart|market|foods|shop|store)/.test(haystack)) return ShoppingCart;
  if (/(restaurant|dinner|lunch|pizza|pizzeria|burger|sushi|curry|food)/.test(haystack)) return ForkKnife;
  return Receipt;
}

export function formatActivityDate(input) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return typeof input === 'string' ? input : '';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return `${CURRENCY}0`;
  return `${CURRENCY}${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function BalanceHero({ net, onAddExpense }) {
  const prefersReducedMotion = useReducedMotion();
  const isOwed = net > 0.004;
  const owesOthers = net < -0.004;
  const label = isOwed ? "You're owed" : owesOthers ? 'You owe' : 'All settled';
  const amountText = isOwed || owesOthers ? formatAmount(net) : '';
  const amountColor = owesOthers
    ? 'text-[var(--app-danger)]'
    : 'text-[var(--app-primary-strong)]';

  return (
    <section className="w-full text-center mb-10" data-testid="balance-hero">
      <p className="app-eyebrow mb-2">Current Balance</p>
      <h2
        className={`text-5xl md:text-6xl font-extrabold tracking-[-0.04em] mb-6 ${amountColor}`}
        data-testid="balance-amount"
      >
        {label}
        {amountText ? <> {amountText}</> : null}
      </h2>
      <motion.button
        type="button"
        data-testid="add-expense-btn"
        onClick={onAddExpense}
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        className="mx-auto inline-flex items-center gap-2 rounded-full px-8 py-3 font-extrabold text-[var(--app-primary-foreground)] bg-[linear-gradient(135deg,var(--app-primary)_0%,var(--app-primary-strong)_100%)] shadow-[var(--app-shadow-button)]"
      >
        <Plus size={18} weight="bold" />
        Add Expense
      </motion.button>
    </section>
  );
}

function ActivityRow({ expense, userId, onOpen }) {
  const Icon = iconForExpense(expense);
  const iPaid = expense.paid_by_id === userId;
  const myShare = expense.split_details?.find((s) => s.user_id === userId);
  const displayAmount = iPaid
    ? expense.total_amount
    : myShare?.amount ?? expense.total_amount ?? 0;
  const label = iPaid ? 'You Paid' : 'Your Share';
  const amountColor = iPaid ? 'text-[var(--app-primary)]' : 'text-[var(--app-muted)]';

  return (
    <button
      type="button"
      data-testid={`activity-row-${expense.id}`}
      onClick={() => onOpen(expense)}
      className="w-full flex items-center justify-between gap-3 py-3 px-3 hover:bg-white/70 rounded-xl transition-colors text-left"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white flex items-center justify-center text-[var(--app-primary)]">
          <Icon size={20} weight="bold" />
        </div>
        <div className="min-w-0">
          <p
            className="font-extrabold text-[var(--app-foreground)] leading-tight truncate"
            data-testid={`activity-merchant-${expense.id}`}
          >
            {expense.merchant || 'Untitled expense'}
          </p>
          <p className="text-[12px] text-[var(--app-muted)]">
            {formatActivityDate(expense.date || expense.created_at)}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`font-extrabold ${amountColor}`}
          data-testid={`activity-amount-${expense.id}`}
        >
          {formatAmount(displayAmount)}
        </p>
        <p className="text-[9px] text-[var(--app-muted)] uppercase tracking-wider font-extrabold">
          {label}
        </p>
      </div>
    </button>
  );
}

function BottomNav({ onProfileClick, onReportsClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const items = [
    { key: 'home', label: 'Home', icon: House, onClick: () => navigate('/dashboard'), match: (p) => p === '/dashboard' || p === '/' },
    { key: 'groups', label: 'Groups', icon: Users, onClick: () => navigate('/groups'), match: (p) => p.startsWith('/groups') },
    { key: 'settle', label: 'Settle', icon: ArrowsLeftRight, onClick: () => navigate('/settlements'), match: (p) => p.startsWith('/settlements') },
    { key: 'reports', label: 'Reports', icon: ChartBar, onClick: onReportsClick, match: (p) => p.startsWith('/reports') },
    { key: 'profile', label: 'Profile', icon: User, onClick: onProfileClick, match: () => false },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(42,52,52,0.04)] rounded-t-[1.5rem]"
      data-testid="bottom-nav"
    >
      {items.map((item) => {
        const active = item.match(location.pathname);
        const Icon = item.icon;
        return (
          <motion.button
            key={item.key}
            type="button"
            data-testid={`bottom-nav-${item.key}`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            onClick={item.onClick}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={
              active
                ? 'flex flex-col items-center justify-center bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)] rounded-full px-5 py-1.5'
                : 'flex flex-col items-center justify-center text-[var(--app-muted)] px-4 py-1.5 hover:opacity-80 transition-opacity'
            }
          >
            <Icon size={22} weight={active ? 'fill' : 'bold'} />
            <span className={`text-[10px] tracking-wide ${active ? 'font-extrabold' : 'font-semibold'}`}>{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [youreOwed, setYoureOwed] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [pendingSettlements, setPendingSettlements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const groupsData = await api.get('/groups');
        const safeGroups = Array.isArray(groupsData) ? groupsData : [];
        let allExpenses = [];
        let totalOwed = 0;
        let totalOwe = 0;
        let pending = 0;

        for (const group of safeGroups) {
          const [expensesData, settlementsData] = await Promise.all([
            api.get(`/groups/${group.id}/expenses`),
            api.get(`/groups/${group.id}/settlements`),
          ]);
          if (Array.isArray(expensesData)) allExpenses.push(...expensesData);
          for (const s of Array.isArray(settlementsData) ? settlementsData : []) {
            if (s.to_user_id === user?.id) {
              totalOwed += Number(s.amount) || 0;
              pending += 1;
            }
            if (s.from_user_id === user?.id) {
              totalOwe += Number(s.amount) || 0;
              pending += 1;
            }
          }
        }

        if (cancelled) return;
        const sorted = allExpenses.sort(
          (a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0),
        );
        setGroups(safeGroups);
        setExpenses(sorted);
        setYoureOwed(totalOwed);
        setYouOwe(totalOwe);
        setPendingSettlements(pending);
      } catch (error) {
        if (!cancelled) toast.error('Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const net = useMemo(() => youreOwed - youOwe, [youreOwed, youOwe]);
  const recentExpenses = useMemo(() => expenses.slice(0, 4), [expenses]);
  const initial = (user?.name || '').trim().charAt(0).toUpperCase();

  const handleReports = () => {
    if (groups.length === 0) {
      toast.message('Create a group first to view reports');
      navigate('/groups');
      return;
    }
    navigate(`/reports/${groups[0].id}`);
  };

  return (
    <div className="app-shell min-h-screen flex flex-col" data-testid="home-shell">
      <header className="sticky top-0 z-40 bg-[rgba(249,251,250,0.82)] backdrop-blur-xl" ref={menuRef}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              data-testid="menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              className="text-[var(--app-primary)] hover:opacity-80 transition-opacity"
            >
              <List size={24} weight="bold" />
            </button>
            <h1 className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]">
              GoDutch
            </h1>
          </div>

          <button
            type="button"
            aria-label="Account menu"
            data-testid="avatar-btn"
            onClick={() => setMenuOpen((o) => !o)}
            className="h-10 w-10 rounded-full overflow-hidden bg-[var(--app-soft-strong)] flex items-center justify-center text-[var(--app-primary-strong)]"
          >
            {initial ? (
              <span className="text-sm font-extrabold" data-testid="avatar-initial">
                {initial}
              </span>
            ) : (
              <User size={18} weight="bold" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              data-testid="menu-popover"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              className="absolute right-6 top-[68px] w-52 rounded-[1.25rem] bg-white p-2 shadow-[var(--app-shadow-card)]"
            >
              <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--app-muted-subtle)]">
                Signed in as
              </div>
              <div className="px-3 pb-2 text-sm font-extrabold text-[var(--app-foreground)] truncate">
                {user?.name || 'You'}
              </div>
              <button
                type="button"
                data-testid="logout-btn"
                onClick={() => {
                  setMenuOpen(false);
                  logout?.();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-[var(--app-foreground)] transition-colors hover:bg-[var(--app-soft)]"
              >
                <SignOut size={16} weight="bold" />
                Logout
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <motion.main
        className="flex-grow flex flex-col items-center px-6 pt-8 pb-32 max-w-2xl mx-auto w-full"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <BalanceHero net={net} onAddExpense={() => navigate('/new-expense')} />

        <section
          className="w-full rounded-[2rem] bg-[var(--app-soft)] p-6 mb-6"
          data-testid="recent-activity"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-extrabold tracking-[-0.02em] text-[var(--app-foreground)]">
              Recent Activity
            </h3>
            <button
              type="button"
              data-testid="view-all-btn"
              onClick={() => navigate('/groups')}
              className="text-sm font-bold text-[var(--app-primary)]"
            >
              View all
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-[var(--app-muted)]" data-testid="activity-loading">
              Loading...
            </p>
          ) : recentExpenses.length === 0 ? (
            <div className="py-8 text-center" data-testid="activity-empty">
              <Receipt size={40} weight="bold" className="mx-auto mb-2 text-[var(--app-muted-subtle)]" />
              <p className="text-sm text-[var(--app-muted)]">No expenses yet — add your first one.</p>
            </div>
          ) : (
            <div className="space-y-1" data-testid="activity-list">
              {recentExpenses.map((expense) => (
                <ActivityRow
                  key={expense.id}
                  expense={expense}
                  userId={user?.id}
                  onOpen={(e) =>
                    navigate(`/expenses/${e.id}`, {
                      state: { from: '/dashboard', fromLabel: 'Home' },
                    })
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[var(--app-border-soft)]">
            <button
              type="button"
              data-testid="settlements-banner"
              onClick={() => navigate('/settlements')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/50 py-2 text-[var(--app-muted)] transition-colors hover:bg-white/80 hover:text-[var(--app-primary)]"
            >
              <Bell size={18} weight="bold" />
              <span className="text-sm font-bold tracking-tight" data-testid="settlements-banner-label">
                {pendingSettlements > 0
                  ? `${pendingSettlements} settlement${pendingSettlements === 1 ? '' : 's'} waiting`
                  : 'All settlements cleared'}
              </span>
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </section>
      </motion.main>

      <BottomNav onProfileClick={() => setMenuOpen((o) => !o)} onReportsClick={handleReports} />
    </div>
  );
}

export default Dashboard;
