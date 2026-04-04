import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getHabitacion,
  actualizarHabitacion,
  getEstadosHabitacion,
  getHistorialLimpiezas,
  getMantenimientos,
  registrarLimpieza,
  crearMantenimiento,
} from '../../api/habitacionesApi';

export default function HabitacionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habitacion, setHabitacion] = useState(null);
  const [estados, setEstados] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('detalle'); // detalle, limpiezas, mantenimientos
  const [showLimpiezaForm, setShowLimpiezaForm] = useState(false);
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resHab, resEstados, resLimpiezas, resMantenimientos] = await Promise.all([
        getHabitacion(id),
        getEstadosHabitacion(),
        getHistorialLimpiezas(id),
        getMantenimientos(id),
      ]);
      setHabitacion(resHab.data);
      setEstados(resEstados.data);
      setLimpiezas(resLimpiezas.data.limpiezas);
      setMantenimientos(resMantenimientos.data.mantenimientos);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstadoId) => {
    try {
      await actualizarHabitacion(id, { estado_habitacion: nuevoEstadoId });
      alert('Estado actualizado correctamente');
      cargarDatos();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleGuardarLimpieza = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await registrarLimpieza(id, {
        habitacion: parseInt(id),
        realizada_por: parseInt(formData.get('realizada_por')),
        fecha_limpieza: formData.get('fecha_limpieza'),
        hora_inicio: formData.get('hora_inicio') || null,
        hora_fin: formData.get('hora_fin') || null,
        observaciones: formData.get('observaciones'),
      });
      alert('Limpieza registrada');
      setShowLimpiezaForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar limpieza');
    }
  };

  const handleGuardarMantenimiento = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await crearMantenimiento(id, {
        tipo: formData.get('tipo'),
        descripcion: formData.get('descripcion'),
        fecha_solicitud: formData.get('fecha_solicitud'),
      });
      alert('Solicitud de mantenimiento creada');
      setShowMantenimientoForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear solicitud');
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>;
  if (!habitacion) return <div className="text-center py-8">Habitación no encontrada</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Habitación {habitacion.numero}</h1>
        <button
          onClick={() => navigate('/habitaciones')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Volver
        </button>
      </div>

      {/* Información General */}
      <div className="bg-blue-50 p-6 rounded mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Tipo:</strong> {habitacion.tipo_habitacion_info.nombre}</p>
            <p><strong>Descripción:</strong> {habitacion.descripcion || 'N/A'}</p>
            <p><strong>Capacidad:</strong> {habitacion.capacidad} mascotas</p>
          </div>
          <div>
            <p><strong>Estado:</strong> {habitacion.estado_habitacion_info.nombre}</p>
            <p><strong>Activa:</strong> {habitacion.activa ? '✅ Sí' : '❌ No'}</p>
            {habitacion.url_camara && (
              <p><strong>Cámara:</strong> <a href={habitacion.url_camara} className="text-blue-600">Ver</a></p>
            )}
          </div>
        </div>

        {/* Cambiar Estado */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Cambiar estado:</label>
          <select
            onChange={(e) => handleCambiarEstado(parseInt(e.target.value))}
            value={habitacion.estado_habitacion}
            className="border rounded px-3 py-2"
          >
            {estados.map((est) => (
              <option key={est.estado_habitacion_id} value={est.estado_habitacion_id}>
                {est.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('detalle')}
          className={`px-4 py-2 ${activeTab === 'detalle' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Detalle
        </button>
        <button
          onClick={() => setActiveTab('limpiezas')}
          className={`px-4 py-2 ${activeTab === 'limpiezas' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Limpiezas ({limpiezas.length})
        </button>
        <button
          onClick={() => setActiveTab('mantenimientos')}
          className={`px-4 py-2 ${activeTab === 'mantenimientos' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Mantenimientos ({mantenimientos.length})
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'limpiezas' && (
        <div>
          <button
            onClick={() => setShowLimpiezaForm(!showLimpiezaForm)}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {showLimpiezaForm ? 'Cancelar' : 'Registrar Limpieza'}
          </button>

          {showLimpiezaForm && (
            <form onSubmit={handleGuardarLimpieza} className="bg-gray-50 p-4 rounded mb-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="realizada_por"
                  placeholder="ID persona limpieza"
                  required
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  name="fecha_limpieza"
                  required
                  className="border rounded px-3 py-2"
                />
                <input
                  type="time"
                  name="hora_inicio"
                  className="border rounded px-3 py-2"
                />
                <input
                  type="time"
                  name="hora_fin"
                  className="border rounded px-3 py-2"
                />
              </div>
              <textarea
                name="observaciones"
                placeholder="Observaciones"
                className="w-full border rounded px-3 py-2 mt-4"
                rows="3"
              />
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Guardar Limpieza
              </button>
            </form>
          )}

          <div className="space-y-3">
            {limpiezas.length === 0 ? (
              <p className="text-gray-500">No hay registros de limpieza</p>
            ) : (
              limpiezas.map((limpieza) => (
                <div key={limpieza.limpieza_id} className="border p-4 rounded bg-gray-50">
                  <p><strong>Fecha:</strong> {limpieza.fecha_limpieza}</p>
                  <p><strong>Realizada por:</strong> {limpieza.realizada_por_nombre}</p>
                  <p><strong>Hora:</strong> {limpieza.hora_inicio} - {limpieza.hora_fin}</p>
                  {limpieza.observaciones && <p><strong>Observaciones:</strong> {limpieza.observaciones}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'mantenimientos' && (
        <div>
          <button
            onClick={() => setShowMantenimientoForm(!showMantenimientoForm)}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {showMantenimientoForm ? 'Cancelar' : 'Crear Solicitud'}
          </button>

          {showMantenimientoForm && (
            <form onSubmit={handleGuardarMantenimiento} className="bg-gray-50 p-4 rounded mb-4">
              <input
                type="text"
                name="tipo"
                placeholder="Tipo de mantenimiento"
                required
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <textarea
                name="descripcion"
                placeholder="Descripción del problema"
                required
                className="w-full border rounded px-3 py-2 mb-3"
                rows="3"
              />
              <input
                type="date"
                name="fecha_solicitud"
                required
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Crear Solicitud
              </button>
            </form>
          )}

          <div className="space-y-3">
            {mantenimientos.length === 0 ? (
              <p className="text-gray-500">No hay solicitudes de mantenimiento</p>
            ) : (
              mantenimientos.map((mant) => (
                <div key={mant.mantenimiento_id} className="border p-4 rounded bg-gray-50">
                  <p><strong>Tipo:</strong> {mant.tipo}</p>
                  <p><strong>Descripción:</strong> {mant.descripcion}</p>
                  <p><strong>Solicitado:</strong> {mant.fecha_solicitud}</p>
                  <p><strong>Estado:</strong> {mant.completado ? '✅ Completado' : '⏳ Pendiente'}</p>
                  {mant.realizado_por_nombre && <p><strong>Realizado por:</strong> {mant.realizado_por_nombre}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
