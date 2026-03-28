import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { ArrowLeft, PaperPlaneTilt } from '@phosphor-icons/react';
import Header from '../components/Header';

function SendMoney({ onLogout }) {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!upiId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/upi/send-money`,
        {
          to_upi_id: upiId,
          amount: parseFloat(amount),
          transaction_type: 'payment',
          note
        },
        { headers: getAuthHeader() }
      );

      toast.success(`₹${amount} sent successfully!`);
      navigate('/upi');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Transaction failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <button
          onClick={() => navigate('/upi')}
          className="flex items-center gap-2 mb-4 md:mb-6 font-bold text-sm"
        >
          <ArrowLeft size={20} weight="bold" />
          Back
        </button>

        <h1 className="text-2xl sm:text-3xl tracking-tight font-bold mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Send Money
        </h1>

        <form onSubmit={handleSend} className="neo-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              UPI ID / Phone Number
            </label>
            <input
              data-testid="upi-id-input"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="neo-input w-full"
              placeholder="username@upi or 9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Amount (₹)
            </label>
            <input
              data-testid="amount-input"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="neo-input w-full text-2xl font-mono"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Note (Optional)
            </label>
            <textarea
              data-testid="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="neo-input w-full"
              rows="2"
              placeholder="What's this payment for?"
            />
          </div>

          <button
            data-testid="send-button"
            type="submit"
            disabled={loading}
            className="neo-btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <PaperPlaneTilt size={20} weight="bold" />
                Send Money
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SendMoney;