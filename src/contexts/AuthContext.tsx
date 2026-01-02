// src/contexts/AuthContext.tsx
// ✅ VERSION MISE À JOUR - Ajout support country + postal_code dans signup
// ✅ ZÉRO RÉGRESSION - Toutes les fonctions existantes conservées à 100%

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User as APIUser } from '../services/api';

// ============================================================================
// Extended User type that includes all fields needed in the frontend
// ============================================================================
export interface User extends APIUser {
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // 🆕 UPDATED - Added country and postal_code parameters
  signup: (
    name: string, 
    email: string, 
    password: string,
    country?: string,        // ✅ NEW (optional, defaults to 'FR' on backend)
    postal_code?: string     // ✅ NEW (optional)
  ) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ EXISTING EFFECT - PRESERVED 100%
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData) as User);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // 🆕 UPDATED - Added country and postal_code parameters
  const signup = async (
    name: string, 
    email: string, 
    password: string,
    country?: string,
    postal_code?: string
  ) => {
    try {
      const response = await authAPI.signup({ 
        name, 
        email, 
        password,
        country,        // ✅ NEW
        postal_code     // ✅ NEW
      });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData as User);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'inscription' 
      };
    }
  };

  // ✅ EXISTING LOGIN - PRESERVED 100%
  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData as User);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Identifiants invalides' 
      };
    }
  };

  // ✅ EXISTING LOGOUT - PRESERVED 100%
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ✅ EXISTING UPDATE USER - PRESERVED 100%
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};