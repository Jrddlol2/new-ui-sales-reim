import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const navigate = useNavigate();
  
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
        <KPICard title="Total Users" value="1,248" icon="group" iconColorClass="bg-blue-100 text-blue-700" trend="+12 this week" trendColorClass="text-green-600" trendIcon="trending_up" />
        <KPICard title="Active Claims" value="482" icon="receipt_long" iconColorClass="bg-indigo-100 text-indigo-700" trend="Processing Queue" />
        <KPICard title="System Uptime" value="99.98%" icon="settings" iconColorClass="bg-green-100 text-green-700" trend="Healthy" trendColorClass="text-green-600" trendIcon="trending_up" />
        <KPICard title="Pending Master Data" value="14" icon="database" iconColorClass="bg-amber-100 text-amber-700" trend="Action Required" trendColorClass="text-red-600" trendIcon="trending_down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-on-surface">System Health</h4>
            <span className="material-symbols-outlined text-primary">monitor_heart</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-outline">Database Connections</span>
              <span className="font-label-md text-on-surface">42 / 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-outline">Email Service Queue</span>
              <span className="font-label-md text-on-surface">0 pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-outline">API Rate Limit</span>
              <span className="font-label-md text-on-surface">12% utilized</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-on-surface">Recent Audit Logs</h4>
            <span className="material-symbols-outlined text-outline">gavel</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-tertiary">admin_panel_settings</span>
              <div>
                <p className="font-label-md text-on-surface">Role Assignment Changed</p>
                <p className="text-body-sm text-outline">Admin updated John Doe to Approver</p>
                <p className="text-[11px] text-outline mt-1">10 mins ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-primary">settings_applications</span>
              <div>
                <p className="font-label-md text-on-surface">Policy Rules Updated</p>
                <p className="text-body-sm text-outline">Travel Cap increased to $5,000</p>
                <p className="text-[11px] text-outline mt-1">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary">database</span>
              <div>
                <p className="font-label-md text-on-surface">Company Directory Sync</p>
                <p className="text-body-sm text-outline">14 new companies imported from ERP</p>
                <p className="text-[11px] text-outline mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
