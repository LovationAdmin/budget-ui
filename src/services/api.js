import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
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

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/password', data),
};

export const budgetAPI = {
  list: () => api.get('/budgets'),
  create: (data) => api.post('/budgets', data),
  getById: (id) => api.get(`/budgets/${id}`),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getData: (id) => api.get(`/budgets/${id}/data`),
  updateData: (id, data) => api.put(`/budgets/${id}/data`, data),
  inviteMember: (id, email) => api.post(`/budgets/${id}/invite`, { email }),
  getInvitations: (id) => api.get(`/budgets/${id}/invitations`),
  cancelInvitation: (budgetId, invitationId) => api.delete(`/budgets/${budgetId}/invitations/${invitationId}`),
  removeMember: (budgetId, memberId) => api.delete(`/budgets/${budgetId}/members/${memberId}`),
};

export const invitationAPI = {
  accept: (token) => api.post('/invitations/accept', { token }),
  invite: (budgetId, email) => api.post(`/budgets/${budgetId}/invite`, { email }),
};

export default api;