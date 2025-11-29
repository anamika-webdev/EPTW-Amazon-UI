
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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling - NO AUTO-REDIRECT
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - token may be invalid');
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

// ============= Dashboard APIs =============
export const dashboardAPI = {
  getSupervisorStats: async (): Promise<ApiResponse<SupervisorDashboardStats>> => {
    const response = await api.get('/dashboard/supervisor/stats');
    return response.data;
  },

  getAdminStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/stats');
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
    const url = role ? `/users?role=${role}` : '/users';
    const response = await api.get(url);
    return response.data;
  },

  getWorkers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users/workers');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
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

// ============= Permits APIs =============
export const permitsAPI = {
  getAll: async (filters?: any): Promise<ApiResponse<Permit[]>> => {
    const response = await api.get('/permits', { params: filters });
    return response.data;
  },

  getMySupervisorPermits: async (): Promise<ApiResponse<Permit[]>> => {
    const response = await api.get('/permits/my-supervisor-permits');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Permit>> => {
    const response = await api.get(`/permits/${id}`);
    return response.data;
  },

  create: async (permitData: CreatePermitFormData): Promise<ApiResponse<Permit>> => {
    const response = await api.post('/permits', permitData);
    return response.data;
  },

  update: async (id: number, permitData: Partial<Permit>): Promise<ApiResponse<Permit>> => {
    const response = await api.put(`/permits/${id}`, permitData);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/permits/${id}`);
    return response.data;
  },
};

// ============= Master Data APIs =============
export const masterAPI = {
  getHazards: async (): Promise<ApiResponse<MasterHazard[]>> => {
    const response = await api.get('/master/hazards');
    return response.data;
  },

  getPPE: async (): Promise<ApiResponse<MasterPPE[]>> => {
    const response = await api.get('/master/ppe');
    return response.data;
  },

  getChecklistQuestions: async (): Promise<ApiResponse<MasterChecklistQuestion[]>> => {
    const response = await api.get('/master/checklist-questions');
    return response.data;
  },
};

// Export as masterDataAPI for backward compatibility
export const masterDataAPI = masterAPI;

// ============= Team Members APIs =============
export const teamMembersAPI = {
  getAll: async (permitId: number): Promise<ApiResponse<PermitTeamMember[]>> => {
    const response = await api.get(`/permits/${permitId}/team-members`);
    return response.data;
  },

  add: async (permitId: number, memberData: Partial<PermitTeamMember>): Promise<ApiResponse<PermitTeamMember>> => {
    const response = await api.post(`/permits/${permitId}/team-members`, memberData);
    return response.data;
  },

  update: async (permitId: number, memberId: number, memberData: Partial<PermitTeamMember>): Promise<ApiResponse<PermitTeamMember>> => {
    const response = await api.put(`/permits/${permitId}/team-members/${memberId}`, memberData);
    return response.data;
  },

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
export const apiService = api;
export default api;