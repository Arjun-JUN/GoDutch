import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { 
  PaperPlaneTilt, 
  Money, 
  QrCode, 
  CurrencyInr,
  Phone,
  Lightning,
  Receipt as ReceiptIcon,
  ArrowsDownUp,
  Wallet
} from '@phosphor-icons/react';
import Header from '../components/Header';

function UPIHome({ onLogout }) {
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        axios.get(`${API}/upi/accounts`, { headers: getAuthHeader() }),
        axios.get(`${API}/upi/transactions?limit=5`, { headers: getAuthHeader() })
      ]);

      const primaryAccount = accountsRes.data.find(acc => acc.is_primary);
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

  const quickActions = [
    {
      id: 'send',
      label: 'Send Money',
      icon: PaperPlaneTilt,
      color: '#C4F1F9',
      route: '/upi/send'
    },
    {
      id: 'request',
      label: 'Request',
      icon: Money,
      color: '#BDE6A3',
      route: '/upi/request'
    },
    {
      id: 'scan',
      label: 'Scan QR',
      icon: QrCode,
      color: '#FFC4D9',
      route: '/upi/scan'
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: QrCode,
      color: '#C4F1F9',
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
      <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
        <Header onLogout={onLogout} />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="neo-card p-8 text-center">
            <Wallet size={64} weight="bold" className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Link Bank Account
            </h2>
            <p className="text-gray-600 mb-6">
              Link your bank account to start using UPI payments
            </p>
            <button
              onClick={() => navigate('/upi/accounts/add')}
              className="neo-btn-primary"
            >
              Add Bank Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="neo-card p-6 md:p-8 mb-6" style={{ background: 'linear-gradient(135deg, #C4F1F9 0%, #BDE6A3 100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                ₹{balance.toFixed(2)}
              </h1>
            </div>
            <div className="w-16 h-16 bg-white border-2 border-[#0F0F0F] rounded-full flex items-center justify-center">
              <CurrencyInr size={32} weight="bold" />
            </div>
          </div>
          {account && (
            <div className="text-sm">
              <p className="font-bold">{account.bank_name}</p>
              <p className="text-xs opacity-80">{account.upi_id}</p>
            </div>
          )}
        </div>

        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => navigate(action.route)}
              className="neo-card-interactive p-4 text-center"
              data-testid={`action-${action.id}`}
            >
              <div 
                className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 border-2 border-[#0F0F0F] rounded-full flex items-center justify-center"
                style={{ background: action.color }}
              >
                <action.icon size={24} weight="bold" />
              </div>
              <p className="text-xs md:text-sm font-bold">{action.label}</p>
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Services
        </h2>
        
        <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
          {services.map(service => (
            <button
              key={service.id}
              onClick={() => navigate(service.route)}
              className="neo-card p-4 text-center hover:shadow-[6px_6px_0px_0px_rgba(15,15,15,1)] transition-all"
              data-testid={`service-${service.id}`}
            >
              <service.icon size={28} weight="bold" className="mx-auto mb-2" />
              <p className="text-xs md:text-sm font-bold">{service.label}</p>
            </button>
          ))}
        </div>

        <div className="neo-card p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Recent Transactions
            </h2>
            <button
              onClick={() => navigate('/upi/transactions')}
              className="text-sm font-bold text-blue-600"
            >
              View All
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map(txn => {
                const isDebit = txn.from_user_id === user.id;
                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 border-2 border-[#0F0F0F] rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 border-2 border-[#0F0F0F] rounded-full flex items-center justify-center ${
                        isDebit ? 'bg-[#FFC4D9]' : 'bg-[#BDE6A3]'
                      }`}>
                        {isDebit ? (
                          <PaperPlaneTilt size={18} weight="bold" />
                        ) : (
                          <Money size={18} weight="bold" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {isDebit ? 'Sent to' : 'Received from'} {isDebit ? txn.to_upi_id : txn.from_upi_id}
                        </p>
                        <p className="text-xs text-gray-600">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`font-mono font-bold text-lg ${
                      isDebit ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isDebit ? '-' : '+'}₹{txn.amount.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UPIHome;