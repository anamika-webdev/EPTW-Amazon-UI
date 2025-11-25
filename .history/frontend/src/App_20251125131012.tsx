// frontend/src/App.tsx
import { useState, useEffect } from 'react';
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
}

function DashboardLayout({
  currentUser,
  currentPage,
  onLogout,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: DashboardLayoutProps) {
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
        return <AdminDashboard currentPage={currentPage} onNavigate={onNavigate} />;
      }
      // Default for admin
      return <AdminDashboard currentPage="admin-dashboard" onNavigate={onNavigate} />;
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
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
                <p className="text-xs text-gray-400">
                  Role: {currentUser?.role} | Mapped: {currentUser?.frontendRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate}
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header 
          currentUser={currentUser}
          onLogout={onLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default App;