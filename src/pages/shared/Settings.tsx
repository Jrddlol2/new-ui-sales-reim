import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label } from '../../components/ui/Input';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';
import { requestDelegation, acceptDelegation, declineDelegation, cancelDelegation, ApiError } from '../../lib/api';
import { UserRole, DelegationStatus } from '../../types';

const STATUS_STYLE: Record<string, string> = {
  [DelegationStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [DelegationStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [DelegationStatus.DECLINED]: 'bg-error-container text-error',
  [DelegationStatus.EXPIRED]: 'bg-surface-container-high text-on-surface-variant',
  [DelegationStatus.CANCELLED]: 'bg-surface-container-high text-on-surface-variant',
};

function DelegationPanel() {
  const { currentUser, users, delegations, refresh } = useAppContext();
  const { addToast } = useToast();
  const [delegateId, setDelegateId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [busy, setBusy] = useState(false);

  const nameOf = (id: string) => users.find(u => u.id === id)?.name || id;

  // I requested this — I'm covered by someone else while I'm out.
  const asApprover = delegations.filter(d => d.approver_id === currentUser.id);
  // Someone asked me to cover for them.
  const asDelegate = delegations.filter(d => d.delegate_id === currentUser.id);
  const pendingOnMe = asDelegate.filter(d => d.status === DelegationStatus.PENDING);

  const otherApprovers = users.filter(u => u.role === UserRole.APPROVER && u.id !== currentUser.id);

  const submitRequest = async () => {
    if (!delegateId || !startDate || !endDate) {
      addToast('Pick a delegate and both dates.', 'error');
      return;
    }
    setBusy(true);
    try {
      await requestDelegation(delegateId, startDate, endDate);
      await refresh();
      addToast('Delegation request sent.', 'success');
      setDelegateId(''); setStartDate(''); setEndDate('');
    } catch (err) {
      addToast((err as ApiError).message || 'Could not send the request.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const respond = async (id: string, action: 'accept' | 'decline') => {
    setBusy(true);
    try {
      if (action === 'accept') await acceptDelegation(id);
      else await declineDelegation(id, window.prompt('Reason for declining (optional):') || undefined);
      await refresh();
      addToast(action === 'accept' ? 'Delegation accepted — claims will now route to you.' : 'Delegation declined.', 'success');
    } catch (err) {
      addToast((err as ApiError).message || 'Could not update the delegation.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    setBusy(true);
    try {
      await cancelDelegation(id);
      await refresh();
      addToast('Delegation cancelled.', 'success');
    } catch (err) {
      addToast((err as ApiError).message || 'Could not cancel the delegation.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (currentUser.role !== UserRole.APPROVER) {
    return (
      <div className="py-12 text-center text-outline">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">supervisor_account</span>
        <p>Approval delegation is only available to Approvers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {pendingOnMe.length > 0 && (
        <div className="bg-tertiary-container/30 border border-tertiary rounded-lg p-4 space-y-3">
          <h4 className="font-headline-sm text-on-surface">Requests waiting on you</h4>
          {pendingOnMe.map(d => (
            <div key={d.id} className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-3">
              <p className="text-sm text-on-surface">
                <strong>{nameOf(d.approver_id)}</strong> asked you to cover approvals from {d.start_date} to {d.end_date}.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => respond(d.id, 'decline')} disabled={busy}>Decline</Button>
                <Button size="sm" onClick={() => respond(d.id, 'accept')} disabled={busy}>Accept</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="font-headline-sm text-on-surface mb-3">Request coverage while you're out</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Delegate to</Label>
            <Select value={delegateId} onChange={e => setDelegateId(e.target.value)}>
              <option value="">— Select an approver —</option>
              {otherApprovers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Start</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" onClick={submitRequest} disabled={busy}>Send Request</Button>
      </div>

      <div>
        <h4 className="font-headline-sm text-on-surface mb-3">Delegations you've requested</h4>
        {asApprover.length === 0 ? (
          <p className="text-sm text-outline">None yet.</p>
        ) : (
          <div className="space-y-2">
            {asApprover.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg text-sm">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold mr-2 ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                  <span className="text-on-surface">{nameOf(d.delegate_id)}, {d.start_date} → {d.end_date}</span>
                  {d.decline_reason && <p className="text-xs text-outline mt-1">Declined: {d.decline_reason}</p>}
                </div>
                {(d.status === DelegationStatus.PENDING || d.status === DelegationStatus.ACTIVE) && (
                  <Button size="sm" variant="ghost" onClick={() => cancel(d.id)} disabled={busy}>Cancel</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {asDelegate.length > 0 && (
        <div>
          <h4 className="font-headline-sm text-on-surface mb-3">Delegations you've covered</h4>
          <div className="space-y-2">
            {asDelegate.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold mr-2 ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                <span className="text-on-surface flex-1 ml-2">For {nameOf(d.approver_id)}, {d.start_date} → {d.end_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const { addToast } = useToast();
  const { currentUser, resetData } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'delegation', label: 'Delegation' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-display text-on-surface">Settings</h1>
          <p className="text-body-md text-outline mt-1">Manage your preferences and delegations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === t.id ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-headline-md text-on-surface">{tabs.find(t => t.id === activeTab)?.label}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTab === 'profile' && (
                <>
                  <div className="flex items-center gap-4">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-xl font-bold text-on-secondary-container">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <Button variant="outline" size="sm" onClick={() => addToast('Photo updated successfully', 'success')}>Change Photo</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="block font-label-sm text-outline mb-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue={currentUser.name} />
                    </div>
                    <div>
                      <label className="block font-label-sm text-outline mb-1">Email Address</label>
                      <input type="email" className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-base text-on-surface-variant focus:outline-none" defaultValue={currentUser.email} disabled />
                    </div>
                    <div>
                      <label className="block font-label-sm text-outline mb-1">Department</label>
                      <input type="text" className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-base text-on-surface-variant focus:outline-none" defaultValue={currentUser.department} disabled />
                    </div>
                    <div>
                      <label className="block font-label-sm text-outline mb-1">Role</label>
                      <input type="text" className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-base text-on-surface-variant focus:outline-none" defaultValue={currentUser.role} disabled />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Button variant="outline" className="text-error border-error hover:bg-error/10" onClick={() => resetData()}>Generate New Mock Data</Button>
                    <Button onClick={() => addToast('Changes saved successfully', 'success')}>Save Changes</Button>
                  </div>
                </>
              )}

              {activeTab === 'delegation' && <DelegationPanel />}

              {(activeTab === 'notifications' || activeTab === 'security') && (
                <div className="py-12 text-center text-outline">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">build</span>
                  <p>Settings for {activeTab} can be configured here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
