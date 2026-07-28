import { NavLink } from 'react-router-dom';
import { cn } from '../ui/Button';
import { useAppContext } from '../AppContext';
import { UserRole } from '../../types';

const getNavItems = (role: UserRole) => {
  const common = [
    { label: 'Dashboard', icon: 'dashboard', path: '/' },
  ];
  
  if (role === UserRole.REQUESTOR) {
    return [
      ...common,
      { label: 'My Requests', icon: 'description', path: '/claims' },
      { label: 'Submit Claim', icon: 'add_circle', path: '/claims/new' },
      { label: 'MOMs', icon: 'meeting_room', path: '/moms' },
      { label: 'Receipt Archive', icon: 'receipt_long', path: '/receipts' },
      { label: 'Calendar', icon: 'calendar_month', path: '/calendar' },
      { label: 'Support', icon: 'help', path: '/support' },
      { label: 'Settings', icon: 'settings', path: '/settings' },
    ];
  }
  
  if (role === UserRole.APPROVER) {
    return [
      ...common,
      { label: 'My Requests', icon: 'description', path: '/claims' },
      { label: 'Submit Claim', icon: 'add_circle', path: '/claims/new' },
      { label: 'Approvals', icon: 'assignment_turned_in', path: '/approvals' },
      { label: 'MOMs', icon: 'meeting_room', path: '/moms' },
      { label: 'Receipt Archive', icon: 'receipt_long', path: '/receipts' },
      { label: 'Calendar', icon: 'calendar_month', path: '/calendar' },
      { label: 'Support', icon: 'help', path: '/support' },
      { label: 'Settings', icon: 'settings', path: '/settings' },
    ];
  }
  
  if (role === UserRole.CUSTODIAN) {
    return [
      ...common,
      { label: 'Processing Queue', icon: 'payments', path: '/disbursements' },
      { label: 'Ready to Claim', icon: 'outbox', path: '/ready-to-claim' },
      { label: 'Transaction History', icon: 'history', path: '/transactions' },
      { label: 'Support', icon: 'help', path: '/support' },
      { label: 'Settings', icon: 'settings', path: '/settings' },
    ];
  }
  
  if (role === UserRole.ADMIN) {
    return [
      ...common,
      { label: 'User Accounts', icon: 'people', path: '/admin/users' },
      { label: 'Master Data Admin', icon: 'database', path: '/admin/master-data' },
      { label: 'Field Definitions', icon: 'input', path: '/admin/fields' },
      { label: 'Company Directory', icon: 'business', path: '/admin/companies' },
      { label: 'Historical Import', icon: 'upload_file', path: '/admin/import' },
      { label: 'Admin Reporting', icon: 'bar_chart', path: '/admin/reports' },
      { label: 'Audit Log', icon: 'gavel', path: '/admin/audit' },
      { label: 'System Emails', icon: 'mail', path: '/admin/emails' },
      { label: 'Support', icon: 'help', path: '/support' },
      { label: 'Settings', icon: 'settings', path: '/settings' },
    ];
  }
  
  return common;
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { currentUser } = useAppContext();
  const navItems = getNavItems(currentUser.role);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-inverse-surface/50 z-20 lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "flex flex-col h-screen py-6 bg-[#1A5BDB] fixed left-0 top-0 z-30 transition-all duration-300 shadow-xl",
        isCollapsed ? "w-[220px] lg:w-[80px]" : "w-[220px] lg:w-[220px]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header with Logo and Mobile Close control */}
        <div className={cn(
          "mb-8 flex items-center transition-all duration-300 relative",
          isCollapsed ? "px-3 lg:px-2 justify-center" : "px-6 justify-center"
        )}>
          <div className="flex items-center overflow-hidden justify-center w-full">
            <img 
              key={isCollapsed ? 'collapsed-logo' : 'full-logo'}
              src={isCollapsed ? '/logo-icon.png' : '/logo.png'} 
              alt="Microgenesis Logo" 
              className={cn(
                "w-auto max-w-[180px] object-contain transition-all duration-300",
                isCollapsed ? "max-h-8 lg:max-h-8" : "max-h-12"
              )}
              onError={(e) => {
                const target = e.currentTarget;
                const currentSrc = target.src;
                if (isCollapsed) {
                  if (currentSrc.endsWith('/logo-icon.png')) {
                    target.src = '/logo/logo-icon.png';
                  } else if (currentSrc.endsWith('/logo/logo-icon.png')) {
                    target.src = '/logo/icon.png';
                  } else if (currentSrc.endsWith('/logo/icon.png')) {
                    target.src = '/logo-icon.svg';
                  } else if (currentSrc.endsWith('/logo-icon.svg')) {
                    target.src = '/logo/logo-icon.svg';
                  } else if (currentSrc.endsWith('/logo/logo-icon.svg')) {
                    target.src = '/logo.png';
                  } else {
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback font-bold text-white text-lg font-sans tracking-wide';
                      fallback.innerText = 'M';
                      parent.appendChild(fallback);
                    }
                  }
                } else {
                  if (currentSrc.endsWith('/logo.png')) {
                    target.src = '/logo/logo.png';
                  } else if (currentSrc.endsWith('/logo/logo.png')) {
                    target.src = '/logo.svg';
                  } else if (currentSrc.endsWith('/logo.svg')) {
                    target.src = '/logo/logo.svg';
                  } else {
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback font-bold text-white text-lg font-sans tracking-wide';
                      fallback.innerText = 'MICROGENESIS';
                      parent.appendChild(fallback);
                    }
                  }
                }
              }} 
            />
          </div>

          {/* Mobile Close Button */}
          <button className="lg:hidden absolute right-4 text-white/80 hover:text-white focus:ring-2 focus:ring-white outline-none rounded p-1" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Desktop Circular Collapse Toggle Button on Sidebar Right Edge */}
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1A5BDB] shadow-lg hover:bg-slate-50 hover:scale-110 active:scale-95 border border-blue-200 transition-all absolute -right-4 top-1/2 -translate-y-1/2 z-40 focus:outline-none focus:ring-2 focus:ring-primary"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="material-symbols-outlined text-[20px] font-bold">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}
        
        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              title={item.label}
              className={({ isActive }) => cn(
                "flex items-center py-3 group transition-all duration-200 ease-in-out focus:ring-2 focus:ring-white focus:ring-inset outline-none",
                isCollapsed ? "lg:justify-center lg:px-0" : "",
                isActive 
                  ? "text-white font-bold border-l-4 border-white bg-black/15 shadow-inner" + (isCollapsed ? " pl-4 lg:pl-0" : " pl-4")
                  : "text-white/80 font-medium hover:bg-white/15 hover:text-white" + (isCollapsed ? " pl-5 lg:pl-0" : " pl-5")
              )}
            >
              <span className={cn(
                "material-symbols-outlined transition-all",
                isCollapsed ? "lg:mr-0 text-[22px]" : "mr-3 text-[24px]"
              )}>
                {item.icon}
              </span>
              <span className={cn(
                "font-body-base text-body-base whitespace-nowrap transition-all duration-200",
                isCollapsed ? "lg:hidden" : "block"
              )}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
        
        {/* User Profile Card Footer */}
        <div className={cn(
          "mt-auto pt-4 transition-all duration-300",
          isCollapsed ? "px-6 lg:px-2" : "px-6"
        )}>
          <div 
            className={cn(
              "p-3 bg-black/10 rounded-xl flex items-center gap-3 transition-all duration-300",
              isCollapsed ? "lg:justify-center lg:p-2" : ""
            )}
            title={isCollapsed ? `${currentUser.name} (${currentUser.jobTitle})` : undefined}
          >
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full border-2 border-white/20 object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className={cn("overflow-hidden transition-all duration-200", isCollapsed ? "lg:hidden" : "block")}>
              <p className="text-white font-label-md text-label-md truncate">{currentUser.name}</p>
              <p className="text-white/80 font-body-sm text-body-sm truncate">{currentUser.jobTitle}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
