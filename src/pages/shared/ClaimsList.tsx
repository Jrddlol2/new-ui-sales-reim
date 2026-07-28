import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppContext } from '../../components/AppContext';

export function ClaimsList() {
  const { currentUser, claims } = useAppContext();
  const navigate = useNavigate();
  
  const myClaims = claims.filter(c => c.requestorId === currentUser.id);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display text-display text-on-surface">My Requests</h2>
          <p className="text-body-md text-outline mt-1">Track your submitted claims, advances, and liquidations.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/claims/new')}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Claim
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <Input className="pl-10 py-1.5" placeholder="Search claims..." />
            </div>
            <Select className="w-48 py-1.5">
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
            </Select>
          </div>
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
              {myClaims.map(claim => (
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
              {myClaims.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
