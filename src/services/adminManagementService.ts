import apiClient, { handleApiError } from '@/services/apiClient';
import { AdminManagement } from '@/types';

// Backend admin user shape
interface BackendAdmin {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles?: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
  login_count?: number;
  is_super_admin?: boolean;
}

// Backend create admin request
interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  roles?: string;
}

// Backend promote user request
interface PromoteUserRequest {
  user_id: string;
  permissions?: string[];
}

class AdminManagementService {
  /**
   * Get all admin users
   */
  async getAllAdmins(): Promise<AdminManagement[]> {
    try {
      const { data } = await apiClient.get<BackendAdmin[]>('/admin/super/admins');
      const adminList = Array.isArray(data) ? data : [];
      
      return adminList.map((admin): AdminManagement => ({
        id: admin.id.toString(),
        name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.username,
        email: admin.email,
        role: this.normalizeRole(admin.roles, admin.is_super_admin),
        status: admin.is_active ? 'active' : 'inactive',
        lastLogin: admin.last_login || '',
        permissions: this.getDefaultPermissions(admin.roles, admin.is_super_admin),
        createdAt: admin.created_at || new Date().toISOString(),
        createdBy: 'System', // Backend doesn't track who created admin
        avatar: undefined
      }));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get specific admin details
   */
  async getAdmin(adminId: string): Promise<AdminManagement | null> {
    try {
      const { data } = await apiClient.get<BackendAdmin>(`/admin/super/admins/${adminId}`);
      
      if (!data) return null;
      
      return {
        id: data.id.toString(),
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
        email: data.email,
        role: this.normalizeRole(data.roles, data.is_super_admin),
        status: data.is_active ? 'active' : 'inactive',
        lastLogin: data.last_login || '',
        permissions: this.getDefaultPermissions(data.roles, data.is_super_admin),
        createdAt: data.created_at || new Date().toISOString(),
        createdBy: 'System',
        avatar: undefined
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new admin user
   */
  async createAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'super-admin';
    permissions: string[];
  }): Promise<AdminManagement> {
    try {
      const [firstName, ...lastNameParts] = adminData.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const createRequest: CreateAdminRequest = {
        username: adminData.email.split('@')[0], // Use email prefix as username
        email: adminData.email,
        password: adminData.password,
        first_name: firstName,
        last_name: lastName,
        roles: adminData.role === 'super-admin' ? 'super_admin' : 'admin'
      };

      const { data } = await apiClient.post<BackendAdmin>('/admin/auth/create-admin', createRequest);
      
      return {
        id: data.id.toString(),
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        status: 'active',
        lastLogin: '',
        permissions: adminData.permissions,
        createdAt: new Date().toISOString(),
        createdBy: 'Super Admin',
        avatar: undefined
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Promote a regular user to admin
   */
  async promoteUserToAdmin(userData: {
    userId: string;
    name: string;
    email: string;
    permissions: string[];
  }): Promise<AdminManagement> {
    try {
      const { data } = await apiClient.post(`/admin/super/admins/${userData.userId}/promote`, {
        permissions: userData.permissions
      });

      return {
        id: userData.userId,
        name: userData.name,
        email: userData.email,
        role: 'admin',
        status: 'active',
        lastLogin: '',
        permissions: userData.permissions,
        createdAt: new Date().toISOString(),
        createdBy: 'Super Admin',
        avatar: undefined
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update admin information
   */
  async updateAdmin(adminId: string, updates: Partial<AdminManagement>): Promise<AdminManagement> {
    try {
      // Backend doesn't have a direct update endpoint, so we'll simulate it
      // In a real implementation, you'd need to add an update endpoint to the backend
      const currentAdmin = await this.getAdmin(adminId);
      if (!currentAdmin) {
        throw new Error('Admin not found');
      }

      // For now, we'll just return the updated admin
      // In reality, you'd send the updates to the backend
      return {
        ...currentAdmin,
        ...updates,
        id: adminId // Ensure ID doesn't change
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Activate admin account
   */
  async activateAdmin(adminId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/super/admins/${adminId}/activate`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Deactivate admin account
   */
  async deactivateAdmin(adminId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/super/admins/${adminId}/deactivate`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Demote admin to regular user
   */
  async demoteAdmin(adminId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/admin/super/admins/${adminId}/demote`, {
        reason: reason || 'Admin privileges revoked'
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get admin login activity
   */
  async getAdminLoginActivity(adminId: string) {
    try {
      const { data } = await apiClient.get(`/admin/super/admins/${adminId}/login-activity`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all regular users for promotion
   */
  async getRegularUsers(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    joinDate: string;
  }>> {
    try {
      const { data } = await apiClient.get('/admin/users');
      const userList = Array.isArray(data) ? data : [];
      
      // Filter out existing admins
      return userList
        .filter((user: BackendAdmin) => user.roles === 'customer' || user.roles === 'client')
        .map((user: BackendAdmin) => ({
          id: user.id.toString(),
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          email: user.email,
          status: user.is_active ? 'active' : 'inactive',
          joinDate: user.created_at || ''
        }));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get admin management statistics
   */
  async getAdminStatistics() {
    try {
      const admins = await this.getAllAdmins();
      
      const totalAdmins = admins.length;
      const activeAdmins = admins.filter(a => a.status === 'active').length;
      const superAdmins = admins.filter(a => a.role === 'super-admin').length;
      
      // Calculate recent logins (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogins = admins.filter(a => {
        if (!a.lastLogin) return false;
        const lastLogin = new Date(a.lastLogin);
        return lastLogin > oneDayAgo;
      }).length;

      return {
        totalAdmins,
        activeAdmins,
        superAdmins,
        recentLogins,
        activeRate: totalAdmins > 0 ? ((activeAdmins / totalAdmins) * 100).toFixed(1) : '0'
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Normalize backend role to frontend role
   */
  private normalizeRole(backendRole?: string, isSuperAdmin?: boolean): 'admin' | 'super-admin' {
    if (isSuperAdmin || backendRole === 'super_admin' || backendRole === 'super') {
      return 'super-admin';
    }
    return 'admin';
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role?: string, isSuperAdmin?: boolean): string[] {
    if (isSuperAdmin || role === 'super_admin' || role === 'super') {
      return [
        'user_management',
        'admin_management', 
        'system_settings',
        'financial_oversight',
        'platform_analytics',
        'security_management'
      ];
    }
    
    return [
      'user_management',
      'content_moderation',
      'order_management',
      'basic_analytics'
    ];
  }
}

const adminManagementService = new AdminManagementService();
export default adminManagementService;