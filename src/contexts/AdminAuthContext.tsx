import React, { createContext, useContext, useEffect, useState } from "react";
import adminService, { AdminUser } from "@/services/adminService";

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginSuper: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      try {
        // try server profile (cookie session)
        const profile = await adminService.profile();
        setAdmin(profile);
      } catch {
        const local = adminService.getCurrentAdmin();
        setAdmin(local);
      } finally {
        setIsLoading(false);
      }
    };
    void boot();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await adminService.login({ username, password });
      setAdmin(u);
    } finally {
      setIsLoading(false);
    }
  };

  const loginSuper = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await adminService.login({ username, password }, true);
      setAdmin(u);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await adminService.logout();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    const u = await adminService.profile();
    setAdmin(u);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        loginSuper,
        logout,
        refresh,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
