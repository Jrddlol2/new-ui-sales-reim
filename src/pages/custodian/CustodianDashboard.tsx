import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { KPICard } from '../../components/ui/KPICard';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';

export function CustodianDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { claims, users } = useAppContext();
  
  const processingClaims = claims.filter(c => c.status === 'Processing' || c.status === 'Ready for Claim');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <span className="font-label-sm text-primary font-bold tracking-wider uppercase">Custodian Queue</span>
          <h1 className="font-display text-display text-on-surface mt-1">Pending Disbursements</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast('Displaying active filters', 'success')}><span className="material-symbols-outlined">filter_list</span> Filter</Button>
          <Button className="gap-2 focus:ring-2 focus:ring-primary outline-none" onClick={() => {
            const csv = 'Report Data\n...';
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'custodian_report.csv';
            a.click();
            addToast('Report exported successfully', 'success');
          }}><span className="material-symbols-outlined">download</span> Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Missing Receipts" 
          value="42" 
          icon="receipt_long" 
          iconColorClass="bg-error-container text-on-error-container"
          trend="+12% vs last week"
          trendColorClass="text-error bg-error-container px-2 py-1 rounded-full"
        />
        <KPICard 
          title="Total Pending" 
          value={processingClaims.length.toString()} 
          icon="pending_actions" 
          iconColorClass="bg-primary-fixed text-on-primary-fixed-variant"
          trend="Active Queue"
          trendColorClass="text-primary bg-primary-fixed px-2 py-1 rounded-full"
        />
        <KPICard 
          title="Oldest Item in Queue" 
          value="4.2" 
          prefix=""
          icon="schedule" 
          iconColorClass="bg-tertiary-fixed text-on-tertiary-fixed-variant"
          trend="Urgent"
          trendColorClass="text-tertiary bg-tertiary-fixed px-2 py-1 rounded-full"
        />
      </div>

      <Card>
        <CardHeader className="bg-surface-container-low">
          <div className="flex items-center gap-4">
            <h3 className="font-label-md uppercase tracking-wider text-on-surface">Claims Awaiting Processing</h3>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">AS</div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">MK</div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">+5</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-outline">Viewing {processingClaims.length > 0 ? `1-${processingClaims.length}` : '0'} of {processingClaims.length}</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-label-sm text-outline uppercase">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Requestor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {processingClaims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                    <p className="font-label-md">Queue is empty!</p>
                  </td>
                </tr>
              ) : processingClaims.map(claim => {
                const req = users.find(u => u.id === claim.requestorId) || users[0];
                return (
                  <tr key={claim.id} className="hover:bg-primary-container/5 transition-colors group cursor-pointer" onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                      navigate(`/claims/${claim.id}`);
                    }
                  }}>
                    <td className="px-6 py-5 font-mono-data text-primary font-bold">{claim.ref}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-semibold">{req.name.split(' ').map(n=>n[0]).join('')}</div>
                        <div>
                          <p className="text-sm font-bold">{req.name}</p>
                          <p className="text-xs text-outline">{req.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono-data text-sm font-bold">${claim.total.toFixed(2)}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button size="sm" className="gap-2 ml-auto" onClick={() => navigate('/disbursements')}>
                        <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                        Generate Release Code
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-label-md text-on-surface mb-4">Queue Velocity (24h)</h4>
          <div className="h-32 flex items-end justify-between gap-1">
            {[40, 60, 90, 30, 55, 85, 45].map((h, i) => (
              <div key={i} className="w-full bg-primary-fixed-dim/20 rounded-t-sm relative group hover:bg-primary transition-all cursor-help" style={{ height: `${h}%` }}>
                <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-sm opacity-60" style={{ height: `${Math.max(30, h - 20)}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-outline uppercase font-bold tracking-wider">
            <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>00:00</span>
          </div>
        </Card>
        
        <Card className="bg-primary-container text-on-primary-container p-6 relative flex flex-col justify-center overflow-hidden">
          <div className="z-10">
            <h4 className="font-headline-md mb-2">Automated Audit Mode</h4>
            <p className="text-body-base opacity-80 mb-6">FinFlow AI is currently verifying 24 receipts in the background. System efficiency is at 98.4%.</p>
            <Button variant="secondary" className="gap-2 text-primary font-bold" onClick={() => navigate('/transactions')}>
              <span className="material-symbols-outlined">auto_awesome</span> View Audit Logs
            </Button>
          </div>
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-[120px]">security</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
