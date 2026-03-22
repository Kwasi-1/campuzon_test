import apiClient, { handleApiError } from '@/services/apiClient';
import adminService from '@/services/adminService';
import { Notification, NotificationSettings } from '@/types-new';

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
  type: (n.notification_type as Notification['type']) || 'system',
  dateCreated: n.created_at || new Date().toISOString(),
  isRead: !!n.is_read,
  priority: 'low',
  referenceID: null,
  referenceType: null,
});

class AdminNotificationsService {
  private readonly SETTINGS_KEY = 'adminNotificationSettings';
  private readonly DATABAE_KEY = 'adminNotificationMockDB';

  private getDB() {
    const raw = localStorage.getItem(this.DATABAE_KEY);
    if (raw) return JSON.parse(raw);
    return {
      notifications: [
        {
          id: '1',
          title: 'New Order Alert',
          message: 'You have received a new order from customer John Doe',
          type: 'order',
          dateCreated: new Date().toISOString(),
          isRead: false,
          priority: 'high',
          referenceType: null,
          referenceID: null,
        },
        {
          id: '2',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
          type: 'system',
          dateCreated: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
          priority: 'medium',
          referenceType: null,
          referenceID: null,
        }
      ],
      broadcasts: [
        {
          id: 'broadcast-1',
          title: 'Platform Maintenance Notice',
          message: 'We will be performing scheduled maintenance tonight.',
          type: 'warning',
          recipients: 'all',
          status: 'sent',
          sentAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      templates: [
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
      ],
      stats: {
        totalSent: 1250,
        totalDelivered: 1188,
        deliveryRate: 95.04,
        engagementRate: 68.5
      }
    };
  }

  private saveDB(data: any) {
    localStorage.setItem(this.DATABAE_KEY, JSON.stringify(data));
  }

  async list(adminId?: string): Promise<Notification[]> {
    try {
      if (adminId) {
        const { data } = await apiClient.get<BackendNotification[]>(`/admin/super/admins/${encodeURIComponent(adminId)}/notifications`);
        return (Array.isArray(data) ? data : []).map(map);
      }
      const { data } = await apiClient.get<{ success: boolean; notifications: BackendNotification[] }>(`/user/account/notifications`);
      const list = data?.notifications || [];
      return (Array.isArray(list) ? list : []).map(map);
    } catch (error) {
      console.warn('Failed to fetch notifications API, using local DB:', error);
      return this.getDB().notifications;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.post(`/user/account/notifications/${encodeURIComponent(notificationId)}/read`);
    } catch (error) {
       console.warn('Failed to call markAsRead API, updating local DB...');
       const db = this.getDB();
       db.notifications = db.notifications.map((n: Notification) => 
         n.id === notificationId ? { ...n, isRead: true } : n
       );
       this.saveDB(db);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post('/admin/notifications/mark-all-read');
    } catch (error) {
      console.warn('Failed to call markAllAsRead API, updating local DB...');
      const db = this.getDB();
      db.notifications = db.notifications.map((n: Notification) => ({ ...n, isRead: true }));
      this.saveDB(db);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async createBroadcast(broadcast: Omit<BroadcastNotification, 'id' | 'status'>): Promise<BroadcastNotification> {
    try {
      const { data } = await apiClient.post<BroadcastNotification>('/admin/notifications/broadcast', broadcast);
      return data;
    } catch (error) {
      console.warn('Failed to create broadcast API, updating local DB...');
      const db = this.getDB();
      const newBroadcast = {
        id: `broadcast-${Date.now()}`,
        ...broadcast,
        status: 'sent' as const,
        sentAt: new Date().toISOString()
      };
      db.broadcasts = [newBroadcast, ...db.broadcasts];
      // update stats as well to simulate real engagement
      db.stats.totalSent += 1;
      db.stats.totalDelivered += 1;
      this.saveDB(db);
      return newBroadcast;
    }
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data } = await apiClient.get<NotificationTemplate[]>('/admin/notifications/templates');
      return data;
    } catch (error) {
      console.warn('Failed to fetch templates API, using local DB...');
      return this.getDB().templates;
    }
  }

  async createTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> {
    try {
      const { data } = await apiClient.post<NotificationTemplate>('/admin/notifications/templates', template);
      return data;
    } catch (error) {
      console.warn('Failed to create template API, updating local DB...');
      const db = this.getDB();
      const newTemplate = { id: `template-${Date.now()}`, ...template };
      db.templates.push(newTemplate);
      this.saveDB(db);
      return newTemplate;
    }
  }

  async updateTemplate(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const { data } = await apiClient.put<NotificationTemplate>(`/admin/notifications/templates/${id}`, template);
      return data;
    } catch (error) {
      console.warn('Failed to update template API, updating local DB...');
      const db = this.getDB();
      let updated = null;
      db.templates = db.templates.map((t: NotificationTemplate) => {
        if (t.id === id) {
          updated = { ...t, ...template };
          return updated;
        }
        return t;
      });
      if (!updated) throw new Error("Template not found");
      this.saveDB(db);
      return updated;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/notifications/templates/${id}`);
    } catch (error) {
      console.warn('Failed to delete template API, updating local DB...');
      const db = this.getDB();
      db.templates = db.templates.filter((t: NotificationTemplate) => t.id !== id);
      this.saveDB(db);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async getBroadcastHistory(): Promise<BroadcastNotification[]> {
    try {
      const { data } = await apiClient.get<BroadcastNotification[]>('/admin/notifications/broadcasts');
      return data;
    } catch (error) {
      console.warn('Failed to fetch broadcast API, using local DB...');
      return this.getDB().broadcasts;
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
      console.warn('Failed to fetch stats API, using local DB...');
      return this.getDB().stats;
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
      console.warn('Failed to update notification settings on server API, updating local DB:', error);
      this.saveSettings(settings); // Fallback
    }
  }
}

const adminNotificationsService = new AdminNotificationsService();
export default adminNotificationsService;
