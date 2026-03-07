import apiClient, { handleApiError } from '@/services/apiClient';
import { UserActivity } from '@/types';

// Backend user activity shape (login attempts)
interface BackendLoginAttempt {
  timestamp: string;
  ip_address: string;
  success: boolean;
}

// Backend user shape
interface BackendUser {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles?: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

class SuperAdminService {
  /**
   * Get all user activities by aggregating from multiple sources
   * Since the backend doesn't have a comprehensive activity log,
   * we'll combine login attempts with user registration data
   */
  async getAllUserActivities(): Promise<UserActivity[]> {
    try {
      const activities: UserActivity[] = [];

      // Get all users first
      const { data: users } = await apiClient.get<BackendUser[]>('/admin/users');
      const userList = Array.isArray(users) ? users : [];

      // For each user, get their login activity
      for (const user of userList) {
        try {
          // Try to get login activity for each user (this might fail for some users)
          const { data: loginAttempts } = await apiClient.get<BackendLoginAttempt[]>(
            `/admin/super/admins/${user.id}/login-activity`
          );
          
          const userLoginActivities = Array.isArray(loginAttempts) ? loginAttempts : [];
          
          // Convert login attempts to UserActivity format
          userLoginActivities.forEach((attempt, index) => {
            activities.push({
              id: `login_${user.id}_${index}`,
              userId: user.id.toString(),
              userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
              userEmail: user.email,
              userRole: this.normalizeRole(user.roles || 'client'),
              action: attempt.success ? 'login' : 'failed_login',
              description: attempt.success 
                ? 'User logged in successfully' 
                : 'Failed login attempt',
              timestamp: attempt.timestamp,
              ipAddress: attempt.ip_address,
              location: 'Unknown', // Backend doesn't provide location
              device: 'Unknown', // Backend doesn't provide device info
              status: attempt.success ? 'success' : 'failed'
            });
          });
        } catch (error) {
          // If we can't get login activity for this user, create a registration activity
          if (user.created_at) {
            activities.push({
              id: `registration_${user.id}`,
              userId: user.id.toString(),
              userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
              userEmail: user.email,
              userRole: this.normalizeRole(user.roles || 'client'),
              action: 'registration',
              description: 'User registered on the platform',
              timestamp: user.created_at,
              ipAddress: 'Unknown',
              location: 'Unknown',
              device: 'Unknown',
              status: 'success'
            });
          }
        }
      }

      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user activities for a specific user
   */
  async getUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      const activities: UserActivity[] = [];

      // Get user info first
      const { data: users } = await apiClient.get<BackendUser[]>('/admin/users');
      const userList = Array.isArray(users) ? users : [];
      const user = userList.find(u => u.id.toString() === userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Get login activity for this specific user
      try {
        const { data: loginAttempts } = await apiClient.get<BackendLoginAttempt[]>(
          `/admin/super/admins/${userId}/login-activity`
        );
        
        const userLoginActivities = Array.isArray(loginAttempts) ? loginAttempts : [];
        
        // Convert login attempts to UserActivity format
        userLoginActivities.forEach((attempt, index) => {
          activities.push({
            id: `login_${userId}_${index}`,
            userId: userId,
            userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            userEmail: user.email,
            userRole: this.normalizeRole(user.roles || 'client'),
            action: attempt.success ? 'login' : 'failed_login',
            description: attempt.success 
              ? 'User logged in successfully' 
              : 'Failed login attempt',
            timestamp: attempt.timestamp,
            ipAddress: attempt.ip_address,
            location: 'Unknown',
            device: 'Unknown',
            status: attempt.success ? 'success' : 'failed'
          });
        });
      } catch (error) {
        // If no login activity, add registration activity if available
        if (user.created_at) {
          activities.push({
            id: `registration_${userId}`,
            userId: userId,
            userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            userEmail: user.email,
            userRole: this.normalizeRole(user.roles || 'client'),
            action: 'registration',
            description: 'User registered on the platform',
            timestamp: user.created_at,
            ipAddress: 'Unknown',
            location: 'Unknown',
            device: 'Unknown',
            status: 'success'
          });
        }
      }

      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export user activities to CSV format
   */
  async exportUserActivities(): Promise<string> {
    try {
      const activities = await this.getAllUserActivities();
      
      const headers = [
        'ID',
        'User ID',
        'User Name',
        'User Email',
        'User Role',
        'Action',
        'Description',
        'Timestamp',
        'IP Address',
        'Location',
        'Device',
        'Status'
      ];

      let csv = headers.join(',') + '\n';
      
      activities.forEach(activity => {
        const row = [
          activity.id,
          activity.userId,
          `"${activity.userName}"`,
          activity.userEmail,
          activity.userRole,
          activity.action,
          `"${activity.description}"`,
          activity.timestamp,
          activity.ipAddress,
          activity.location,
          activity.device,
          activity.status
        ];
        csv += row.join(',') + '\n';
      });

      return csv;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics() {
    try {
      const activities = await this.getAllUserActivities();
      
      const totalActivities = activities.length;
      const successfulActivities = activities.filter(a => a.status === 'success').length;
      const failedActivities = activities.filter(a => a.status === 'failed').length;
      const uniqueUsers = new Set(activities.map(a => a.userId)).size;

      // Get action type counts
      const actionCounts = activities.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get role counts
      const roleCounts = activities.reduce((acc, activity) => {
        acc[activity.userRole] = (acc[activity.userRole] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalActivities,
        successfulActivities,
        failedActivities,
        uniqueUsers,
        successRate: totalActivities > 0 ? ((successfulActivities / totalActivities) * 100).toFixed(1) : '0',
        actionCounts,
        roleCounts
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Normalize backend role to frontend role
   */
  private normalizeRole(backendRole: string): string {
    const roleMap: Record<string, string> = {
      'customer': 'client',
      'admin': 'admin',
      'super_admin': 'super-admin',
      'super': 'super-admin',
      'store_owner': 'store',
      'stall_owner': 'store',
      'rider': 'rider'
    };
    
    return roleMap[backendRole.toLowerCase()] || 'client';
  }
}

const superAdminService = new SuperAdminService();
export default superAdminService;