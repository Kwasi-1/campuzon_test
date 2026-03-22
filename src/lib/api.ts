import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useAuthPromptStore } from '@/stores/authPromptStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const AUTH_STORAGE_KEY = 'campuzon-auth';
const RETURN_TO_STORAGE_KEY = 'auth:returnTo';
const SESSION_EXPIRED_SHOWN_KEY = 'auth:sessionExpiredShown';
const SESSION_EXPIRED_TOAST_ID = 'session-expired';
const SESSION_EXPIRED_TOAST_MESSAGE = 'Session expired. Please sign in again to continue.';

let sessionExpiryHandled = false;

function isAuthRoute(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/verify-2fa')
  );
}

function handleUnauthorizedOnce() {
  if (sessionExpiryHandled) return;
  sessionExpiryHandled = true;

  const authState = useAuthStore.getState();
  const hadAuthenticatedSession =
    Boolean(authState.isAuthenticated) ||
    Boolean(authState.accessToken) ||
    Boolean(authState.refreshToken);

  try {
    if (typeof window !== 'undefined') {
      const hasShownSessionExpired =
        window.sessionStorage.getItem(SESSION_EXPIRED_SHOWN_KEY) === '1';
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentPath && currentPath !== '/login') {
        window.sessionStorage.setItem(RETURN_TO_STORAGE_KEY, currentPath);
      }

      useAuthStore.getState().logout();
      window.localStorage.removeItem(AUTH_STORAGE_KEY);

      if (hadAuthenticatedSession && !hasShownSessionExpired) {
        toast.error(SESSION_EXPIRED_TOAST_MESSAGE, {
          id: SESSION_EXPIRED_TOAST_ID,
        });
        useAuthPromptStore
          .getState()
          .openAuthPrompt(currentPath, SESSION_EXPIRED_TOAST_MESSAGE);
        window.sessionStorage.setItem(SESSION_EXPIRED_SHOWN_KEY, '1');
      }

      return;
    }
  } catch {
    // Fall back to in-memory logout in non-browser or restricted environments
    useAuthStore.getState().logout();
    return;
  }
}

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle global unauthorized states
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    if (error.response?.status === 401 && !isAuthRoute(originalRequest?.url)) {
      handleUnauthorizedOnce();
    }

    return Promise.reject(error);
  }
);

// Helper to extract data from response
export function extractData<T>(response: AxiosResponse): T {
  const payload = response.data;

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (record.success && typeof record.success === 'object') {
      const successRecord = record.success as Record<string, unknown>;
      if ('data' in successRecord && successRecord.data !== undefined) {
        return successRecord.data as T;
      }
    }

    if ('data' in record && record.data !== undefined) {
      return record.data as T;
    }
  }

  return payload as T;
}

// Helper to extract error message
export function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;
