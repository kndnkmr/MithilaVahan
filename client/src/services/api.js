// Central Axios instance + grouped API calls.

import axios from 'axios';

// In dev, Vite proxies /api to :5000. In production set VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// Attach the JWT (if any) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const cityAPI = {
  list: () => api.get('/cities'),
};

export const vehicleAPI = {
  list: (params) => api.get('/vehicles', { params }),
  mine: () => api.get('/vehicles/mine'),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
};

export const tripAPI = {
  request: (data) => api.post('/trips', data),
  mine: () => api.get('/trips/mine'),
  available: () => api.get('/trips/available'),
  accept: (id, data) => api.put(`/trips/${id}/accept`, data),
  updateStatus: (id, data) => api.put(`/trips/${id}/status`, data),
  cancel: (id, data) => api.put(`/trips/${id}/cancel`, data),
  rate: (id, data) => api.put(`/trips/${id}/rate`, data),
  claimPaid: (id) => api.put(`/trips/${id}/claim-paid`),
  confirmPayment: (id) => api.put(`/trips/${id}/confirm-payment`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
};

export const driverAPI = {
  setOnline: (isOnline) => api.put('/drivers/online', { isOnline }),
  submitDocuments: (data) => api.put('/drivers/documents', data),
};

export const pushAPI = {
  publicKey: () => api.get('/push/public-key'),
  subscribe: (subscription) => api.post('/push/subscribe', subscription),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  drivers: (status) => api.get('/admin/drivers', { params: { status } }),
  setDriverStatus: (id, status) => api.put(`/admin/drivers/${id}/status`, { status }),
  vehicles: (status) => api.get('/admin/vehicles', { params: { status } }),
  setVehicleStatus: (id, status) => api.put(`/admin/vehicles/${id}/status`, { status }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (commissionPercent) => api.put('/admin/settings', { commissionPercent }),
};

export default api;
