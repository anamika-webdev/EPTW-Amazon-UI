import { LayoutDashboard, Building2, Users, FileText, UserCircle, ClipboardList, Plus, LogOut } from 'lucide-react';
import type { UserRole, CurrentPage } from '../../App';

interface SidebarProps {
  currentRole: UserRole;
  currentPage: CurrentPage;
  onNavigate: (page: CurrentPage) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export function Sidebar({ currentRole, currentPage, onNavigate, onLogout, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const adminMenuItems = [
    { id: 'admin-dashboard' as CurrentPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'site-management' as CurrentPage, label: 'Site Management', icon: Building2 },
    { id: 'user-management' as CurrentPage, label: 'User Management', icon: Users },
    { id: 'ptw-all-permits' as CurrentPage, label: 'All Permits', icon: FileText },
  ];

  const supervisorMenuItems = [
    { id: 'supervisor-dashboard' as CurrentPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'worker-list' as CurrentPage, label: 'Workers', icon: Users },
    { id: 'create-ptw' as CurrentPage, label: 'Create PTW', icon: Plus },
  ];

  const workerMenuItems = [
    { id: 'worker-dashboard' as CurrentPage, label: 'My Permits', icon: ClipboardList },
  ];

  let menuItems = adminMenuItems;
  if (currentRole === 'supervisor') menuItems = supervisorMenuItems;
  if (currentRole === 'worker') menuItems = workerMenuItems;

  const roleColors = {
    admin: 'bg-blue-600',
    supervisor: 'bg-green-600',
    worker: 'bg-orange-600',
  };

  const roleLabels = {
    admin: 'Administrator',
    supervisor: 'Supervisor',
    worker: 'Worker',
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-15 h-15 ${roleColors[currentRole]} rounded-lg flex items-center justify-center`}>
              <img src="logo.jpg" alt="EPTW logo" className="w-15 h-15 object-contain" />
            </div>
            <div>
              <h2 className="text-slate-900">EPTW</h2>
              <p className="text-xs text-slate-500">Permit System</p>
            </div>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <UserCircle className="w-8 h-8 text-slate-600" />
            <div>
              <p className="text-sm text-slate-900">{roleLabels[currentRole]}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? `${roleColors[currentRole]} text-white`
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}