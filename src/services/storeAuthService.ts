import apiClient, { ApiResponse } from './apiClient';

export interface StoreUser {
  id?: string;
  email: string;
  name?: string;
  stallName?: string;
  stallId?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

export interface StoreLoginRequest {
  email: string;
  password: string;
}

export interface StoreSignupRequest {
  stall_name: string;
  description: string;
  region: string;
  subregion: string;
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  password: string;
}

export interface StoreAuthResponse {
  success: boolean;
  data?: {
    user?: StoreUser;
  };
  message?: string;
  error?: string;
}

// Backend-aligned response types
type StallLoginResponse = {
  success: boolean;
  message?: string;
  error?: string;
  stall_id?: string;
  stall_name?: string;
};

type StallStatusResponse = {
  success: boolean;
  logged_in: boolean;
  stall_id?: string;
  stall_name?: string;
  email?: string;
  error?: string;
};

type StallRegisterResponse = {
  success: boolean;
  message?: string;
  error?: string;
  stall?: {
    id: string;
    stall_name: string;
    stall_id: string;
    status: string;
    created_at: string;
  };
};

class StoreAuthService {
  /**
   * Store login
   */
  async login(credentials: StoreLoginRequest): Promise<StoreAuthResponse> {
    try {
      const response = await apiClient.post<StallLoginResponse>(
        '/stall/auth/login',
        credentials
      );

      if (response.data.success) {
        // Backend returns stall_id and stall_name on success; session cookie is set
        const minimalUser: StoreUser = {
          email: credentials.email,
          stallId: response.data.stall_id,
          stallName: response.data.stall_name,
        };
        localStorage.setItem('storeUser', JSON.stringify(minimalUser));
      }

      return response.data;
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Store registration/signup
   */
  async signup(storeData: StoreSignupRequest): Promise<StoreAuthResponse> {
    try {
      const response = await apiClient.post<StallRegisterResponse>(
        '/stall/auth/register',
        storeData
      );

      // Registration returns stall metadata; auto-login is not guaranteed
      return response.data;
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Store logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/stall/auth/logout');
    } catch (error) {
      // Log error but don't throw - we still want to clear local storage
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('storeUser');
    }
  }

  /**
   * Get current store user from localStorage
   */
  getCurrentUser(): StoreUser | null {
    try {
      const userString = localStorage.getItem('storeUser');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    // Store portal uses cookie-based session; no token is stored
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user;
  }

  /**
   * Refresh user profile
   */
  async refreshProfile(): Promise<StoreUser> {
    try {
      // Use status endpoint to verify session and basic stall identity
      const response = await apiClient.get<StallStatusResponse>('/stall/auth/status');
      if (response.data.success && response.data.logged_in) {
        const minimalUser: StoreUser = {
          email: response.data.email || this.getCurrentUser()?.email || '',
          stallId: response.data.stall_id,
          stallName: response.data.stall_name,
        };
        localStorage.setItem('storeUser', JSON.stringify(minimalUser));
        return minimalUser;
      }

      throw new Error(response.data.error || 'Failed to refresh profile');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update store profile
   */
  async updateProfile(profileData: Partial<StoreUser>): Promise<StoreUser> {
    try {
      // Store profile updates happen per stall; require stall_id
      const stallId = profileData.stallId || this.getCurrentUser()?.stallId;
      if (!stallId) throw new Error('Missing stallId for profile update');

      const payload: Record<string, unknown> = {};
      if (profileData.stallName) payload.stall_name = profileData.stallName;
      if (profileData.description) payload.description = profileData.description;
      if (profileData.category) payload.category = profileData.category;
      if ((profileData as { subcategory?: string }).subcategory) payload.subcategory = (profileData as { subcategory?: string }).subcategory;
      if (profileData.email) payload.email = profileData.email;
      if (profileData.phone) payload.phone = profileData.phone;
      if ((profileData as { whatsapp?: string }).whatsapp) payload.whatsapp = (profileData as { whatsapp?: string }).whatsapp;

      const response = await apiClient.put<ApiResponse<unknown>>(
        `/stall/auth/stall/${stallId}/update`,
        payload
      );

      if (response.data.success) {
        // Merge into local minimal user
        const current = this.getCurrentUser() || {} as StoreUser;
        const updated: StoreUser = {
          ...current,
          stallName: profileData.stallName ?? current.stallName,
          email: profileData.email ?? current.email,
        };
        localStorage.setItem('storeUser', JSON.stringify(updated));
        return updated;
      }

      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Change store password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Password change endpoint is not defined in stallAuth; surface clear error
      throw new Error('Change password is not available for store portal yet');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Not implemented in backend; placeholder to keep UI from breaking
      throw new Error('Password reset is not available for store portal yet');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Not implemented in backend; placeholder to keep UI from breaking
      throw new Error('Password reset is not available for store portal yet');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: unknown): string {
    const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
    if (err.response?.data?.error) {
      return err.response.data.error;
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
    return 'An unexpected error occurred';
  }
}

const storeAuthService = new StoreAuthService();
export default storeAuthService;