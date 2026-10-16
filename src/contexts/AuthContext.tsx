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
import api, { authAPI, userAPI, User as APIUser } from '../services/api';
import { extractRateLimitError } from '@/lib/rateLimitError';
import { setSentryUser } from '@/lib/sentry';
import { clearAllAdvisorJobs } from '@/lib/ai/advisorJob';
import { pick, defineMessages, usePreference } from '@/i18n/runtime';
import { LOCALES, type Locale } from '@/i18n/locales';
import { hasSavedPreference, uiLocale } from '@/i18n/preference';

const M = defineMessages({
  fr: {
    signupFailed: "La création du compte a échoué. Vérifiez votre connexion et réessayez.",
    loginFailed: 'E-mail ou mot de passe incorrect.',
    logoutAllFailed: 'Échec de la déconnexion globale',
  },
  en: {
    signupFailed: 'Account creation failed. Check your connection and try again.',
    loginFailed: 'Incorrect email or password.',
    logoutAllFailed: 'Couldn’t sign out of all devices',
  },
});

const isLocale = (l: unknown): l is Locale => typeof l === 'string' && l in LOCALES;

export interface User extends APIUser {
  created_at?: string;
  updated_at?: string;
  /** Language of the account: the app and its emails. Absent on accounts created before it existed. */
  locale?: Locale;
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
  ) => Promise<{ success: boolean; error?: string; code?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  /** Opens the session returned by another flow (e.g. email verification). */
  startSession: (accessToken: string, userData: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  /** Saves the language of the account (the screen's language is set with usePreference). */
  saveLocale: (locale: Locale) => void;
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
  const { setPreference } = usePreference();

  const saveLocale = (locale: Locale) => {
    api.put('/user/locale', { locale }).catch((err) => console.warn('[Auth] Saving the language failed', err));
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, locale };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next));
      return next;
    });
  };

  /**
   * The account's language becomes the screen's. An account without one (made
   * before languages existed) keeps what its owner saw until now: French,
   * unless they chose a language on this device; that choice is saved.
   */
  const applyAccountLocale = (u: User) => {
    if (isLocale(u.locale)) {
      setPreference(u.locale);
      return;
    }
    const locale: Locale = hasSavedPreference() ? uiLocale() : 'fr';
    setPreference(locale);
    saveLocale(locale);
  };

  /** A session restored from this device: its cached user may predate the account's language. */
  const restoreLocale = (u: User) => {
    if (isLocale(u.locale)) setPreference(u.locale);
    else userAPI.getProfile().then((r: { data?: { locale?: Locale } }) => applyAccountLocale({ ...u, locale: r.data?.locale })).catch(() => {});
  };

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
          restoreLocale(u);
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
          restoreLocale(u);
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
        applyAccountLocale(userData as User);
      }

      return { success: true };
    } catch (error: any) {
      // Si rate-limited (429), message FR clair avec compte à rebours
      const rateLimitMsg = extractRateLimitError(error);
      const errorMessage =
        rateLimitMsg ??
        error.response?.data?.error ??
        pick(M).signupFailed;
      return { success: false, error: errorMessage, code: error.response?.data?.code as string | undefined };
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
      applyAccountLocale(userData as User);

      return { success: true };
    } catch (err: any) {
      console.error('Login failed:', err);
      // Si rate-limited (429), message FR clair plutôt que "mot de passe incorrect"
      const rateLimitMsg = extractRateLimitError(err);
      const data = err.response?.data;
      const errorMessage = rateLimitMsg ?? data?.error ?? pick(M).loginFailed;
      const code = (data?.code as string | undefined) ?? (data?.email_not_verified ? 'email_not_verified' : undefined);
      return { success: false, error: errorMessage, code };
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
    clearAllAdvisorJobs();
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
        error: error.response?.data?.error || pick(M).logoutAllFailed,
      };
    }

    // Une fois le serveur a invalidé, on nettoie aussi le local
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_USER);
    clearAllAdvisorJobs();
    setUser(null);
    setSentryUser(null);

    return { success: true };
  };

  const startSession = (accessToken: string, userData: User, refreshToken?: string) => {
    persistAuth(accessToken, refreshToken, userData);
    setUser(userData);
    setSentryUser(userData.id);
    applyAccountLocale(userData);
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
      value={{ user, signup, login, logout, logoutAll, loading, updateUser, startSession, saveLocale }}
    >
      {children}
    </AuthContext.Provider>
  );
};
