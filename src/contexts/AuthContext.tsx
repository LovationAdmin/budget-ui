// src/contexts/AuthContext.tsx - VERSION OPTIMISÉE
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  // ============================================================================
  // 🚀 OPTIMISATION : Chargement initial avec useEffect
  // ============================================================================
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

  // ============================================================================
  // 🚀 OPTIMISATION : useCallback pour éviter la recréation des fonctions
  // ============================================================================

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.signup({ name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'inscription' 
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Identifiants invalides' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // ============================================================================
  // 🚀 OPTIMISATION : useMemo pour éviter la recréation du contexte
  // ============================================================================
  const contextValue = useMemo(() => ({
    user,
    loading,
    signup,
    login,
    logout,
    updateUser
  }), [user, loading, signup, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};