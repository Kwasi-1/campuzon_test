import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Base API configuration
// Support both VITE_API_BASE_URL and VITE_API_URL env vars
const envVars = import.meta.env as unknown as Record<string, string | undefined>;
const API_BASE_URL = envVars.VITE_API_BASE_URL || envVars.VITE_API_URL || 'https://test-api.campuzon.me/api/v1/';

// API Response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

/**
 * API Client Class
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      // Send and receive HTTP-only session cookies for auth
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor to add authentication tokens
    this.client.interceptors.request.use(
      (config) => {
        // Determine which token to use based on the request URL
        // For store portal routes, rely on cookie session and do not attach Authorization header
        if (config.url?.includes('/stall/')) {
          if (config.headers && 'Authorization' in config.headers) {
            delete (config.headers as Record<string, unknown>).Authorization;
          }
        } else if (config.url?.includes('/admin/')) {
          // Admin portal uses its own JWT — managed by adminService.ts on the lib/api client
          // This apiClient is not used for admin routes; leave Authorization as-is
        } else {
          // Regular client requests use regular auth token
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Handle 401 errors by clearing appropriate tokens and redirecting
        if (error.response?.status === 401) {
          const requestUrl = error.config?.url || '';
          
          if (requestUrl.includes('/stall/')) {
            // Store portal unauthorized
            localStorage.removeItem('storeUser');
            
            if (window.location.pathname.startsWith('/store-portal')) {
              window.location.href = '/store-portal/login';
            }
          } else if (requestUrl.includes('/admin/')) {
            // Admin portal unauthorized
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminUser');
            
            if (window.location.pathname.startsWith('/super-admin-portal')) {
              window.location.href = '/super-admin/login';
            } else if (window.location.pathname.startsWith('/admin-portal')) {
              window.location.href = '/admin/login';
            }
          } else {
            // Regular client unauthorized
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // For client pages, we might want to handle this more gracefully
            console.warn('Client authentication expired');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params });
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.client.put(url, data);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }

  /**
   * Get the axios instance for advanced usage
   */
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export the API client instance
const apiClient = new ApiClient();
export default apiClient;

/**
 * Error handling utility function
 */
export const handleApiError = (error: unknown): string => {
  const err = error as AxiosError<{ error?: string; message?: string }>;
  if (err.response?.data?.error) {
    return err.response.data.error;
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err.message) {
    return err.message;
  }
  return 'An unexpected error occurred';
};