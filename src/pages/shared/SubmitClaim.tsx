import React from "react";
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { cn } from '../../components/ui/Button';
import { useAppContext } from '../../components/AppContext';
import { DynamicFieldRenderer } from '../../components/shared/DynamicFieldRenderer';
import { useToast } from '../../components/shared/ToastContext';
import { MinutesSource, ClaimStatus } from '../../types';
import { submitClaimFlow, DraftLineItem } from '../../lib/api';

export function SubmitClaim() {
  const navigate = useNavigate();
  const { currentUser, fieldDefinitions, users, claims, refresh } = useAppContext();
  const { addToast } = useToast();

  const [claimType, setClaimType] = useState<'Reimbursement' | 'Cash Advance' | 'Liquidation'>('Reimbursement');
  const [step, setStep] = useState(0); // Step 0 is Type Selection
  const [loading, setLoading] = useState(false);
  const momFileInputRef = useRef<HTMLInputElement>(null);

  // Form State. Holds the real File alongside the preview URL â€” the server
  // needs the bytes, and an object URL can't be re-read after a reload.
  const [lineItemsLocal, setLineItemsLocal] = useState<DraftLineItem[]>([
    { expenseDate: new Date().toISOString().split('T')[0], amount: 0, paymentMethod: 'Personal Card', vendor: '', category: 'Meals' }
  ]);
  const [momCore, setMomCore] = useState({
    client: '', purpose: '', location: '', contactPerson: '', contactPersonEmail: '', discussion: '',
  });
  const [momFile, setMomFile] = useState<File | undefined>();
  const [cashAdvanceId, setCashAdvanceId] = useState<string>('');
  const [momSource, setMomSource] = useState<MinutesSource>(MinutesSource.TEMPLATE);
  const [momData, setMomData] = useState<Record<string, any>>({});
  const [claimCustomFields, setClaimCustomFields] = useState<Record<string, string>>({});
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const steps = [
    { num: 1, title: 'Details & Items' },
    { num: 2, title: 'Minutes of Meeting' },
    { num: 3, title: 'Schedule Review' },
    { num: 4, title: 'Review & Submit' }
  ];

  const handleNext = () => {
    if (step === 1 && lineItemsLocal.length === 0 && claimType !== 'Cash Advance') {
      addToast('Please add at least one line item', 'error');
      return;
    }
    if (step === 1) {
      // Must mirror DynamicFieldRenderer's own filter exactly â€” validating a
      // field the renderer hides leaves the user blocked by an invisible input.
      const activeClaimFields = fieldDefinitions.filter(fd =>
        fd.entity === 'claim' && fd.active &&
        (!fd.applicableClaimTypes || fd.applicableClaimTypes.length === 0 || fd.applicableClaimTypes.includes(claimType))
      );
      const missingRequired = activeClaimFields.find(fd => fd.required && (!claimCustomFields[fd.key] || claimCustomFields[fd.key].trim() === ''));
      if (missingRequired) {
        addToast(`Please fill required field: ${missingRequired.label}`, 'error');
        return;
      }
    }
    if (step === 2 && claimType !== 'Cash Advance' && momSource === MinutesSource.TEMPLATE) {
      const activeMomFields = fieldDefinitions.filter(fd => fd.entity === 'mom' && fd.active);
      const missingRequired = activeMomFields.find(fd => fd.required && (!momData[fd.key] || momData[fd.key].trim() === ''));
      if (missingRequired) {
        addToast(`Please fill required field: ${missingRequired.label}`, 'error');
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };
  const handleBack = () => setStep(s => Math.max(s - 1, 0));
  
  const totalAmount = lineItemsLocal.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const flaggedHighValue = lineItemsLocal.some(item => (Number(item.amount) || 0) > 15000);
  
  let varianceAmount = 0;
  let varianceType: 'Settled' | 'RefundDue' | 'ReimbursementDue' = 'Settled';
  if (claimType === 'Liquidation' && cashAdvanceId) {
    const parentCa = claims.find(c => c.id === cashAdvanceId);
    if (parentCa) {
      varianceAmount = totalAmount - parentCa.total;
      if (varianceAmount > 0) varianceType = 'ReimbursementDue';
      else if (varianceAmount < 0) varianceType = 'RefundDue';
    }
  }

  const handleFileUploadForLineItem = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLineItemsLocal(prev => prev.map((li, i) =>
      i === index ? { ...li, receiptFile: file, receiptUrl: URL.createObjectURL(file) } : li
    ));
  };

  const handleFileUploadForMOM = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMomFile(file);
    setMomData(p => ({ ...p, fileName: file.name }));
  };

  /** Shared by Save Draft and Submit â€” same three server writes, different finality. */
  const send = async (isDraft: boolean) => {
    setLoading(true);
    try {
      await submitClaimFlow({
        lineItems: lineItemsLocal,
        mom: {
          ...momCore,
          meetingDate,
          meetingTime,
          source: momSource,
          file: momFile,
        },
        customFields: { ...momData, ...claimCustomFields },
        meetingDate,
        meetingTime,
        remarks: momCore.purpose,
        isDraft,
      });
      await refresh();
      addToast(isDraft ? 'Saved as draft.' : 'Claim submitted successfully!', 'success');
      navigate('/claims');
    } catch (err: any) {
      // Server-side workflow rules (missing receipt, unscheduled review meeting,
      // no assigned manager) surface here verbatim rather than being guessed at.
      addToast(err?.message || 'Could not submit the claim.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => send(true);
  const handleSubmit = () => send(false);

  const approver = users.find(u => u.id === currentUser.reportsTo);
  const myCashAdvances = claims.filter(c => c.requestorId === currentUser.id && c.type === 'Cash Advance' && c.status === ClaimStatus.RELEASED);

  if (step === 0) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-6">
        <h2 className="font-headline-lg mb-6">What would you like to submit?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="hover:border-primary cursor-pointer transition-colors" onClick={() => { setClaimType('Reimbursement'); setStep(1); }}>
            <CardContent className="p-6 text-center">
              <span className="material-symbols-outlined text-[48px] text-primary mb-4">receipt_long</span>
              <h3 className="font-headline-sm">Reimbursement</h3>
              <p className="text-sm text-on-surface-variant mt-2">Claim business expenses already paid for.</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-colors" onClick={() => { setClaimType('Cash Advance'); setStep(1); }}>
            <CardContent className="p-6 text-center">
              <span className="material-symbols-outlined text-[48px] text-primary mb-4">payments</span>
              <h3 className="font-headline-sm">Cash Advance</h3>
              <p className="text-sm text-on-surface-variant mt-2">Request funds before an upcoming expense.</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-colors" onClick={() => { setClaimType('Liquidation'); setStep(1); }}>
            <CardContent className="p-6 text-center">
              <span className="material-symbols-outlined text-[48px] text-primary mb-4">account_balance_wallet</span>
              <h3 className="font-headline-sm">Liquidation</h3>
              <p className="text-sm text-on-surface-variant mt-2">Settle an existing cash advance.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-12 px-6">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="font-label-sm uppercase tracking-wider">Claims Management</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-label-sm uppercase tracking-wider text-primary">New {claimType}</span>
        </div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline-lg text-on-surface">Submit {claimType}</h2>
            <p className="font-body-base text-on-surface-variant">Step {step} of 4: {steps[step - 1].title}</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="font-label-sm text-primary uppercase">Draft mode</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto pt-6">
          <div className="absolute top-[44px] left-0 w-full h-[2px] bg-outline-variant -z-10"></div>
          <div 
            className="absolute top-[44px] left-0 h-[2px] bg-primary -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          {steps.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md transition-colors",
                  isCompleted ? "bg-primary text-on-primary shadow-sm" : 
                  isActive ? "bg-primary-container text-on-primary-container ring-4 ring-primary-container/20 border-2 border-primary" : 
                  "bg-surface-container-highest text-on-surface-variant border-2 border-outline-variant"
                )}>
                  {isCompleted ? <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>check</span> : s.num}
                </div>
                <span className={cn("absolute -bottom-8 font-label-sm whitespace-nowrap", isActive ? "text-primary font-bold" : isCompleted ? "text-on-surface font-bold" : "text-on-surface-variant")}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16">
        {step === 1 && (
          <Card>
            <CardHeader>
              <h3 className="font-headline-md text-on-surface">{claimType} Details</h3>
              <Button size="sm" className="gap-2" onClick={() => setLineItemsLocal(p => [...p, { expenseDate: new Date().toISOString().split('T')[0], amount: 0, paymentMethod: 'Personal Card', vendor: '', category: 'Meals' }])}>
                <span className="material-symbols-outlined text-[18px]">add</span> Add Row
              </Button>
            </CardHeader>
            <CardContent>
              {claimType === 'Liquidation' && (
                <div className="mb-6 max-w-md">
                  <Label required>Select Cash Advance to Liquidate</Label>
                  <Select value={cashAdvanceId} onChange={e => setCashAdvanceId(e.target.value)}>
                    <option value="">-- Select --</option>
                    {myCashAdvances.map(ca => <option key={ca.id} value={ca.id}>{ca.ref} - ${ca.total.toFixed(2)} ({ca.purpose})</option>)}
                  </Select>
                </div>
              )}
              
              <div className="mb-6">
                <DynamicFieldRenderer 
                  entity="claim" 
                  claimType={claimType}
                  values={claimCustomFields} 
                  onChange={(key, value) => setClaimCustomFields(p => ({ ...p, [key]: value }))} 
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-brand-table-header text-on-surface-variant font-label-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Vendor / Supplier</th>
                      <th className="px-3 py-3">Payment Method</th>
                      <th className="px-3 py-3">Purpose</th>
                      <th className="px-3 py-3 text-right">Amount</th>
                      <th className="px-3 py-3">Receipt / OR Attachment</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {lineItemsLocal.map((item, idx) => (
                      <tr key={idx} className="hover:bg-brand-row-hover transition-colors">
                        <td className="px-3 py-3">
                          <Input type="date" value={item.expenseDate || ''} onChange={e => { const n = [...lineItemsLocal]; n[idx].expenseDate = e.target.value; setLineItemsLocal(n); }} className="py-1 px-2 text-xs" />
                        </td>
                        <td className="px-3 py-3">
                          <Select className="py-1 px-2 text-xs" value={item.category || ''} onChange={e => { const n = [...lineItemsLocal]; n[idx].category = e.target.value; setLineItemsLocal(n); }}>
                            <option value="">Select Category</option>
                            <option>Meals</option>
                            <option>Travel</option>
                            <option>Supplies</option>
                            <option>Lodging</option>
                            <option>Transportation</option>
                            <option>Utilities</option>
                            <option>Entertainment</option>
                          </Select>
                        </td>
                        <td className="px-3 py-3">
                          <Input type="text" value={item.vendor || ''} onChange={e => { const n = [...lineItemsLocal]; n[idx].vendor = e.target.value; setLineItemsLocal(n); }} className="py-1 px-2 text-xs" placeholder="Vendor..." />
                        </td>
                        <td className="px-3 py-3">
                          <Select className="py-1 px-2 text-xs" value={item.paymentMethod || 'Personal Card'} onChange={e => { const n = [...lineItemsLocal]; n[idx].paymentMethod = e.target.value; setLineItemsLocal(n); }}>
                            <option>Personal Card</option>
                            <option>Company Card</option>
                            <option>Cash</option>
                            <option>Bank Transfer</option>
                          </Select>
                        </td>
                        <td className="px-3 py-3">
                          <Input type="text" value={item.businessPurpose || ''} onChange={e => { const n = [...lineItemsLocal]; n[idx].businessPurpose = e.target.value; setLineItemsLocal(n); }} className="py-1 px-2 text-xs" placeholder="Purpose..." />
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-xs">$</span>
                            <Input type="number" value={item.amount || ''} onChange={e => { const n = [...lineItemsLocal]; n[idx].amount = Number(e.target.value); setLineItemsLocal(n); }} className="pl-5 py-1 px-2 text-right font-mono-data text-xs" />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {item.receiptFile ? (
                              <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-xs">
                                <span className="material-symbols-outlined text-[14px] text-primary">description</span>
                                <span className="truncate max-w-[100px]">{item.receiptFile.name}</span>
                                <button type="button" onClick={() => setLineItemsLocal(prev => prev.map((li, i) =>
                                  i === idx ? { ...li, receiptFile: undefined, receiptUrl: undefined } : li
                                ))} className="text-error hover:opacity-80">
                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                                <span className="material-symbols-outlined text-[16px]">upload_file</span> Attach OR/Receipt
                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileUploadForLineItem(idx, e)} />
                              </label>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={() => setLineItemsLocal(p => p.filter((_, i) => i !== idx))} className="text-error hover:opacity-70"><span className="material-symbols-outlined">delete_outline</span></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end gap-8 bg-surface-container-low p-6 rounded-lg">
                <div className="text-right">
                  <span className="font-label-sm text-on-surface-variant uppercase">Total Items</span>
                  <p className="font-headline-md">{lineItemsLocal.length}</p>
                </div>
                {claimType === 'Liquidation' && cashAdvanceId && (
                  <div className="text-right">
                    <span className="font-label-sm text-on-surface-variant uppercase">Advance</span>
                    <p className="font-headline-md">${(claims.find(c => c.id === cashAdvanceId)?.total || 0).toFixed(2)}</p>
                  </div>
                )}
                <div className="text-right bg-primary-container text-on-primary-container px-6 py-3 rounded-lg">
                  <span className="font-label-sm uppercase opacity-80">{claimType === 'Liquidation' ? varianceType : 'Total Amount'}</span>
                  <p className="text-[28px] font-bold leading-none mt-1">${claimType === 'Liquidation' ? Math.abs(varianceAmount).toFixed(2) : totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-12">
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-headline-md text-on-surface">Minutes of Meeting</h4>
                  <Select value={momSource} onChange={(e) => setMomSource(e.target.value as MinutesSource)} className="w-auto">
                    <option value={MinutesSource.TEMPLATE}>Fill Template</option>
                    <option value={MinutesSource.UPLOADED}>Upload File</option>
                  </Select>
                </div>
                
                {momSource === MinutesSource.UPLOADED ? (
                  <div className="border-2 border-dashed border-outline-variant rounded-lg p-12 text-center flex flex-col items-center justify-center bg-surface-container-low">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,image/*" 
                      className="hidden" 
                      ref={momFileInputRef}
                      onChange={handleFileUploadForMOM}
                    />
                    {momData.fileName ? (
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-[56px] text-primary mb-3">description</span>
                        <p className="font-bold text-on-surface mb-1">{momData.fileName}</p>
                        <p className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full mb-4">File attached ready for submission</p>
                        <Button variant="outline" size="sm" onClick={() => setMomData(p => ({...p, fileName: undefined, fileUrl: undefined}))}>Remove File</Button>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[48px] text-outline mb-4">cloud_upload</span>
                        <p className="font-bold text-on-surface mb-2">Drag and drop MOM document</p>
                        <p className="text-sm text-on-surface-variant mb-6">PDF, DOCX, or JPG up to 10MB</p>
                        <Button variant="outline" onClick={() => momFileInputRef.current?.click()}>Browse Files</Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Core minutes fields. These are first-class columns on the
                        server's MOM record, not admin-configurable extras, so
                        they're rendered explicitly rather than via field defs. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label required>Client / Company</Label>
                        <Input value={momCore.client} onChange={e => setMomCore(p => ({ ...p, client: e.target.value }))} placeholder="Who did you meet with?" />
                      </div>
                      <div>
                        <Label required>Purpose of Meeting</Label>
                        <Input value={momCore.purpose} onChange={e => setMomCore(p => ({ ...p, purpose: e.target.value }))} placeholder="Why did you meet?" />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={momCore.location} onChange={e => setMomCore(p => ({ ...p, location: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Contact Person</Label>
                        <Input value={momCore.contactPerson} onChange={e => setMomCore(p => ({ ...p, contactPerson: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Contact Email</Label>
                        <Input type="email" value={momCore.contactPersonEmail} onChange={e => setMomCore(p => ({ ...p, contactPersonEmail: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Discussion</Label>
                      <textarea
                        rows={3}
                        className="w-full bg-white border border-[#CBD5E1] rounded-[6px] px-4 py-2.5 text-body-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        value={momCore.discussion}
                        onChange={e => setMomCore(p => ({ ...p, discussion: e.target.value }))}
                      />
                    </div>
                    <DynamicFieldRenderer entity="mom" values={momData} onChange={(key, value) => setMomData(p => ({ ...p, [key]: value }))} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {step === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent>
              <h4 className="font-headline-md text-on-surface mb-6">Schedule Review Meeting</h4>
              <p className="text-on-surface-variant mb-8">Select a time to review this claim with your approver ({approver?.name || 'Assigned Approver'}).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label required>Date</Label>
                  <Input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                </div>
                <div>
                  <Label required>Time</Label>
                  <Input type="time" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="max-w-3xl mx-auto text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-primary mb-4">fact_check</span>
            <h4 className="font-headline-md text-on-surface mb-2">Ready to Submit</h4>
            <p className="text-on-surface-variant mb-6">Review your {claimType} before submission.</p>
            <div className="bg-surface-container p-6 rounded-lg text-left inline-block w-full max-w-md">
              <div className="flex justify-between mb-2"><span className="text-on-surface-variant">Type:</span><span className="font-bold">{claimType}</span></div>
              <div className="flex justify-between mb-2"><span className="text-on-surface-variant">Total Amount:</span><span className="font-mono-data font-bold">${totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Approver:</span><span className="font-bold">{approver?.name || 'Assigned Approver'}</span></div>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center border-t border-brand-border pt-8">
        <Button variant="outline" className="gap-2" onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span> Back
        </Button>
        <div className="flex gap-4">
          {step > 0 && <Button variant="ghost" onClick={handleSaveDraft}>Save Draft</Button>}
          {step > 0 && step < 4 ? (
            <Button className="gap-2 px-8" onClick={handleNext}>Next Step <span className="material-symbols-outlined">arrow_forward</span></Button>
          ) : step === 4 ? (
            <Button className="gap-2 px-8" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : null} Submit {claimType}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

