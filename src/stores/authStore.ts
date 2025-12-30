import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, TwoFactorMethod } from '@/types';

// ========== MOCK MODE FOR TESTING ==========
const USE_MOCK_AUTH = true; // Set to false when backend is ready

// Mock user data for testing
const mockUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John D.',
  email: 'john.doe@st.ug.edu.gh',
  phoneNumber: '+233 24 123 4567',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  isOwner: true, // Store owner to test 2FA recommendation
  isActive: true,
  isVerified: true,
  emailVerified: true,
  phoneVerified: true,
  institutionID: 'inst-1',
  hallID: 'hall-1',
  dateCreated: '2024-09-15T10:30:00Z',
  twoFactorEnabled: false,
  twoFactorMethod: 'none',
};

// Mock tokens - generated fresh each time
const getMockTokens = () => ({
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
});
// ============================================

// Response when 2FA is required
export interface TwoFactorRequired {
  requires2FA: true;
  tempToken: string;
  method: TwoFactorMethod;
}

// Response for successful login
interface LoginSuccess {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: false;
}

type LoginResponse = LoginSuccess | TwoFactorRequired;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Computed
  isProfileComplete: () => boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<TwoFactorRequired | null>;
  verify2FA: (tempToken: string, code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (accessToken: string, refreshToken: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  institutionID: string;
  hallID?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Check if user has completed their profile (has phone and institution)
      isProfileComplete: () => {
        const user = get().user;
        if (!user) return false;
        return !!(user.phoneNumber && user.institutionID);
      },

      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (USE_MOCK_AUTH) {
          // Mock login - any email/password works
          // For testing 2FA, use email containing "2fa" like "test2fa@email.com"
          const test2FA = email.toLowerCase().includes('2fa');
          
          if (test2FA) {
            set({ isLoading: false });
            return {
              requires2FA: true as const,
              tempToken: 'mock-temp-token-' + Date.now(),
              method: 'otp' as TwoFactorMethod,
            };
          }
          
          // Regular login without 2FA
          const tokens = getMockTokens();
          set({
            user: { ...mockUser, email },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return null;
        }
        
        // Real API call (when USE_MOCK_AUTH is false)
        try {
          const api = (await import('@/lib/api')).default;
          const { extractData } = await import('@/lib/api');
          const response = await api.post('/auth/login', { email, password });
          const data = extractData<LoginResponse>(response);
          
          if (data.requires2FA) {
            set({ isLoading: false });
            return data as TwoFactorRequired;
          }
          
          const loginData = data as LoginSuccess;
          set({
            user: loginData.user,
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return null;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verify2FA: async (_tempToken, code) => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (USE_MOCK_AUTH) {
          // Mock verify - any 6-digit code works
          if (code.length !== 6) {
            set({ isLoading: false });
            throw new Error('Invalid verification code');
          }
          
          const tokens = getMockTokens();
          set({
            user: { ...mockUser, twoFactorEnabled: true, twoFactorMethod: 'otp' },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
        
        // Real API call
        try {
          const api = (await import('@/lib/api')).default;
          const { extractData } = await import('@/lib/api');
          const response = await api.post('/auth/verify-2fa', { tempToken: _tempToken, code });
          const data = extractData<{ user: User; accessToken: string; refreshToken: string }>(response);
          
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (USE_MOCK_AUTH) {
          // Mock register - create user with provided data
          const newUser: User = {
            ...mockUser,
            id: 'user-' + Date.now(),
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: `${data.firstName} ${data.lastName.charAt(0)}.`,
            email: data.email,
            phoneNumber: data.phoneNumber,
            institutionID: data.institutionID,
            hallID: data.hallID || '',
            isOwner: false,
            dateCreated: new Date().toISOString(),
          };
          
          const tokens = getMockTokens();
          set({
            user: newUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
        
        // Real API call
        try {
          const api = (await import('@/lib/api')).default;
          const { extractData } = await import('@/lib/api');
          const response = await api.post('/auth/register', data);
          const result = extractData<{ user: User; accessToken: string; refreshToken: string }>(response);
          
          set({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Handle Google OAuth - returns true if profile is complete
      loginWithGoogle: async (accessToken, refreshToken) => {
        set({ 
          accessToken, 
          refreshToken, 
          isAuthenticated: true,
          isLoading: true,
        });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (USE_MOCK_AUTH) {
          // Mock Google login - simulate incomplete profile (no phone/institution)
          const googleUser: User = {
            ...mockUser,
            phoneNumber: '', // Empty to trigger profile completion
            institutionID: '', // Empty to trigger profile completion
          };
          
          set({ user: googleUser, isLoading: false });
          return false; // Profile is incomplete
        }
        
        // Real API call
        try {
          const api = (await import('@/lib/api')).default;
          const { extractData } = await import('@/lib/api');
          const response = await api.get('/user/me');
          const data = extractData<{ user: User }>(response);
          set({ user: data.user, isLoading: false });
          
          const user = data.user;
          return !!(user.phoneNumber && user.institutionID);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      fetchProfile: async () => {
        if (!get().accessToken) return;
        
        set({ isLoading: true });
        
        if (USE_MOCK_AUTH) {
          // Just keep current user
          set({ isLoading: false });
          return;
        }
        
        try {
          const api = (await import('@/lib/api')).default;
          const { extractData } = await import('@/lib/api');
          const response = await api.get('/user/me');
          const data = extractData<{ user: User }>(response);
          set({ user: data.user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data) => {
        if (USE_MOCK_AUTH) {
          // Mock update - merge with current user
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...data } as User });
          }
          return;
        }
        
        const api = (await import('@/lib/api')).default;
        const { extractData } = await import('@/lib/api');
        const response = await api.patch('/user/me', data);
        const result = extractData<{ user: User }>(response);
        set({ user: result.user });
      },
    }),
    {
      name: 'campuzon-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
