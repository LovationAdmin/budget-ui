// src/services/api.ts

import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le Token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour gérer le 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types pour les fonctions API
interface AuthData { name?: string; email: string; password: string; }
interface ProfileUpdateData { name: string; }
interface PasswordChangeData { current_password: string; new_password: string; }
interface BudgetCreateData { name: string; }
interface BudgetUpdateData { data: unknown; } 

export const authAPI = {
  signup: (data: AuthData) => api.post('/auth/signup', data),
  login: (data: AuthData) => api.post('/auth/login', data),
};

export const userAPI = {
  updateProfile: (data: ProfileUpdateData) => api.put('/user/profile', data),
  changePassword: (data: PasswordChangeData) => api.put('/user/password', data),
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
};

export const invitationAPI = {
  accept: (token: string) => api.post('/invitations/accept', { token }),
  invite: (budgetId: string, email: string) => api.post(`/budgets/${budgetId}/invite`, { email }),
};

export default api;
