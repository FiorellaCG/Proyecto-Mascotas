import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHabitacionesPersonal, getMisLimpiezas } from '../../api/habitacionesApi';

export default function MisLimpiezasPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHabitaciones, resLimpiezas] = await Promise.all([
          getHabitacionesPersonal(),
          getMisLimpiezas()
        ]);
        setHabitaciones(resHabitaciones.data);
        setLimpiezas(resLimpiezas.data);
      } catch (error) {
        console.error('Error cargando datos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getColorStyles = (estadoNombre) => {
    switch (estadoNombre) {
      case 'Disponible':
        return { bgPill: '#E8F8EF', text: '#28C76F' };
      case 'Reservada':
        return { bgPill: '#E8F0FF', text: '#1E90FF' };
      case 'En mantenimiento':
        return { bgPill: '#FFF3E0', text: '#FF9800' };
      case 'Cerrada':
      default:
        return { bgPill: '#FFE8E8', text: '#FF6B6B' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px 0' }}>
            Mi Panel — Limpiezas
          </h1>
          <p style={{ margin: 0, color: '#555555', fontSize: '15px' }}>
            Bienvenido, {usuario?.nombre || 'Usuario'}
          </p>
        </div>
        <button
          onClick={() => navigate('/personal/limpiezas/nueva')}
          style={{
            background: '#F5A800',
            color: '#1A1A1A',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '12px 24px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e69d00'}
          onMouseLeave={(e) => e.target.style.background = '#F5A800'}
        >
          ＋ Registrar nueva limpieza
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#555555' }}>Cargando panel...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* TABLA 1: Limpiezas */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px' }}>Mis Limpiezas Registradas</h2>
            <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE', color: '#1A1A1A' }}>
                    <th style={{ padding: '16px' }}>Habitación</th>
                    <th style={{ padding: '16px' }}>Fecha</th>
                    <th style={{ padding: '16px' }}>Hora inicio</th>
                    <th style={{ padding: '16px' }}>Hora fin</th>
                    <th style={{ padding: '16px' }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {limpiezas.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#555555' }}>
                        No has registrado limpiezas aún.
                      </td>
                    </tr>
                  ) : (
                    limpiezas.map((limp, idx) => (
                      <tr key={limp.limpieza_id || idx} style={{ borderBottom: '1px solid #F0F0F0' }}>
                        <td style={{ padding: '12px 16px', color: '#1A1A1A', fontWeight: 500 }}>{limp.habitacion_numero || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#555555' }}>{limp.fecha_limpieza}</td>
                        <td style={{ padding: '12px 16px', color: '#555555' }}>{limp.hora_inicio || '--:--'}</td>
                        <td style={{ padding: '12px 16px', color: '#555555' }}>{limp.hora_fin || '--:--'}</td>
                        <td style={{ padding: '12px 16px', color: '#555555' }}>{limp.observaciones || '---'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA 2: Habitaciones */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px' }}>Estado de Habitaciones</h2>
            <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE', color: '#1A1A1A' }}>
                    <th style={{ padding: '16px' }}>Número</th>
                    <th style={{ padding: '16px' }}>Tipo</th>
                    <th style={{ padding: '16px' }}>Estado</th>
                    <th style={{ padding: '16px' }}>Capacidad</th>
                  </tr>
                </thead>
                <tbody>
                  {habitaciones.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#555555' }}>
                        No hay habitaciones activas registradas.
                      </td>
                    </tr>
                  ) : (
                    habitaciones.map((hab, idx) => {
                      const tipo = hab.tipo_habitacion_nombre;
                      const estado = hab.estado_habitacion_nombre;
                      const badgeStyle = getColorStyles(estado);
                      
                      return (
                        <tr key={hab.habitacion_id || idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                          <td style={{ padding: '16px', color: '#1A1A1A', fontWeight: 500 }}>{hab.numero || `H-${hab.habitacion_id}`}</td>
                          <td style={{ padding: '16px', color: '#555555' }}>{tipo}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              background: badgeStyle.bgPill,
                              color: badgeStyle.text,
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {estado}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#555555' }}>{hab.capacidad}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
