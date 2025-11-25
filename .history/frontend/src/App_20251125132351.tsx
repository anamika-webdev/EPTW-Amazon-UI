// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AuthCallback from './pages/auth/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

// User interface that matches backend response
interface User {
  id: number;
  login_id: string;
  full_name: string;
  email: string;
  role: string; // Database role: Admin, Approver_Safety, Approver_AreaManager, Requester
  frontendRole?: 'Admin' | 'Supervisor' | 'Worker'; // Mapped role for UI
  department?: string;
  signature_url?: string;
  created_at?: string;
  auth_provider?: 'local' | 'google';
}

// Role Mapping Function
function mapDatabaseRoleToFrontend(dbRole: string): 'Admin' | 'Supervisor' | 'Worker' {
  // Map all roles to Supervisor except Admin
  if (dbRole === 'Admin') {
    return 'Admin';
  }
  // Approver_Safety, Approver_AreaManager, Requester all map to Supervisor
  return 'Supervisor';
}

// App Context
export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          
          // Ensure frontendRole is mapped
          const mappedUser: User = {
            ...user,
            frontendRole: user.frontendRole || mapDatabaseRoleToFrontend(user.role)
          };
          
          setCurrentUser(mappedUser);
          
          // Set initial page based on role
          if (mappedUser.frontendRole === 'Admin') {
            setCurrentPage('admin-dashboard');
          } else {
            setCurrentPage('supervisor-dashboard');
          }
          
          console.log('Restored session:', {
            name: mappedUser.full_name,
            databaseRole: user.role,
            frontendRole: mappedUser.frontendRole,
            authProvider: mappedUser.auth_provider
          });
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        // Clear invalid session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleLogin = (user: User) => {
    // Map the database role to frontend role
    const mappedUser: User = {
      ...user,
      frontendRole: mapDatabaseRoleToFrontend(user.role)
    };
    
    setCurrentUser(mappedUser);
    
    // Set initial page based on MAPPED role
    if (mappedUser.frontendRole === 'Admin') {
      setCurrentPage('admin-dashboard');
    } else {
      // Everyone else gets Supervisor dashboard
      setCurrentPage('supervisor-dashboard');
    }
    
    console.log('User logged in:', {
      name: mappedUser.full_name,
      databaseRole: user.role,
      frontendRole: mappedUser.frontendRole,
      authProvider: mappedUser.auth_provider,
      initialPage: mappedUser.frontendRole === 'Admin' ? 'admin-dashboard' : 'supervisor-dashboard'
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    console.log('Navigating to:', page);
  };

  // Render dashboard based on current page and user role
  const renderDashboard = () => {
    const frontendRole = currentUser?.frontendRole;
    
    console.log('Rendering dashboard:', { 
      currentPage, 
      frontendRole,
      databaseRole: currentUser?.role 
    });
    
    // Admin Dashboard Routes
    if (frontendRole === 'Admin') {
      if (currentPage === 'admin-dashboard' || currentPage === 'all-permits' || 
          currentPage === 'site-management' || currentPage === 'user-management') {
        return <AdminDashboard currentPage={currentPage} onNavigate={handleNavigate} />;
      }
      // Default for admin
      return <AdminDashboard currentPage="admin-dashboard" onNavigate={handleNavigate} />;
    }
    
    // Supervisor Dashboard Routes (for all non-admin users)
    if (frontendRole === 'Supervisor') {
      if (currentPage === 'supervisor-dashboard' || currentPage === 'create-permit' || 
          currentPage === 'worker-list') {
        return <SupervisorDashboard />;
      }
      // Default for supervisor
      return <SupervisorDashboard />;
    }
    
    // Fallback
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Welcome to Amazon EPTW</h1>
          <div className="p-6 space-y-4 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <span className="text-xl font-semibold text-blue-600">
                  {currentUser?.full_name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{currentUser?.full_name}</p>
                <p className="text-sm text-gray-600">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Auth Routes - Only accessible when NOT logged in */}
          <Route 
            path="/login" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SignupPage onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback onLogin={handleLogin} />} 
          />

          {/* Protected Routes - Only accessible when logged in */}
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <DashboardLayout
                  currentUser={currentUser}
                  currentPage={currentPage}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                  isMobileMenuOpen={isMobileMenuOpen}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                  renderDashboard={renderDashboard}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch all - redirect to login or dashboard */}
          <Route 
            path="*" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

// Dashboard Layout Component
interface DashboardLayoutProps {
  currentUser: User;
  currentPage: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  renderDashboard: () => React.ReactNode;
}

function DashboardLayout({
  currentUser,
  currentPage,
  onLogout,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  renderDashboard
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - Using correct prop names */}
      <Sidebar 
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
        {/* Header - Using correct prop names */}
        <Header 
          currentUser={currentUser}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onLogout={onLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default App;