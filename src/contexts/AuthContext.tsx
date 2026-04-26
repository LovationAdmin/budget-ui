// src/contexts/AuthContext.tsx
// ============================================================================
// AUTH CONTEXT — Pass 2 : refresh token + logout côté serveur
// ============================================================================
// Changements vs Pass 1 :
//   - Stockage du refresh_token dans localStorage (à côté du access token)
//   - Logout appelle /auth/logout pour révoquer le refresh côté serveur
//   - Nouveau : logoutAll() pour se déconnecter de tous les appareils
//
// Rétrocompatibilité totale :
//   - Toutes les méthodes existantes (signup, login, logout, updateUser)
//     gardent la même signature
//   - L'objet retourné par useAuth() ajoute uniquement de nouvelles méthodes
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User as APIUser } from '../services/api';

export interface User extends APIUser {
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (
    name: string,
    email: string,
    password: string,
    country?: string,
    postal_code?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logoutAll: () => Promise<{ success: boolean; error?: string }>;
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

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_REFRESH = 'refresh_token';
const STORAGE_KEY_USER = 'user';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap depuis localStorage au mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEY_USER);

    if (token && userData) {
      try {
        setUser(JSON.parse(userData) as User);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_REFRESH);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
    setLoading(false);
  }, []);

  /**
   * Helper : persiste le couple (access_token, refresh_token, user) en
   * localStorage. Tolère un refresh_token absent (cas où le backend n'a pas
   * réussi à l'émettre — l'access token reste valide jusqu'à son expiration).
   */
  const persistAuth = (
    accessToken: string,
    refreshToken: string | undefined,
    userData: User,
  ) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    country?: string,
    postal_code?: string,
  ) => {
    try {
      const response = await authAPI.signup({
        name,
        email,
        password,
        country,
        postal_code,
      });

      // Le signup actuel demande une vérification d'email avant login,
      // donc il ne renvoie PAS de tokens. On reste cohérent.
      // Si un jour la politique change, ce code gère déjà le cas.
      const { token, access_token, refresh_token, user: userData } = response.data ?? {};
      const accessToken = access_token ?? token;
      if (accessToken && userData) {
        persistAuth(accessToken, refresh_token, userData);
        setUser(userData as User);
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erreur lors de l'inscription",
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, access_token, refresh_token, user: userData } = response.data;

      // Le backend renvoie token (alias) ET access_token (canonique). On lit
      // access_token en priorité, fallback sur token pour compat.
      const accessToken = access_token ?? token;

      persistAuth(accessToken, refresh_token, userData);
      setUser(userData as User);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Identifiants invalides',
      };
    }
  };

  /**
   * Logout : signature synchrone (rétrocompat 100%).
   * - Nettoie immédiatement localStorage et le state React (UI réactive)
   * - Déclenche en arrière-plan la révocation serveur du refresh token
   *   (fire-and-forget : on ne bloque PAS l'UX si le serveur ne répond pas)
   */
  const logout = () => {
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);

    // 1. Nettoyer local en premier — l'UI réagit tout de suite
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);

    // 2. Révocation serveur en arrière-plan, sans bloquer
    if (refreshToken) {
      authAPI.logout(refreshToken).catch((e) => {
        // Silencieux : si la révocation serveur rate, le token expirera de
        // toute façon dans 7 jours. Le user est déjà déconnecté côté client.
        console.warn('Server-side logout failed (token will auto-expire):', e);
      });
    }
  };

  /**
   * LogoutAll : révoque TOUS les refresh tokens de l'utilisateur (toutes les
   * sessions, tous les appareils). Utile depuis la page Profil.
   */
  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Échec de la déconnexion globale',
      };
    }

    // Une fois le serveur a invalidé, on nettoie aussi le local
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);

    return { success: true };
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signup, login, logout, logoutAll, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
