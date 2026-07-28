/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './components/AppContext';
import { ToastProvider } from './components/shared/ToastContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ClaimsList } from './pages/shared/ClaimsList';
import { SubmitClaim } from './pages/shared/SubmitClaim';
import { ClaimDetail } from './pages/shared/ClaimDetail';
import { ApprovalQueue } from './pages/approver/ApprovalQueue';
import { ProcessingQueue } from './pages/custodian/ProcessingQueue';
import { ReadyToClaimQueue } from './pages/custodian/ReadyToClaimQueue';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserRole } from './types';
import { TransactionHistory } from './pages/custodian/TransactionHistory';
import { AuditLog } from './pages/admin/AuditLog';
import { UserAccounts } from './pages/admin/UserAccounts';
import { MOMs } from './pages/shared/MOMs';
import { Calendar } from './pages/shared/Calendar';
import { Settings } from './pages/shared/Settings';
import { Support } from './pages/shared/Support';
import { Notifications } from './pages/shared/Notifications';
import { CompanyDirectory } from './pages/admin/CompanyDirectory';
import { Receipts } from './pages/shared/Receipts';
import { MasterData } from './pages/admin/MasterData';
import { FieldDefinitionsAdmin } from './pages/admin/FieldDefinitionsAdmin';
import { AdminReporting } from './pages/admin/AdminReporting';
import { SystemEmails } from './pages/admin/SystemEmails';
import { HistoricalImport } from './pages/admin/HistoricalImport';

function RoleBasedRouter() {
  const { currentUser } = useAppContext();

  return (
    <Routes>
      <Route element={<Layout />}>
        {currentUser.role === UserRole.ADMIN ? (
          <Route path="/" element={<AdminDashboard />} />
        ) : (
          <Route path="/" element={<Dashboard />} />
        )}
        
        {/* Requestor / General */}
        <Route path="/claims" element={<ClaimsList />} />
        <Route path="/claims/new" element={<SubmitClaim />} />
        <Route path="/claims/:id" element={<ClaimDetail />} />
        <Route path="/moms" element={<MOMs />} />
        <Route path="/receipts" element={<Receipts />} />
        
        {/* Shared */}
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/support" element={<Support />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Approver */}
        <Route path="/approvals" element={<ApprovalQueue />} />
        
        {/* Custodian */}
        <Route path="/disbursements" element={<ProcessingQueue />} />
        <Route path="/ready-to-claim" element={<ReadyToClaimQueue />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        
        {/* Admin */}
        <Route path="/admin/users" element={<UserAccounts />} />
        <Route path="/admin/master-data" element={<MasterData />} />
        <Route path="/admin/fields" element={<FieldDefinitionsAdmin />} />
        <Route path="/admin/companies" element={<CompanyDirectory />} />
        <Route path="/admin/import" element={<HistoricalImport />} />
        <Route path="/admin/reports" element={<AdminReporting />} />
        <Route path="/admin/audit" element={<AuditLog />} />
        <Route path="/admin/emails" element={<SystemEmails />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <RoleBasedRouter />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}

