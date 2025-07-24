import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        
        case 403:
          toast.error(data.message || 'Access denied. Insufficient permissions.');
          break;
        
        case 404:
          toast.error(data.message || 'Resource not found.');
          break;
        
        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message));
          } else {
            toast.error(data.message || 'Validation error.');
          }
          break;
        
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        
        default:
          toast.error(data.message || 'An unexpected error occurred.');
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({ message: 'Network error' });
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
      return Promise.reject(error);
    }
  }
);

// Auth API methods
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user profile
  getProfile: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Attendance API methods
export const attendanceAPI = {
  // Mark check-in
  checkIn: (data) => api.post('/attendance/checkin', data),
  
  // Mark check-out
  checkOut: (data) => api.put('/attendance/checkout', data),
  
  // Get current user's attendance records
  getMyRecords: (params) => api.get('/attendance/my-records', { params }),
  
  // Get today's attendance status
  getTodayStatus: () => api.get('/attendance/today'),
  
  // Admin: Get all attendance records
  getAllRecords: (params) => api.get('/attendance/all', { params }),
  
  // Admin: Get attendance statistics
  getStats: (params) => api.get('/attendance/stats', { params }),
};

// Export default api instance for custom requests
export default api; 