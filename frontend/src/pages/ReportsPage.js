import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { ArrowLeft, ChartBar, TrendUp, Users } from '@phosphor-icons/react';
import Header from '../components/Header';

function ReportsPage({ onLogout }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [groupId]);

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

  if (loading) {
    return (
      <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
        <Header onLogout={onLogout} />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!reports || !group) {
    return (
      <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
        <Header onLogout={onLogout} />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(reports.category_breakdown || {});
  const filteredCategories = categoryFilter === 'all' 
    ? categoryData 
    : categoryData.filter(([cat]) => cat === categoryFilter);

  return (
    <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <button
          data-testid="back-button"
          onClick={() => navigate('/settlements')}
          className="flex items-center gap-2 mb-4 md:mb-6 font-bold text-sm"
        >
          <ArrowLeft size={20} weight="bold" />
          Back to Settlements
        </button>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold mb-6 md:mb-8" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Expense Reports
        </h1>

        <div className="neo-card p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            {group.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="neo-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center">
                <ChartBar size={20} weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-bold">Total Expenses</p>
                <p className="font-mono text-2xl font-bold tracking-tighter">{reports.total_expenses}</p>
              </div>
            </div>
          </div>

          <div className="neo-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#BDE6A3] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center">
                <TrendUp size={20} weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-bold">Total Spent</p>
                <p className="font-mono text-2xl font-bold tracking-tighter">₹{reports.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="neo-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FFC4D9] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center">
                <ChartBar size={20} weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-bold">Avg Expense</p>
                <p className="font-mono text-2xl font-bold tracking-tighter">₹{reports.average_expense.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="neo-card p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Spending by Category
          </h2>
          
          <div className="space-y-3">
            {categoryData.map(([category, amount]) => {
              const percentage = (amount / reports.total_amount) * 100;
              return (
                <div key={category} className="border-2 border-[#0F0F0F] rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">{category}</span>
                    <span className="font-mono font-bold">₹{amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 border-2 border-[#0F0F0F] rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-[#C4F1F9] h-full border-r-2 border-[#0F0F0F]" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="neo-card p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Spending by Member
          </h2>
          
          <div className="space-y-3">
            {reports.user_spending.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-2 border-[#0F0F0F] rounded-lg bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#BDE6A3] border-2 border-[#0F0F0F] rounded-full flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold">{user.name}</span>
                </div>
                <span className="font-mono text-lg font-bold tracking-tighter">₹{user.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="neo-card p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Monthly Trend
          </h2>
          
          <div className="space-y-3">
            {Object.entries(reports.monthly_trend || {}).map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between p-3 border-2 border-[#0F0F0F] rounded-lg bg-white">
                <span className="font-bold">{month}</span>
                <span className="font-mono text-lg font-bold tracking-tighter">₹{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;