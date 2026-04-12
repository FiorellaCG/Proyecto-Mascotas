import api from './authApi';

export const getEspecialistas  = ()     => api.get('/api/especialistas/');
export const crearEspecialista = (data) => api.post('/api/especialistas/crear/', data);
export const getTurnos         = ()     => api.get('/api/especialistas/turnos/');
