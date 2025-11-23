import { Bell, Search, Menu } from 'lucide-react';
import type { UserRole } from '../../App';

interface HeaderProps {
  currentRole: UserRole;
  onMobileMenuToggle: () => void;
}

export function Header({ currentRole, onMobileMenuToggle }: HeaderProps) {
  const roleNames = {
    admin: 'Arjun Mehta',
    supervisor: 'Priya Sharma',
    worker: 'Amit Patel',
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search permits, sites, users..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-slate-900">{roleNames[currentRole]}</p>
              <p className="text-xs text-slate-500 capitalize">{currentRole}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
              {roleNames[currentRole].charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}