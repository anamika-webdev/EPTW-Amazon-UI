// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Site,
  Vendor,
  Permit,
  MasterHazard,
  MasterPPE,
  MasterChecklistQuestion,
  ApiResponse,
  PaginatedResponse,
  CreatePermitFormData,
  SupervisorDashboardStats,
  PermitTeamMember
} from '../types';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= Authentication APIs =============
export const authAPI = {
  login: async (login_id: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { login_id, password });
    return response.data;
  },

  register: async (userData: {
    login_id: string;
    full_name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// ============= Sites APIs =============
export const sitesAPI = {
  getAll: async (): Promise<ApiResponse<Site[]>> => {
    const response = await api.get('/sites');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Site>> => {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  },

  create: async (siteData: Omit<Site, 'id'>): Promise<ApiResponse<Site>> => {
    const response = await api.post('/sites', siteData);
    return response.data;
  },

  update: async (id: number, siteData: Partial<Site>): Promise<ApiResponse<Site>> => {
    const response = await api.put(`/sites/${id}`, siteData);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/sites/${id}`);
    return response.data;
  },
};

// ============= Users APIs =============
export const usersAPI = {
  getAll: async (role?: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users', { params: { role } });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: Omit<User, 'id' | 'created_at'>): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: number, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get workers (Requester role users)
  getWorkers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users/workers');
    return response.data;
  },
};

// ============= Vendors APIs =============
export const vendorsAPI = {
  getAll: async (): Promise<ApiResponse<Vendor[]>> => {
    const response = await api.get('/vendors');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Vendor>> => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  create: async (vendorData: Omit<Vendor, 'id'>): Promise<ApiResponse<Vendor>> => {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  },

  update: async (id: number, vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },
};

// ============= Master Data APIs =============
export const masterDataAPI = {
  // Hazards
  getHazards: async (): Promise<ApiResponse<MasterHazard[]>> => {
    const response = await api.get('/master/hazards');
    return response.data;
  },

  // PPE
  getPPE: async (): Promise<ApiResponse<MasterPPE[]>> => {
    const response = await api.get('/master/ppe');
    return response.data;
  },

  // Checklist Questions
  getChecklistQuestions: async (permit_type?: string): Promise<ApiResponse<MasterChecklistQuestion[]>> => {
    const response = await api.get('/master/checklist-questions', { params: { permit_type } });
    return response.data;
  },
};

// ============= Permits APIs =============
export const permitsAPI = {
  // Get all permits with filters
  getAll: async (filters?: {
    status?: string;
    permit_type?: string;
    site_id?: number;
    created_by_user_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Permit>> => {
    const response = await api.get('/permits', { params: filters });
    return response.data;
  },

  // Get single permit by ID with all related data
  getById: async (id: number): Promise<ApiResponse<Permit>> => {
    const response = await api.get(`/permits/${id}`);
    return response.data;
  },

  // Create new permit
  create: async (permitData: CreatePermitFormData): Promise<ApiResponse<Permit>> => {
    const response = await api.post('/permits', permitData);
    return response.data;
  },

  // Update permit
  update: async (id: number, permitData: Partial<CreatePermitFormData>): Promise<ApiResponse<Permit>> => {
    const response = await api.put(`/permits/${id}`, permitData);
    return response.data;
  },

  // Delete permit
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/permits/${id}`);
    return response.data;
  },

  // Submit permit for approval
  submit: async (id: number): Promise<ApiResponse<Permit>> => {
    const response = await api.post(`/permits/${id}/submit`);
    return response.data;
  },

  // Approve permit
  approve: async (id: number, data: {
    role: string;
    comments?: string;
    signature_data?: string;
  }): Promise<ApiResponse<Permit>> => {
    const response = await api.post(`/permits/${id}/approve`, data);
    return response.data;
  },

  // Reject permit
  reject: async (id: number, data: {
    role: string;
    reason: string;
  }): Promise<ApiResponse<Permit>> => {
    const response = await api.post(`/permits/${id}/reject`, data);
    return response.data;
  },

  // Start work
  startWork: async (id: number): Promise<ApiResponse<Permit>> => {
    const response = await api.post(`/permits/${id}/start`);
    return response.data;
  },

  // Close permit
  close: async (id: number, closureData: {
    housekeeping_done: boolean;
    tools_removed: boolean;
    locks_removed: boolean;
    area_restored: boolean;
    remarks?: string;
  }): Promise<ApiResponse<Permit>> => {
    const response = await api.post(`/permits/${id}/close`, closureData);
    return response.data;
  },

  // Request extension
  requestExtension: async (id: number, extensionData: {
    requested_end_time: string;
    reason: string;
  }): Promise<ApiResponse<Permit>> => {
    const response = await api.post(`/permits/${id}/extend`, extensionData);
    return response.data;
  },

  // Get permits by supervisor (created by user)
  getMySupervisorPermits: async (): Promise<ApiResponse<Permit[]>> => {
    const response = await api.get('/permits/my-supervisor-permits');
    return response.data;
  },

  // Get permits assigned to worker
  getMyWorkerPermits: async (): Promise<ApiResponse<Permit[]>> => {
    const response = await api.get('/permits/my-worker-permits');
    return response.data;
  },
};

// ============= Dashboard APIs =============
export const dashboardAPI = {
  // Supervisor dashboard stats
  getSupervisorStats: async (): Promise<ApiResponse<SupervisorDashboardStats>> => {
    const response = await api.get('/dashboard/supervisor/stats');
    return response.data;
  },

  // Admin dashboard stats
  getAdminStats: async (): Promise<ApiResponse<{
    total_sites: number;
    total_users: number;
    total_permits: number;
    active_permits: number;
    permits_by_type: { permit_type: string; count: number }[];
    permits_by_status: { status: string; count: number }[];
  }>> => {
    const response = await api.get('/dashboard/admin/stats');
    return response.data;
  },
};

// ============= Team Members APIs =============
export const teamMembersAPI = {
  // Get team members for a permit
  getByPermitId: async (permitId: number): Promise<ApiResponse<PermitTeamMember[]>> => {
    const response = await api.get(`/permits/${permitId}/team-members`);
    return response.data;
  },

  // Add team member to permit
  add: async (permitId: number, memberData: Omit<PermitTeamMember, 'id' | 'permit_id'>): Promise<ApiResponse<PermitTeamMember>> => {
    const response = await api.post(`/permits/${permitId}/team-members`, memberData);
    return response.data;
  },

  // Update team member
  update: async (permitId: number, memberId: number, memberData: Partial<PermitTeamMember>): Promise<ApiResponse<PermitTeamMember>> => {
    const response = await api.put(`/permits/${permitId}/team-members/${memberId}`, memberData);
    return response.data;
  },

  // Remove team member
  remove: async (permitId: number, memberId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/permits/${permitId}/team-members/${memberId}`);
    return response.data;
  },
};

// ============= File Upload APIs =============
export const uploadAPI = {
  uploadSignature: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await api.post('/upload/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadSWMS: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('swms', file);
    const response = await api.post('/upload/swms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Export the axios instance for custom requests
export default api;