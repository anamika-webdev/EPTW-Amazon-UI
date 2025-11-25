// frontend/src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// User interface
interface User {
  id: number;
  login_id: string;
  full_name: string;
  email: string;
  role: string;
  frontendRole?: 'Admin' | 'Supervisor' | 'Worker';
  department?: string;
  auth_provider?: 'local' | 'google';
  created_at?: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Role mapping function
function mapDatabaseRoleToFrontend(dbRole: string): 'Admin' | 'Supervisor' | 'Worker' {
  // Only Admin gets Admin Dashboard
  if (dbRole === 'Admin') {
    return 'Admin';
  }
  // Everyone else (Requester, Approver_Safety, Approver_AreaManager) gets Supervisor Dashboard
  return 'Supervisor';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Regular login with password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/v1/auth/login`, {
        login_id: loginId,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Map database role to frontend role
        const mappedUser: User = {
          ...user,
          frontendRole: mapDatabaseRoleToFrontend(user.role)
        };
        
        console.log('Login successful:', {
          databaseRole: user.role,
          frontendRole: mappedUser.frontendRole,
          authProvider: user.auth_provider || 'local',
          redirectTo: mappedUser.frontendRole === 'Admin' ? 'Admin Dashboard' : 'Supervisor Dashboard'
        });
        
        // Store token with expiry
        const tokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiry', tokenExpiry.toString());
        localStorage.setItem('user', JSON.stringify(mappedUser));
        
        onLogin(mappedUser);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message;
      
      if (err.response?.status === 401) {
        setError('Invalid login credentials. Please check your Login ID and password.');
      } else if (err.response?.status === 400) {
        setError(errorMessage || 'Please enter both Login ID and password.');
      } else {
        setError('Login failed. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  // SSO login - Redirects to backend OAuth endpoint
  const handleSSOLogin = () => {
    // Store redirect intent
    sessionStorage.setItem('authIntent', 'sso');
    window.location.href = `${API_BASE_URL}/v1/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-10 space-y-8 bg-white shadow-xl rounded-2xl">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Amazon EPTW
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Electronic Permit to Work System
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login_id" className="block mb-1 text-sm font-medium text-gray-700">
                Login ID
              </label>
              <input
                id="login_id"
                name="login_id"
                type="text"
                autoComplete="username"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="relative block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your login ID"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex">
                <svg 
                  className="flex-shrink-0 w-5 h-5 text-red-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <p className="ml-3 text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 border border-transparent rounded-lg group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          {/* SSO Login Button */}
          <div>
            <button
              type="button"
              onClick={handleSSOLogin}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 border border-transparent rounded-lg shadow-md bg-gradient-to-r from-orange-500 to-orange-600 group hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 hover:shadow-lg"
            >
              <span className="flex items-center">
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
                SSO Login
              </span>
            </button>
            <p className="mt-2 text-xs text-center text-gray-500">
              Login with your organization account
            </p>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-blue-600 transition-colors hover:text-blue-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;