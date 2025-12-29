import axios, { InternalAxiosRequestConfig } from 'axios';

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
  country?: string;
  postal_code?: string;
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

// ============================================================================
// MARKET SUGGESTIONS TYPES
// ============================================================================

export interface Competitor {
  name: string;
  typical_price: number;
  best_offer: string;
  potential_savings: number;
  affiliate_link?: string;
  pros: string[];
  cons: string[];
  contact_available: boolean;
  phone_number?: string;
  contact_email?: string;
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
}

export interface BulkAnalyzeResponse {
  suggestions: ChargeSuggestion[];
  cache_hits: number;
  ai_calls_made: number;
  total_potential_savings: number;
  household_size: number; // NEW: Number of people in the household
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

export interface LocationUpdate {
  country: string;
  postal_code?: string;
}

export interface UserLocation {
  country: string;
  postal_code?: string;
}

// Internal types
interface AuthData { 
  name?: string; 
  email: string; 
  password: string; 
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
}

interface BudgetUpdateData { 
  name?: string; 
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  register: (data: AuthData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: Omit<AuthData, 'name'>) => api.post<AuthResponse>('/auth/login', data),
  getProfile: () => api.get<User>('/auth/me'),
  updateProfile: (data: ProfileUpdateData) => api.put<User>('/auth/profile', data),
  changePassword: (data: PasswordChangeData) => api.put('/auth/password', data),
  
  // 2FA Methods
  setup2FA: () => api.post<{ secret: string; qr_code: string }>('/auth/2fa/setup'),
  verify2FA: (code: string) => api.post('/auth/2fa/verify', { code }),
  disable2FA: (code: string) => api.post('/auth/2fa/disable', { code }),
  login2FA: (userId: string, code: string) => api.post<AuthResponse>('/auth/2fa/login', { user_id: userId, code }),
  
  // Location
  updateLocation: (data: LocationUpdate) => api.put<User>('/auth/location', data),
  getLocation: () => api.get<UserLocation>('/auth/location'),
  
  // Account
  deleteAccount: () => api.delete('/auth/account'),
};

// ============================================================================
// BUDGET API
// ============================================================================

export const budgetAPI = {
  // CRUD
  getAll: () => api.get('/budgets'),
  getById: (id: string) => api.get(`/budgets/${id}`),
  create: (data: BudgetCreateData) => api.post('/budgets', data),
  update: (id: string, data: BudgetUpdateData) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  
  // Budget Data
  getData: (id: string) => api.get(`/budgets/${id}/data`),
  updateData: (id: string, data: any) => api.put(`/budgets/${id}/data`, data),
  
  // Members
  getMembers: (id: string) => api.get(`/budgets/${id}/members`),
  invite: (id: string, email: string) => api.post(`/budgets/${id}/invite`, { email }),
  removeMember: (budgetId: string, memberId: string) => api.delete(`/budgets/${budgetId}/members/${memberId}`),
  acceptInvitation: (token: string) => api.post(`/budgets/accept-invite/${token}`),
  
  // Suggestions API
  bulkAnalyzeSuggestions: (budgetId: string, data: BulkAnalyzeRequest) => 
    api.post<BulkAnalyzeResponse>(`/budgets/${budgetId}/suggestions/bulk-analyze`, data),
  
  getCategorySuggestions: (category: string) => 
    api.get<MarketSuggestion>(`/suggestions/category/${category}`),
};

// ============================================================================
// CATEGORIZATION API
// ============================================================================

export const categorizationAPI = {
  categorize: (label: string) => api.post<CategorizeResponse>('/categorize', { label }),
};

// ============================================================================
// BANKING API
// ============================================================================

export const bankingAPI = {
  // Enable Banking
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