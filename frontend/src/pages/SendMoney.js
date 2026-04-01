import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PaperPlaneTilt } from '@/slate/icons';
import { Header, AppButton, AppInput, AppShell, AppSurface, AppTextarea, Field, PageBackButton, PageContent, PageHero } from '@/slate';

function SendMoney() {
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
      await api.post('/upi/send-money', {
        to_upi_id: upiId,
        amount: parseFloat(amount),
        transaction_type: 'payment',
        note
      });

      toast.success(`Rs ${amount} sent successfully!`);
      navigate('/upi');
    } catch (error) {
      toast.error(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Header />

      <PageContent className="max-w-2xl">
        <PageBackButton onClick={() => navigate('/upi')}>Back</PageBackButton>

        <PageHero
          eyebrow="Payment Flow"
          title="Send Money"
          description="Use the shared payment form patterns so UPI transfers feel consistent with every other surface in the app."
        />

        <form onSubmit={handleSend}>
          <AppSurface className="space-y-6 p-6">
            <Field label="UPI ID / Phone Number">
              <AppInput
                data-testid="upi-id-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi or 9876543210"
                required
              />
            </Field>

            <Field label="Amount (Rs)">
              <AppInput
                data-testid="amount-input"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-semibold tracking-[-0.04em]"
                placeholder="0.00"
                required
              />
            </Field>

            <Field label="Note (Optional)">
              <AppTextarea
                data-testid="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="2"
                placeholder="What's this payment for?"
              />
            </Field>

            <AppButton
              data-testid="send-button"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2"
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
            </AppButton>
          </AppSurface>
        </form>
      </PageContent>
    </AppShell>
  );
}

export default SendMoney;
