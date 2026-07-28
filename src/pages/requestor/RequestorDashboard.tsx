import { useNavigate } from 'react-router-dom';
import { KPICard } from '../../components/ui/KPICard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';

export function RequestorDashboard() {
  const { currentUser, claims } = useAppContext();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const myClaims = claims.filter(c => c.requestorId === currentUser.id);
  const activeClaimsCount = myClaims.filter(c => ['Draft', 'Pending Approval', 'Processing', 'Ready for Claim'].includes(c.status)).length;
  const totalReimbursed = myClaims.filter(c => c.status === 'Completed').reduce((acc, c) => acc + c.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-display text-on-surface">Hello, {currentUser.name.split(' ')[0]}.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/claims/new?type=advance')}>
            <span className="material-symbols-outlined text-[20px]">add_card</span>
            Request Cash Advance
          </Button>
          <Button className="gap-2" onClick={() => navigate('/claims/new')}>
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            New Reimbursement
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          title="Active Claims" 
          value={activeClaimsCount.toString()} 
          icon="pending_actions" 
          iconColorClass="bg-primary-fixed text-on-primary-fixed-variant"
          trend="+2 Since last week"
          trendIcon="trending_up"
          trendColorClass="text-tertiary"
        />
        <KPICard 
          title="Unliquidated Float" 
          value="2,450.00" 
          prefix="$"
          icon="account_balance_wallet" 
          iconColorClass="bg-secondary-container text-on-secondary-fixed-variant"
          trend="3 Overdue"
          trendIcon="warning"
          trendColorClass="text-error"
        />
        <KPICard 
          title="Total Reimbursed" 
          value={totalReimbursed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
          prefix="$"
          icon="payments" 
          iconColorClass="bg-tertiary-fixed text-on-tertiary-fixed-variant"
          trend="100% success rate"
          trendIcon="check_circle"
          trendColorClass="text-[#0D9488]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests Table */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Requests</h3>
            <button className="text-primary font-label-md hover:underline transition-all outline-none focus:ring-2 focus:ring-primary rounded p-1" onClick={() => navigate('/claims')}>View All</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-table-header text-on-surface-variant font-label-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Purpose</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border font-body-base">
                {myClaims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-outline">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                      <p className="font-label-md">No claims submitted yet.</p>
                    </td>
                  </tr>
                ) : myClaims.slice(0, 5).map(claim => (
                  <tr key={claim.id} className="hover:bg-brand-row-hover transition-colors cursor-pointer" onClick={() => navigate(`/claims/${claim.id}`)}>
                    <td className="px-6 py-4 font-mono-data font-medium">{claim.ref}</td>
                    <td className="px-4 py-4">{claim.type}</td>
                    <td className="px-4 py-4">{claim.purpose}</td>
                    <td className="px-4 py-4 font-semibold">${claim.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Side Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-primary-container text-white p-6 rounded-[14px] shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-headline-md mb-2">Liquidation Progress</h4>
              <p className="font-body-base opacity-80 mb-6">You have 3 advances that need liquidation within 5 days.</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-2/3"></div>
                </div>
                <span className="font-label-md">66%</span>
              </div>
              <Button variant="secondary" className="w-full font-bold" onClick={() => addToast('Monthly reports submitted to finance successfully', 'success')}>Submit Reports Now</Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h4 className="font-label-md text-on-surface mb-4">Policies & Guidelines</h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  <div>
                    <p className="font-label-md">Meal Allowance Cap</p>
                    <p className="text-body-sm text-on-surface-variant">Daily limit increased to $65.00 effective Oct 1st.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                  <div>
                    <p className="font-label-md">Receipt Quality</p>
                    <p className="text-body-sm text-on-surface-variant">Ensure all digital scans show date and total clearly.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
