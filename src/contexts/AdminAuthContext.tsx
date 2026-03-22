import React, { createContext, useContext, useEffect, useState } from "react";
import adminService, { AdminUser, TwoFactorRequiredError } from "@/services/adminService";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type LoginStep = "credentials" | "twoFactor" | "done";

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  /**
   * Step 1: returns "requires_2fa" if the server needs an OTP,
   * or "success" if login completed without 2FA.
   */
  loginStep1: (email: string, password: string) => Promise<"requires_2fa" | "success">;
  /**
   * Step 2: submit the 6-digit OTP together with the cached credentials.
   */
  loginStep2: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cached credentials while waiting for 2FA code
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  // Bootstrap: restore session from storage
  useEffect(() => {
    const boot = async () => {
      const cached = adminService.getCurrentAdmin();
      const token = adminService.getAccessToken();
      if (cached && token) {
        try {
          // Validate token still works
          const fresh = await adminService.profile();
          setAdmin(fresh);
        } catch {
          setAdmin(cached); // use cached copy if request fails
        }
      }
      setIsLoading(false);
    };
    void boot();
  }, []);

  // ── Step 1 ─────────────────────────────────
  const loginStep1 = async (
    email: string,
    password: string
  ): Promise<"requires_2fa" | "success"> => {
    setIsLoading(true);
    try {
      // Optimistic: try without 2FA
      const result = await adminService.login({ email, password });
      setAdmin(result.admin);
      return "success";
    } catch (err) {
      if (err instanceof TwoFactorRequiredError) {
        // Cache credentials so step 2 can reuse them
        setPendingEmail(email);
        setPendingPassword(password);
        return "requires_2fa";
      }
      throw err; // re-throw real errors
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2 ─────────────────────────────────
  const loginStep2 = async (code: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await adminService.login({
        email: pendingEmail,
        password: pendingPassword,
        twoFactorCode: code,
      });
      setAdmin(result.admin);
      // Clear pending credentials
      setPendingEmail("");
      setPendingPassword("");
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
    const fresh = await adminService.profile();
    setAdmin(fresh);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        isSuperAdmin: admin?.isSuperAdmin ?? false,
        loginStep1,
        loginStep2,
        logout,
        refresh,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
