import { useState, useEffect } from 'react';
import { useAppContext } from '../components/AppContext';
import { RequestorDashboard } from './requestor/RequestorDashboard';
import { ApproverDashboard } from './approver/ApproverDashboard';
import { CustodianDashboard } from './custodian/CustodianDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { UserRole } from '../types';

export function Dashboard() {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="mb-8 space-y-4">
          <div className="h-8 w-64 bg-surface-container-high rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-surface-container-high rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface-container-lowest p-6 border border-outline-variant rounded-card shadow-sm h-32 flex flex-col justify-between">
              <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-surface-container-high rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="h-64 bg-surface-container-lowest rounded-card border border-outline-variant animate-pulse"></div>
      </div>
    );
  }

  switch (currentUser.role) {
    case UserRole.REQUESTOR:
      return <RequestorDashboard />;
    case UserRole.APPROVER:
      return <ApproverDashboard />;
    case UserRole.CUSTODIAN:
      return <CustodianDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <div>Unknown Role</div>;
  }
}
