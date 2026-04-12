import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getHabitacion,
  actualizarHabitacion,
  getEstadosHabitacion,
  getHistorialLimpiezas,
  getMantenimientos,
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
  
  // States for 'Cambiar estado'
  const [nuevoEstadoId, setNuevoEstadoId] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState(null); // { tipo: 'success' | 'error', text: '' }

  // States for 'Mantenimientos'
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
      if (resHab.data?.estado_habitacion) {
        setNuevoEstadoId(resHab.data.estado_habitacion);
      }
      setEstados(resEstados.data);
      setLimpiezas(resLimpiezas.data.limpiezas || []);
      setMantenimientos(resMantenimientos.data.mantenimientos || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos de la habitación');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCambioEstado = async () => {
    setMensajeEstado(null);
    try {
      if (!nuevoEstadoId) return;
      await actualizarHabitacion(id, { estado_habitacion: parseInt(nuevoEstadoId) });
      setMensajeEstado({ tipo: 'success', text: 'Estado actualizado' });
      // Recargar datos para actualizar la card y badge del encabezado
      cargarDatos();
    } catch (err) {
      setMensajeEstado({ tipo: 'error', text: 'Error al actualizar el estado' });
    }
  };

  const handleGuardarMantenimiento = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await crearMantenimiento(id, {
        habitacion: parseInt(id),
        tipo: formData.get('tipo'),
        descripcion: formData.get('descripcion'),
        fecha_solicitud: formData.get('fecha_solicitud'),
      });
      // Si 201: recarga lista y cierra formulario
      setShowMantenimientoForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear solicitud de mantenimiento');
    }
  };

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

  const inputStyle = {
    border: '1px solid #DDDDDD',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#F5A800', fontSize: '18px' }}>Cargando habitación...</div>;
  if (error) return <div style={{ color: '#FF6B6B', padding: '40px', textAlign: 'center' }}>Error: {error}</div>;
  if (!habitacion) return <div style={{ textAlign: 'center', padding: '40px' }}>Habitación no encontrada</div>;

  const badgeStyle = habitacion.estado_habitacion_info 
    ? getColorStyles(habitacion.estado_habitacion_info.nombre) 
    : { bgPill: '#EEEEEE', text: '#555555' };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Encabezado */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Habitación {habitacion.numero || `H-${id.padStart(2, '0')}`}
          </h1>
          {habitacion.estado_habitacion_info && (
            <span style={{
              background: badgeStyle.bgPill,
              color: badgeStyle.text,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {habitacion.estado_habitacion_info.nombre}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/admin/habitaciones')}
          style={{
            border: '1px solid #DDDDDD',
            background: 'transparent',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: 600,
            color: '#1A1A1A',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#F8F8F8'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          ← Volver
        </button>
      </div>

      {/* Pestañas */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', marginBottom: '24px', gap: '32px' }}>
        <button
          onClick={() => setActiveTab('detalle')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'detalle' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'detalle' ? 600 : 400,
            color: activeTab === 'detalle' ? '#1A1A1A' : '#555555',
            transition: 'all 0.2s'
          }}
        >
          Información general
        </button>
        <button
          onClick={() => setActiveTab('limpiezas')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'limpiezas' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'limpiezas' ? 600 : 400,
            color: activeTab === 'limpiezas' ? '#1A1A1A' : '#555555',
            transition: 'all 0.2s'
          }}
        >
          Historial de limpiezas
        </button>
        <button
          onClick={() => setActiveTab('mantenimientos')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'mantenimientos' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'mantenimientos' ? 600 : 400,
            color: activeTab === 'mantenimientos' ? '#1A1A1A' : '#555555',
            transition: 'all 0.2s'
          }}
        >
          Mantenimientos
        </button>
      </div>

      {/* PESTAÑA 1 - INFORMACIÓN GENERAL */}
      {activeTab === 'detalle' && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #EEEEEE' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <span style={{ color: '#555555', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Tipo de habitación</span> 
                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.tipo_habitacion_info?.nombre || 'N/A'}</span>
                  </p>
                  <p style={{ margin: '0' }}>
                    <span style={{ color: '#555555', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Descripción</span> 
                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.descripcion || 'Sin descripción'}</span>
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <span style={{ color: '#555555', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Capacidad</span> 
                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.capacidad} mascotas</span>
                  </p>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <span style={{ color: '#555555', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Activa</span> 
                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.activa ? '✅' : '❌'}</span>
                  </p>
                  <p style={{ margin: '0' }}>
                    <span style={{ color: '#555555', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Cámara</span> 
                    {habitacion.url_camara ? (
                      <a href={habitacion.url_camara} target="_blank" rel="noreferrer" style={{ color: '#1E90FF', fontWeight: 500, textDecoration: 'none' }}>Ver cámara</a>
                    ) : (
                      <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Sin cámara</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #EEEEEE' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1A1A1A' }}>Cambiar estado</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ color: '#555555', fontSize: '13px' }}>Estado actual:</span>
                {habitacion.estado_habitacion_info && (
                  <span style={{
                    background: badgeStyle.bgPill,
                    color: badgeStyle.text,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {habitacion.estado_habitacion_info.nombre}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <select
                  value={nuevoEstadoId}
                  onChange={(e) => setNuevoEstadoId(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', minWidth: '220px' }}
                >
                  {estados.map((est) => (
                    <option key={est.estado_habitacion_id} value={est.estado_habitacion_id}>
                      {est.nombre}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleGuardarCambioEstado}
                  style={{
                    background: '#F5A800',
                    color: '#1A1A1A',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '10px 20px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e69d00'}
                  onMouseLeave={(e) => e.target.style.background = '#F5A800'}
                >
                  Guardar cambio
                </button>

                {mensajeEstado && (
                  <span style={{ 
                    color: mensajeEstado.tipo === 'success' ? '#28C76F' : '#FF6B6B',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}>
                    {mensajeEstado.tipo === 'success' ? '✓ ' : '⚠ '}
                    {mensajeEstado.text}
                  </span>
                )}
              </div>
            </div>

         </div>
      )}

      {/* PESTAÑA 2 - HISTORIAL DE LIMPIEZAS */}
      {activeTab === 'limpiezas' && (
        <div>
          <div style={{ marginBottom: '16px', color: '#555555', fontSize: '14px', fontStyle: 'italic' }}>
            ℹ Las limpiezas son registradas por el personal de limpieza
          </div>
          
          {limpiezas.length === 0 ? (
            <p style={{ color: '#1A1A1A', fontWeight: 500, padding: '24px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #EEEEEE', textAlign: 'center' }}>
              🧹 No hay registros de limpieza
            </p>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE' }}>
                    <th style={{ padding: '16px' }}>Fecha</th>
                    <th style={{ padding: '16px' }}>Hora inicio</th>
                    <th style={{ padding: '16px' }}>Hora fin</th>
                    <th style={{ padding: '16px' }}>Personal</th>
                    <th style={{ padding: '16px' }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {limpiezas.map((limpieza, idx) => (
                    <tr key={limpieza.limpieza_id || idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                      <td style={{ padding: '16px', color: '#1A1A1A' }}>{limpieza.fecha_limpieza}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>{limpieza.hora_inicio || '-'}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>{limpieza.hora_fin || '-'}</td>
                      <td style={{ padding: '16px', color: '#1A1A1A' }}>{limpieza.realizada_por_nombre || `ID: ${limpieza.realizada_por}`}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>{limpieza.observaciones || 'Ninguna'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3 - MANTENIMIENTOS */}
      {activeTab === 'mantenimientos' && (
        <div>
          <button
            onClick={() => setShowMantenimientoForm(!showMantenimientoForm)}
            style={{
              background: showMantenimientoForm ? '#EEEEEE' : '#F5A800',
              color: '#1A1A1A',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px 20px',
              border: 'none',
              marginBottom: '24px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {showMantenimientoForm ? 'Cancelar' : '＋ Nueva solicitud'}
          </button>

          {showMantenimientoForm && (
            <form onSubmit={handleGuardarMantenimiento} style={{ background: '#F8F8F8', borderRadius: '12px', padding: '24px', border: '1px solid #DDDDDD', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1A1A1A' }}>Registrar nueva solicitud</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>Tipo</label>
                  <select name="tipo" style={inputStyle} required>
                    <option value="">Seleccione el tipo...</option>
                    <option value="Reparación">Reparación</option>
                    <option value="Mobiliario">Mobiliario</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>Fecha solicitud</label>
                  <input type="date" name="fecha_solicitud" style={inputStyle} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>Descripción</label>
                <textarea
                  name="descripcion"
                  placeholder="Detalles sobre el mantenimiento requerido..."
                  required
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  type="submit"
                  style={{
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '10px 24px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#333333'}
                  onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
                >
                  Registrar
                </button>
              </div>
            </form>
          )}

          <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE' }}>
                  <th style={{ padding: '16px' }}>Tipo</th>
                  <th style={{ padding: '16px' }}>Descripción</th>
                  <th style={{ padding: '16px' }}>Fecha solicitud</th>
                  <th style={{ padding: '16px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#555555' }}>
                      No hay solicitudes de mantenimiento registradas
                    </td>
                  </tr>
                ) : (
                  mantenimientos.map((mant, idx) => (
                    <tr key={mant.mantenimiento_id || idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                      <td style={{ padding: '16px', color: '#1A1A1A', fontWeight: 500 }}>{mant.tipo}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>{mant.descripcion}</td>
                      <td style={{ padding: '16px', color: '#1A1A1A' }}>{mant.fecha_solicitud}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: mant.completado ? '#E8F8EF' : '#FFF3E0',
                          color: mant.completado ? '#28C76F' : '#FF9800',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {mant.completado ? 'Completado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
