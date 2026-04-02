import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { ArrowsLeftRight, Check, CurrencyInr } from '@/slate/icons';
import { Header, InDevelopmentOverlay, AppButton, AppInput, AppModal, AppSelect, AppShell, AppSurface, Callout, EmptyState, Field, IconBadge, ModalHeader, PageContent, PageHero } from '@/slate';

function SettlementsPageRedesign() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [upiId, setUpiId] = useState('');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const loadGroups = async () => {
    try {
      const data = await api.get('/groups');
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load groups');
    }
  };

  const loadSettlements = useCallback(async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const data = await api.get(`/groups/${selectedGroup}/settlements`);
      setSettlements(data);
    } catch (error) {
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadSettlements();
    }
  }, [selectedGroup, loadSettlements]);

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
      const data = await api.post('/upi/initiate-payment', {
        upi_id: upiId,
        amount: selectedSettlement.amount,
        settlement_id: `${selectedGroup}-${selectedSettlement.from_user_id}-${selectedSettlement.to_user_id}`,
        note: 'goDutch settlement'
      });

      window.location.href = data.upi_url;
      toast.success('Opening UPI app...');
      setShowPaymentModal(false);
    } catch (error) {
      toast.error('Payment initiation failed');
    }
  };

  return (
    <AppShell>
      <Header />

      <PageContent className="relative overflow-hidden">
        <InDevelopmentOverlay 
          marketingText="Experience the future of seamless settlements. Our automated balance-clearing is currently in final refinement."
          pmText="Performance Optimization: We are optimizing the settlement engine to handle large group graphs with O(n) complexity. Stay tuned!"
        />
        
        <div className="blur-[20px] opacity-[0.3] pointer-events-none select-none transition-all duration-1000">
          <PageHero
            eyebrow="Settlement Summary"
            title="Settlements"
            description="Review what is still owed, pay with UPI, and close the loop with a softer, cleaner ledger."
            actions={(
              <AppButton
                data-testid="view-reports-btn"
                onClick={() => navigate(`/reports/${selectedGroup}`)}
                variant="secondary"
                size="sm"
                disabled={!selectedGroup}
              >
                View Reports
              </AppButton>
            )}
          />

          <AppSelect
            label="Select Group"
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            options={groups.map((group) => ({
              label: group.name,
              value: group.id,
            }))}
            className="mb-5 md:mb-6 w-full md:max-w-md"
            data-testid="group-select"
          />

          <AppSurface className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <IconBadge icon={ArrowsLeftRight} />
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Who owes whom</h2>
                <p className="text-sm text-[var(--app-muted)]">Pending payments for the selected group.</p>
              </div>
            </div>

            {loading ? (
              <p className="text-[var(--app-muted)]">Loading...</p>
            ) : settlements.length === 0 ? (
              <EmptyState icon={Check} title="All settled up!" description="No outstanding payments in this group" />
            ) : (
              <div className="space-y-3 md:space-y-4" data-testid="settlements-list">
                {settlements.map((settlement, index) => (
                  <div
                    key={index}
                    data-testid={`settlement-${index}`}
                    className="app-list-row flex flex-col gap-3 p-4 md:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--app-soft)] font-bold text-sm text-[var(--app-primary-strong)]">
                          {settlement.from_user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--app-foreground)]" data-testid={`settlement-from-${index}`}>
                            {settlement.from_user_name}
                          </p>
                          <p className="text-xs text-[var(--app-muted)]">owes {settlement.to_user_name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-extrabold tracking-[-0.04em] text-[var(--app-primary)] md:text-2xl" data-testid={`settlement-amount-${index}`}>
                          Rs {Number(settlement.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {settlement.from_user_id === currentUser?.id && (
                      <AppButton
                        data-testid={`pay-now-${index}`}
                        onClick={() => handlePayNow(settlement)}
                        className="flex w-full items-center justify-center gap-2 text-sm"
                      >
                        <CurrencyInr size={18} weight="bold" />
                        Pay via UPI
                      </AppButton>
                    )}
                  </div>
                ))}
              </div>
            )}
          </AppSurface>

          {settlements.length > 0 && (
            <Callout className="mt-4 md:mt-6">
              <p className="text-xs text-[var(--app-muted)] md:text-sm">
                <strong>Tip:</strong> Click &quot;Pay via UPI&quot; to settle directly using any UPI app.
              </p>
            </Callout>
          )}
        </div>
      </PageContent>

      <AppModal open={showPaymentModal && selectedSettlement} data-testid="upi-payment-modal">
        <div className="blur-sm grayscale-[30%] pointer-events-none select-none">
          {selectedSettlement ? (
            <>
              <ModalHeader title="Pay via UPI" />

              <div className="mb-6">
                <div className="mb-4 rounded-[1.5rem] bg-[var(--app-soft)] p-4">
                  <p className="mb-2 text-sm text-[var(--app-muted)]">You are paying:</p>
                  <p className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]">
                    Rs {Number(selectedSettlement.amount).toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-[var(--app-muted)]">To: {selectedSettlement.to_user_name}</p>
                </div>

                <Field label="Recipient's UPI ID">
                  <AppInput
                    data-testid="upi-id-input"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                  />
                  <p className="mt-2 text-xs text-[var(--app-muted)]">
                    Ask {selectedSettlement.to_user_name} for their UPI ID
                  </p>
                </Field>
              </div>

              <div className="flex gap-3">
                <AppButton
                  data-testid="cancel-payment-btn"
                  onClick={() => setShowPaymentModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </AppButton>
                <AppButton
                  data-testid="proceed-payment-btn"
                  onClick={initiateUPIPayment}
                  className="flex flex-1 items-center justify-center gap-2"
                >
                  <CurrencyInr size={18} weight="bold" />
                  Pay Now
                </AppButton>
              </div>
            </>
          ) : null}
        </div>
      </AppModal>
    </AppShell>
  );
}

export default SettlementsPageRedesign;
