import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowsLeftRight, 
  CurrencyInr, 
  House, 
  Plus, 
  Receipt, 
  SignOut, 
  Users 
} from '@/slate/icons';
import { AppButton } from './AppButton';
import { IconBadge } from './AppSurface';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { logout } = useAuth();

  const navItems = [
    { key: 'dashboard', label: 'Home', path: '/dashboard', icon: House },
    { key: 'upi', label: 'UPI', path: '/upi', icon: CurrencyInr, match: (pathname) => pathname.startsWith('/upi') },
    { key: 'new-expense', label: 'Split', path: '/new-expense', icon: Plus },
    { key: 'groups', label: 'Groups', path: '/groups', icon: Users, match: (pathname) => pathname.startsWith('/groups') },
    { key: 'settlements', label: 'Settle', path: '/settlements', icon: ArrowsLeftRight },
  ];
  const actionItems = [
    ...navItems,
    { key: 'logout', label: 'Logout', icon: SignOut, onClick: logout },
  ];

  const isActive = (item) => {
    if (item.key === 'logout') {
      return false;
    }

    return item.match ? item.match(location.pathname) : location.pathname === item.path;
  };

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    navigate(item.path);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-[rgba(169,180,179,0.14)] bg-[rgba(249,251,250,0.82)] backdrop-blur-xl"
        data-testid="header"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => navigate('/dashboard')}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              <IconBadge icon={Receipt} tone="soft" className="h-11 w-11 bg-[rgba(209,232,221,0.75)]" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-left"
              data-testid="app-title"
              whileHover={prefersReducedMotion ? undefined : { opacity: 0.92 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              <div className="text-lg font-extrabold tracking-[-0.04em] text-[var(--app-primary)] md:text-xl">GoDutch</div>
              <div className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--app-muted)] md:block">
                Alpine Ledger
              </div>
            </motion.button>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.div key={item.key}>
                  <AppButton
                    data-testid={`nav-${item.key}`}
                    onClick={() => handleItemClick(item)}
                    variant={active ? 'secondary' : 'ghost'}
                    size="sm"
                    className={`${
                      active
                        ? 'bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]'
                        : 'text-[var(--app-muted)]'
                    }`}
                  >
                    <Icon size={16} weight={active ? 'fill' : 'bold'} />
                    {item.label}
                  </AppButton>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </header>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(169,180,179,0.16)] bg-[rgba(249,251,250,0.9)] px-3 pb-5 pt-3 backdrop-blur-xl md:hidden"
        data-testid="mobile-nav"
      >
        <div className="grid grid-cols-6 gap-2">
          {actionItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const testId = item.key === 'new-expense' ? 'mobile-nav-new-expense' : `mobile-nav-${item.key}`;
            return (
              <motion.button
                key={item.key}
                type="button"
                data-testid={testId}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center gap-1 rounded-[1.25rem] px-2 py-2.5 text-[11px] font-bold transition-all ${
                  active
                    ? 'bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]'
                    : 'bg-[rgba(255,255,255,0.66)] text-[var(--app-muted)]'
                }`}
                whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
              >
                <Icon size={20} weight={active ? 'fill' : 'bold'} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Header;
