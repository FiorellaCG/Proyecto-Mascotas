import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodasReservaciones, cambiarEstadoReservacion } from '../../api/reservacionesApi';

export default function ReservacionesAdminPage() {
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    cargarReservaciones();
  }, [filtroEstado, filtroDesde, filtroHasta]);

  const cargarReservaciones = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado !== 'Todos') params.estado = filtroEstado;
      if (filtroDesde) params.fecha_inicio = filtroDesde;
      
      const res = await getTodasReservaciones(params);
      let data = res.data;
      if (filtroHasta) {
        data = data.filter(r => r.fecha_inicio <= filtroHasta);
      }
      setReservaciones(data);
    } catch (err) {
      setError('Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCambiarEstado = async (id, estadoId) => {
    if (!estadoId) return;
    try {
      const res = await cambiarEstadoReservacion(id, { estado_reservacion_id: parseInt(estadoId) });
      showToast('✅ Estado actualizado con éxito');
      setReservaciones(prev => prev.map(r => r.reservacion_id === id ? res.data : r));
    } catch (err) {
      showToast('❌ Error al actualizar estado', true);
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

  const inputStyle = {
    padding: '8px 12px', border: '1px solid #DDDDDD', borderRadius: '8px', outline: 'none'
  };

  return (
    <div style={{ padding: '40px', fontFamily: '"Inter", sans-serif', maxWidth: '1200px', margin: '0 auto', marginLeft: '250px' }}>
      
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.isError ? '#FF6B6B' : '#28C76F', color: '#FFF',
          padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#1A1A1A', margin: 0, fontWeight: 700 }}>
          Gestión de Reservaciones
          <span style={{ fontSize: '16px', color: '#888', fontWeight: 500, marginLeft: '12px' }}>({reservaciones.length} registradas)</span>
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={inputStyle}>
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="En curso">En curso</option>
          <option value="Cancelada">Cancelada</option>
        </select>
        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} style={inputStyle} title="Desde" />
        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} style={inputStyle} title="Hasta" />
        <button 
          onClick={() => { setFiltroEstado('Todos'); setFiltroDesde(''); setFiltroHasta(''); }}
          style={{ padding: '8px 16px', background: '#EEEEEE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#555' }}
        >
          Limpiar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#F5A800' }}>Cargando datos...</div>
      ) : error ? (
        <div style={{ color: '#FF6B6B' }}>{error}</div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE' }}>
                <th style={{ padding: '16px' }}>#</th>
                <th style={{ padding: '16px' }}>Mascota</th>
                <th style={{ padding: '16px' }}>Habitación</th>
                <th style={{ padding: '16px' }}>Estancia</th>
                <th style={{ padding: '16px' }}>Fechas</th>
                <th style={{ padding: '16px' }}>Paquetes</th>
                <th style={{ padding: '16px' }}>Estado</th>
                <th style={{ padding: '16px', minWidth: '220px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservaciones.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#555' }}>No hay reservaciones encontradas</td></tr>
              ) : (
                reservaciones.map((res, idx) => {
                  const bStyle = getBadgeStyle(res.estado_reservacion?.nombre);
                  return (
                    <tr key={res.reservacion_id || idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                      <td style={{ padding: '16px', color: '#555' }}>{res.reservacion_id}</td>
                      <td style={{ padding: '16px', color: '#1A1A1A', fontWeight: 500 }}>{res.mascota_nombre}</td>
                      <td style={{ padding: '16px', color: '#555' }}>H-{res.habitacion_numero}</td>
                      <td style={{ padding: '16px', color: '#555' }}>{res.tipo_estancia?.nombre}</td>
                      <td style={{ padding: '16px', color: '#1A1A1A' }}>
                        {res.fecha_inicio} <br/><span style={{color: '#888', fontSize: '12px'}}>h/ {res.es_indefinida ? 'Indefinida' : (res.fecha_fin || '-')}</span>
                      </td>
                      <td style={{ padding: '16px', color: '#888', fontSize: '12px' }}>
                        {res.paquetes && res.paquetes.length > 0 ? res.paquetes.map(p => p.paquete.nombre).join(', ') : 'Ninguno'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: bStyle.bg, color: bStyle.color, padding: '4px 12px',
                          borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block'
                        }}>{res.estado_reservacion?.nombre}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          style={{ ...inputStyle, padding: '6px', fontSize: '13px', marginRight: '8px', cursor: 'pointer' }}
                          onChange={(e) => {
                            e.target.nextSibling.dataset.val = e.target.value;
                          }}
                        >
                          <option value="">Cambiar a...</option>
                          <option value="1">Pendiente</option>
                          <option value="2">Confirmada</option>
                          <option value="3">En curso</option>
                          <option value="4">Cancelada</option>
                        </select>
                        <button
                          onClick={(e) => handleCambiarEstado(res.reservacion_id, e.target.dataset.val)}
                          style={{
                            background: '#F5A800', color: '#1A1A1A', fontWeight: 600,
                            borderRadius: '6px', padding: '6px 12px', border: 'none',
                            cursor: 'pointer', fontSize: '12px'
                          }}
                        >
                          Guardar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
