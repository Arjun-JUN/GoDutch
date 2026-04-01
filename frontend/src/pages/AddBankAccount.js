import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Header, AppButton, AppInput, AppShell, AppSurface, Callout, Field, PageBackButton, PageContent, PageHero } from '@/slate';

function AddBankAccount() {
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
      await api.post('/upi/accounts', formData);

      toast.success('Bank account linked successfully!');
      navigate('/upi');
    } catch (error) {
      toast.error(error.message || 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell>
      <Header />

      <PageContent className="max-w-2xl">
        <PageBackButton onClick={() => navigate('/upi')}>Back</PageBackButton>

        <PageHero
          eyebrow="Account Setup"
          title="Add Bank Account"
          description="Capture bank details through the same reusable form system used across the refreshed UI surfaces."
        />

        <form onSubmit={handleSubmit}>
          <AppSurface className="space-y-4 p-6">
            <Field label="Bank Name">
              <AppInput
                data-testid="bank-name-input"
                type="text"
                value={formData.bank_name}
                onChange={(e) => updateField('bank_name', e.target.value)}
                placeholder="State Bank of India"
                required
              />
            </Field>

            <Field label="Account Holder Name">
              <AppInput
                data-testid="account-holder-input"
                type="text"
                value={formData.account_holder}
                onChange={(e) => updateField('account_holder', e.target.value)}
                placeholder="John Doe"
                required
              />
            </Field>

            <Field label="Account Number">
              <AppInput
                data-testid="account-number-input"
                type="text"
                value={formData.account_number}
                onChange={(e) => updateField('account_number', e.target.value)}
                placeholder="1234567890"
                required
              />
            </Field>

            <Field label="IFSC Code">
              <AppInput
                data-testid="ifsc-input"
                type="text"
                value={formData.ifsc_code}
                onChange={(e) => updateField('ifsc_code', e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                required
              />
            </Field>

            <Field label="UPI ID">
              <AppInput
                data-testid="upi-id-input"
                type="text"
                value={formData.upi_id}
                onChange={(e) => updateField('upi_id', e.target.value)}
                placeholder="yourname@paytm"
                required
              />
            </Field>

            <Callout>
              <p className="text-xs text-[var(--app-muted)] md:text-sm">
                Your UPI ID can look like `name@paytm` or `number@ybl`.
              </p>
            </Callout>

            <AppButton
              data-testid="submit-button"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Adding...</span>
                </>
              ) : (
                'Link Bank Account'
              )}
            </AppButton>
          </AppSurface>
        </form>
      </PageContent>
    </AppShell>
  );
}

export default AddBankAccount;
