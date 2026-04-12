import api from './authApi';

export const getMisReservaciones      = ()      => api.get('/api/reservaciones/mis-reservaciones/');
export const crearReservacion         = (data)  => api.post('/api/reservaciones/crear/', data);
export const getTiposEstancia         = ()      => api.get('/api/reservaciones/tipos-estancia/');
export const getPaquetes              = ()      => api.get('/api/reservaciones/paquetes/');
export const getHabitacionesDisponibles = (params) => api.get('/api/reservaciones/habitaciones-disponibles/', { params });

// Admin
export const getTodasReservaciones    = (params) => api.get('/api/reservaciones/todas/', { params });
export const cambiarEstadoReservacion = (id, data) => api.patch(`/api/reservaciones/${id}/estado/`, data);
