import apiClient, { handleApiError } from '@/services/apiClient';
import adminDataService from '@/services/adminDataService';

export interface DashboardStats {
  totalUsers: number;
  totalStalls: number;
  totalProducts: number;
  pendingApprovals: number;
  totalRevenue?: number | null; // might require super admin analytics endpoint
  activeOrders: number;
}

export interface RevenueData {
  name: string;
  revenue: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface TopStore {
  name: string;
  revenue: string;
  orders: number;
}

// Minimal shapes for backend responses
interface BackendBrowseResponse {
  success: boolean;
  pagination?: {
    page: number;
    per_page?: number;
    total: number;
    total_pages?: number;
  };
}

interface RevenueAnalyticsResponse {
  chartData?: RevenueData[];
}

interface CategoryAnalyticsResponse {
  categories?: CategoryData[];
}

interface TopStoresResponse {
  stores?: TopStore[];
}

class AdminDashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      // Fetch users and stalls in parallel
      const [users, stalls] = await Promise.all([
        adminDataService.getUsers(),
        adminDataService.getStalls(),
      ]);

      // Get total products using public browse pagination count
      let totalProducts = 0;
      try {
        const { data } = await apiClient.get<BackendBrowseResponse>('/product/browse?per_page=1');
        if (data?.success && data?.pagination?.total !== undefined) {
          totalProducts = Number(data.pagination.total) || 0;
        }
      } catch (e) {
        // ignore and keep 0
        console.warn('Failed to fetch total products:', handleApiError(e));
      }

      // Pending approvals: accept multiple representations
      const pendingApprovals = stalls.filter((s) => {
        const st = (s.status || '').toLowerCase();
        return st === 'pending' || st === 'pending_approval' || st === 'awaiting_approval';
      }).length;

      return {
        totalUsers: users.length,
        totalStalls: stalls.length,
        totalProducts,
        pendingApprovals,
        totalRevenue: null, // backend aggregate not available yet
        activeOrders: 0, // placeholder - will be replaced when orders endpoint is available
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getRevenueAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueData[]> {
    try {
      // Placeholder endpoint - replace when analytics backend is ready
      const { data } = await apiClient.get<RevenueAnalyticsResponse>(`/admin/analytics/revenue?period=${period}`);
      return data?.chartData || this.getMockRevenueData();
    } catch (error) {
      console.warn('Revenue analytics endpoint not available, using placeholder data');
      return this.getMockRevenueData();
    }
  }

  async getCategoryAnalytics(): Promise<CategoryData[]> {
    try {
      // Placeholder endpoint - replace when analytics backend is ready
      const { data } = await apiClient.get<CategoryAnalyticsResponse>('/admin/analytics/categories');
      return data?.categories || this.getMockCategoryData();
    } catch (error) {
      console.warn('Category analytics endpoint not available, using placeholder data');
      return this.getMockCategoryData();
    }
  }

  async getTopStores(limit: number = 5): Promise<TopStore[]> {
    try {
      // Placeholder endpoint - replace when analytics backend is ready
      const { data } = await apiClient.get<TopStoresResponse>(`/admin/analytics/top-stores?limit=${limit}`);
      return data?.stores || this.getMockTopStores();
    } catch (error) {
      console.warn('Top stores analytics endpoint not available, using placeholder data');
      return this.getMockTopStores();
    }
  }

  // Mock data methods - remove when real endpoints are available
  private getMockRevenueData(): RevenueData[] {
    return [
      { name: "Jan", revenue: 12500, orders: 45 },
      { name: "Feb", revenue: 15800, orders: 52 },
      { name: "Mar", revenue: 18200, orders: 61 },
      { name: "Apr", revenue: 14600, orders: 48 },
      { name: "May", revenue: 19500, orders: 68 },
      { name: "Jun", revenue: 22100, orders: 73 },
    ];
  }

  private getMockCategoryData(): CategoryData[] {
    return [
      { name: "Groceries", value: 45, color: "#8884d8" },
      { name: "Beverages", value: 25, color: "#82ca9d" },
      { name: "Fruits", value: 20, color: "#ffc658" },
      { name: "Others", value: 10, color: "#ff7300" },
    ];
  }

  private getMockTopStores(): TopStore[] {
    return [
      { name: "Fresh Market Central", revenue: "₵8,500", orders: 45 },
      { name: "QuickShop Express", revenue: "₵7,200", orders: 38 },
      { name: "City Grocers", revenue: "₵6,800", orders: 32 },
      { name: "Garden Fresh", revenue: "₵5,900", orders: 28 },
      { name: "Corner Store Plus", revenue: "₵4,700", orders: 24 },
    ];
  }
}

const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
