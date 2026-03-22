/**
 * Admin Service
 * Uses the shared api client from src/lib/api.ts with a request interceptor
 * that swaps in the admin JWT instead of the user JWT.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { api, extractData, extractError } from '@/lib/api';

// ──────────────────────────────────────────────
// Token storage keys — isolated from user auth
// ──────────────────────────────────────────────
const ADMIN_TOKEN_KEY    = 'adminAccessToken';
const ADMIN_REFRESH_KEY  = 'adminRefreshToken';
const ADMIN_USER_KEY     = 'adminUser';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support' | 'finance';
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLogin: string | null;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AdminLoginResult {
  admin: AdminUser;
  accessToken: string;
  refreshToken: string;
}

/** Thrown when the server sends 428 REQUIRES_2FA — not a real error */
export class TwoFactorRequiredError extends Error {
  constructor() {
    super('Two-factor authentication code required');
    this.name = 'TwoFactorRequiredError';
  }
}

// ──────────────────────────────────────────────
// Intercept: replace user token with admin token
// for all /admin/ routes
// ──────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url?.includes('/admin/')) {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else {
      // No admin token — remove any user token that was set by the main interceptor
      delete config.headers.Authorization;
    }
  }
  return config;
});

// ──────────────────────────────────────────────
// Intercept: handle 401 on admin routes
// ──────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config as InternalAxiosRequestConfig & { _adminRetry?: boolean };
    const isAdminRoute = originalReq?.url?.includes('/admin/');

    if (
      error.response?.status === 401 &&
      isAdminRoute &&
      !originalReq._adminRetry
    ) {
      originalReq._adminRetry = true;
      const refreshToken = localStorage.getItem(ADMIN_REFRESH_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}admin/auth/refresh`,
            { refreshToken }
          );
          const newToken: string | undefined = extractData<{ accessToken: string }>(
            { data } as import('axios').AxiosResponse
          )?.accessToken;
          if (newToken) {
            localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
            originalReq.headers.Authorization = `Bearer ${newToken}`;
            return api(originalReq);
          }
        } catch {
          // refresh failed — clear session
        }
      }
      adminService.clearSession();
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────
class AdminService {
  // ── Storage ───────────────────────────────────
  getAccessToken() { return localStorage.getItem(ADMIN_TOKEN_KEY); }
  getRefreshToken() { return localStorage.getItem(ADMIN_REFRESH_KEY); }

  getCurrentAdmin(): AdminUser | null {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }

  private save(admin: AdminUser, accessToken: string, refreshToken: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY,   accessToken);
    localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
    localStorage.setItem(ADMIN_USER_KEY,    JSON.stringify(admin));
  }

  clearSession() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }

  // ── Auth ──────────────────────────────────────
  /**
   * POST /api/v1/admin/auth/login
   * If the server responds 428 (REQUIRES_2FA) we throw TwoFactorRequiredError
   * so the caller can show the OTP step.
   */
  async login(payload: AdminLoginPayload): Promise<AdminLoginResult> {
    try {
      const res = await api.post('admin/auth/login', payload);
      const result = extractData<AdminLoginResult>(res);
      this.save(result.admin, result.accessToken, result.refreshToken);
      return result;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 428) {
        throw new TwoFactorRequiredError();
      }
      throw new Error(extractError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      await api.post('admin/auth/logout', { refreshToken });
    } catch {
      // ignore server errors on logout
    } finally {
      this.clearSession();
    }
  }

  async profile(): Promise<AdminUser> {
    const res = await api.get('admin/auth/me');
    const admin = extractData<AdminUser>(res);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    return admin;
  }
}

const adminService = new AdminService();
export default adminService;
