import { useNavigate, useLocation } from 'react-router-dom';
import { Receipt, House, Users, ArrowsLeftRight, SignOut } from '@phosphor-icons/react';
import { getCurrentUser } from '../App';

function Header({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="border-b-2 border-[#0F0F0F] sticky top-0 z-50"
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
              SplitScan
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-2">
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
  );
}

export default Header;