import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERCEPTORS
// ============================================================================

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
  user: User;
}

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
}

// ============================================================================
// LOCATION TYPES (NEW)
// ============================================================================

export interface LocationUpdate {
  country: string;
  postal_code?: string;
}

export interface UserLocation {
  country: string;
  postal_code?: string;
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

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

interface DeleteAccountData { 
  password: string; 
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  signup: (data: AuthData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/signup', data),
  
  login: (data: Omit<AuthData, 'name'>): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/user/profile'),
  
  updateProfile: (data: ProfileUpdateData): Promise<AxiosResponse> =>
    api.put('/user/profile', data),
  
  // ✅ NEW: Location endpoints
  updateLocation: (data: LocationUpdate): Promise<AxiosResponse> =>
    api.put('/user/location', data),
    
  getLocation: (): Promise<AxiosResponse<UserLocation>> =>
    api.get('/user/location'),
  
  changePassword: (data: PasswordChangeData): Promise<AxiosResponse> =>
    api.post('/user/change-password', data),
  
  deleteAccount: (data: DeleteAccountData): Promise<AxiosResponse> =>
    api.post('/user/delete-account', data),
};

// ============================================================================
// BUDGET API
// ============================================================================

export const budgetAPI = {
  create: (name: string, year: number): Promise<AxiosResponse> =>
    api.post('/budgets', { name, year }),
  
  getAll: (): Promise<AxiosResponse> =>
    api.get('/budgets'),
  
  getOne: (id: string): Promise<AxiosResponse> =>
    api.get(`/budgets/${id}`),
  
  getData: (id: string): Promise<AxiosResponse> =>
    api.get(`/budgets/${id}/data`),
  
  updateData: (id: string, data: any): Promise<AxiosResponse> =>
    api.put(`/budgets/${id}/data`, { data }),
  
  delete: (id: string): Promise<AxiosResponse> =>
    api.delete(`/budgets/${id}`),
  
  invite: (budgetId: string, email: string): Promise<AxiosResponse> =>
    api.post(`/budgets/${budgetId}/invite`, { email }),
  
  removeMember: (budgetId: string, userId: string): Promise<AxiosResponse> =>
    api.delete(`/budgets/${budgetId}/members/${userId}`),
  
  // AI Categorization
  categorize: (label: string): Promise<AxiosResponse<CategorizeResponse>> =>
    api.post('/categorize', { label }),
  
  // Market Suggestions
  bulkAnalyzeSuggestions: (
    budgetId: string, 
    request: BulkAnalyzeRequest
  ): Promise<AxiosResponse<BulkAnalyzeResponse>> =>
    api.post(`/budgets/${budgetId}/suggestions/bulk-analyze`, request),
  
  getCategorySuggestions: (category: string): Promise<AxiosResponse<MarketSuggestion>> =>
    api.get(`/suggestions/category/${category}`),
  
  // GDPR Export
  exportUserData: (): Promise<AxiosResponse> =>
    api.get('/user/export-data'),
};

// ============================================================================
// INVITATION API
// ============================================================================

export const invitationAPI = {
  accept: (token: string): Promise<AxiosResponse> =>
    api.post('/invitations/accept', { token }),
  
  getByToken: (token: string): Promise<AxiosResponse> =>
    api.get(`/invitations/${token}`),
};

// ============================================================================
// ENABLE BANKING API (REALITY CHECK)
// ============================================================================

export const enableBankingAPI = {
  getAuthUrl: (budgetId: string, aspspId: string): Promise<AxiosResponse> =>
    api.post('/enable-banking/auth-url', { budget_id: budgetId, aspsp_id: aspspId }),
  
  handleCallback: (code: string, state: string): Promise<AxiosResponse> =>
    api.get(`/enable-banking/callback?code=${code}&state=${state}`),
  
  saveConnection: (data: any): Promise<AxiosResponse> =>
    api.post('/enable-banking/save-connection', data),
  
  getTransactions: (
    budgetId: string, 
    source?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AxiosResponse> => {
    let url = `/banking/${budgetId}/transactions?`;
    if (source) url += `source=${source}&`;
    if (startDate) url += `start_date=${startDate}&`;
    if (endDate) url += `end_date=${endDate}`;
    return api.get(url);
  },
  
  mapTransactions: (budgetId: string, mappings: any): Promise<AxiosResponse> =>
    api.post(`/banking/${budgetId}/map-transactions`, mappings),
  
  getMappedTotals: (budgetId: string, year: number): Promise<AxiosResponse> =>
    api.get(`/banking/${budgetId}/mapped-totals?year=${year}`),
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default api;