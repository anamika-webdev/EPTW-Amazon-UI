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
import UserProfile from './components/common/UserProfile';

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

// Role Mapping Function - ONLY Admin gets Admin Dashboard
function mapDatabaseRoleToFrontend(dbRole: string): 'Admin' | 'Supervisor' | 'Worker' {
  // Only Admin role gets Admin Dashboard
  if (dbRole === 'Admin') {
    return 'Admin';
  }
  // ALL OTHER ROLES (Requester, Approver_Safety, Approver_AreaManager) get Supervisor Dashboard
  return 'Supervisor';
}

// Session Security Functions
const isTokenExpired = (): boolean => {
  const expiryStr = localStorage.getItem('tokenExpiry');
  if (!expiryStr) return true;
  
  const expiry = parseInt(expiryStr);
  return Date.now() > expiry;
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('user');
  sessionStorage.clear();
};

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
  const [showProfile, setShowProfile] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // Check if token exists and is not expired
        if (token && userStr && !isTokenExpired()) {
          const user = JSON.parse(userStr);
          
          // Ensure frontendRole is mapped correctly
          const mappedUser: User = {
            ...user,
            frontendRole: user.frontendRole || mapDatabaseRoleToFrontend(user.role)
          };
          
          setCurrentUser(mappedUser);
          
          // Set initial page based on role - ONLY Admin gets Admin Dashboard
          if (mappedUser.frontendRole === 'Admin') {
            setCurrentPage('admin-dashboard');
          } else {
            // Everyone else (including Requester) gets Supervisor Dashboard
            setCurrentPage('supervisor-dashboard');
          }
          
          console.log('✅ Session restored:', {
            name: mappedUser.full_name,
            databaseRole: user.role,
            frontendRole: mappedUser.frontendRole,
            dashboard: mappedUser.frontendRole === 'Admin' ? 'Admin Portal' : 'Supervisor Dashboard',
            authProvider: mappedUser.auth_provider
          });
        } else {
          // Token expired or doesn't exist
          if (token && isTokenExpired()) {
            console.log('⚠️ Token expired - clearing session');
            clearSession();
          }
        }
      } catch (error) {
        console.error('❌ Session restoration error:', error);
        clearSession();
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkExistingSession();

    // Check token expiry every minute
    const tokenCheckInterval = setInterval(() => {
      if (isTokenExpired()) {
        console.log('⚠️ Token expired - logging out');
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const handleLogin = (user: User) => {
    // Map the database role to frontend role
    const mappedUser: User = {
      ...user,
      frontendRole: mapDatabaseRoleToFrontend(user.role)
    };
    
    setCurrentUser(mappedUser);
    
    // Set initial page based on MAPPED role - ONLY Admin gets Admin Dashboard
    if (mappedUser.frontendRole === 'Admin') {
      setCurrentPage('admin-dashboard');
    } else {
      // Everyone else (including Requester) gets Supervisor Dashboard
      setCurrentPage('supervisor-dashboard');
    }
    
    console.log('✅ User logged in:', {
      name: mappedUser.full_name,
      databaseRole: user.role,
      frontendRole: mappedUser.frontendRole,
      dashboard: mappedUser.frontendRole === 'Admin' ? 'Admin Portal' : 'Supervisor Dashboard',
      authProvider: mappedUser.auth_provider
    });
  };

  const handleLogout = () => {
    console.log('👋 User logged out');
    clearSession();
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setShowProfile(false);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShowProfile(false); // Close profile when navigating
    console.log('📍 Navigating to:', page);
  };

  // Render dashboard based on current page and user role
  const renderDashboard = () => {
    const frontendRole = currentUser?.frontendRole;
    
    // Show user profile if requested
    if (showProfile && currentUser) {
      return (
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <button
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <UserProfile user={currentUser} variant="card" />
          </div>
        </div>
      );
    }
    
    console.log('🎯 Rendering dashboard:', { 
      currentPage, 
      frontendRole,
      databaseRole: currentUser?.role 
    });
    
    // ONLY Admin gets Admin Dashboard
    if (frontendRole === 'Admin') {
      if (currentPage === 'admin-dashboard' || currentPage === 'all-permits' || 
          currentPage === 'site-management' || currentPage === 'user-management') {
        return <AdminDashboard currentPage={currentPage} onNavigate={handleNavigate} />;
      }
      return <AdminDashboard currentPage="admin-dashboard" onNavigate={handleNavigate} />;
    }
    
    // ALL OTHER ROLES (Requester, Approver_Safety, Approver_AreaManager) get Supervisor Dashboard
    if (frontendRole === 'Supervisor') {
      if (currentPage === 'supervisor-dashboard' || currentPage === 'create-permit' || 
          currentPage === 'worker-list') {
        return <SupervisorDashboard />;
      }
      return <SupervisorDashboard />;
    }
    
    // Fallback (should never reach here)
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Welcome to Amazon EPTW</h1>
          <div className="p-6 space-y-4 bg-white rounded-lg shadow">
            <UserProfile user={currentUser!} variant="inline" />
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
          <p className="mt-2 text-sm text-gray-500">Verifying your session</p>
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
                  showProfile={showProfile}
                  setShowProfile={setShowProfile}
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
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
}

function DashboardLayout({
  currentUser,
  currentPage,
  onLogout,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  renderDashboard,
  showProfile,
  setShowProfile
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
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
        {/* Header with Profile Button */}
        <Header 
          currentUser={currentUser}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onLogout={onLogout}
        />

        {/* User Profile Banner (shows when not on profile page) */}
        {!showProfile && (
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mx-auto max-w-7xl">
              <UserProfile user={currentUser} variant="inline" />
              <button
                onClick={() => setShowProfile(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100"
              >
                View Full Profile
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default App;