import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { Plus, Receipt, Users, ArrowsLeftRight, SignOut } from '@phosphor-icons/react';
import Header from '../components/Header';

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsRes = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      setGroups(groupsRes.data);

      if (groupsRes.data.length > 0) {
        const allExpenses = [];
        for (const group of groupsRes.data) {
          const expensesRes = await axios.get(
            `${API}/groups/${group.id}/expenses`,
            { headers: getAuthHeader() }
          );
          allExpenses.push(...expensesRes.data);
        }
        setExpenses(allExpenses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Welcome back, {user?.name}!
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Manage your expenses, groups, and settlements all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <button
            data-testid="new-expense-btn"
            onClick={() => navigate('/new-expense')}
            className="neo-card-interactive p-6 text-left"
          >
            <div className="w-12 h-12 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center mb-4">
              <Plus size={24} weight="bold" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              New Expense
            </h3>
            <p className="text-sm text-gray-600">Scan receipt & split bills</p>
          </button>

          <button
            data-testid="groups-btn"
            onClick={() => navigate('/groups')}
            className="neo-card-interactive p-6 text-left"
          >
            <div className="w-12 h-12 bg-[#BDE6A3] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center mb-4">
              <Users size={24} weight="bold" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Groups
            </h3>
            <p className="text-sm text-gray-600">{groups.length} active groups</p>
          </button>

          <button
            data-testid="settlements-btn"
            onClick={() => navigate('/settlements')}
            className="neo-card-interactive p-6 text-left"
          >
            <div className="w-12 h-12 bg-[#FFC4D9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center mb-4">
              <ArrowsLeftRight size={24} weight="bold" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Settlements
            </h3>
            <p className="text-sm text-gray-600">See who owes what</p>
          </button>
        </div>

        <div className="neo-card p-6">
          <h2 className="text-xl sm:text-2xl tracking-tight font-bold mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Recent Expenses
          </h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={64} weight="bold" className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No expenses yet</p>
              <button
                data-testid="create-first-expense-btn"
                onClick={() => navigate('/new-expense')}
                className="neo-btn-primary"
              >
                Create Your First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-4" data-testid="expenses-list">
              {expenses.slice(0, 10).map((expense) => (
                <div
                  key={expense.id}
                  data-testid={`expense-${expense.id}`}
                  className="flex items-center justify-between p-4 border-2 border-[#0F0F0F] rounded-lg bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center">
                      <Receipt size={20} weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-bold" data-testid={`expense-merchant-${expense.id}`}>
                        {expense.merchant}
                      </h3>
                      <p className="text-sm text-gray-600">{expense.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl md:text-2xl font-bold tracking-tighter" data-testid={`expense-amount-${expense.id}`}>
                      ${expense.total_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">{expense.split_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;