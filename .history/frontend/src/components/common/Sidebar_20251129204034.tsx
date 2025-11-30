// frontend/src/components/common/Sidebar.tsx
import { LayoutDashboard, Users, Plus, LogOut, X } from 'lucide-react';

interface User {
  id: number;
  login_id: string;
  full_name: string;
  email: string;
  role: string;
  department?: string;
}

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export default function Sidebar({ 
  currentUser, 
  currentPage, 
  onNavigate, 
  onLogout,
  isMobileMenuOpen,
  onMobileMenuClose
}: SidebarProps) {
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if user is Admin or Administrator - check both role and frontendRole
  const isAdmin = currentUser.role === 'Admin' || 
                  currentUser.role === 'Administrator' ||
                  (currentUser as any).frontendRole === 'Admin';

  console.log('🎨 Sidebar render:', {
    role: currentUser.role,
    frontendRole: (currentUser as any).frontendRole,
    isAdmin: isAdmin
  });

  // Determine role-based navigation items
  const getNavigationItems = () => {
    if (isAdmin) {
      // Admin/Administrator navigation
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'site-management', label: 'Site Management', icon: LayoutDashboard },
        { id: 'user-management', label: 'User Management', icon: Users },
        { id: 'all-permits', label: 'All Permits', icon: LayoutDashboard },
      ];
    } else {
      // All other roles (Supervisor, Approver_Safety, Approver_AreaManager, Requester, etc.)
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'worker-list', label: 'Workers', icon: Users },
        { id: 'create-permit', label: 'Create PTW', icon: Plus },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleNavClick = (pageId: string) => {
    console.log('📌 Sidebar navigation clicked:', pageId);
    onNavigate(pageId);
    onMobileMenuClose();
  };

  const NavButton = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    
    return (
      <button
        onClick={() => handleNavClick(item.id)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all
          ${isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <span className="text-lg font-bold text-white">E</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">EPTW</h1>
          </div>
          <button
            onClick={onMobileMenuClose}
            className="p-2 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User profile */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 text-lg font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
              {getInitials(currentUser.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser.full_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.role}
              </p>
              {currentUser.department && (
                <p className="text-xs text-gray-400 truncate">
                  {currentUser.department}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}