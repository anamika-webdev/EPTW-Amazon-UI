
import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - FIX: Use 'token' not 'auth_token'
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - REMOVE auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Don't auto-redirect - let components handle errors
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
