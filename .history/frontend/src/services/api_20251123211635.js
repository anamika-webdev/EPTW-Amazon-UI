// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Proxied through Vite to http://localhost:3000/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ============================================
// REQUEST INTERCEPTOR - Add JWT Token
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Handle Errors
// ============================================
api.interceptors.response.use(
  (response) => {
    // Return just the data portion
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  // Login with credentials
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Google OAuth (redirect)
  loginWithGoogle: () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  },
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Logout
  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    return api.post('/auth/logout');
  },
  
  // Refresh token
  refreshToken: (token) => api.post('/auth/refresh', { token }),
};

// ============================================
// PERMIT SERVICE
// ============================================
export const permitService = {
  // Get all permits
  getAll: () => api.get('/permits'),
  
  // Get permit by ID (full details)
  getById: (id) => api.get(`/permits/${id}`),
  
  // Create new permit
  create: (permitData) => api.post('/permits', permitData),
  
  // Update permit (Draft only)
  update: (id, permitData) => api.put(`/permits/${id}`, permitData),
  
  // Delete permit (Draft only)
  delete: (id) => api.delete(`/permits/${id}`),
  
  // Submit permit for approval
  submit: (id) => api.post(`/permits/${id}/submit`),
  
  // Approve permit (Approver only)
  approve: (id, data) => api.post(`/permits/${id}/approve`, data),
  
  // Reject permit (Approver only)
  reject: (id, data) => api.post(`/permits/${id}/reject`, data),
  
  // Request extension
  requestExtension: (id, data) => api.post(`/permits/${id}/extend`, data),
  
  // Approve extension (Approver only)
  approveExtension: (id, extensionId, data) => 
    api.post(`/permits/${id}/extension/${extensionId}/approve`, data),
  
  // Close permit
  close: (id, closureData) => api.post(`/permits/${id}/close`, closureData),
  
  // Get permits by status
  getByStatus: (status) => api.get(`/permits/status/${status}`),
  
  // Get user's permits
  getMyPermits: () => api.get('/permits/user/my-permits'),
  
  // Get pending approvals (Approver only)
  getPendingApprovals: () => api.get('/permits/pending/approvals'),
};

// ============================================
// USER SERVICE
// ============================================
export const userService = {
  // Get all users
  getAll: () => api.get('/users'),
  
  // Get user by ID
  getById: (id) => api.get(`/users/${id}`),
  
  // Create user (Admin only)
  create: (userData) => api.post('/users', userData),
  
  // Update user (Admin only)
  update: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user (Admin only)
  delete: (id) => api.delete(`/users/${id}`),
  
  // Get users by role
  getByRole: (role) => api.get(`/users/role/${role}`),
};

// ============================================
// SITE SERVICE
// ============================================
export const siteService = {
  // Get all sites
  getAll: () => api.get('/sites'),
  
  // Get site by ID
  getById: (id) => api.get(`/sites/${id}`),
  
  // Create site (Admin only)
  create: (siteData) => api.post('/sites', siteData),
  
  // Update site (Admin only)
  update: (id, siteData) => api.put(`/sites/${id}`, siteData),
  
  // Delete site (Admin only)
  delete: (id) => api.delete(`/sites/${id}`),
};

// ============================================
// VENDOR SERVICE
// ============================================
export const vendorService = {
  // Get all vendors
  getAll: () => api.get('/vendors'),
  
  // Get vendor by ID
  getById: (id) => api.get(`/vendors/${id}`),
  
  // Create vendor
  create: (vendorData) => api.post('/vendors', vendorData),
  
  // Update vendor
  update: (id, vendorData) => api.put(`/vendors/${id}`, vendorData),
  
  // Delete vendor (Admin only)
  delete: (id) => api.delete(`/vendors/${id}`),
};

// ============================================
// MASTER DATA SERVICE
// ============================================
export const masterDataService = {
  // Get all hazards
  getHazards: () => api.get('/master/hazards'),
  
  // Get hazard by ID
  getHazardById: (id) => api.get(`/master/hazards/${id}`),
  
  // Get all PPE
  getPPE: () => api.get('/master/ppe'),
  
  // Get PPE by ID
  getPPEById: (id) => api.get(`/master/ppe/${id}`),
  
  // Get all checklist questions
  getChecklist: () => api.get('/master/checklist'),
  
  // Get checklist by permit type
  getChecklistByType: (permitType) => api.get(`/master/checklist/${permitType}`),
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  // Get dashboard statistics
  getStats: () => api.get('/dashboard/stats'),
  
  // Get permits by status count
  getPermitsByStatus: () => api.get('/dashboard/permits-by-status'),
  
  // Get permits by type count
  getPermitsByType: () => api.get('/dashboard/permits-by-type'),
  
  // Get permits by site
  getPermitsBySite: () => api.get('/dashboard/permits-by-site'),
  
  // Get recent activity
  getRecentActivity: (limit = 10) => api.get(`/dashboard/recent-activity?limit=${limit}`),
  
  // Get expiring permits
  getExpiringPermits: (hours = 24) => api.get(`/dashboard/expiring-permits?hours=${hours}`),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token');
  },
  
  // Get stored token
  getToken: () => {
    return localStorage.getItem('jwt_token');
  },
  
  // Get stored user
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Set auth data
  setAuthData: (token, user) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  },
  
  // Check if user has role
  hasRole: (role) => {
    const user = authUtils.getUser();
    return user?.role === role;
  },
  
  // Check if user is approver
  isApprover: () => {
    const user = authUtils.getUser();
    return ['Approver_AreaManager', 'Approver_Safety', 'Admin'].includes(user?.role);
  },
  
  // Check if user is admin
  isAdmin: () => {
    const user = authUtils.getUser();
    return user?.role === 'Admin';
  },
};

// Export default api instance for custom requests
export default api;