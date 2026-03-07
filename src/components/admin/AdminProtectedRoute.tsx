import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireSuper?: boolean;
}

const AdminProtectedRoute: React.FC<Props> = ({ children, requireSuper }) => {
  const { admin, isLoading } = useAdminAuth();
  const clientAuth = useAuth();

  if (isLoading) return null; // or a loader

  // Allow access if authenticated via client auth with admin roles
  const clientUser = clientAuth?.user;
  const clientIsAdmin =
    clientUser &&
    (clientUser.role === "admin" || clientUser.role === "super-admin");
  if (clientIsAdmin) {
    if (requireSuper && clientUser.role !== "super-admin") {
      return <Navigate to="/admin-portal" replace />;
    }
    return <>{children}</>;
  }

  if (!admin)
    return (
      <Navigate
        to={requireSuper ? "/super-admin/login" : "/admin/login"}
        replace
      />
    );

  if (requireSuper && admin.roles !== "super_admin") {
    return <Navigate to="/admin-portal" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
