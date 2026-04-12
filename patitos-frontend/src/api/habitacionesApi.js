import api from './authApi';

// RF-24: Obtener tipos de habitación
export const getTiposHabitacion = () => api.get('/api/habitaciones/tipos/');

// Obtener estados de habitación
export const getEstadosHabitacion = () => api.get('/api/habitaciones/estados/');

// RF-19: Listar todas las habitaciones (Admin)
export const getTodasHabitaciones = (params) => api.get('/api/habitaciones/', { params });

export const getHabitacionesPersonal = () => api.get('/api/habitaciones/personal/');
export const getMisLimpiezas = () => api.get('/api/habitaciones/mis-limpiezas/');

// RF-20: Obtener detalle de una habitación
export const getHabitacion = (id) => api.get(`/api/habitaciones/${id}/`);

// RF-20: Cambiar estado de habitación
export const actualizarHabitacion = (id, data) => api.patch(`/api/habitaciones/${id}/`, data);

// RF-21: Registrar limpieza
export const registrarLimpieza = (habitacionId, data) => 
  api.post(`/api/habitaciones/${habitacionId}/limpiezas/`, data);

// RF-22: Listar limpiezas de una habitación
export const getHistorialLimpiezas = (habitacionId) => 
  api.get(`/api/habitaciones/${habitacionId}/limpiezas/`);

// RF-23: Listar mantenimientos de una habitación
export const getMantenimientos = (habitacionId, params) => 
  api.get(`/api/habitaciones/${habitacionId}/mantenimientos/`, { params });

// RF-23: Crear solicitud de mantenimiento
export const crearMantenimiento = (habitacionId, data) => 
  api.post(`/api/habitaciones/${habitacionId}/mantenimientos/`, data);
