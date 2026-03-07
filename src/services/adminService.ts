import apiClient, { ApiResponse, handleApiError } from '@/services/apiClient';

export interface AdminUser {
  id: string;
  username: string;
  roles: 'admin' | 'super_admin';
  display_name?: string;
}

export interface AdminAuthResponse extends ApiResponse {
  admin?: AdminUser;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

class AdminService {
  private readonly ADMIN_USER_KEY = 'adminUser';

  getCurrentAdmin(): AdminUser | null {
    const raw = localStorage.getItem(this.ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }

  private storeAdmin(user: AdminUser) {
    localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(user));
  }

  private clearAdmin() {
    localStorage.removeItem(this.ADMIN_USER_KEY);
  }

  async login(credentials: AdminLoginRequest, superAdmin = false): Promise<AdminUser> {
    try {
      const url = superAdmin ? '/admin/auth/super' : '/admin/auth/login';
      const { data } = await apiClient.post<AdminAuthResponse>(url, credentials);
      if (!data.success || !data.admin) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      this.storeAdmin(data.admin);
      return data.admin;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse>('/admin/auth/logout');
    } catch (error) {
      // ignore and clear session client-side
    } finally {
      this.clearAdmin();
    }
  }

  async profile(): Promise<AdminUser> {
    try {
      const { data } = await apiClient.get<AdminAuthResponse>('/admin/auth/admin-profile');
      if (!data.success || !data.admin) {
        throw new Error(data.message || data.error || 'Failed to fetch profile');
      }
      this.storeAdmin(data.admin);
      return data.admin;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

const adminService = new AdminService();
export default adminService;
