import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { ArrowLeft, Receipt } from '@phosphor-icons/react';
import Header from '../components/Header';

function GroupDetail({ onLogout }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      const groupsRes = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      const foundGroup = groupsRes.data.find((g) => g.id === groupId);
      
      if (!foundGroup) {
        toast.error('Group not found');
        navigate('/groups');
        return;
      }
      
      setGroup(foundGroup);

      const [expensesRes, settlementsRes] = await Promise.all([
        axios.get(`${API}/groups/${groupId}/expenses`, {
          headers: getAuthHeader(),
        }),
        axios.get(`${API}/groups/${groupId}/settlements`, {
          headers: getAuthHeader(),
        }),
      ]);

      setExpenses(expensesRes.data);
      setSettlements(settlementsRes.data);
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
        <Header onLogout={onLogout} />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <button
          data-testid="back-button"
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2 mb-4 md:mb-6 font-bold text-sm"
        >
          <ArrowLeft size={20} weight="bold" />
          Back to Groups
        </button>

        <div className="neo-card p-4 md:p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl tracking-tight font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            {group.name}
          </h1>
          
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Members</h3>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="text-sm bg-white border-2 border-[#0F0F0F] rounded-lg px-3 py-2"
                  data-testid={`member-badge-${member.id}`}
                >
                  {member.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="neo-card p-4 md:p-6 mb-6">
          <h2 className="text-xl sm:text-2xl tracking-tight font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Expenses
          </h2>

          {expenses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3" data-testid="group-expenses-list">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 md:p-4 border-2 border-[#0F0F0F] rounded-lg bg-white"
                  data-testid={`expense-${expense.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Receipt size={18} weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base">{expense.merchant}</h3>
                      <p className="text-xs text-gray-600">{expense.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg md:text-xl font-bold tracking-tighter">
                      ${expense.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="neo-card p-4 md:p-6">
          <h2 className="text-xl sm:text-2xl tracking-tight font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Settlements
          </h2>

          {settlements.length === 0 ? (
            <p className="text-gray-600 text-center py-8">All settled up!</p>
          ) : (
            <div className="space-y-3" data-testid="group-settlements-list">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border-2 border-[#0F0F0F] rounded-lg bg-white"
                  data-testid={`settlement-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{settlement.from_user_name}</span>
                    <span className="text-gray-600 text-xs">owes</span>
                    <span className="font-bold text-sm">{settlement.to_user_name}</span>
                  </div>
                  <p className="font-mono text-xl font-bold tracking-tighter">
                    ${settlement.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetail;