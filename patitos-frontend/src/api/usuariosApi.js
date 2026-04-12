import api from './authApi';

export const getUsuarios  = ()     => api.get('/api/auth/admin/listar/');
export const crearUsuario = (data) => api.post('/api/auth/admin/crear/', data);
export const getRoles     = ()     => api.get('/api/auth/admin/roles/');
