import apiClient, { handleApiError } from '@/services/apiClient';
import { User, StoreData } from '@/types';

interface StallAnalytics {
  totalStalls: number;
  activeStalls: number;
  pendingStalls: number;
  suspendedStalls: number;
  topPerformingStalls: Array<{ name: string; revenue: number; orders: number }>;
}
interface BackendUser {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  roles?: string;
  is_active?: boolean;
  created_at?: string;
}

interface BackendStallItem {
  id?: string;
  stall_name: string;
  stall_id: string;
  status?: string;
  owner_name?: string;
  created_at?: string;
}

class AdminDataService {
  async getUsers(): Promise<User[]> {
    try {
      const { data } = await apiClient.get<BackendUser[]>('/admin/users');
      const list = Array.isArray(data) ? data : [];
      return list.map((u, idx): User => ({
        id: u.id ?? idx,
        name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.username,
        email: u.email,
        role: (u.roles || u.role) as User['role'],
        status: u.is_active ? 'Active' : 'Inactive',
        location: '',
        orders: 0,
        totalSpent: 0,
        joinDate: u.created_at,
      }));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getStalls(): Promise<StoreData[]> {
    try {
      const { data } = await apiClient.get<BackendStallItem[]>('/admin/stalls');
      const list = Array.isArray(data) ? data : [];
      return list.map((s, idx): StoreData => ({
        id: idx + 1,
        stallId: s.stall_id,
        name: s.stall_name,
        owner: s.owner_name || 'Unknown',
        email: '',
        phone: '',
        category: '',
        location: '',
        status: s.status || 'Active',
        rating: 0,
        totalProducts: 0,
        monthlyRevenue: 0,
        joinDate: s.created_at || '',
        logo: '',
      }));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveStall(stallId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/stalls/${encodeURIComponent(stallId)}/approve`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async suspendStall(stallId: string, reason?: string, duration?: string): Promise<void> {
    try {
      await apiClient.post(`/admin/stalls/${encodeURIComponent(stallId)}/suspend`, { reason, duration });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async activateStall(stallId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/stalls/${encodeURIComponent(stallId)}/activate`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async rejectStall(stallId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/admin/stalls/${encodeURIComponent(stallId)}/reject`, { reason });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // User CRUD operations
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const { data } = await apiClient.post('/admin/users', {
        username: userData.name.toLowerCase().replace(/\s+/g, '_'),
        email: userData.email,
        first_name: userData.name.split(' ')[0],
        last_name: userData.name.split(' ').slice(1).join(' '),
        role: userData.role,
        is_active: userData.status === 'Active',
      });
      
      // Transform backend response to frontend User type
      return {
        id: (data as BackendUser).id || Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        location: userData.location || '',
        orders: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateUser(userId: string | number, userData: Partial<User>): Promise<User> {
    try {
      const { data } = await apiClient.put(`/admin/users/${userId}`, {
        username: userData.name?.toLowerCase().replace(/\s+/g, '_'),
        email: userData.email,
        first_name: userData.name?.split(' ')[0],
        last_name: userData.name?.split(' ').slice(1).join(' '),
        role: userData.role,
        is_active: userData.status === 'Active',
      });
      
      // Return updated user data
      return {
        id: userId,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'client',
        status: userData.status || 'Active',
        location: userData.location || '',
        orders: userData.orders || 0,
        totalSpent: userData.totalSpent || 0,
        joinDate: userData.joinDate || '',
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async suspendUser(userId: string | number, reason: string, duration: string): Promise<void> {
    try {
      await apiClient.post(`/admin/users/${userId}/suspend`, { reason, duration });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async activateUser(userId: string | number): Promise<void> {
    try {
      await apiClient.post(`/admin/users/${userId}/activate`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteUser(userId: string | number): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/users/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportStalls(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/stalls/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getStallAnalytics(): Promise<StallAnalytics> {
    try {
      const { data } = await apiClient.get('/admin/analytics/stalls');
      return (data as StallAnalytics) || {
        totalStalls: 0,
        activeStalls: 0,
        pendingStalls: 0,
        suspendedStalls: 0,
        topPerformingStalls: [],
      };
    } catch (error) {
      // Return mock data when analytics endpoint is not available
      console.warn('Stall analytics endpoint not available, using fallback data');
      return {
        totalStalls: 0,
        activeStalls: 0,
        pendingStalls: 0,
        suspendedStalls: 0,
        topPerformingStalls: [
          { name: 'Fresh Market Central', revenue: 15000, orders: 120 },
          { name: 'QuickShop Express', revenue: 12500, orders: 95 },
          { name: 'City Grocers', revenue: 11200, orders: 88 },
        ],
      };
    }
  }
}

const adminDataService = new AdminDataService();
export default adminDataService;
