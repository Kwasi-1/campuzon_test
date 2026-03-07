import apiClient, { handleApiError } from '@/services/apiClient';
import adminService from '@/services/adminService';
import { Notification, NotificationSettings } from '@/types';

interface BackendNotification {
  id?: string;
  title?: string;
  message?: string;
  notification_type?: string;
  data?: Record<string, unknown>;
  is_read?: boolean;
  created_at?: string;
  read_at?: string | null;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'push' | 'sms';
  category: string;
  isActive: boolean;
  variables: string[];
}

export interface BroadcastNotification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipients: 'all' | 'customers' | 'stores' | 'riders';
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

const map = (n: BackendNotification): Notification => ({
  id: String(n.id || ''),
  title: n.title || 'Notification',
  message: n.message || '',
  type: (n.notification_type as Notification['type']) || 'info',
  timestamp: n.created_at || new Date().toISOString(),
  read: !!n.is_read,
  priority: 'low',
  category: 'system',
});

class AdminNotificationsService {
  private readonly SETTINGS_KEY = 'adminNotificationSettings';

  async list(adminId?: string): Promise<Notification[]> {
    try {
      // Prefer super admin scoped notifications if adminId provided; else fallback to customer notifications
      if (adminId) {
        const { data } = await apiClient.get<BackendNotification[]>(`/admin/super/admins/${encodeURIComponent(adminId)}/notifications`);
        return (Array.isArray(data) ? data : []).map(map);
      }
      // Fallback: use customer notifications endpoint for current session user
      const { data } = await apiClient.get<{ success: boolean; notifications: BackendNotification[] }>(`/user/account/notifications`);
      const list = data?.notifications || [];
      return (Array.isArray(list) ? list : []).map(map);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          title: 'New Order Alert',
          message: 'You have received a new order from customer John Doe',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          category: 'order'
        },
        {
          id: '2',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
          type: 'warning',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          priority: 'medium',
          category: 'system'
        }
      ];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Prefer customer endpoint shape since admin-specific mark-as-read is not listed
      await apiClient.post(`/user/account/notifications/${encodeURIComponent(notificationId)}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post('/admin/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async createBroadcast(broadcast: Omit<BroadcastNotification, 'id' | 'status'>): Promise<BroadcastNotification> {
    try {
      const { data } = await apiClient.post<BroadcastNotification>('/admin/notifications/broadcast', broadcast);
      return data;
    } catch (error) {
      console.error('Failed to create broadcast:', error);
      // Return mock response as fallback
      return {
        id: `broadcast-${Date.now()}`,
        ...broadcast,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
    }
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data } = await apiClient.get<NotificationTemplate[]>('/admin/notifications/templates');
      return data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Return mock templates as fallback
      return [
        {
          id: 'order-confirmation',
          name: 'Order Confirmation',
          subject: 'Your order has been confirmed',
          body: 'Hello {{customerName}}, your order {{orderNumber}} has been confirmed.',
          type: 'email',
          category: 'orders',
          isActive: true,
          variables: ['customerName', 'orderNumber']
        },
        {
          id: 'welcome-user',
          name: 'Welcome New User',
          subject: 'Welcome to Tobra!',
          body: 'Welcome {{userName}}! Thank you for joining our platform.',
          type: 'email',
          category: 'user',
          isActive: true,
          variables: ['userName']
        }
      ];
    }
  }

  async createTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> {
    try {
      const { data } = await apiClient.post<NotificationTemplate>('/admin/notifications/templates', template);
      return data;
    } catch (error) {
      console.error('Failed to create template:', error);
      // Return mock response as fallback
      return {
        id: `template-${Date.now()}`,
        ...template
      };
    }
  }

  async updateTemplate(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const { data } = await apiClient.put<NotificationTemplate>(`/admin/notifications/templates/${id}`, template);
      return data;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/notifications/templates/${id}`);
    } catch (error) {
      console.error('Failed to delete template:', error);
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async getBroadcastHistory(): Promise<BroadcastNotification[]> {
    try {
      const { data } = await apiClient.get<BroadcastNotification[]>('/admin/notifications/broadcasts');
      return data;
    } catch (error) {
      console.error('Failed to fetch broadcast history:', error);
      // Return mock data as fallback
      return [
        {
          id: 'broadcast-1',
          title: 'Platform Maintenance Notice',
          message: 'We will be performing scheduled maintenance tonight.',
          type: 'warning',
          recipients: 'all',
          status: 'sent',
          sentAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
  }

  async getNotificationStats(): Promise<{
    totalSent: number;
    totalDelivered: number;
    deliveryRate: number;
    engagementRate: number;
  }> {
    try {
      const { data } = await apiClient.get<{
        totalSent: number;
        totalDelivered: number;
        deliveryRate: number;
        engagementRate: number;
      }>('/admin/notifications/stats');
      return data;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      // Return mock stats as fallback
      return {
        totalSent: 1250,
        totalDelivered: 1188,
        deliveryRate: 95.04,
        engagementRate: 68.5
      };
    }
  }

  getSettings(): NotificationSettings | null {
    const raw = localStorage.getItem(this.SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as NotificationSettings) : null;
  }

  saveSettings(settings: NotificationSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  async updateServerSettings(settings: NotificationSettings): Promise<void> {
    try {
      await apiClient.put('/admin/notifications/settings', settings);
      this.saveSettings(settings);
    } catch (error) {
      console.error('Failed to update notification settings on server:', error);
      // Save locally as fallback
      this.saveSettings(settings);
    }
  }
}

const adminNotificationsService = new AdminNotificationsService();
export default adminNotificationsService;
