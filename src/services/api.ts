import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- EXPORTED TYPES ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Response type for AI Categorization
export interface CategorizeResponse {
    label: string;
    category: string;
}

// Internal types
interface AuthData { name?: string; email: string; password: string; }
interface ProfileUpdateData { name: string; avatar?: string; }
interface PasswordChangeData { current_password: string; new_password: string; }
interface BudgetCreateData { name: string; }
interface BudgetUpdateData { data: unknown; } 
interface DeleteAccountData { password: string; }

export interface Competitor {
  name: string;
  typical_price: number;
  best_offer: string;
  potential_savings: number;
  affiliate_link?: string;
  pros: string[];
  cons: string[];
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

export interface BulkAnalyzeRequest {
  charges: Array<{
    id: string;
    category: string;
    label: string;
    amount: number;
    merchant_name?: string;
  }>;
}

export interface BulkAnalyzeResponse {
  suggestions: Array<{
    charge_id: string;
    charge_label: string;
    suggestion: MarketSuggestion;
  }>;
  cache_hits: number;
  ai_calls_made: number;
  total_potential_savings: number;
}

export const authAPI = {
  signup: (data: AuthData): Promise<AxiosResponse<AuthResponse>> => api.post('/auth/signup', data),
  login: (data: AuthData): Promise<AxiosResponse<AuthResponse>> => api.post('/auth/login', data),
  resendVerification: (email: string) => api.post('/auth/verify/resend', { email }),
};

export const userAPI = {
  updateProfile: (data: ProfileUpdateData) => api.put('/user/profile', data),
  changePassword: (data: PasswordChangeData) => api.put('/user/password', data),
  deleteAccount: (data: DeleteAccountData) => api.delete('/user/account', { data }),
};

export const budgetAPI = {
  list: () => api.get('/budgets'),
  create: (data: BudgetCreateData) => api.post('/budgets', data),
  getById: (id: string) => api.get(`/budgets/${id}`),
  update: (id: string, data: unknown) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  getData: (id: string) => api.get(`/budgets/${id}/data`),
  updateData: (id: string, data: BudgetUpdateData) => api.put(`/budgets/${id}/data`, data),
  inviteMember: (id: string, email: string) => api.post(`/budgets/${id}/invite`, { email }),
  getInvitations: (id: string) => api.get(`/budgets/${id}/invitations`),
  cancelInvitation: (budgetId: string, invitationId: string) => api.delete(`/budgets/${budgetId}/invitations/${invitationId}`),
  removeMember: (budgetId: string, memberId: string) => api.delete(`/budgets/${budgetId}/members/${memberId}`),
  
  // NEW: AI Categorization Endpoint
  categorize: (label: string): Promise<AxiosResponse<CategorizeResponse>> => api.post('/categorize', { label }),
  // Nouvelle méthode pour l'analyse bulk
  bulkAnalyzeSuggestions: (
    budgetId: string, 
    data: BulkAnalyzeRequest
  ): Promise<AxiosResponse<BulkAnalyzeResponse>> => 
    api.post(`/budgets/${budgetId}/suggestions/bulk-analyze`, data),
  
  // Analyse d'une charge individuelle
  analyzeSingleCharge: (data: {
    category: string;
    merchant_name?: string;
    current_amount: number;
  }): Promise<AxiosResponse<MarketSuggestion>> =>
    api.post('/suggestions/analyze', data),
    
  // Récupérer suggestions en cache pour une catégorie
  getCategorySuggestions: (category: string): Promise<AxiosResponse<MarketSuggestion>> =>
    api.get(`/suggestions/category/${category}`),
};

export const invitationAPI = {
  accept: (token: string) => api.post('/invitations/accept', { token }),
  invite: (budgetId: string, email: string) => api.post(`/budgets/${budgetId}/invite`, { email }),
};

export default api;