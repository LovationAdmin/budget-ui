// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  // Ajoutez d'autres propriétés utilisateur si nécessaire
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        // Assertion de type pour les données stockées
        setUser(JSON.parse(userData) as User);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.signup({ name, email, password });
      // @ts-ignore: Ignorer le type si la réponse est un AxiosResponse
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

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      // @ts-ignore: Ignorer le type si la réponse est un AxiosResponse
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};