import { useState } from 'react';
import { Portal } from '../../components/shared/Portal';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';
import { confirmReceipt } from '../../lib/api';
import { UserRole, ClaimStatus, ExpenseLineItem } from '../../types';

export function ClaimDetail() {
  const { addToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, claims, lineItems, moms, users, statusHistory, fieldDefinitions, refresh } = useAppContext();
  const [activeReceipt, setActiveReceipt] = useState<ExpenseLineItem | null>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [submittingReceipt, setSubmittingReceipt] = useState(false);

  const claim = claims.find(c => c.id === id) || claims[0];
  const items = lineItems.filter(li => li.claimId === claim.id);
  const mom = moms.find(m => m.claimId === claim.id);
  const history = statusHistory.filter(h => h.claimId === claim.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Only Approver can approve/reject, and only if they are not the requestor.
  // Reimbursement claims sit at Pending Approval; Cash Advances/Liquidations
  // use the server's own Submitted status for the same moment.
  const isApprover = currentUser.role === UserRole.APPROVER &&
    (claim.status === ClaimStatus.PENDING_APPROVAL || claim.status === ClaimStatus.SUBMITTED) &&
    currentUser.id !== claim.requestorId;
  const isCustodian = currentUser.role === UserRole.CUSTODIAN && (claim.status === ClaimStatus.PROCESSING || claim.status === ClaimStatus.READY_FOR_CLAIM || claim.status === ClaimStatus.APPROVED);
  // Only the requestor closes the loop, by quoting the code the custodian issued.
  const canConfirmReceipt = currentUser.id === claim.requestorId && claim.status === ClaimStatus.READY_FOR_CLAIM;

  const handleConfirmReceipt = async () => {
    if (!receiptCode.trim()) {
      setReceiptError('Enter the release code from your custodian.');
      return;
    }
    setSubmittingReceipt(true);
    setReceiptError('');
    try {
      await confirmReceipt(claim.id, receiptCode.trim());
      await refresh();
      addToast('Receipt confirmed. Your reimbursement is complete.', 'success');
      setConfirmingReceipt(false);
      setReceiptCode('');
    } catch (err: any) {
      // The server rejects a wrong code; show its message rather than closing.
      setReceiptError(err?.message || 'Could not confirm receipt.');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 text-on-surface-variant font-label-sm mb-2">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate(-1)}>Claims</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">{claim.ref}</span>
          </nav>
          <div className="flex items-center gap-4">
             <h1 className="font-display text-display text-on-surface">{claim.purpose}</h1>
             <StatusBadge status={claim.status} />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.print()}>Export PDF</Button>
          {isApprover && <Button onClick={() => navigate('/approvals')}>Go to Approval</Button>}
          {isCustodian && <Button onClick={() => navigate('/disbursements')}>Go to Processing</Button>}
          {canConfirmReceipt && (
            <Button className="gap-2" onClick={() => { setReceiptCode(''); setReceiptError(''); setConfirmingReceipt(true); }}>
              <span className="material-symbols-outlined text-[18px]">check_circle</span> Confirm Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {claim.customFields && Object.keys(claim.customFields).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">feed</span>
                  <h3 className="font-headline-md text-on-surface">Claim Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(claim.customFields).map(([key, value]) => {
                    const fd = fieldDefinitions.find(f => f.key === key && f.entity === 'claim');
                    return (
                      <div key={key}>
                        <p className="text-label-md text-outline mb-1">{fd ? fd.label : key}</p>
                        <p className="font-body-base text-on-surface">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {mom && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">summarize</span>
                  <h3 className="font-headline-md text-on-surface">Meeting Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Purpose</p>
                    <p className="font-body-lg text-on-surface">{mom.purposeOfMeeting || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Location</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-[18px]">location_on</span>
                      <p className="font-body-lg text-on-surface">{mom.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Source File</p>
                    <p className="font-body-sm text-primary font-semibold">{mom.fileName || 'Template Form'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {claim.type === 'Liquidation' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  <h3 className="font-headline-md text-on-surface">Liquidation Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Related Cash Advance</p>
                     <p className="font-mono-data text-on-surface bg-surface-container-low px-2 py-1 rounded inline-block">{claim.cashAdvanceId}</p>
                  </div>
                  <div>
                     <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Variance Amount</p>
                     <p className={`font-body-lg font-bold ${claim.varianceType === 'RefundDue' ? 'text-error' : claim.varianceType === 'ReimbursementDue' ? 'text-primary' : 'text-green-600'}`}>
                        ${Math.abs(claim.varianceAmount || 0).toFixed(2)}
                        <span className="block text-sm font-normal text-on-surface-variant mt-1">{claim.varianceType}</span>
                     </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h3 className="font-headline-md text-on-surface">Expense Line Items</h3>
              <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-md">
                Total: ${claim.total.toFixed(2)}
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Vendor / Purpose</th>
                    <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
                    <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {items.map(item => {
                    const hasReceipt = Boolean(item.receiptUrl);
                    return (
                      <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-mono-data text-xs">{item.expenseDate}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="font-bold text-on-surface">{item.vendor || 'N/A'}</p>
                          <p className="text-on-surface-variant text-[11px]">{item.businessPurpose}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{item.paymentMethod || 'Personal Card'}</td>
                        <td className="px-4 py-3 font-mono-data text-right font-bold text-xs">${item.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          {hasReceipt ? (
                            <button 
                              onClick={() => setActiveReceipt(item)}
                              className="text-primary hover:text-primary-container p-1 rounded hover:bg-primary/10 transition-colors"
                              title="View Receipt Attachment"
                            >
                              <span className="material-symbols-outlined text-[20px]">attachment</span>
                            </button>
                          ) : (
                            <span className="material-symbols-outlined text-[20px] text-outline/30 cursor-not-allowed" title="No Receipt Attached">
                              attachment
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                        No line items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Policy Compliance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body-base text-on-surface">Flight Class</span>
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-base text-on-surface">Per Diem Meal</span>
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="font-headline-md text-on-surface">History</h3>
              </div>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-outline-variant">
                {history.map((h) => {
                  const user = users.find(u => u.id === h.changedBy);
                  const isSubmit = h.newStatus === ClaimStatus.SUBMITTED;
                  return (
                    <div key={h.id} className="relative flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-surface-container-lowest z-10 ${isSubmit ? 'bg-primary-fixed text-primary-fixed-dim' : 'bg-green-100 text-green-600'}`}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isSubmit ? 'send' : 'check'}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-label-md text-on-surface">{user?.name || 'System User'} <span className="font-normal text-on-surface-variant">• {h.newStatus}</span></p>
                        <p className="font-body-sm text-outline">{new Date(h.timestamp).toLocaleString()}</p>
                        {h.comment && (
                          <div className="mt-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                            <p className="font-body-sm text-on-surface-variant italic">"{h.comment}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {activeReceipt && (
        <Portal>
        
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-headline-sm text-on-surface">Receipt Attachment</h3>
              <button onClick={() => setActiveReceipt(null)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
              {activeReceipt.receiptUrl?.startsWith('blob:') || activeReceipt.receiptUrl?.startsWith('data:image') ? (
                <img src={activeReceipt.receiptUrl} alt="Receipt preview" className="max-h-64 mx-auto object-contain rounded" />
              ) : (
                <div className="py-8">
                  <span className="material-symbols-outlined text-[56px] text-primary mb-2">description</span>
                  <p className="font-bold text-on-surface">{activeReceipt.receiptFileName || 'Receipt_Document.pdf'}</p>
                </div>
              )}
            </div>

            <div className="space-y-1 text-sm text-on-surface">
              <p><span className="text-outline">Vendor:</span> {activeReceipt.vendor || 'N/A'}</p>
              <p><span className="text-outline">Category:</span> {activeReceipt.category}</p>
              <p><span className="text-outline">Amount:</span> ${activeReceipt.amount.toFixed(2)}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
              {activeReceipt.receiptUrl && (
                <a href={activeReceipt.receiptUrl} target="_blank" rel="noreferrer" download={activeReceipt.receiptFileName || 'receipt.pdf'}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <span className="material-symbols-outlined text-[16px]">download</span> Download
                  </Button>
                </a>
              )}
              <Button size="sm" onClick={() => setActiveReceipt(null)}>Close</Button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Confirm Receipt Modal — requestor closes out the payout */}
      {confirmingReceipt && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <h3 className="font-headline-sm text-on-surface">Confirm Receipt of Funds</h3>
                <button onClick={() => setConfirmingReceipt(false)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-body-sm text-on-surface-variant">
                Enter the release code provided by your custodian to confirm you received the
                payout for <span className="font-semibold text-on-surface">{claim.ref}</span> (${claim.total.toFixed(2)}).
                This completes your reimbursement.
              </p>

              <div>
                <input
                  autoFocus
                  value={receiptCode}
                  onChange={e => { setReceiptCode(e.target.value); setReceiptError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleConfirmReceipt(); }}
                  placeholder="Release code"
                  className={`w-full bg-white border ${receiptError ? 'border-error' : 'border-[#CBD5E1]'} rounded-[6px] px-4 py-2.5 font-mono-data tracking-widest text-body-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none uppercase`}
                />
                {receiptError && <p className="text-error text-xs mt-1">{receiptError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                <Button variant="ghost" onClick={() => setConfirmingReceipt(false)} disabled={submittingReceipt}>Cancel</Button>
                <Button className="gap-2" onClick={handleConfirmReceipt} disabled={submittingReceipt}>
                  {submittingReceipt ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : null}
                  Confirm &amp; Complete
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

