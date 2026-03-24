import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

export const loginApi  = (correo, password) => api.post('/api/auth/login/', { correo, password });
export const logoutApi = ()                 => api.post('/api/auth/logout/');
export const getMeApi  = ()                 => api.get('/api/auth/me/');

export default api;
