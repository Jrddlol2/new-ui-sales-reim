import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../components/AppContext';
import { ClaimStatus, SupportRequestStatus } from '../../types';
import { fetchAuditHistory } from '../../lib/api';

interface AuditEntry {
  id: string;
  timestamp: string;
  new_status: string;
  reason?: string;
  changedBy?: { name: string; role: string };
  claim?: { claim_number?: string };
  targetUser?: { name: string };
  master_data_key?: string;
}

const TERMINAL_STATUSES: string[] = [
  ClaimStatus.COMPLETED, ClaimStatus.REJECTED, ClaimStatus.LIQUIDATED, ClaimStatus.CLOSED,
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function describeEntry(e: AuditEntry): string {
  if (e.claim?.claim_number) return `${e.claim.claim_number} → ${e.new_status}`;
  if (e.targetUser?.name) return `${e.targetUser.name}: ${e.new_status}`;
  if (e.master_data_key) return `${e.master_data_key}: ${e.new_status}`;
  return e.reason || e.new_status;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { users, claims, masterData, supportRequests } = useAppContext();

  const [recentAudit, setRecentAudit] = useState<AuditEntry[]>([]);
  const [auditError, setAuditError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchAuditHistory()
      .then((data: AuditEntry[]) => { if (alive) setRecentAudit((data || []).slice(0, 5)); })
      .catch((e: any) => { if (alive) setAuditError(e?.message || 'Could not load recent activity.'); });
    return () => { alive = false; };
  }, []);

  const activeClaims = useMemo(
    () => claims.filter(c => !TERMINAL_STATUSES.includes(c.status)).length,
    [claims]
  );
  const openSupportRequests = useMemo(
    () => supportRequests.filter(s => s.status !== SupportRequestStatus.RESOLVED).length,
    [supportRequests]
  );
  const inactiveMasterData = useMemo(
    () => masterData.filter(d => !d.active).length,
    [masterData]
  );

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    claims.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [claims]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-display text-on-surface">System Administration</h1>
          <p className="text-body-md text-outline mt-1">Global platform metrics, settings, and health.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/settings')}>
          <span className="material-symbols-outlined text-[18px]">settings</span>
          System Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Users" value={users.length.toString()} icon="group" iconColorClass="bg-blue-100 text-blue-700" />
        <KPICard title="Active Claims" value={activeClaims.toString()} icon="receipt_long" iconColorClass="bg-indigo-100 text-indigo-700" trend="In flight (not yet terminal)" />
        <KPICard
          title="Open Support Requests"
          value={openSupportRequests.toString()}
          icon="support_agent"
          iconColorClass={openSupportRequests > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}
          trend={openSupportRequests > 0 ? 'Needs attention' : 'All clear'}
          trendColorClass={openSupportRequests > 0 ? 'text-red-600' : 'text-green-600'}
          trendIcon={openSupportRequests > 0 ? 'trending_down' : 'trending_up'}
        />
        <KPICard
          title="Inactive Master Data"
          value={inactiveMasterData.toString()}
          icon="database"
          iconColorClass="bg-amber-100 text-amber-700"
          trend={inactiveMasterData > 0 ? 'Review recommended' : 'All active'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-on-surface">Claims by Status</h4>
            <span className="material-symbols-outlined text-primary">bar_chart</span>
          </div>
          {statusBreakdown.length === 0 ? (
            <p className="text-body-sm text-outline">No claims in the system yet.</p>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="font-body-md text-outline">{status}</span>
                  <span className="font-label-md text-on-surface">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-on-surface">Recent Activity</h4>
            <span className="material-symbols-outlined text-outline">gavel</span>
          </div>
          {auditError ? (
            <p className="text-body-sm text-error">{auditError}</p>
          ) : recentAudit.length === 0 ? (
            <p className="text-body-sm text-outline">No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {recentAudit.map((e, i) => (
                <div key={e.id} className={`flex items-start gap-3 ${i < recentAudit.length - 1 ? 'border-b border-outline-variant pb-3' : ''}`}>
                  <span className="material-symbols-outlined text-secondary">history</span>
                  <div>
                    <p className="font-label-md text-on-surface">{describeEntry(e)}</p>
                    {e.changedBy?.name && <p className="text-body-sm text-outline">by {e.changedBy.name}</p>}
                    <p className="text-[11px] text-outline mt-1">{timeAgo(e.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-4 mt-2 border-t border-outline-variant">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate('/admin/audit')}>
              View full audit log <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
