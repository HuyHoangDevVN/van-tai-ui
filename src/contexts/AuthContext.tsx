/**
 * Authentication Context
 * Quản lý state đăng nhập, token JWT và thông tin user
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  maKhach?: string; // Mã khách hàng nếu role là customer
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isCustomer: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Mock auth functions - thay bằng API thật khi backend sẵn sàng
 */
const mockLogin = async (
  email: string,
  password: string,
): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock admin account
  if (email === 'admin@example.com' && password === 'admin123') {
    return {
      user: {
        id: 'admin-001',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
      },
      token: 'mock-jwt-token-admin',
    };
  }

  // Mock customer account
  if (password === '123456') {
    return {
      user: {
        id: `customer-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'customer',
        maKhach: 'KH001',
      },
      token: 'mock-jwt-token-customer',
    };
  }

  throw new Error('Email hoặc mật khẩu không đúng');
};

const mockRegister = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock registration success
  return {
    user: {
      id: `customer-${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: 'customer',
      maKhach: `KH${Date.now().toString().slice(-4)}`,
    },
    token: 'mock-jwt-token-new-customer',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state từ localStorage khi mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await mockLogin(email, password);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await mockRegister(data);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
