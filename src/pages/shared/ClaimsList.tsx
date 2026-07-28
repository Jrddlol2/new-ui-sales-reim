import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppContext } from '../../components/AppContext';
import { Pagination } from '../../components/ui/Pagination';

export function ClaimsList() {
  const { currentUser, claims } = useAppContext();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const myClaims = claims.filter(c => c.requestorId === currentUser.id);

  const filteredClaims = useMemo(() => {
    return myClaims.filter(claim => {
      const matchesSearch = claim.ref.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            claim.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? claim.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [myClaims, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);


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
              <Input 
                className="pl-10 py-1.5" 
                placeholder="Search claims..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              className="w-48 py-1.5"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Ready for Claim">Ready for Claim</option>
              <option value="Completed">Completed</option>
              <option value="Returned for Revision">Returned</option>
              <option value="Rejected">Rejected</option>
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
              {paginatedClaims.map(claim => (
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
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </Card>
    </div>
  );
}
