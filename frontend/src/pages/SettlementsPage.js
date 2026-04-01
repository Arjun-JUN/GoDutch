import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { ArrowsLeftRight, Check, CurrencyInr, QrCode } from '@/slate/icons';
import { Header, InDevelopmentOverlay } from '@/slate';

function SettlementsPage({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [upiId, setUpiId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

    loadGroups();
  }, []);

  useEffect(() => {
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

    if (selectedGroup) {
      loadSettlements();
    }
  }, [selectedGroup]);

  const handlePayNow = (settlement) => {
    setSelectedSettlement(settlement);
    setShowPaymentModal(true);
  };

  const initiateUPIPayment = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter UPI ID');
      return;
    }

    try {
      const res = await axios.post(
        `${API}/upi/initiate-payment`,
        {
          upi_id: upiId,
          amount: selectedSettlement.amount,
          settlement_id: `${selectedGroup}-${selectedSettlement.from_user_id}-${selectedSettlement.to_user_id}`,
          note: `goDutch settlement`
        },
        { headers: getAuthHeader() }
      );

      window.location.href = res.data.upi_url;
      
      toast.success('Opening UPI app...');
      setShowPaymentModal(false);
    } catch (error) {
      toast.error('Payment initiation failed');
    }
  };

  return (
    <div className="min-h-screen mobile-safe-padding relative overflow-hidden">
      <Header onLogout={onLogout} />
      
      <InDevelopmentOverlay 
        marketingText="Settling up has never been this satisfying. Automated group settlements are coming to GoDutch very soon."
        pmText="Our advanced balance-netting algorithm is undergoing final stress tests to guarantee perfect mathematical accuracy across all your groups."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 blur-[20px] opacity-[0.3] pointer-events-none select-none transition-all duration-1000">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="app-page-title">
            Settlements
          </h1>
          <button
            data-testid="view-reports-btn"
            onClick={() => navigate(`/reports/${selectedGroup}`)}
            className="neo-btn-secondary text-xs md:text-sm"
          >
            View Reports
          </button>
        </div>

        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
            Select Group
          </label>
          <select
            data-testid="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="neo-input w-full md:max-w-md text-sm md:text-base"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="neo-card p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 md:mb-6">
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
            <div className="space-y-3 md:space-y-4" data-testid="settlements-list">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  data-testid={`settlement-${index}`}
                  className="flex flex-col gap-3 p-3 md:p-4 border-2 border-[#0F0F0F] rounded-lg bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[#FFC4D9] border-2 border-[#0F0F0F] rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {settlement.from_user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" data-testid={`settlement-from-${index}`}>
                          {settlement.from_user_name}
                        </p>
                        <p className="text-xs text-gray-600">owes {settlement.to_user_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-lg md:text-2xl font-bold tracking-tighter" data-testid={`settlement-amount-${index}`}>
                        ₹{settlement.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {settlement.from_user_id === getCurrentUser()?.id && (
                    <button
                      data-testid={`pay-now-${index}`}
                      onClick={() => handlePayNow(settlement)}
                      className="neo-btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                      <CurrencyInr size={18} weight="bold" />
                      Pay via UPI
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {settlements.length > 0 && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white border-2 border-[#0F0F0F] rounded-lg">
            <p className="text-xs md:text-sm text-gray-600">
              <strong>Tip:</strong> Click "Pay via UPI" to settle directly using any UPI app (Google Pay, PhonePe, Paytm, etc.)
            </p>
          </div>
        )}
      </div>

      {showPaymentModal && selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 blur-sm pointer-events-none" data-testid="upi-payment-modal">
          <div className="neo-card p-6 md:p-8 max-w-md w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Pay via UPI
            </h2>
            
            <div className="mb-6">
              <div className="p-4 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg mb-4">
                <p className="text-sm mb-2">You are paying:</p>
                <p className="font-mono text-2xl font-bold">₹{selectedSettlement.amount.toFixed(2)}</p>
                <p className="text-xs mt-2 text-gray-600">To: {selectedSettlement.to_user_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Recipient's UPI ID
                </label>
                <input
                  data-testid="upi-id-input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="neo-input w-full"
                  placeholder="username@upi"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Ask {selectedSettlement.to_user_name} for their UPI ID
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                data-testid="cancel-payment-btn"
                onClick={() => setShowPaymentModal(false)}
                className="neo-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                data-testid="proceed-payment-btn"
                onClick={initiateUPIPayment}
                className="neo-btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <CurrencyInr size={18} weight="bold" />
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettlementsPage;