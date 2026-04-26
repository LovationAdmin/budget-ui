// src/services/api.ts
// ============================================================================
// API CLIENT — Pass 2 : refresh token flow + handling des 401 concurrents
// ============================================================================
// Changements vs version précédente :
//   - Ajout de l'endpoint /auth/refresh
//   - Intercepteur 401 : tente UN refresh avant de rediriger vers /login
//   - Gestion des 401 concurrents : un seul refresh en vol à la fois,
//     les requêtes parallèles attendent puis rejouent
//   - Login renvoie aussi un refresh_token, stocké à côté du token
//
// Rétrocompatibilité totale :
//   - Toutes les fonctions exportées (authAPI, userAPI, budgetAPI, etc.)
//     gardent leur signature
//   - Le champ "token" de la réponse de login reste lu (alias serveur)
// ============================================================================

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// ----------------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------------

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_REFRESH = 'refresh_token';
const STORAGE_KEY_USER = 'user';

// ----------------------------------------------------------------------------
// AXIOS INSTANCE PRINCIPALE
// ----------------------------------------------------------------------------

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Instance "raw" sans intercepteurs : utilisée pour appeler /auth/refresh
// sans déclencher la boucle de refresh sur cet appel-là.
const rawAxios = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ----------------------------------------------------------------------------
// INTERCEPTEUR REQUEST : injection du Bearer
// ----------------------------------------------------------------------------

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------------------
// REFRESH FLOW : gestion des 401 concurrents
// ----------------------------------------------------------------------------
// Pattern classique :
//   - Si plusieurs requêtes échouent en 401 en même temps, UNE SEULE déclenche
//     le refresh ; les autres s'abonnent et attendent le résultat.
//   - Quand le refresh aboutit, toutes les requêtes en attente sont rejouées
//     avec le nouveau token.
//   - Si le refresh échoue, on force le logout et on les rejette toutes.

let isRefreshing = false;
type Subscriber = (newToken: string | null) => void;
let refreshSubscribers: Subscriber[] = [];

function notifySubscribers(newToken: string | null) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function subscribeToRefresh(cb: Subscriber) {
  refreshSubscribers.push(cb);
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_REFRESH);
  localStorage.removeItem(STORAGE_KEY_USER);
}

function redirectToLogin() {
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

async function performRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const { data } = await rawAxios.post('/auth/refresh', {
    refresh_token: refreshToken,
  });

  const newAccessToken: string | undefined = data.access_token ?? data.token;
  const newRefreshToken: string | undefined = data.refresh_token;

  if (!newAccessToken) {
    throw new Error('Refresh response missing access_token');
  }

  localStorage.setItem(STORAGE_KEY_TOKEN, newAccessToken);
  if (newRefreshToken) {
    localStorage.setItem(STORAGE_KEY_REFRESH, newRefreshToken);
  }

  return newAccessToken;
}

// ----------------------------------------------------------------------------
// INTERCEPTEUR RESPONSE : 401 → tentative de refresh
// ----------------------------------------------------------------------------

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Pas un 401 ou pas de config (erreur réseau, etc.) : on rejette
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Si l'erreur 401 vient déjà d'un retry : on abandonne (évite la boucle)
    if (originalRequest._retry) {
      clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    // Si l'utilisateur n'a même pas de refresh_token (jamais loggé / déjà clear)
    // → pas la peine de tenter un refresh
    if (!localStorage.getItem(STORAGE_KEY_REFRESH)) {
      clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Si un refresh est déjà en cours, on attend la fin
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          if (newToken) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // Sinon : on lance le refresh
    isRefreshing = true;
    try {
      const newToken = await performRefresh();
      notifySubscribers(newToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      notifySubscribers(null);
      clearAuth();
      redirectToLogin();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  postal_code?: string;
}

export interface AuthResponse {
  token: string;          // alias rétrocompat
  access_token?: string;  // nom canonique
  refresh_token?: string;
  token_type?: string;
  user: User;
}

export interface CategorizeResponse {
  label: string;
  category: string;
}

export interface Competitor {
  name: string;
  typical_price: number;
  best_offer: string;
  potential_savings: number;
  pros: string[];
  cons: string[];
  website_url?: string;
  affiliate_link?: string;
  phone_number?: string;
  contact_email?: string;
  contact_available: boolean;
}

export interface MarketSuggestion {
  id: string;
  category: string;
  country: string;
  merchant_name?: string;
  competitors: Competitor[];
  last_updated: string;
  expires_at: string;
}

export interface ChargeSuggestion {
  charge_id: string;
  charge_label: string;
  suggestion: MarketSuggestion;
}

export interface BulkAnalyzeRequest {
  charges: Array<{
    id: string;
    category: string;
    label: string;
    amount: number;
    merchant_name?: string;
  }>;
  household_size: number;
}

export interface BulkAnalyzeResponse {
  suggestions: ChargeSuggestion[];
  cache_hits: number;
  ai_calls_made: number;
  total_potential_savings: number;
  household_size: number;
}

export interface LocationUpdate {
  country: string;
  postal_code?: string;
}

export interface UserLocation {
  country: string;
  postal_code?: string;
}

// ----------------------------------------------------------------------------
// INTERNAL TYPES
// ----------------------------------------------------------------------------

interface AuthData {
  name?: string;
  email: string;
  password: string;
  country?: string;
  postal_code?: string;
}

interface ProfileUpdateData {
  name: string;
  avatar?: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

interface BudgetCreateData {
  name: string;
  year?: number;
  location?: string;
  currency?: string;
}

interface BudgetUpdateData {
  data: unknown;
}

interface DeleteAccountData {
  password: string;
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  signup: (data: AuthData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/signup', data),

  login: (data: AuthData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),

  // Pass 2 : refresh & logout côté serveur
  refresh: (refresh_token: string): Promise<AxiosResponse<AuthResponse>> =>
    rawAxios.post('/auth/refresh', { refresh_token }),

  logout: (refresh_token?: string) =>
    rawAxios.post('/auth/logout', { refresh_token: refresh_token ?? null }),

  logoutAll: () => api.post('/user/logout-all'),

  activeSessionsCount: () =>
    api.get<{ active_sessions: number }>('/user/sessions/count'),

  resendVerification: (email: string) =>
    api.post('/auth/verify/resend', { email }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),
};

// ============================================================================
// USER API — inchangé vs Pass 1
// ============================================================================

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: ProfileUpdateData) => api.put('/user/profile', data),
  changePassword: (data: PasswordChangeData) => api.post('/user/password', data),
  setupTOTP: () => api.post('/user/2fa/setup'),
  verifyTOTP: (code: string) => api.post('/user/2fa/verify', { code }),
  disableTOTP: (password: string, code: string) =>
    api.post('/user/2fa/disable', { password, code }),
  deleteAccount: (data: DeleteAccountData) =>
    api.delete('/user/account', { data }),
  exportData: () => api.get('/user/export-data'),
};

// ============================================================================
// BUDGET API — inchangé
// ============================================================================

export const budgetAPI = {
  list: () => api.get('/budgets'),
  getById: (id: string) => api.get(`/budgets/${id}`),
  create: (data: BudgetCreateData) => api.post('/budgets', data),
  update: (id: string, data: { name: string; location?: string; currency?: string }) =>
    api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  getData: (id: string) => api.get(`/budgets/${id}/data`),
  updateData: (id: string, data: BudgetUpdateData) => api.put(`/budgets/${id}/data`, data),
  invite: (id: string, email: string) => api.post(`/budgets/${id}/invite`, { email }),
  acceptInvitation: (token: string) => api.post('/invitations/accept', { token }),
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default api;
