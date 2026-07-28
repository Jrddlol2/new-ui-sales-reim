import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ClaimStatus } from '../../types';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';

function getAgingInfo(submittedAt: string | undefined, createdAt: string) {
  const start = new Date(submittedAt || createdAt).getTime();
  const now = new Date().getTime(); // or mock current time
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  if (days >= 5) return { text: `Waiting ${days} days`, color: 'text-error bg-error-container', raw: days };
  if (days >= 3) return { text: `Waiting ${days} days`, color: 'text-tertiary bg-tertiary-container', raw: days };
  return { text: days === 0 ? 'Today' : `Waiting ${days} days`, color: 'text-outline bg-surface-container', raw: days };
}

export function ApprovalQueue() {
  const navigate = useNavigate();
  const { claims, users, currentUser, updateClaimStatus, delegations } = useAppContext();
  const { addToast } = useToast();
  
  const [filter, setFilter] = useState('All');
  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingClaims = useMemo(() => claims.filter(c => {
    // Reimbursement claims land on 'Pending Approval'; Cash Advances and
    // Liquidations use the server's own 'Submitted' status for the same
    // moment — both belong in this queue.
    const isPending = c.status === ClaimStatus.PENDING_APPROVAL || c.status === ClaimStatus.SUBMITTED;
    if (!isPending) return false;
    const requestor = users.find(u => u.id === c.requestorId);
    if (!requestor) return false;
    
    // Can never approve own claims
    if (c.requestorId === currentUser.id) return false;
    
    const isDirectReport = requestor.reportsTo === currentUser.id;
    const isDelegate = delegations.some(d =>
      d.delegate_id === currentUser.id &&
      d.approver_id === requestor.reportsTo &&
      d.status === 'Active'
    );

    return isDirectReport || isDelegate;
  }), [claims, currentUser, users, delegations]);

  let displayedClaims = pendingClaims;
  if (filter === 'Advances') displayedClaims = pendingClaims.filter(c => c.type === 'Cash Advance');
  if (filter === 'HighPriority') displayedClaims = pendingClaims.filter(c => c.flaggedHighValue || c.total > 15000);

  const staleClaims = pendingClaims.filter(c => c.approverStaleSince);

  const handleAction = (claimId: string, action: 'approve' | 'reject' | 'return') => {
    setSelectedClaimId(claimId);
    setComment('');
    setActiveModal(action);
  };

  const handleConfirm = async () => {
    if (!selectedClaimId || !activeModal) return;

    let newStatus: ClaimStatus;
    let toastMsg = '';
    let toastType: 'success' | 'error' | 'info' = 'success';

    switch (activeModal) {
      case 'approve':
        newStatus = ClaimStatus.APPROVED;
        toastMsg = 'Claim approved successfully.';
        break;
      case 'reject':
        newStatus = ClaimStatus.REJECTED;
        toastMsg = 'Claim rejected.';
        toastType = 'error';
        break;
      case 'return':
        newStatus = ClaimStatus.RETURNED;
        toastMsg = 'Claim returned to requestor.';
        toastType = 'info';
        break;
      default:
        newStatus = ClaimStatus.PENDING_APPROVAL;
    }

    setIsSubmitting(true);
    try {
      await updateClaimStatus(selectedClaimId, newStatus, currentUser.id, comment);
      addToast(toastMsg, toastType);
      setActiveModal(null);
      setSelectedClaimId(null);
    } catch (err: any) {
      // Routing rules (delegation expiry, stale approver, self-approval) are
      // enforced server-side; surface the refusal rather than faking success.
      addToast(err?.message || 'Could not action this claim.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled = (activeModal === 'reject' || activeModal === 'return') && comment.trim() === '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-display text-on-surface">Approval Queue</h1>
          <p className="text-body-md text-outline mt-1">Review and action pending reimbursement claims and advances.</p>
        </div>
      </div>

      {staleClaims.length > 0 && (
        <Card className="border-tertiary bg-tertiary-container/30">
          <CardContent className="p-4 flex items-start gap-4">
            <span className="material-symbols-outlined text-tertiary text-[24px]">warning</span>
            <div>
              <h4 className="font-headline-sm text-on-surface mb-1">Stale Approvals Detected</h4>
              <p className="text-on-surface-variant text-sm mb-2">You have {staleClaims.length} claims that are routed to you, but the requestor's manager has recently changed. Please review or transfer them.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-tertiary text-tertiary" onClick={() => {
                  addToast('Filtered to stale claims', 'success');
                  setFilter('All'); // Mock action
                }}>Review Stale Claims</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 pb-2">
        <button onClick={() => setFilter('All')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm ${filter === 'All' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>All Pending ({pendingClaims.length})</button>
        <button onClick={() => setFilter('HighPriority')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm ${filter === 'HighPriority' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>High Priority</button>
        <button onClick={() => setFilter('Advances')} className={`px-5 py-2 rounded-full font-label-md transition-colors shadow-sm ${filter === 'Advances' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'}`}>Cash Advances</button>
      </div>

      <Card>
        <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant">
          <h4 className="font-headline-md text-on-surface">Pending Your Action</h4>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast('Filter options opened', 'success')}><span className="material-symbols-outlined text-outline">filter_list</span></button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Requestor</th>
                <th className="px-6 py-4">Ref & Type</th>
                <th className="px-6 py-4">Aging</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {displayedClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                    <p className="font-label-md">You're all caught up!</p>
                  </td>
                </tr>
              ) : displayedClaims.map(claim => {
                const req = users.find(u => u.id === claim.requestorId) || users[0];
                const aging = getAgingInfo(claim.submittedAt, claim.createdAt);
                return (
                  <tr key={claim.id} className={`hover:bg-primary-fixed/20 transition-colors group cursor-pointer ${claim.approverStaleSince ? 'bg-tertiary-container/10' : ''}`} onClick={(e) => {
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
                          <p className="font-label-md text-on-surface flex items-center gap-2">
                            {req.name}
                            {claim.approverStaleSince && <span className="material-symbols-outlined text-tertiary text-[16px]" title={claim.approverStaleReason}>warning</span>}
                          </p>
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
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${aging.color}`}>
                          {aging.text}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-mono-data text-on-surface font-bold">${claim.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10" onClick={() => handleAction(claim.id, 'approve')}>Approve</Button>
                        {/* Each entity's decision vocabulary is server-enforced and differs:
                            a reimbursement claim takes Approve/Reject/Return; a Cash Advance
                            has no "return to revise" concept (Approve/Reject only); a
                            Liquidation has no "reject" concept once cash is already out
                            with the requestor (Approve/Return only). */}
                        {claim.type !== 'Cash Advance' && (
                          <Button size="sm" variant="outline" className="text-tertiary border-tertiary hover:bg-tertiary/10" onClick={() => handleAction(claim.id, 'return')}>Return</Button>
                        )}
                        {claim.type !== 'Liquidation' && (
                          <Button size="sm" variant="outline" className="text-error border-error hover:bg-error/10" onClick={() => handleAction(claim.id, 'reject')}>Reject</Button>
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

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={activeModal === 'approve'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirm}
        title="Approve Claim"
        confirmLabel={isSubmitting ? "Approving..." : "Approve"}
        disabled={isSubmitting}
      >
        <p className="mb-4">Are you sure you want to approve this claim? It will be forwarded to the custodian for processing.</p>
        <div>
          <label className="block text-label-md text-on-surface mb-1">Comment (Optional)</label>
          <textarea 
            className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-primary resize-none"
            rows={3}
            placeholder="Add any notes..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </ConfirmModal>

      {/* Return Modal */}
      <ConfirmModal
        isOpen={activeModal === 'return'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirm}
        title="Return for Revision"
        confirmLabel={isSubmitting ? "Returning..." : "Return to Requestor"}
        variant="warning"
        disabled={isConfirmDisabled || isSubmitting}
      >
        <p className="mb-4">Return this claim to the requestor for corrections. They will be notified to resubmit.</p>
        <div>
          <label className="block text-label-md text-on-surface mb-1">Reason for Return <span className="text-error">*</span></label>
          <textarea 
            className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-primary resize-none"
            rows={3}
            placeholder="Please explain what needs to be fixed..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
          {isConfirmDisabled && (
            <p className="text-error text-body-sm mt-1">A reason is required to return a claim.</p>
          )}
        </div>
      </ConfirmModal>

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={activeModal === 'reject'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirm}
        title="Reject Claim"
        confirmLabel={isSubmitting ? "Rejecting..." : "Reject Claim"}
        variant="error"
        disabled={isConfirmDisabled || isSubmitting}
      >
        <p className="mb-4 text-error">Rejecting a claim is final. The requestor will have to create a new claim if they wish to try again.</p>
        <div>
          <label className="block text-label-md text-on-surface mb-1">Reason for Rejection <span className="text-error">*</span></label>
          <textarea 
            className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-primary resize-none"
            rows={3}
            placeholder="Please explain why this claim is rejected..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
          {isConfirmDisabled && (
            <p className="text-error text-body-sm mt-1">A reason is required to reject a claim.</p>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}
