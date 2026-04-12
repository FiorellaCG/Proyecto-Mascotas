import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisReservaciones } from '../../api/reservacionesApi';

export default function MisReservacionesPage() {
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarReservaciones();
  }, []);

  const cargarReservaciones = async () => {
    try {
      setLoading(true);
      const res = await getMisReservaciones();
      setReservaciones(res.data);
    } catch {
      setError('Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (estado) => {
    switch(estado) {
      case 'Pendiente': return { bg: '#EEEEEE', color: '#555555' };
      case 'Confirmada': return { bg: '#E8F8EF', color: '#28C76F' };
      case 'En curso': return { bg: '#E8F0FF', color: '#1E90FF' };
      case 'Cancelada': return { bg: '#FFE8E8', color: '#FF6B6B' };
      default: return { bg: '#EEEEEE', color: '#555555' };
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#F5A800', fontSize: '18px' }}>Cargando reservaciones...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#1A1A1A', margin: 0, fontWeight: 700 }}>Mis Reservaciones</h1>
        <button
          onClick={() => navigate('/mi-cuenta/reservaciones/nueva')}
          style={{
            background: '#F5A800', color: '#1A1A1A', fontWeight: 600,
            borderRadius: '8px', padding: '10px 20px', border: 'none',
            cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e69d00'}
          onMouseLeave={(e) => e.target.style.background = '#F5A800'}
        >
          ＋ Nueva reservación
        </button>
      </div>

      {error && <p style={{ color: '#FF6B6B' }}>{error}</p>}

      {reservaciones.length === 0 ? (
        <div style={{ background: '#FFFFFF', padding: '60px 40px', borderRadius: '12px', border: '1px solid #EEEEEE', textAlign: 'center' }}>
          <p style={{ color: '#555555', fontSize: '16px', margin: 0 }}>📋 No tienes reservaciones registradas</p>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE' }}>
                <th style={{ padding: '16px' }}>Mascota</th>
                <th style={{ padding: '16px' }}>Habitación</th>
                <th style={{ padding: '16px' }}>Tipo estancia</th>
                <th style={{ padding: '16px' }}>Fecha inicio</th>
                <th style={{ padding: '16px' }}>Fecha fin</th>
                <th style={{ padding: '16px' }}>Paquetes</th>
                <th style={{ padding: '16px' }}>Estado</th>
                <th style={{ padding: '16px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservaciones.map((res, idx) => {
                const bStyle = getBadgeStyle(res.estado_reservacion?.nombre);
                return (
                  <tr key={res.reservacion_id || idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                    <td style={{ padding: '16px', color: '#1A1A1A', fontWeight: 500 }}>{res.mascota_nombre}</td>
                    <td style={{ padding: '16px', color: '#555555' }}>H-{res.habitacion_numero}</td>
                    <td style={{ padding: '16px', color: '#555555' }}>
                      {res.tipo_estancia?.nombre}
                      {res.tipo_estancia?.hora_inicio && <div style={{ fontSize: '12px', color: '#888' }}>{res.tipo_estancia.hora_inicio} - {res.tipo_estancia.hora_fin}</div>}
                    </td>
                    <td style={{ padding: '16px', color: '#1A1A1A' }}>{res.fecha_inicio}</td>
                    <td style={{ padding: '16px', color: '#555555' }}>{res.es_indefinida ? 'Indefinida' : (res.fecha_fin || '-')}</td>
                    <td style={{ padding: '16px', color: '#888888', fontSize: '13px', maxWidth: '200px' }}>
                      {res.paquetes && res.paquetes.length > 0 
                        ? res.paquetes.map(p => p.paquete.nombre).join(', ') 
                        : 'Ninguno'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: bStyle.bg, color: bStyle.color, padding: '4px 12px',
                        borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block'
                      }}>{res.estado_reservacion?.nombre}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => navigate(`/mi-cuenta/reservaciones/${res.reservacion_id}`)}
                        style={{
                          background: '#F5A800', color: '#1A1A1A', border: 'none',
                          borderRadius: '8px', padding: '6px 14px', fontSize: '13px',
                          fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
