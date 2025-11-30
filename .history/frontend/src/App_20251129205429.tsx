import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SiteManagement from './pages/admin/SiteManagement';
import UserManagement from './pages/admin/UserManagement';
import AllPermits from './pages/admin/AllPermits';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { CreatePTW } from './components/supervisor/CreatePTW';
import { WorkerList } from './components/supervisor/WorkerList';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

interface User {
  id: number;
  login_id: string;
  full_name: string;
  email: string;
  role: string;
  frontendRole?: 'Admin' | 'Supervisor' | 'Worker';
  department?: string;
  created_at?: string;
}

type PageType = 'dashboard' | 'site-management' | 'user-management' | 'all-permits' | 'create-permit' | 'worker-list';

// Helper function to check if user is admin
function checkIsAdmin(user: User): boolean {
  const roleCheck1 = user.role === 'Admin';
  const roleCheck2 = user.role === 'Administrator';
  const roleCheck3 = user.frontendRole === 'Admin';
  
  console.log('🔍 checkIsAdmin called:');
  console.log('   user.role:', user.role);
  console.log('   user.frontendRole:', user.frontendRole);
  console.log('   Check 1 (role === Admin):', roleCheck1);
  console.log('   Check 2 (role === Administrator):', roleCheck2);
  console.log('   Check 3 (frontendRole === Admin):', roleCheck3);
  
  const result = roleCheck1 || roleCheck2 || roleCheck3;
  console.log('   FINAL RESULT:', result);
  
  return result;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user ONCE on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔄 Loaded user from storage:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('❌ Error parsing user:', error);
        localStorage.clear();
        sessionStorage.clear();
      }
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  const handleLogin = (user: User) => {
    console.log('='.repeat(50));
    console.log('🔐 LOGIN HANDLER CALLED');
    console.log('='.repeat(50));
    console.log('User object received:', user);
    console.log('Role:', user.role);
    console.log('Frontend Role:', user.frontendRole);
    
    setCurrentUser(user);
    setCurrentPage('dashboard');
    
    console.log('✅ User state updated');
    console.log('='.repeat(50));
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    setIsMobileMenuOpen(false);
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Check if user is admin
  const isAdmin = checkIsAdmin(currentUser);

  console.log('='.repeat(50));
  console.log('🎨 RENDERING APP');
  console.log('='.repeat(50));
  console.log('Current User:', currentUser.full_name);
  console.log('Role:', currentUser.role);
  console.log('Frontend Role:', currentUser.frontendRole);
  console.log('IS ADMIN:', isAdmin);
  console.log('Current Page:', currentPage);
  console.log('Will render:', isAdmin ? 'AdminDashboard' : 'SupervisorDashboard');
  console.log('='.repeat(50));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentUser={currentUser} 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
        isMobileMenuOpen={isMobileMenuOpen} 
        onMobileMenuClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex flex-col flex-1 lg:ml-64">
        <Header 
          currentUser={currentUser} 
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Debug banner - REMOVE THIS AFTER FIXING */}
          <div className={`mb-4 p-4 rounded-lg border-2 ${isAdmin ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
            <h3 className="mb-2 text-lg font-bold">
              {isAdmin ? '✅ ADMIN MODE' : 'ℹ️ SUPERVISOR MODE'}
            </h3>
            <div className="space-y-1 text-sm">
              <p><strong>Role:</strong> {currentUser.role}</p>
              <p><strong>Frontend Role:</strong> {currentUser.frontendRole || 'Not set'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'YES ✅' : 'NO ❌'}</p>
              <p><strong>Dashboard:</strong> {isAdmin ? 'Admin Dashboard' : 'Supervisor Dashboard'}</p>
            </div>
          </div>

          {/* Dashboard routing */}
          {currentPage === 'dashboard' && isAdmin && <AdminDashboard />}
          {currentPage === 'dashboard' && !isAdmin && <SupervisorDashboard onNavigate={handleNavigate} />}
          
          {/* Admin-only pages */}
          {currentPage === 'site-management' && <SiteManagement />}
          {currentPage === 'user-management' && <UserManagement />}
          {currentPage === 'all-permits' && <AllPermits />}
          
          {/* Supervisor/Worker pages */}
          {currentPage === 'create-permit' && <CreatePTW onBack={() => handleNavigate('dashboard')} onSuccess={() => handleNavigate('dashboard')} />}
          {currentPage === 'worker-list' && <WorkerList onBack={() => handleNavigate('dashboard')} />}
        </main>
      </div>
    </div>
  );
}

export default App;