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
  setEmergencyContact: (data) => api.put('/auth/emergency-contact', data),
};

export const cityAPI = {
  list: () => api.get('/cities'),
};

export const vehicleAPI = {
  list: (params) => api.get('/vehicles', { params }),
  get: (id) => api.get(`/vehicles/${id}`),
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
  sos: (id, coords) => api.put(`/trips/${id}/sos`, coords),
  shared: (token) => api.get(`/trips/share/${token}`),
  estimate: (params) => api.get('/trips/estimate', { params }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
};

export const complaintAPI = {
  file: (data) => api.post('/complaints', data),
  mine: () => api.get('/complaints/mine'),
  // admin
  all: (status) => api.get('/admin/complaints', { params: { status } }),
  update: (id, data) => api.put(`/admin/complaints/${id}`, data),
};

export const uploadAPI = {
  // file: a File object from an <input type="file">
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const driverAPI = {
  setOnline: (isOnline) => api.put('/drivers/online', { isOnline }),
  submitDocuments: (data) => api.put('/drivers/documents', data),
  reviews: (id) => api.get(`/drivers/${id}/reviews`),
};

export const pushAPI = {
  publicKey: () => api.get('/push/public-key'),
  subscribe: (subscription) => api.post('/push/subscribe', subscription),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  drivers: (status) => api.get('/admin/drivers', { params: { status } }),
  riders: () => api.get('/admin/riders'),
  setDriverStatus: (id, status) => api.put(`/admin/drivers/${id}/status`, { status }),
  setSuspension: (id, isSuspended) => api.put(`/admin/users/${id}/suspension`, { isSuspended }),
  vehicles: (status) => api.get('/admin/vehicles', { params: { status } }),
  setVehicleStatus: (id, status) => api.put(`/admin/vehicles/${id}/status`, { status }),
  getSettings: () => api.get('/admin/settings'),
  // Accepts { commissionPercent } and/or { fareGuide }
  updateSettings: (data) =>
    api.put('/admin/settings', typeof data === 'number' ? { commissionPercent: data } : data),
};

export default api;
