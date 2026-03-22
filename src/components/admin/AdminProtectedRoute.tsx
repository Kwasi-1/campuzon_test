import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Props {
  children: React.ReactNode;
  requireSuper?: boolean;
}

const AdminProtectedRoute: React.FC<Props> = ({ children, requireSuper }) => {
  const { admin, isLoading, isSuperAdmin } = useAdminAuth();

  if (isLoading) {
    // Show a minimal loader while session is being bootstrapped
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireSuper && !isSuperAdmin) {
    return <Navigate to="/admin-portal" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
