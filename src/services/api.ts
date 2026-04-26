// src/services/api.ts
// ============================================================================
// API CLIENT — Pass 2 (refresh token + smart 401 interceptor)
// ============================================================================
// Changements par rapport à la version précédente :
//   1. `withCredentials: true` → les cookies (refresh) sont envoyés
//      automatiquement aux endpoints /auth/refresh et /auth/logout.
//   2. Intercepteur 401 intelligent :
//      - Tente UN refresh avant de rediriger vers /login
//      - Queue les requêtes concurrentes pendant le refresh
//      - Retry les requêtes en échec avec le nouveau token
//      - En cas d'échec du refresh : clear localStorage + redirect /login
//   3. Tous les types et exports existants sont **préservés à 100%**.
// ============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Cross-origin cookies : le backend a déjà AllowCredentials=true + allowlist
  withCredentials: true,
});

// ============================================================================
// REFRESH STATE — singleton module-level
// ============================================================================

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}

let isRefreshing = false;
let pendingQueue: QueueItem[] = [];

function flushQueue(token: string | null, error: unknown = null) {
  pendingQueue.forEach((item) => {
    if (token) item.resolve(token);
    else item.reject(error);
  });
  pendingQueue = [];
}

/**
 * Appelle /auth/refresh. Le cookie refresh est envoyé automatiquement.
 * On utilise une instance axios "naked" (sans intercepteur) pour éviter
 * la récursion infinie sur les 401.
 */
async function callRefresh(): Promise<string> {
  const response = await axios.post<{ access_token: string; expires_in?: number }>(
    `${API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const { access_token } = response.data;
  if (!access_token) {
    throw new Error('Refresh response missing access_token');
  }
  return access_token;
}

function forceLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}`;
  }
}

// ============================================================================
// INTERCEPTORS
// ============================================================================

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Endpoints à NE PAS retry :
    // - /auth/login : 401 = mauvais credentials, pas un token expiré
    // - /auth/refresh : récursion infinie
    // - /auth/logout : déjà en train de se déconnecter
    const url = originalRequest.url ?? '';
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, mettre en file d'attente
    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (!newToken) throw error;
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await callRefresh();
      localStorage.setItem('token', newToken);
      flushQueue(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(null, refreshError);
      forceLogout();
      return Promise.reject(refreshError);
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
  token: string;
  expires_in?: number;
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

  // 🆕 Pass 2
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  refresh: (): Promise<AxiosResponse<{ access_token: string; expires_in?: number }>> =>
    api.post('/auth/refresh'),

  resendVerification: (email: string) => api.post('/auth/verify/resend', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: ProfileUpdateData) => api.put('/user/profile', data),
  changePassword: (data: PasswordChangeData) => api.post('/user/password', data),
  deleteAccount: (data: DeleteAccountData) => api.delete('/user/account', { data }),
  exportData: () => api.get('/user/export-data'),

  setupTOTP: () => api.post('/user/2fa/setup'),
  verifyTOTP: (code: string) => api.post('/user/2fa/verify', { code }),
  disableTOTP: (password: string, code: string) =>
    api.post('/user/2fa/disable', { password, code }),
};

// ============================================================================
// BUDGET API
// ============================================================================

export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getById: (id: string) => api.get(`/budgets/${id}`),
  create: (data: BudgetCreateData) => api.post('/budgets', data),
  update: (id: string, data: BudgetCreateData) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  getData: (id: string) => api.get(`/budgets/${id}/data`),
  updateData: (id: string, data: BudgetUpdateData) => api.put(`/budgets/${id}/data`, data),
  invite: (id: string, email: string) => api.post(`/budgets/${id}/invite`, { email }),
  acceptInvitation: (token: string) => api.post('/invitations/accept', { token }),
};

export default api;
