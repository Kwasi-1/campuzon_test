import apiClient, { handleApiError } from '@/services/apiClient';

// Backend shapes (partial)
export interface BackendRiderLocationItem {
  rider_id: string;
  rider_info?: {
    name?: string;
    username?: string;
    phone?: string;
    vehicle_type?: string;
    license_plate?: string;
    status?: string;
  };
  location?: { lat?: number; lng?: number };
  is_online?: boolean;
  last_updated?: string;
  battery_level?: number;
  active_orders_count?: number;
}

export interface RidersLocationsResponse {
  success: boolean;
  riders: BackendRiderLocationItem[];
  total_online_riders?: number;
  last_updated?: string;
}

export interface AdminRider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalDeliveries: number;
  earnings: number;
  joinedAt: string;
  vehicleType: string;
  location: string;
  avatar?: string;
  licenseNumber?: string;
  isOnline?: boolean;
  activeOrders?: number;
}

export interface RiderAnalytics {
  totalRiders: number;
  activeRiders: number;
  onlineRiders: number;
  suspendedRiders: number;
  avgRating: number;
  totalDeliveries: number;
  topPerformers: Array<{ name: string; deliveries: number; rating: number }>;
}

export interface RiderPerformanceResponse {
  success: boolean;
  period_days: number;
  riders: Array<{
    rider_id: string;
    rider_info: { name: string; username: string; vehicle_type?: string; status?: string; registered_at?: string };
    performance: { total_deliveries: number; recent_deliveries: number; avg_deliveries_per_day: number; estimated_total_earnings: number; completion_rate?: number; rating?: number };
    status: { is_online: boolean; last_seen?: string; active_orders: number };
  }>;
}

class AdminRiderService {
  async getRidersLocations(): Promise<RidersLocationsResponse> {
    try {
      const { data } = await apiClient.get<RidersLocationsResponse>('/admin/riders/locations');
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPerformance(days = 30, status?: string): Promise<RiderPerformanceResponse> {
    try {
      const params = new URLSearchParams();
      params.append('days', String(days));
      if (status) params.append('status', status);
      const { data } = await apiClient.get<RiderPerformanceResponse>(`/admin/riders/performance?${params.toString()}`);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async suspendRider(riderId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/admin/riders/${encodeURIComponent(riderId)}/suspend`, { reason });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async reactivateRider(riderId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/admin/riders/${encodeURIComponent(riderId)}/reactivate`, { reason });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAllRiders(): Promise<AdminRider[]> {
    try {
      // Try to use combined performance data to get comprehensive rider info
      const performanceData = await this.getPerformance(30);
      
      return performanceData.riders.map((rider) => ({
        id: rider.rider_id,
        name: rider.rider_info.name || rider.rider_info.username,
        email: '', // Not available in current endpoint
        phone: '', // Not available in current endpoint
        status: (rider.rider_info.status as AdminRider['status']) || 'active',
        rating: rider.performance.rating || 0,
        totalDeliveries: rider.performance.total_deliveries,
        earnings: rider.performance.estimated_total_earnings,
        joinedAt: rider.rider_info.registered_at || '',
        vehicleType: rider.rider_info.vehicle_type || 'motorcycle',
        location: 'Unknown', // Not available in current endpoint
        isOnline: rider.status.is_online,
        activeOrders: rider.status.active_orders,
      }));
    } catch (error) {
      // Fallback to mock data if endpoint is not available
      console.warn('Rider data endpoint not available, using fallback data');
      return this.getMockRiders();
    }
  }

  async updateRider(riderId: string, updates: Partial<AdminRider>): Promise<AdminRider> {
    try {
      const { data } = await apiClient.put(`/admin/riders/${encodeURIComponent(riderId)}`, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        vehicle_type: updates.vehicleType,
        license_number: updates.licenseNumber,
        status: updates.status,
      });
      
      // Return updated rider data
      return {
        id: riderId,
        name: updates.name || '',
        email: updates.email || '',
        phone: updates.phone || '',
        status: updates.status || 'active',
        rating: updates.rating || 0,
        totalDeliveries: updates.totalDeliveries || 0,
        earnings: updates.earnings || 0,
        joinedAt: updates.joinedAt || '',
        vehicleType: updates.vehicleType || 'motorcycle',
        location: updates.location || '',
        isOnline: updates.isOnline || false,
        activeOrders: updates.activeOrders || 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getRiderAnalytics(): Promise<RiderAnalytics> {
    try {
      const { data } = await apiClient.get('/admin/analytics/riders');
      return (data as RiderAnalytics) || this.getMockAnalytics();
    } catch (error) {
      console.warn('Rider analytics endpoint not available, using fallback data');
      return this.getMockAnalytics();
    }
  }

  async exportRiders(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/riders/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async removeRider(riderId: string, reason?: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/riders/${encodeURIComponent(riderId)}?reason=${encodeURIComponent(reason || '')}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Mock data methods for fallback
  private getMockRiders(): AdminRider[] {
    return [
      {
        id: '1',
        name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '+233987654321',
        status: 'active',
        rating: 4.8,
        totalDeliveries: 245,
        earnings: 3500,
        joinedAt: '2024-01-10',
        vehicleType: 'motorcycle',
        location: 'Accra Central',
        isOnline: true,
        activeOrders: 2,
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+233876543210',
        status: 'active',
        rating: 4.9,
        totalDeliveries: 189,
        earnings: 2800,
        joinedAt: '2024-02-15',
        vehicleType: 'bicycle',
        location: 'Kumasi',
        isOnline: false,
        activeOrders: 0,
      },
    ];
  }

  private getMockAnalytics(): RiderAnalytics {
    return {
      totalRiders: 156,
      activeRiders: 142,
      onlineRiders: 89,
      suspendedRiders: 3,
      avgRating: 4.6,
      totalDeliveries: 12543,
      topPerformers: [
        { name: 'Michael Johnson', deliveries: 245, rating: 4.8 },
        { name: 'Sarah Wilson', deliveries: 189, rating: 4.9 },
        { name: 'David Brown', deliveries: 167, rating: 4.7 },
      ],
    };
  }
}

const adminRiderService = new AdminRiderService();
export default adminRiderService;
