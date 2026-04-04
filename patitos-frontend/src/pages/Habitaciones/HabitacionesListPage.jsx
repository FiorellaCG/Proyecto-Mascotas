import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodasHabitaciones, getEstadosHabitacion } from '../../api/habitacionesApi';

export default function HabitacionesListPage() {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [estados, setEstados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar estados
      const resEstados = await getEstadosHabitacion();
      setEstados(resEstados.data);

      // Cargar habitaciones
      const params = filtroEstado ? { estado_id: filtroEstado } : {};
      const resHabitaciones = await getTodasHabitaciones(params);
      setHabitaciones(resHabitaciones.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Habitaciones</h1>

      {/* Filtro por estado */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filtrar por estado:</label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos los estados</option>
          {estados.map((est) => (
            <option key={est.estado_habitacion_id} value={est.estado_habitacion_id}>
              {est.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de habitaciones */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="border p-3 text-left">Número</th>
              <th className="border p-3 text-left">Tipo</th>
              <th className="border p-3 text-left">Estado</th>
              <th className="border p-3 text-left">Capacidad</th>
              <th className="border p-3 text-left">Activa</th>
              <th className="border p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((hab) => (
              <tr key={hab.habitacion_id} className="hover:bg-gray-100">
                <td className="border p-3 font-semibold">{hab.numero}</td>
                <td className="border p-3">{hab.tipo_habitacion_nombre}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded text-white text-sm ${
                    hab.estado_habitacion_nombre === 'Disponible' ? 'bg-green-500' :
                    hab.estado_habitacion_nombre === 'Reservada' ? 'bg-yellow-500' :
                    hab.estado_habitacion_nombre === 'En mantenimiento' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}>
                    {hab.estado_habitacion_nombre}
                  </span>
                </td>
                <td className="border p-3 text-center">{hab.capacidad}</td>
                <td className="border p-3 text-center">
                  {hab.activa ? '✅' : '❌'}
                </td>
                <td className="border p-3 text-center">
                  <button
                    onClick={() => navigate(`/habitaciones/${hab.habitacion_id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {habitaciones.length === 0 && (
        <div className="text-center mt-8 text-gray-500">
          No hay habitaciones para mostrar
        </div>
      )}
    </div>
  );
}
