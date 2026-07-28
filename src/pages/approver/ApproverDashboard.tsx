import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';

export function ApproverDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser, claims, users } = useAppContext();

  // Show pending claims for the approver
  const pendingClaims = claims.filter(c => c.status === 'Pending Approval' || c.status === 'Draft' || c.status === 'Processing');
  const awaitingApproval = claims.filter(c => c.status === 'Pending Approval').length;
  
  // Just show everything for demo.
  const totalManaged = claims.reduce((acc, c) => acc + c.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h3 className="font-display text-display text-on-surface">Welcome back, {currentUser.name.split(' ')[0]}</h3>
        <div className="flex items-center text-outline mt-1">
          <span className="material-symbols-outlined text-[18px] mr-2">calendar_today</span>
          <p className="font-label-md text-label-md">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-card shadow-sm">
          <p className="font-label-sm text-outline uppercase mb-2">Awaiting Approval</p>
          <div className="flex justify-between items-end">
            <p className="font-headline-lg text-on-surface">{awaitingApproval}</p>
            <div className="text-error font-label-sm flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>+12%
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-card shadow-sm">
          <p className="font-label-sm text-outline uppercase mb-2">Total Managed</p>
          <div className="flex justify-between items-end">
            <p className="font-headline-lg text-on-surface">${totalManaged.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <div className="text-primary font-label-sm flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_down</span>-4%
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-card shadow-sm">
          <p className="font-label-sm text-outline uppercase mb-2">Avg. Response Time</p>
          <div className="flex justify-between items-end">
            <p className="font-headline-lg text-on-surface">4.2 hrs</p>
            <div className="text-primary font-label-sm flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">timer</span>On Track
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-card shadow-sm">
          <p className="font-label-sm text-outline uppercase mb-2">Approval Rate</p>
          <div className="flex justify-between items-end">
            <p className="font-headline-lg text-on-surface">94.2%</p>
            <div className="text-primary font-label-sm flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>Healthy
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button className="px-5 py-2 rounded-full bg-primary text-white font-label-md shadow-md focus:ring-2 focus:ring-primary outline-none">All Requests</button>
        <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md focus:ring-2 focus:ring-primary outline-none">Claims</button>
        <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md focus:ring-2 focus:ring-primary outline-none">Cash Advances</button>
        <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md focus:ring-2 focus:ring-primary outline-none">Liquidations</button>
      </div>

      <Card>
        <CardHeader className="bg-surface-container-low/50">
          <h4 className="font-headline-md text-on-surface">Unified Worklist</h4>
          <div className="flex items-center gap-2">
            <button aria-label="Filter options" className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary focus-visible:outline-none" onClick={() => addToast('Filter options opened', 'success')}><span className="material-symbols-outlined text-outline">filter_list</span></button>
            <button aria-label="More options" className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary focus-visible:outline-none" onClick={() => addToast('Additional options opened', 'success')}><span className="material-symbols-outlined text-outline">more_vert</span></button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Requestor</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {pendingClaims.map(claim => {
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
                      <div className="flex items-center text-on-surface-variant font-label-md">
                        <span className="material-symbols-outlined text-[18px] mr-2 text-primary">receipt_long</span>
                        {claim.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono-data text-on-surface font-bold">${claim.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => navigate('/approvals')}>Action</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-on-surface">Recent Activity</h4>
            <span className="material-symbols-outlined text-outline">history</span>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-[1px] flex-1 bg-outline-variant my-1"></div>
              </div>
              <div className="pb-2">
                <p className="font-label-md text-on-surface">System Auto-Validated Claims</p>
                <p className="text-body-sm text-outline">12 low-risk travel claims were automatically approved via policy rules.</p>
                <p className="text-[11px] text-outline mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-error rounded-full"></div>
              </div>
              <div className="pb-2">
                <p className="font-label-md text-on-surface">Rejected Advance Request</p>
                <p className="text-body-sm text-outline">Jessica Chen's request for $2,000 was flagged for exceeding cap.</p>
                <p className="text-[11px] text-outline mt-1">4 hours ago</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden p-6 flex flex-col justify-between">
          <div className="z-10 relative">
            <h4 className="font-headline-md text-on-surface mb-2">Team Sentiment</h4>
            <p className="text-body-sm text-outline mb-6">Efficiency metrics for the past week</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-sm text-on-surface-variant">Policy Compliance</span>
                  <span className="font-label-sm text-primary">98%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full">
                  <div className="h-full bg-primary rounded-full w-[98%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-sm text-on-surface-variant">Process Velocity</span>
                  <span className="font-label-sm text-tertiary">84%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full">
                  <div className="h-full bg-tertiary rounded-full w-[84%]"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant z-10">
            <Button variant="outline" className="w-full gap-2 text-primary border-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast('Weekly report generated and emailed', 'success')}>
              <span className="material-symbols-outlined text-[18px]">assessment</span> Generate Weekly Report
            </Button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        </Card>
      </div>
    </div>
  );
}
