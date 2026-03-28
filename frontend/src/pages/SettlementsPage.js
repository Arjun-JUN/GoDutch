import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { ArrowsLeftRight, Check } from '@phosphor-icons/react';
import Header from '../components/Header';

function SettlementsPage({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadSettlements();
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      setGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load groups');
    }
  };

  const loadSettlements = async () => {
    if (!selectedGroup) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `${API}/groups/${selectedGroup}/settlements`,
        { headers: getAuthHeader() }
      );
      setSettlements(res.data);
    } catch (error) {
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold mb-8" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Settlements
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-bold uppercase tracking-wider mb-2">
            Select Group
          </label>
          <select
            data-testid="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="neo-input max-w-md"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="neo-card p-6">
          <h2 className="text-xl sm:text-2xl tracking-tight font-bold mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Who Owes Whom
          </h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : settlements.length === 0 ? (
            <div className="text-center py-12">
              <Check size={64} weight="bold" className="mx-auto mb-4 text-[#BDE6A3]" />
              <p className="text-gray-600">All settled up!</p>
              <p className="text-sm text-gray-500 mt-2">No outstanding payments in this group</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="settlements-list">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  data-testid={`settlement-${index}`}
                  className="flex items-center justify-between p-4 border-2 border-[#0F0F0F] rounded-lg bg-white"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-[#FFC4D9] border-2 border-[#0F0F0F] rounded-full flex items-center justify-center font-bold text-sm">
                      {settlement.from_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" data-testid={`settlement-from-${index}`}>
                        {settlement.from_user_name}
                      </p>
                      <p className="text-sm text-gray-600">owes</p>
                    </div>
                  </div>

                  <div className="mx-4">
                    <ArrowsLeftRight size={24} weight="bold" className="text-gray-400" />
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <p className="font-bold" data-testid={`settlement-to-${index}`}>
                        {settlement.to_user_name}
                      </p>
                      <p className="text-sm text-gray-600">receives</p>
                    </div>
                    <div className="w-10 h-10 bg-[#BDE6A3] border-2 border-[#0F0F0F] rounded-full flex items-center justify-center font-bold text-sm">
                      {settlement.to_user_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <p className="font-mono text-2xl font-bold tracking-tighter" data-testid={`settlement-amount-${index}`}>
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {settlements.length > 0 && (
          <div className="mt-6 p-4 bg-white border-2 border-[#0F0F0F] rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Use your preferred payment method (Venmo, Cash App, etc.) to settle up, then ask the group creator to mark as paid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettlementsPage;