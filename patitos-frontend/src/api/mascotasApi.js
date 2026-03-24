import api from './authApi';

export const getMisMascotas        = ()            => api.get('/api/mascotas/mis-mascotas/');
export const getMascota            = (id)          => api.get(`/api/mascotas/${id}/`);
export const registrarMascota      = (data)        => api.post('/api/mascotas/registrar/', data);
export const getNiveles            = ()            => api.get('/api/mascotas/niveles-asistencia/');
export const getTiposCuidado       = ()            => api.get('/api/mascotas/tipos-cuidado/');
export const getMascotasPendientes = ()            => api.get('/api/mascotas/pendientes/');
export const getTodasMascotas      = (params)      => api.get('/api/mascotas/todas/', { params });
export const aprobarMascota        = (id, aprobar) => api.patch(`/api/mascotas/${id}/aprobar/`, { aprobar });
