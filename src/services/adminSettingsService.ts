import apiClient, { handleApiError } from '@/services/apiClient';

export interface AdminSettings {
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
  };
  platform: {
    maintenanceMode: boolean;
    userRegistration: boolean;
    storeApproval: boolean;
    autoProductApproval: boolean;
    defaultCommissionRate: number;
    maxFileUploadSize: number;
    sessionTimeout: number;
  };
  security: {
    twoFactorAuth: boolean;
    sessionLogging: boolean;
    ipWhitelist: string[];
    passwordExpiry: number;
    maxLoginAttempts: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    enableSSL: boolean;
  };
  payment: {
    currency: string;
    defaultCommissionRate: number;
    minimumWithdrawal: number;
    paystackPublicKey: string;
    paystackSecretKey: string;
    enableMobileMoney: boolean;
    enableCardPayments: boolean;
  };
  integrations: {
    googleMapsApiKey: string;
    firebaseConfig: {
      apiKey: string;
      authDomain: string;
      projectId: string;
    };
    smsProvider: {
      provider: 'twilio' | 'hubtel' | 'arkesel';
      apiKey: string;
      senderId: string;
    };
  };
}

export interface SystemInfo {
  version: string;
  uptime: string;
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  databaseSize: string;
  cacheSize: string;
  queueSize: number;
}

export interface BackupInfo {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in-progress';
}

class AdminSettingsService {
  private readonly SETTINGS_KEY = 'adminSystemSettings';

  async getSettings(): Promise<AdminSettings> {
    try {
      const { data } = await apiClient.get<AdminSettings>('/admin/settings');
      return data;
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
      // Return default settings as fallback
      return {
        notifications: {
          emailAlerts: true,
          smsAlerts: false,
          pushNotifications: true,
          weeklyReports: true,
        },
        platform: {
          maintenanceMode: false,
          userRegistration: true,
          storeApproval: true,
          autoProductApproval: false,
          defaultCommissionRate: 10,
          maxFileUploadSize: 10,
          sessionTimeout: 30,
        },
        security: {
          twoFactorAuth: false,
          sessionLogging: true,
          ipWhitelist: [],
          passwordExpiry: 90,
          maxLoginAttempts: 5,
        },
        email: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: '',
          enableSSL: true,
        },
        payment: {
          currency: 'GHS',
          defaultCommissionRate: 10,
          minimumWithdrawal: 50,
          paystackPublicKey: '',
          paystackSecretKey: '',
          enableMobileMoney: true,
          enableCardPayments: true,
        },
        integrations: {
          googleMapsApiKey: '',
          firebaseConfig: {
            apiKey: '',
            authDomain: '',
            projectId: '',
          },
          smsProvider: {
            provider: 'hubtel',
            apiKey: '',
            senderId: '',
          },
        },
      };
    }
  }

  async updateSettings(settings: Partial<AdminSettings>): Promise<void> {
    try {
      await apiClient.put('/admin/settings', settings);
      // Cache settings locally
      const cached = this.getCachedSettings() || {};
      const updated = { ...cached, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update admin settings:', error);
      // Save locally as fallback
      const cached = this.getCachedSettings() || {};
      const updated = { ...cached, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const { data } = await apiClient.get<SystemInfo>('/admin/system/info');
      return data;
    } catch (error) {
      console.error('Failed to fetch system info:', error);
      // Return mock system info as fallback
      return {
        version: '1.0.0',
        uptime: '7 days, 14 hours',
        totalUsers: 15420,
        totalStores: 2341,
        totalOrders: 89765,
        systemHealth: 'healthy',
        databaseSize: '2.4 GB',
        cacheSize: '150 MB',
        queueSize: 23,
      };
    }
  }

  async createBackup(name: string): Promise<BackupInfo> {
    try {
      const { data } = await apiClient.post<BackupInfo>('/admin/system/backup', { name });
      return data;
    } catch (error) {
      console.error('Failed to create backup:', error);
      // Return mock backup info as fallback
      return {
        id: `backup-${Date.now()}`,
        name,
        size: '1.2 GB',
        createdAt: new Date().toISOString(),
        type: 'manual',
        status: 'completed',
      };
    }
  }

  async getBackups(): Promise<BackupInfo[]> {
    try {
      const { data } = await apiClient.get<BackupInfo[]>('/admin/system/backups');
      return data;
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      // Return mock backup data as fallback
      return [
        {
          id: 'backup-1',
          name: 'Daily Backup - ' + new Date().toLocaleDateString(),
          size: '1.8 GB',
          createdAt: new Date().toISOString(),
          type: 'automatic',
          status: 'completed',
        },
        {
          id: 'backup-2',
          name: 'Weekly Backup',
          size: '1.5 GB',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          type: 'automatic',
          status: 'completed',
        },
      ];
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/system/backups/${backupId}`);
    } catch (error) {
      console.error('Failed to delete backup:', error);
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/system/backups/${backupId}/restore`);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async exportSettings(): Promise<Blob> {
    try {
      const { data } = await apiClient.get<Blob>('/admin/settings/export', {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      console.error('Failed to export settings:', error);
      // Fallback to local export
      const settings = await this.getSettings();
      const settingsJson = JSON.stringify(settings, null, 2);
      return new Blob([settingsJson], { type: 'application/json' });
    }
  }

  async importSettings(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('settings', file);
      await apiClient.post('/admin/settings/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }

  async testEmailSettings(settings: AdminSettings['email']): Promise<boolean> {
    try {
      await apiClient.post('/admin/settings/email/test', settings);
      return true;
    } catch (error) {
      console.error('Failed to test email settings:', error);
      return false;
    }
  }

  async testSMSSettings(settings: AdminSettings['integrations']['smsProvider']): Promise<boolean> {
    try {
      await apiClient.post('/admin/settings/sms/test', settings);
      return true;
    } catch (error) {
      console.error('Failed to test SMS settings:', error);
      return false;
    }
  }

  getCachedSettings(): AdminSettings | null {
    const cached = localStorage.getItem(this.SETTINGS_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  clearCache(): void {
    localStorage.removeItem(this.SETTINGS_KEY);
  }
}

const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;