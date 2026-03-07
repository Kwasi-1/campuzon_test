import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super-admin';
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for specific required role
  if (requiredRole && user.role !== requiredRole) {
    // Super admin can access admin routes
    if (requiredRole === 'admin' && user.role === 'super-admin') {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  // Check for allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;