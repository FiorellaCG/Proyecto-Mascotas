import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMisReservaciones } from '../../api/reservacionesApi';

export default function DetalleReservacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservacion, setReservacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarReserva();
  }, [id]);

  const cargarReserva = async () => {
    try {
      setLoading(true);
      const res = await getMisReservaciones();
      // filter by id
      const found = res.data.find(r => r.reservacion_id.toString() === id);
      if (found) {
        setReservacion(found);
      } else {
        setError("Reservación no encontrada.");
      }
    } catch (err) {
      setError("Error al cargar la reservación.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#F5A800', fontSize: '18px' }}>Cargando reservación...</div>;
  if (error) return <div style={{ color: '#FF6B6B', padding: '40px', textAlign: 'center' }}>Error: {error}</div>;
  if (!reservacion) return null;

  const getColorStyles = (estado) => {
    switch (estado) {
      case 'Aprobada': case 'Confirmada': case 'Finalizada': return { bg: '#E8F8EF', text: '#28C76F' };
      case 'En curso': return { bg: '#E8F0FF', text: '#1E90FF' };
      case 'Pendiente': return { bg: '#FFF3E0', text: '#FF9800' };
      case 'Rechazada': case 'Cancelada': default: return { bg: '#FFE8E8', text: '#FF6B6B' };
    }
  };

  const statusStyle = getColorStyles(reservacion.estado_reservacion?.nombre);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', marginBottom: '24px' }}>
        Detalle de la Reservación #{reservacion.reservacion_id}
      </h1>

      <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700, color: '#1A1A1A', borderBottom: '1px solid #EEEEEE', paddingBottom: '12px' }}>
          📄 Datos de la reservación
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Mascota</strong>
              <span style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>{reservacion.mascota_nombre}</span>
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Habitación</strong>
              <span style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>H-{reservacion.habitacion_numero}</span>
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Tipo de estancia</strong>
              <span style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>{reservacion.tipo_estancia?.nombre}</span>
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Estado</strong>
              <span style={{
                background: statusStyle.bg,
                color: statusStyle.text,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-block'
              }}>
                {reservacion.estado_reservacion?.nombre}
              </span>
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Fecha de inicio</strong>
              <span style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>{reservacion.fecha_inicio}</span>
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Fecha de fin</strong>
              <span style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>{reservacion.es_indefinida ? 'Indefinida' : reservacion.fecha_fin}</span>
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Observaciones</strong>
              <span style={{ fontSize: '14px', color: '#1A1A1A' }}>{reservacion.observaciones || 'Ninguna'}</span>
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px', fontSize: '13px' }}>Paquetes contratados</strong>
              {reservacion.paquetes && reservacion.paquetes.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px', color: '#1A1A1A' }}>
                  {reservacion.paquetes.map(p => (
                    <li key={p.reservacion_paquete_id}>{p.paquete?.nombre}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '14px', color: '#555' }}>Sin paquetes adicionales</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {reservacion.url_camara &&
       ['Confirmada', 'En curso'].includes(reservacion.estado_reservacion?.nombre) && (
        <div style={{
          background:'#FFFFFF', border:'1px solid #EEEEEE',
          borderRadius:'12px', padding:'24px', marginTop:'24px'
        }}>
          <h3 style={{ margin:'0 0 8px 0', fontSize:'18px', fontWeight:700, color:'#1A1A1A' }}>
            📷 Cámara en vivo
          </h3>
          <p style={{ color:'#555555', fontSize:'14px', margin:'0 0 16px 0' }}>
            Tu mascota está siendo monitoreada en tiempo real.
            Haz click para ver la transmisión en vivo.
          </p>
          <a
            href={reservacion.url_camara}
            target="_blank"
            rel="noreferrer"
            style={{
              display:'inline-block',
              background:'#F5A800', color:'#1A1A1A',
              fontWeight:600, borderRadius:'8px',
              padding:'12px 24px', textDecoration:'none',
              fontSize:'15px'
            }}
          >
            📹 Ver cámara en vivo →
          </a>
          <p style={{ color:'#AAAAAA', fontSize:'12px', marginTop:'12px' }}>
            Se abrirá Google Meet en una nueva pestaña.
            Se requiere cuenta de Google para acceder.
          </p>
        </div>
      )}

      {reservacion.url_camara &&
       !['Confirmada', 'En curso'].includes(reservacion.estado_reservacion?.nombre) && (
        <div style={{
          background:'#F8F8F8', border:'1px solid #EEEEEE',
          borderRadius:'12px', padding:'24px', marginTop:'24px',
          textAlign:'center', color:'#555555'
        }}>
          📷 La cámara estará disponible cuando tu reservación sea confirmada.
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
        <button
          onClick={() => navigate('/mi-cuenta/reservaciones')}
          style={{
            border: '1px solid #DDDDDD',
            background: 'transparent',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 600,
            color: '#1A1A1A',
            cursor: 'pointer',
            transition: 'background 0.2s',
            fontSize: '15px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#FAFAFA'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          ← Volver a mis reservaciones
        </button>
      </div>

    </div>
  );
}
