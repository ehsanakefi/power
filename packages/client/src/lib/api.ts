import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (we'll implement auth store later)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  timestamp?: string;
}

// User Types
export interface User {
  id: number;
  phone: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface Ticket {
  id: number;
  title: string;
  content: string;
  status: string;
  authorId: number;
  author: {
    id: number;
    phone: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TicketLog {
  id: number;
  ticketId: number;
  before: Record<string, any>;
  after: Record<string, any>;
  changes: Record<string, any>;
  user: string;
  createdAt: string;
}

export interface TicketStats {
  total: number;
  unseen: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

// API Methods
export const api = {
  // Authentication
  auth: {
    login: (phone: string) =>
      apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { phone }),

    verify: (phone: string, code: string) =>
      apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/verify', { phone, code }),

    profile: () =>
      apiClient.get<ApiResponse<{ user: User }>>('/auth/profile'),

    refresh: () =>
      apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh'),

    logout: () =>
      apiClient.post<ApiResponse>('/auth/logout'),
  },

  // Tickets
  tickets: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: string;
      authorId?: number;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      return apiClient.get<ApiResponse<{
        tickets: Ticket[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>>(`/tickets?${queryParams.toString()}`);
    },

    getById: (id: number) =>
      apiClient.get<ApiResponse<{ ticket: Ticket }>>(`/tickets/${id}`),

    create: (data: { title: string; content: string }) =>
      apiClient.post<ApiResponse<{ ticket: Ticket }>>('/tickets', data),

    update: (id: number, data: { title?: string; content?: string }) =>
      apiClient.put<ApiResponse<{ ticket: Ticket }>>(`/tickets/${id}`, data),

    updateStatus: (id: number, status: string) =>
      apiClient.put<ApiResponse<{ ticket: Ticket }>>(`/tickets/${id}/status`, { status }),

    delete: (id: number) =>
      apiClient.delete<ApiResponse>(`/tickets/${id}`),

    getHistory: (id: number) =>
      apiClient.get<ApiResponse<{ history: TicketLog[] }>>(`/tickets/${id}/history`),

    getStats: () =>
      apiClient.get<ApiResponse<{ stats: TicketStats }>>('/tickets/stats'),
  },

  // Health check
  health: () =>
    apiClient.get<ApiResponse>('/health'),
};

// Utility functions
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Error handling utility
export const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export default apiClient;
