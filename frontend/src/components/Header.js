import { useNavigate, useLocation } from 'react-router-dom';
import { Receipt, House, Users, ArrowsLeftRight, SignOut, Plus, CurrencyInr } from '@phosphor-icons/react';
import { getCurrentUser } from '../App';

function Header({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header
        className="border-b-2 border-[#0F0F0F] sticky top-0 z-50 hidden md:block"
        style={{ background: '#FFFDF2' }}
        data-testid="header"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center">
                <Receipt size={20} weight="bold" />
              </div>
              <h1
                className="text-xl font-black tracking-tight"
                style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
                data-testid="app-title"
              >
                goDutch
              </h1>
            </div>

            <nav className="flex items-center gap-2">
              <button
                data-testid="nav-dashboard"
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 border-[#0F0F0F] rounded-full transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[#C4F1F9]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <House size={16} weight="bold" />
                Dashboard
              </button>
              <button
                data-testid="nav-groups"
                onClick={() => navigate('/groups')}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 border-[#0F0F0F] rounded-full transition-all ${
                  isActive('/groups')
                    ? 'bg-[#C4F1F9]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Users size={16} weight="bold" />
                Groups
              </button>
              <button
                data-testid="nav-settlements"
                onClick={() => navigate('/settlements')}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 border-[#0F0F0F] rounded-full transition-all ${
                  isActive('/settlements')
                    ? 'bg-[#C4F1F9]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <ArrowsLeftRight size={16} weight="bold" />
                Settlements
              </button>
            </nav>

            <button
              data-testid="logout-btn"
              onClick={onLogout}
              className="neo-btn-secondary flex items-center gap-2 text-sm"
            >
              <SignOut size={16} weight="bold" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className="border-b-2 border-[#0F0F0F] sticky top-0 z-50 md:hidden"
        style={{ background: '#FFFDF2' }}
        data-testid="mobile-header"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center">
                <Receipt size={16} weight="bold" />
              </div>
              <h1
                className="text-lg font-black tracking-tight"
                style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
              >
                goDutch
              </h1>
            </div>
            <button
              data-testid="mobile-logout-btn"
              onClick={onLogout}
              className="p-2 border-2 border-[#0F0F0F] rounded-lg bg-white"
            >
              <SignOut size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t-2 border-[#0F0F0F] z-50 md:hidden"
        style={{ background: '#FFFDF2' }}
        data-testid="mobile-nav"
      >
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            data-testid="mobile-nav-dashboard"
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 py-2 px-2 border-2 border-[#0F0F0F] rounded-lg transition-all ${
              isActive('/dashboard') ? 'bg-[#C4F1F9]' : 'bg-white'
            }`}
          >
            <House size={20} weight=\"bold\" />
            <span className=\"text-xs font-bold\">Home</span>
          </button>
          <button
            data-testid="mobile-nav-upi"
            onClick={() => navigate('/upi')}
            className={`flex flex-col items-center gap-1 py-2 px-2 border-2 border-[#0F0F0F] rounded-lg transition-all ${
              isActive('/upi') || location.pathname.startsWith('/upi') ? 'bg-[#C4F1F9]' : 'bg-white'
            }`}
          >
            <CurrencyInr size={20} weight=\"bold\" />
            <span className=\"text-xs font-bold\">UPI</span>
          </button>
          <button
            data-testid="mobile-nav-new-expense"
            onClick={() => navigate('/new-expense')}
            className={`flex flex-col items-center gap-1 py-2 px-2 border-2 border-[#0F0F0F] rounded-lg transition-all ${
              isActive('/new-expense') ? 'bg-[#C4F1F9]' : 'bg-white'
            }`}
          >
            <Plus size={20} weight=\"bold\" />
            <span className=\"text-xs font-bold\">Add</span>
          </button>
          <button
            data-testid="mobile-nav-groups"
            onClick={() => navigate('/groups')}
            className={`flex flex-col items-center gap-1 py-2 px-2 border-2 border-[#0F0F0F] rounded-lg transition-all ${
              isActive('/groups') || location.pathname.startsWith('/groups') ? 'bg-[#C4F1F9]' : 'bg-white'
            }`}
          >
            <Users size={20} weight=\"bold\" />
            <span className=\"text-xs font-bold\">Groups</span>
          </button>
          <button
            data-testid="mobile-nav-settlements"
            onClick={() => navigate('/settlements')}
            className={`flex flex-col items-center gap-1 py-2 px-2 border-2 border-[#0F0F0F] rounded-lg transition-all ${
              isActive('/settlements') ? 'bg-[#C4F1F9]' : 'bg-white'
            }`}
          >
            <ArrowsLeftRight size={20} weight=\"bold\" />
            <span className=\"text-xs font-bold\">Settle</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Header;