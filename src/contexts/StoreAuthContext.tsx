import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import storeAuthService, {
  StoreUser,
  StoreLoginRequest,
  StoreSignupRequest,
} from "@/services/storeAuthService";

interface StoreAuthContextType {
  user: StoreUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: StoreLoginRequest) => Promise<void>;
  signup: (storeData: StoreSignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<StoreUser>) => Promise<void>;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(
  undefined
);

interface StoreAuthProviderProps {
  children: ReactNode;
  // When true, do not run initial server refresh; load from local storage and render immediately
  skipBootstrap?: boolean;
}

export const StoreAuthProvider: React.FC<StoreAuthProviderProps> = ({
  children,
  skipBootstrap = false,
}) => {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const initializeAuth = async () => {
      try {
        if (skipBootstrap) {
          // Fast path for login route: avoid network call; use local if present
          const currentUser = storeAuthService.getCurrentUser();
          if (currentUser) setUser(currentUser);
          setIsLoading(false);
          return;
        }
        // Prefer server truth via status endpoint (cookie session)
        const refreshed = await storeAuthService.refreshProfile();
        setUser(refreshed);
      } catch (error) {
        // Fall back to local user if available
        const currentUser = storeAuthService.getCurrentUser();
        if (currentUser) setUser(currentUser);
        else {
          localStorage.removeItem("storeUser");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [skipBootstrap]);

  const login = async (credentials: StoreLoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await storeAuthService.login(credentials);
      if (response.success) {
        const current = storeAuthService.getCurrentUser();
        if (current) setUser(current);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (storeData: StoreSignupRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await storeAuthService.signup(storeData);
      // Signup does not log in; require manual login afterwards
      if (!response.success) {
        throw new Error(response.message || "Signup failed");
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await storeAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const updatedUser = await storeAuthService.refreshProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile refresh error:", error);
      throw error;
    }
  };

  const updateProfile = async (
    profileData: Partial<StoreUser>
  ): Promise<void> => {
    try {
      const updatedUser = await storeAuthService.updateProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const value: StoreAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshProfile,
    updateProfile,
  };

  return (
    <StoreAuthContext.Provider value={value}>
      {children}
    </StoreAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStoreAuth = (): StoreAuthContextType => {
  const context = useContext(StoreAuthContext);
  if (context === undefined) {
    throw new Error("useStoreAuth must be used within a StoreAuthProvider");
  }
  return context;
};
