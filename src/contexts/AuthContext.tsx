// src/contexts/AuthContext.tsx
// ============================================================================
// AUTH CONTEXT — Pass 2 (refresh) + Pass 3 (rate-limit aware)
// ============================================================================
// Changements vs version précédente :
//   - Bug fix : login() ne retournait rien dans le catch → "Erreur de connexion"
//     générique pour TOUS les échecs. Maintenant retourne { success, error }
//     avec le bon message.
//   - Login + Signup utilisent extractRateLimitError pour formater un message
//     français clair en cas de 429.
//
// Rétrocompatibilité totale :
//   - Toutes les méthodes existantes gardent leur signature
//   - Pages consommatrices (Login.tsx, Signup.tsx) lisent `result.error` →
//     elles reçoivent automatiquement le bon message sans modification
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User as APIUser } from '../services/api';
import { extractRateLimitError } from '@/lib/rateLimitError';
import { setSentryUser } from '@/lib/sentry';

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
  logout: () => Promise<void>;
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
    const restoreSession = async () => {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEY_USER);

      if (token && userData) {
        // Cas heureux : tout est encore en localStorage
        try {
          const u = JSON.parse(userData) as User;
          setUser(u);
          setSentryUser(u.id);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      } else if (userData && !token) {
        // Restauration : user en cache mais access token perdu/expiré.
        // Si le cookie refresh est encore valide, on récupère un nouveau token.
        try {
          const response = await authAPI.refresh();
          localStorage.setItem(STORAGE_KEY_TOKEN, response.data.access_token);
          const u = JSON.parse(userData) as User;
          setUser(u);
          setSentryUser(u.id);
        } catch {
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      }
      setLoading(false);
    };

    restoreSession();
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
      // donc il ne renvoie PAS de tokens dans le flow nominal. On reste
      // cohérent : si un jour des tokens sont renvoyés, on les persiste.
      const { token, access_token, refresh_token, user: userData } = response.data ?? {};
      const accessToken = access_token ?? token;
      if (accessToken && userData) {
        persistAuth(accessToken, refresh_token, userData);
        setUser(userData as User);
        setSentryUser(userData.id);
      }

      return { success: true };
    } catch (error: any) {
      // Si rate-limited (429), message FR clair avec compte à rebours
      const rateLimitMsg = extractRateLimitError(error);
      const errorMessage =
        rateLimitMsg ??
        error.response?.data?.error ??
        "Erreur lors de l'inscription";
      return { success: false, error: errorMessage };
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
      setSentryUser(userData.id);

      return { success: true };
    } catch (err: any) {
      console.error('Login failed:', err);
      // Si rate-limited (429), message FR clair plutôt que "mot de passe incorrect"
      const rateLimitMsg = extractRateLimitError(err);
      const errorMessage =
        rateLimitMsg ??
        err.response?.data?.error ??
        'Email ou mot de passe incorrect';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout : nettoie le state local + révoque le refresh côté serveur.
   * Best-effort : si le serveur ne répond pas, on déconnecte quand même.
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('[Auth] Server logout failed (continuing locally)', error);
    }
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
    setSentryUser(null);
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
    setSentryUser(null);

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
