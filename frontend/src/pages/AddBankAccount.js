import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { ArrowLeft } from '@phosphor-icons/react';
import Header from '../components/Header';

function AddBankAccount({ onLogout }) {
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder: '',
    upi_id: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API}/upi/accounts`,
        formData,
        { headers: getAuthHeader() }
      );

      toast.success('Bank account linked successfully!');
      navigate('/upi');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to add account';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          Add Bank Account
        </h1>

        <form onSubmit={handleSubmit} className="neo-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Bank Name
            </label>
            <input
              data-testid="bank-name-input"
              type="text"
              value={formData.bank_name}
              onChange={(e) => updateField('bank_name', e.target.value)}
              className="neo-input w-full"
              placeholder="State Bank of India"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Account Holder Name
            </label>
            <input
              data-testid="account-holder-input"
              type="text"
              value={formData.account_holder}
              onChange={(e) => updateField('account_holder', e.target.value)}
              className="neo-input w-full"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Account Number
            </label>
            <input
              data-testid="account-number-input"
              type="text"
              value={formData.account_number}
              onChange={(e) => updateField('account_number', e.target.value)}
              className="neo-input w-full"
              placeholder="1234567890"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              IFSC Code
            </label>
            <input
              data-testid="ifsc-input"
              type="text"
              value={formData.ifsc_code}
              onChange={(e) => updateField('ifsc_code', e.target.value.toUpperCase())}
              className="neo-input w-full"
              placeholder="SBIN0001234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              UPI ID
            </label>
            <input
              data-testid="upi-id-input"
              type="text"
              value={formData.upi_id}
              onChange={(e) => updateField('upi_id', e.target.value)}
              className="neo-input w-full"
              placeholder="yourname@paytm"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              Your UPI ID (e.g., name@paytm, number@ybl)
            </p>
          </div>

          <button
            data-testid="submit-button"
            type="submit"
            disabled={loading}
            className="neo-btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Adding...</span>
              </>
            ) : (
              'Link Bank Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBankAccount;