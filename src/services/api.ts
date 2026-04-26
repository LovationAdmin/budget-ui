// src/services/api.ts
// ============================================================================
// API CLIENT — Pass 2 (refresh + smart 401) avec PRÉSERVATION COMPLÈTE
// ============================================================================
// Ce fichier reprend INTÉGRALEMENT les APIs existantes (zéro suppression) et
// ajoute les nouveautés Pass 2 :
//   - withCredentials: true   → cookies refresh envoyés au backend
//   - smart 401 interceptor   → tente UN refresh + queue les requêtes en attente
//   - authAPI.logout / logoutAll / refresh
//
// AuthResponse a été élargi pour accepter à la fois l'ancien format (`token`)
// et le format nouveau (`access_token` + `refresh_token` optionnels) afin de
// rester compatible avec d'éventuels patches déjà appliqués sur AuthContext.
// ============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Cross-origin cookies (refresh token httpOnly)
  withCredentials: true,
});

// ============================================================================
// REFRESH STATE
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

async function callRefresh(): Promise<string> {
  // Instance "naked" sans intercepteur pour éviter la récursion
  const response = await axios.post<{ access_token: string; expires_in?: number }>(
    `${API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const { access_token } = response.data;
  if (!access_token) throw new Error('Refresh response missing access_token');
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

    // Endpoints sur lesquels on NE retry PAS
    const url = originalRequest.url ?? '';
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, queue cette requête
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
// EXPORTED TYPES — PRESERVED 100% (+ AuthResponse élargi)
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  postal_code?: string;
}

/**
 * Réponse de /auth/login et /auth/signup.
 *
 * Champs supportés (tous optionnels pour permettre la migration progressive) :
 *   - `token`         : ancien format backend (Pass 1 et avant). Toujours présent.
 *   - `access_token`  : nouveau format si tu migres le backend. Optionnel.
 *   - `refresh_token` : seulement si tu choisis le mode body au lieu de cookie.
 *                       En mode cookie httpOnly (recommandé), ce champ N'EST PAS
 *                       renvoyé — laisse-le optionnel pour compat.
 *   - `expires_in`    : durée de vie en secondes (pour refresh proactif côté front).
 */
export interface AuthResponse {
  token: string;
  access_token?: string;
  refresh_token?: string;
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

  // 🆕 Pass 2 — révoque le refresh côté serveur + clear cookie
  logout: () => api.post('/auth/logout'),

  // 🆕 Pass 2 — révoque tous les refresh tokens du user (multi-device)
  logoutAll: () => api.post('/auth/logout-all'),

  // 🆕 Pass 2 — appel manuel (utilisé par AuthContext pour restore session)
  refresh: (): Promise<AxiosResponse<{ access_token: string; expires_in?: number }>> =>
    api.post('/auth/refresh'),

  resendVerification: (email: string) =>
    api.post('/auth/verify/resend', { email }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  getProfile: () => api.get('/user/profile'),

  updateProfile: (data: ProfileUpdateData) =>
    api.put('/user/profile', data),

  // ⚠️ Le backend expose POST /user/password (pas PUT). Si tu utilisais PUT
  // jusqu'ici et que ça marchait, c'est probablement parce que Gin route les
  // deux. On garde POST pour être aligné avec routes.go.
  changePassword: (data: PasswordChangeData) =>
    api.post('/user/password', data),

  deleteAccount: (data: DeleteAccountData) =>
    api.delete('/user/account', { data }),

  updateLocation: (data: LocationUpdate): Promise<AxiosResponse> =>
    api.put('/user/location', data),

  getLocation: (): Promise<AxiosResponse<UserLocation>> =>
    api.get('/user/location'),

  // 2FA
  setupTOTP: () => api.post('/user/2fa/setup'),
  verifyTOTP: (code: string) => api.post('/user/2fa/verify', { code }),
  disableTOTP: (password: string, code: string) =>
    api.post('/user/2fa/disable', { password, code }),
};

// ============================================================================
// BUDGET API — PRESERVED 100%
// ============================================================================

export const budgetAPI = {
  // CRUD
  list: () => api.get('/budgets'),
  create: (data: BudgetCreateData) => api.post('/budgets', data),
  getById: (id: string) => api.get(`/budgets/${id}`),
  update: (id: string, data: unknown) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),

  // Budget Data
  getData: (id: string) => api.get(`/budgets/${id}/data`),
  updateData: (id: string, data: BudgetUpdateData) =>
    api.put(`/budgets/${id}/data`, data),

  // Members & Invitations
  inviteMember: (id: string, email: string) =>
    api.post(`/budgets/${id}/invite`, { email }),
  getInvitations: (id: string) =>
    api.get(`/budgets/${id}/invitations`),
  cancelInvitation: (budgetId: string, invitationId: string) =>
    api.delete(`/budgets/${budgetId}/invitations/${invitationId}`),
  removeMember: (budgetId: string, memberId: string) =>
    api.delete(`/budgets/${budgetId}/members/${memberId}`),

  // Categorization (AI)
  categorize: (label: string): Promise<AxiosResponse<CategorizeResponse>> =>
    api.post('/categorize', { label }),

  // Market Suggestions — bulk (async, retour via WS)
  bulkAnalyzeSuggestions: (
    budgetId: string,
    data: BulkAnalyzeRequest,
  ): Promise<AxiosResponse<BulkAnalyzeResponse>> =>
    api.post(`/budgets/${budgetId}/suggestions/bulk-analyze`, data),

  // Market Suggestions — single charge (sync, retour direct)
  analyzeSingleCharge: (data: {
    category: string;
    merchant_name?: string;
    current_amount: number;
    household_size?: number;
    description?: string;
    budget_id?: string;
    country?: string;
    currency?: string;
  }): Promise<AxiosResponse<MarketSuggestion>> =>
    api.post('/suggestions/analyze', {
      // Mapper current_amount (front) → amount (backend)
      amount: data.current_amount,
      category: data.category,
      merchant_name: data.merchant_name,
      household_size: data.household_size,
      description: data.description,
      budget_id: data.budget_id,
      country: data.country,
      currency: data.currency,
    }),

  // Cached suggestions par catégorie
  getCategorySuggestions: (category: string): Promise<AxiosResponse<MarketSuggestion>> =>
    api.get(`/suggestions/category/${category}`),

  // GDPR Export (placé ici historiquement même si c'est une donnée user)
  exportUserData: (): Promise<AxiosResponse> =>
    api.get('/user/export-data'),

  // Acceptation d'invitation (alias pratique — l'endpoint canonique reste invitationAPI.accept)
  acceptInvitation: (token: string) =>
    api.post('/invitations/accept', { token }),
};

// ============================================================================
// INVITATION API — PRESERVED 100%
// ============================================================================

export const invitationAPI = {
  accept: (token: string) =>
    api.post('/invitations/accept', { token }),

  getByToken: (token: string) =>
    api.get(`/invitations/${token}`),

  invite: (budgetId: string, email: string) =>
    api.post(`/budgets/${budgetId}/invite`, { email }),
};

// ============================================================================
// BANKING API — PRESERVED 100%
// ============================================================================

export const bankingAPI = {
  getInstitutions: (country?: string) =>
    api.get('/banking/institutions', { params: { country } }),

  createAuthSession: (budgetId: string, institutionId: string) =>
    api.post(`/banking/budgets/${budgetId}/auth-session`, { institution_id: institutionId }),

  handleCallback: (budgetId: string, code: string, state: string) =>
    api.post(`/banking/budgets/${budgetId}/callback`, { code, state }),

  getConnections: (budgetId: string) =>
    api.get(`/banking/budgets/${budgetId}/connections`),

  deleteConnection: (budgetId: string, connectionId: string) =>
    api.delete(`/banking/budgets/${budgetId}/connections/${connectionId}`),

  getTransactions: (budgetId: string, params?: { from?: string; to?: string }) =>
    api.get(`/banking/budgets/${budgetId}/transactions`, { params }),

  getRealityCheck: (budgetId: string) =>
    api.get(`/banking/budgets/${budgetId}/reality-check`),
};

export default api;