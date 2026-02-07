/**
 * Protected Route Guard
 * Bảo vệ routes theo role người dùng
 */

import React from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { Spin } from 'antd';
import { useAuth, UserRole } from '@contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Component bảo vệ route theo authentication và authorization
 * @param children - Component con cần bảo vệ
 * @param allowedRoles - Danh sách roles được phép truy cập
 * @param redirectTo - URL redirect nếu không đủ quyền
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/auth/login',
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} search={{ from: location.pathname }} replace />;
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    const roleRedirects: Record<UserRole, string> = {
      admin: '/admin',
      customer: '/search',
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};

/**
 * Guard cho Admin routes
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/auth/login">
      {children}
    </ProtectedRoute>
  );
};

/**
 * Guard cho Customer routes
 */
export const CustomerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['customer']} redirectTo="/auth/login">
      {children}
    </ProtectedRoute>
  );
};

/**
 * Guard cho Authenticated routes (any role)
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default ProtectedRoute;
