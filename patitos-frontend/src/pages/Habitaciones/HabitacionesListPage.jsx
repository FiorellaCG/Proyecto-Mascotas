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

  const getColorStyles = (estado) => {
    switch (estado) {
      case 'Disponible':
        return { bgPill: '#E8F8EF', border: '#28C76F', text: '#28C76F' };
      case 'Reservada':
        return { bgPill: '#E8F0FF', border: '#1E90FF', text: '#1E90FF' };
      case 'En mantenimiento':
        return { bgPill: '#FFF3E0', border: '#FF9800', text: '#FF9800' };
      case 'Cerrada':
      default:
        return { bgPill: '#FFE8E8', border: '#FF6B6B', text: '#FF6B6B' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      {/* Header layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          Gestión de Habitaciones
        </h1>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ border: '1px solid #DDDDDD', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
        >
          <option value="">Todos los estados</option>
          {estados.map((est) => (
            <option key={est.estado_habitacion_id} value={est.estado_habitacion_id}>
              {est.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #EEEEEE', overflow: 'hidden', marginTop: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#F8F8F8' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A' }}>Número</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A' }}>Tipo</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A' }}>Estado</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A' }}>Capacidad</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A' }}>Cámara</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#555555' }}>
                  No hay habitaciones para mostrar
                </td>
              </tr>
            ) : (
              habitaciones.map((hab) => {
                const styles = getColorStyles(hab.estado_habitacion_nombre);
                return (
                  <tr 
                    key={hab.habitacion_id} 
                    style={{ borderBottom: '1px solid #F0F0F0', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1A1A1A' }}>{hab.numero}</td>
                    <td style={{ padding: '14px 16px', color: '#555555' }}>{hab.tipo_habitacion_nombre}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: styles.bgPill,
                        color: styles.text,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        {hab.estado_habitacion_nombre}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#555555' }}>{hab.capacidad}</td>
                    <td style={{ padding: '14px 16px', color: '#555555' }}>
                      {hab.tiene_camara ? '📷' : <span style={{ color: '#CCCCCC' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => navigate(`/admin/habitaciones/${hab.habitacion_id}`)}
                        style={{
                          background: '#F5A800',
                          color: '#1A1A1A',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          cursor: 'pointer'
                        }}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
