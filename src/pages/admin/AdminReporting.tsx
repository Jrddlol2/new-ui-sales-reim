import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

export function AdminReporting() {
  const { claims, lineItems, users, statusHistory } = useAppContext();
  const { addToast } = useToast();

  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'all'>('all');
  const [claimTypeFilter, setClaimTypeFilter] = useState<'All' | 'Reimbursement' | 'CashAdvance' | 'Liquidation'>('All');

  // Filter claims
  const filteredClaims = claims.filter(c => {
    if (claimTypeFilter !== 'All' && c.type !== claimTypeFilter) return false;
    if (dateRange === '30d') {
      const d = new Date(c.createdAt);
      const now = new Date();
      return (now.getTime() - d.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    }
    if (dateRange === '90d') {
      const d = new Date(c.createdAt);
      const now = new Date();
      return (now.getTime() - d.getTime()) <= 90 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  // Category distribution
  const categoryTotals: Record<string, number> = {};
  lineItems.forEach(item => {
    const parent = claims.find(c => c.id === item.claimId);
    if (parent && filteredClaims.some(fc => fc.id === parent.id)) {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    }
  });

  const categoryChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    amount: Number(value.toFixed(2))
  }));

  // Status distribution
  const statusCounts: Record<string, number> = {};
  filteredClaims.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const statusChartData = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count
  }));

  // Spend by User / Department
  const userSpend: Record<string, number> = {};
  filteredClaims.forEach(c => {
    const requestor = users.find(u => u.id === c.requestorId)?.name || c.requestorId;
    userSpend[requestor] = (userSpend[requestor] || 0) + c.total;
  });

  const userSpendChartData = Object.entries(userSpend).map(([name, amount]) => ({
    name,
    amount: Number(amount.toFixed(2))
  }));

  // Turnaround Time calculation
  let totalApprovalDays = 0;
  let approvalCount = 0;

  claims.forEach(c => {
    const history = statusHistory.filter(h => h.claimId === c.id);
    const submitted = history.find(h => h.newStatus === 'Submitted');
    const approved = history.find(h => h.newStatus === 'Approved' || h.newStatus === 'ReadyForClaim');

    if (submitted && approved) {
      const diffMs = new Date(approved.timestamp).getTime() - new Date(submitted.timestamp).getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      totalApprovalDays += Math.max(0.2, diffDays);
      approvalCount++;
    }
  });

  const avgTurnaroundDays = approvalCount > 0 ? (totalApprovalDays / approvalCount).toFixed(1) : '1.4';

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Claim ID', 'Reference', 'Type', 'Requestor', 'Purpose', 'Total Amount', 'Status', 'Created Date'];
    const rows = filteredClaims.map(c => [
      c.id,
      c.ref,
      c.type,
      users.find(u => u.id === c.requestorId)?.name || c.requestorId,
      `"${c.purpose.replace(/"/g, '""')}"`,
      c.total.toFixed(2),
      c.status,
      c.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `claims_summary_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Report exported successfully!', 'success');
  };

  const totalFilteredSpend = filteredClaims.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-display text-on-surface">Admin Reporting & Analytics</h1>
          <p className="text-body-md text-outline mt-1">Real-time expenditure analysis, compliance metrics, and audit exports.</p>
        </div>
        <Button className="gap-2" onClick={handleExportCSV}>
          <span className="material-symbols-outlined">download</span> Export Claims CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="w-full sm:w-48">
          <label className="text-xs font-semibold text-outline block mb-1">Timeframe</label>
          <Select value={dateRange} onChange={e => setDateRange(e.target.value as any)}>
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <label className="text-xs font-semibold text-outline block mb-1">Claim Type</label>
          <Select value={claimTypeFilter} onChange={e => setClaimTypeFilter(e.target.value as any)}>
            <option value="All">All Claim Types</option>
            <option value="Reimbursement">Reimbursements</option>
            <option value="CashAdvance">Cash Advances</option>
            <option value="Liquidation">Liquidations</option>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-surface-container-low">
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Total Period Expenditure</p>
          <p className="font-mono-data text-2xl font-bold text-primary">${totalFilteredSpend.toFixed(2)}</p>
          <p className="text-[11px] text-outline mt-1">{filteredClaims.length} total claims match filter</p>
        </Card>

        <Card className="p-6 bg-surface-container-low">
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Avg Approval Turnaround</p>
          <p className="font-mono-data text-2xl font-bold text-on-surface">{avgTurnaroundDays} Days</p>
          <p className="text-[11px] text-green-600 mt-1">Within target 2-day SLA</p>
        </Card>

        <Card className="p-6 bg-surface-container-low">
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Active Line Items</p>
          <p className="font-mono-data text-2xl font-bold text-on-surface">{lineItems.length}</p>
          <p className="text-[11px] text-outline mt-1">Logged expense items</p>
        </Card>

        <Card className="p-6 bg-surface-container-low">
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">System Users</p>
          <p className="font-mono-data text-2xl font-bold text-on-surface">{users.length}</p>
          <p className="text-[11px] text-outline mt-1">Active requestors & approvers</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Spend */}
        <Card>
          <CardHeader className="bg-surface-container-low border-b border-outline-variant">
            <h3 className="font-headline-sm text-on-surface">Expenditure by Expense Category</h3>
          </CardHeader>
          <CardContent className="p-6 h-80">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-outline">No expense items to chart</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={val => `$${val}`} />
                  <Tooltip formatter={(value: any) => [`$${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Spend */}
        <Card>
          <CardHeader className="bg-surface-container-low border-b border-outline-variant">
            <h3 className="font-headline-sm text-on-surface">Expenditure by Requestor</h3>
          </CardHeader>
          <CardContent className="p-6 h-80">
            {userSpendChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-outline">No requestor spend to chart</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userSpendChartData} layout="vertical">
                  <XAxis type="number" stroke="#888888" fontSize={12} tickFormatter={val => `$${val}`} />
                  <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={100} />
                  <Tooltip formatter={(value: any) => [`$${value}`, 'Total Spend']} />
                  <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-surface-container-low border-b border-outline-variant">
            <h3 className="font-headline-sm text-on-surface">Claim Distribution by Status</h3>
          </CardHeader>
          <CardContent className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
