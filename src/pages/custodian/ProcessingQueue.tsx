import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ClaimStatus, Claim } from '../../types';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';

export function ProcessingQueue() {
  const navigate = useNavigate();
  const { claims, users, lineItems, currentUser, updateClaimStatus } = useAppContext();
  const { addToast } = useToast();

  const [filter, setFilter] = useState('All');
  const [activeModal, setActiveModal] = useState<'markReady' | 'release' | 'closeLiq' | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [releaseCode, setReleaseCode] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [refundRef, setRefundRef] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processingClaims = claims.filter(c =>
    (c.status === ClaimStatus.APPROVED) ||
    (c.status === ClaimStatus.PROCESSING) ||
    (c.type === 'Cash Advance' && c.status === ClaimStatus.APPROVED) ||
    // A Liquidation only reaches the custodian once an Approver has reviewed
    // it (Submitted -> Reviewed) and a refund is actually owed back — settled
    // or reimbursement-due liquidations are closed automatically server-side.
    (c.type === 'Liquidation' && c.status === ClaimStatus.REVIEWED && c.varianceType === 'RefundDue')
  );

  let displayedClaims = processingClaims;
  if (filter === 'Audit') displayedClaims = processingClaims.filter(c => c.status === ClaimStatus.PROCESSING);
  if (filter === 'Advances') displayedClaims = processingClaims.filter(c => c.type === 'Cash Advance');
  if (filter === 'Liquidations') displayedClaims = processingClaims.filter(c => c.type === 'Liquidation');

  const handleAction = (claim: Claim, action: 'markReady' | 'release' | 'closeLiq') => {
    setSelectedClaim(claim);
    setReleaseCode('');
    setPaymentRef('');
    setRefundRef('');
    setError('');
    setActiveModal(action);
  };

  const handleConfirm = async () => {
    if (!selectedClaim || !activeModal) return;

    // The code is only something to verify once one has been issued. A claim
    // that has never had one gets it minted server-side on mark-ready, so
    // demanding it up front would make the step unreachable.
    if (activeModal === 'markReady' && selectedClaim.releaseCode) {
      if (releaseCode !== selectedClaim.releaseCode) {
        setError('Invalid release code. Please verify the code provided by Finance Audit.');
        return;
      }
    }

    let newStatus: string = selectedClaim.status;
    let toastMsg = '';
    let updates: Partial<Claim> = {};

    switch (activeModal) {
      case 'markReady':
        newStatus = ClaimStatus.READY_FOR_CLAIM;
        toastMsg = 'Claim marked ready for payout.';
        break;
      case 'release':
        newStatus = ClaimStatus.RELEASED;
        toastMsg = 'Cash advance released successfully.';
        updates = { releaseReference: paymentRef || undefined };
        break;
      case 'closeLiq':
        newStatus = ClaimStatus.CLOSED;
        toastMsg = 'Liquidation closed.';
        updates = { releaseReference: refundRef || undefined };
        break;
    }

    setIsSubmitting(true);
    try {
      await updateClaimStatus(selectedClaim.id, newStatus as ClaimStatus, currentUser.id, undefined, updates);
      addToast(toastMsg, 'success');
      setActiveModal(null);
      setSelectedClaim(null);
    } catch (err: any) {
      // The server owns these transitions — report what it actually said
      // instead of claiming success and leaving the row unchanged.
      setError(err?.message || 'The server rejected this action.');
      addToast(err?.message || 'Action failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-display text-on-surface">Processing Queue</h1>
          <p className="text-body-md text-outline mt-1">Manage approved claims, cash advances, and liquidations.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-2">
        <button onClick={() => setFilter('All')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm focus:ring-2 focus:ring-primary outline-none ${filter === 'All' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>All Processing</button>
        <button onClick={() => setFilter('Audit')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm focus:ring-2 focus:ring-primary outline-none ${filter === 'Audit' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>In Audit</button>
        <button onClick={() => setFilter('Advances')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm focus:ring-2 focus:ring-primary outline-none ${filter === 'Advances' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>Cash Advances</button>
        <button onClick={() => setFilter('Liquidations')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm focus:ring-2 focus:ring-primary outline-none ${filter === 'Liquidations' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>Liquidations</button>
      </div>

      <Card>
        <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant">
          <h4 className="font-headline-md text-on-surface">Disbursement Worklist</h4>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Requestor</th>
                <th className="px-6 py-4">Ref & Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {displayedClaims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                    <p className="font-label-md">Queue is empty!</p>
                  </td>
                </tr>
              ) : displayedClaims.map(claim => {
                const req = users.find(u => u.id === claim.requestorId) || users[0];
                return (
                  <tr key={claim.id} className="hover:bg-primary-fixed/20 transition-colors group cursor-pointer" onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                      navigate(`/claims/${claim.id}`);
                    }
                  }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {req.avatarUrl ? (
                          <img src={req.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">{req.name.split(' ').map(n=>n[0]).join('')}</div>
                        )}
                        <div>
                          <p className="font-label-md text-on-surface">{req.name}</p>
                          <p className="text-body-sm text-outline">{req.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-label-md text-on-surface flex items-center gap-2">
                        {claim.ref}
                        {claim.flaggedHighValue && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-error-container text-error">High Value</span>}
                      </p>
                      <div className="flex items-center text-outline font-body-sm mt-0.5">
                        <span className="material-symbols-outlined text-[14px] mr-1">receipt_long</span>
                        {claim.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono-data text-on-surface font-bold">
                       ${claim.type === 'Liquidation' ? Math.abs(claim.varianceAmount || 0).toFixed(2) : claim.total.toFixed(2)}
                       {claim.type === 'Liquidation' && <span className="block text-xs font-normal text-on-surface-variant">{claim.varianceType}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {claim.type === 'Reimbursement' && claim.status === ClaimStatus.APPROVED && (
                          <span className="text-body-sm text-outline italic self-center pr-2">Awaiting processing</span>
                        )}
                        {claim.type === 'Reimbursement' && claim.status === ClaimStatus.PROCESSING && (
                          <Button size="sm" className="gap-1.5" onClick={() => handleAction(claim, 'markReady')}>
                            <span className="material-symbols-outlined text-[16px]">fact_check</span> Review
                          </Button>
                        )}
                        {claim.type === 'Cash Advance' && claim.status === ClaimStatus.APPROVED && (
                          <Button size="sm" onClick={() => handleAction(claim, 'release')}>Release Funds</Button>
                        )}
                        {claim.type === 'Liquidation' && claim.status === ClaimStatus.REVIEWED && claim.varianceType === 'RefundDue' && (
                          <Button size="sm" onClick={() => handleAction(claim, 'closeLiq')}>Close Liquidation</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={activeModal === 'markReady'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirm}
        title="Review & Mark Ready"
        confirmLabel={isSubmitting ? "Verifying..." : "Verify & Mark Ready"}
        disabled={isSubmitting}
      >
        {selectedClaim && (() => {
          const items = lineItems.filter(li => li.claimId === selectedClaim.id);
          return (
            <div className="space-y-4">
              <p className="text-body-sm text-on-surface-variant">
                Review the submitted expenses and receipts, then verify the release code
                generated when this claim entered processing.
              </p>
              {items.length === 0 ? (
                <p className="text-body-sm text-outline italic">No expense line items found for this claim.</p>
              ) : (
                <div className="border border-outline-variant rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low text-outline font-label-sm uppercase sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Category / Vendor</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 whitespace-nowrap">{item.expenseDate}</td>
                          <td className="px-3 py-2">
                            <div className="font-medium text-on-surface">{item.category}</div>
                            <div className="text-outline text-xs">{item.vendor}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono-data">${item.amount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-center">
                            {item.receiptUrl ? (
                              <a
                                href={item.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                                onClick={e => e.stopPropagation()}
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-error text-xs">Missing</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
                <span className="font-label-md text-on-surface-variant">Claim Total</span>
                <span className="font-mono-data font-bold text-on-surface">${selectedClaim.total.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-label-md text-on-surface mb-1">Release Code</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-mono-data uppercase focus:outline-primary"
                  placeholder="e.g. RC-12345"
                  value={releaseCode}
                  onChange={(e) => {
                    setReleaseCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  disabled={isSubmitting}
                />
                {error && <p className="text-error text-body-sm mt-2 flex items-center"><span className="material-symbols-outlined text-[16px] mr-1">error</span>{error}</p>}
              </div>
            </div>
          );
        })()}
      </ConfirmModal>

      <ConfirmModal
        isOpen={activeModal === 'release'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirm}
        title="Release Cash Advance"
        confirmLabel={isSubmitting ? "Releasing..." : "Confirm Release"}
        disabled={isSubmitting}
      >
        <p className="mb-4 text-body-md text-on-surface-variant">Enter the payment reference or check number for this release.</p>
        <Input type="text" placeholder="Reference Number" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
      </ConfirmModal>

      <ConfirmModal
        isOpen={activeModal === 'closeLiq'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirm}
        title="Close Liquidation"
        confirmLabel={isSubmitting ? "Closing..." : "Close Liquidation"}
        disabled={isSubmitting}
      >
        <p className="mb-4 text-body-md text-on-surface-variant">Confirm the refund of {selectedClaim ? `$${Math.abs(selectedClaim.varianceAmount || 0).toFixed(2)}` : ''} has been physically collected from the requestor, then close this liquidation.</p>
        <Input type="text" placeholder="Reference note (optional)" value={refundRef} onChange={e => setRefundRef(e.target.value)} />
      </ConfirmModal>
    </div>
  );
}

