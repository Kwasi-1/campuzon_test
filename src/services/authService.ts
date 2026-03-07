/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including login, signup, logout,
 * and token management.
 */

import apiClient, { ApiResponse, handleApiError } from './apiClient';
import { User, LoginFormData, SignupFormData } from '@/types';

// Authentication response types
export interface LoginResult {
  user?: User;
  requires2FA?: boolean;
  message?: string;
}

export type LoginResponse = {
  success: boolean;
  message?: string;
  user?: User;
  requires_2fa?: boolean;
  tfa_method?: 'email' | 'sms';
  email_sent?: boolean;
};

export type SignupResponse = {
  success: boolean;
  message?: string;
  user?: Partial<User> & { id?: string | number; username?: string; first_name?: string; last_name?: string; roles?: string };
};

export type ProfileResponse = {
  success: boolean;
  user?: User;
  message?: string;
};

export type SecurityInfoResponse = {
  success: boolean;
  security?: {
    two_factor_enabled: boolean;
    two_factor_last_used?: string | null;
    email_verified?: boolean;
    last_login?: string | null;
    login_count?: number;
    account_created?: string | null;
    failed_login_attempts?: number;
    account_locked?: boolean;
    account_active?: boolean;
  };
  message?: string;
};

/**
 * Authentication Service Class
 */
class AuthService {
  private readonly USER_KEY = 'user';
  private readonly PENDING_AUTH_KEY = 'pendingAuth'; // sessionStorage

  /**
   * Login user with email/username and password
   */
  async login(credentials: LoginFormData): Promise<LoginResult> {
    try {
      const { data } = await apiClient.post<LoginResponse>('/user/auth/login', {
        username: credentials.email, // backend accepts username or email
        password: credentials.password,
      });

      if (data.requires_2fa) {
        // Store pending creds in sessionStorage for second step
        this.storePendingAuth(credentials.email, credentials.password);
        return { requires2FA: true, message: data.message };
      }

      if (data.success && data.user) {
        this.storeUser(data.user);
        return { user: data.user, message: data.message };
      }

      throw new Error(data.message || 'Login failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register new user
   */
  async signup(userData: SignupFormData): Promise<{ message: string }> {
    try {
      // Extract first and last name from full name
      const nameParts = (userData.name || '').trim().split(' ');
      const firstName = userData['firstName' as keyof SignupFormData] as unknown as string || nameParts[0] || '';
      const lastName = userData['lastName' as keyof SignupFormData] as unknown as string || nameParts.slice(1).join(' ') || '';

      const { data } = await apiClient.post<SignupResponse>('/user/auth/register', {
        first_name: firstName,
        last_name: lastName,
        username: userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
      });

      if (data.success) {
        return { message: data.message || 'Registration successful. Please verify your email.' };
      }

      throw new Error(data.message || 'Registration failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/user/auth/logout');
    } catch (error) {
      // Continue with local logout even if server logout fails
      console.warn('Server logout failed:', handleApiError(error));
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ProfileResponse>('/user/auth/profile');

      if (response.data.success && response.data.user) {
        this.storeUser(response.data.user);
        return response.data.user;
      }

      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ProfileResponse>('/user/auth/profile', userData);

      if (response.data.success && response.data.user) {
        this.storeUser(response.data.user);
        return response.data.user;
      }

      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/user/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get security info (2FA status, last logins, etc.)
   */
  async getSecurityInfo(): Promise<SecurityInfoResponse['security']> {
    try {
      const { data } = await apiClient.get<SecurityInfoResponse>('/user/auth/security-info');
      if (data.success && data.security) return data.security;
      throw new Error(data.message || 'Failed to fetch security info');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /** Enable two-factor authentication (requires password). Returns recovery codes. */
  async enableTwoFactor(password: string): Promise<string[]> {
    try {
      const { data } = await apiClient.post<ApiResponse<{ recovery_codes?: string[] }>>(
        '/user/auth/enable-2fa',
        { password }
      );
  if (!data.success) throw new Error(data.message || 'Failed to enable 2FA');
  // Some responses include recovery_codes directly at root; normalize both shapes
  const maybeWithCodes = data as ApiResponse<{ recovery_codes?: string[] }> & { recovery_codes?: string[] };
  return maybeWithCodes.recovery_codes || maybeWithCodes.data?.recovery_codes || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /** Disable two-factor authentication (requires password). */
  async disableTwoFactor(password: string): Promise<void> {
    try {
      const { data } = await apiClient.post<ApiResponse>('/user/auth/disable-2fa', { password });
      if (!data.success) throw new Error(data.message || 'Failed to disable 2FA');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Store authentication data in localStorage
   */
  /**
   * Store user data in localStorage
   */
  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.PENDING_AUTH_KEY);
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getUser();
    return !!user;
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(email: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/user/auth/resend-verification', { email });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send verification email');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/user/auth/verify-email', { token });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 2FA: Request a new TFA code sent to user's email
   */
  async requestTfaCode(username: string): Promise<void> {
    try {
      const { data } = await apiClient.post<ApiResponse>('/user/auth/request-tfa-code', { username });
      if (!data.success) {
        throw new Error(data.message || 'Failed to request verification code');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 2FA: Complete login by posting tfa_code along with original credentials
   */
  async completeTwoFactor(username: string, password: string, code: string): Promise<User> {
    try {
      const { data } = await apiClient.post<LoginResponse>('/user/auth/login', {
        username,
        password,
        tfa_code: code,
      });
      if (data.success && data.user) {
        this.storeUser(data.user);
        // clear pending
        sessionStorage.removeItem(this.PENDING_AUTH_KEY);
        return data.user;
      }
      throw new Error(data.message || 'Verification failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Helpers to manage pending credentials (sessionStorage only)
   */
  private storePendingAuth(username: string, password: string) {
    try {
      sessionStorage.setItem(this.PENDING_AUTH_KEY, JSON.stringify({ username, password }));
    } catch {
      // ignore storage errors (e.g., private mode)
    }
  }

  getPendingAuth(): { username: string; password: string } | null {
    try {
      const raw = sessionStorage.getItem(this.PENDING_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;