import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "@/types";
import { authService } from "@/services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on app startup
    const initializeAuth = () => {
      const savedUser = authService.getUser();
      if (savedUser) {
        setUser(savedUser);
        // Optionally refresh user profile from server
        refreshUserProfile();
      }
    };

    initializeAuth();
  }, []);

  const refreshUserProfile = async () => {
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    } catch (error) {
      console.warn("Failed to refresh user profile:", error);
      // Don't logout on profile refresh failure, user might still be valid
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });
      if (result.requires2FA) {
        // upstream page should navigate to 2FA
        return true;
      }
      if (result.user) {
        setUser(result.user);
      }
      return false;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    city: string,
    region: string
  ) => {
    setIsLoading(true);
    try {
      await authService.signup({
        name,
        email,
        password,
        confirmPassword: password,
        phone,
        address,
        city,
        region,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const completeTwoFactor = async (code: string) => {
    const pending = authService.getPendingAuth();
    if (!pending) throw new Error("No pending authentication");
    const user = await authService.completeTwoFactor(
      pending.username,
      pending.password,
      code
    );
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, completeTwoFactor, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
