import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Strict Authentication Check: unauthenticated visitors are redirected to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Pending account status enforcement
  if (user.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // 3. Strict Role-Based Authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's primary authorized portal
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};
