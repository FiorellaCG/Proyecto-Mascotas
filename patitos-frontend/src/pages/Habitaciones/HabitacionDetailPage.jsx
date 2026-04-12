import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getHabitacion,
  actualizarHabitacion,
  getEstadosHabitacion,
  getHistorialLimpiezas,
  getMantenimientos,
  crearMantenimiento,
  completarMantenimiento,
  editarCamara,
  actualizarHabitacionCompleta,
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleAbrirModal = () => {
    setEditForm({
      numero: habitacion.numero || '',
      descripcion: habitacion.descripcion || '',
      capacidad: habitacion.capacidad || 1,
      tipo_habitacion: habitacion.tipo_habitacion || '',
      estado_habitacion: habitacion.estado_habitacion || '',
      url_camara: habitacion.url_camara || '',
      activa: habitacion.activa ?? true,
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await actualizarHabitacionCompleta(id, editForm);
      setShowEditModal(false);
      cargarDatos();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setEditLoading(false);
    }
  };
  
  // States for 'Cambiar estado'
  const [nuevoEstadoId, setNuevoEstadoId] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState(null); // { tipo: 'success' | 'error', text: '' }

  // States for 'Mantenimientos'
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);

  // States for 'Cámara'
  const [urlCamara, setUrlCamara] = useState('');
  const [mensajeCamara, setMensajeCamara] = useState(null);

  useEffect(() => {
    if (habitacion) {
      setUrlCamara(habitacion.url_camara || '');
    }
  }, [habitacion]);

  const handleGuardarCamara = async () => {
    setMensajeCamara(null);
    try {
      await editarCamara(id, { url_camara: urlCamara });
      setMensajeCamara({ tipo: 'success', text: 'URL de cámara actualizada' });
      cargarDatos();
    } catch {
      setMensajeCamara({ tipo: 'error', text: 'Error al guardar' });
    }
  };

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
    } catch {
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

  const handleCambiarEstadoMant = async (mantenimiento_id, completado) => {
    try {
      await completarMantenimiento(mantenimiento_id, { completado })
      cargarDatos() // recarga tabla
    } catch {
      alert('Error al actualizar mantenimiento')
    }
  }

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

  const labelStyle = { display:'block', marginBottom:'6px', fontSize:'14px', color:'#555555', fontWeight:500 };

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
        <div style={{ display:'flex', gap:'8px' }}>
          <button
            onClick={handleAbrirModal}
            style={{
              background:'#1A1A1A', color:'#FFFFFF',
              fontWeight:600, border:'none',
              borderRadius:'8px', padding:'8px 16px',
              cursor:'pointer', fontSize:'14px'
            }}
          >
            ✏️ Editar habitación
          </button>
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
                  <div>
                    <span style={{ color:'#555555', fontSize:'13px', display:'block', marginBottom:'4px' }}>
                      Cámara (link de Google Meet)
                    </span>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <input
                        value={urlCamara}
                        onChange={(e) => setUrlCamara(e.target.value)}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        style={{
                          border:'1px solid #DDDDDD', borderRadius:'8px',
                          padding:'8px 12px', fontSize:'13px', flex:1,
                          outline:'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#F5A800'}
                        onBlur={(e) => e.target.style.borderColor = '#DDDDDD'}
                      />
                      <button
                        onClick={handleGuardarCamara}
                        style={{
                          background:'#F5A800', color:'#1A1A1A', fontWeight:600,
                          border:'none', borderRadius:'8px', padding:'8px 16px',
                          cursor:'pointer', fontSize:'13px', whiteSpace:'nowrap'
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                    {habitacion.url_camara && (
                      <div style={{ marginTop:'10px' }}>
                        <a
                          href={habitacion.url_camara}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color:'#1E90FF', fontSize:'13px',
                            textDecoration:'none', fontWeight:500
                          }}
                        >
                          🔗 Ver link guardado →
                        </a>
                      </div>
                    )}
                    {mensajeCamara && (
                      <span style={{
                        color: mensajeCamara.tipo === 'success' ? '#28C76F' : '#FF6B6B',
                        fontSize:'13px', marginTop:'6px', display:'block'
                      }}>
                        {mensajeCamara.tipo === 'success' ? '✓ ' : '⚠ '}{mensajeCamara.text}
                      </span>
                    )}
                  </div>
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
                  <th style={{ padding: '16px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientos.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#555555' }}>
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
                      <td style={{ padding: '16px' }}>
                        {!mant.completado ? (
                          <button
                            onClick={() => handleCambiarEstadoMant(mant.mantenimiento_id, true)}
                            style={{
                              background: '#28C76F', color: '#FFFFFF',
                              border: 'none', borderRadius: '8px',
                              padding: '6px 14px', fontSize: '13px',
                              fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            ✓ Completar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarEstadoMant(mant.mantenimiento_id, false)}
                            style={{
                              background: '#FF9800', color: '#FFFFFF',
                              border: 'none', borderRadius: '8px',
                              padding: '6px 14px', fontSize: '13px',
                              fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            ↩ Reabrir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Editar Habitación */}
      {showEditModal && (
        <div style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.5)',
          display:'flex', alignItems:'center',
          justifyContent:'center', zIndex:1000
        }}>
          <div style={{
            background:'#FFFFFF', borderRadius:'16px',
            padding:'32px', width:'100%', maxWidth:'520px',
            maxHeight:'90vh', overflowY:'auto'
          }}>
            <h2 style={{ margin:'0 0 24px 0', fontSize:'20px', fontWeight:700, color:'#1A1A1A' }}>
              Editar Habitación
            </h2>

            {/* Número */}
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Número</label>
              <input value={editForm.numero}
                onChange={e => setEditForm({...editForm, numero: e.target.value})}
                style={inputStyle} />
            </div>

            {/* Tipo */}
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Tipo de habitación</label>
              <select value={editForm.tipo_habitacion}
                onChange={e => setEditForm({...editForm, tipo_habitacion: e.target.value})}
                style={inputStyle}>
                <option value="1">Habitación individual</option>
                <option value="2">Habitación individual con cámara</option>
                <option value="3">Habitación de cuidados especiales</option>
              </select>
            </div>

            {/* Estado */}
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Estado</label>
              <select value={editForm.estado_habitacion}
                onChange={e => setEditForm({...editForm, estado_habitacion: e.target.value})}
                style={inputStyle}>
                <option value="1">Disponible</option>
                <option value="2">Reservada</option>
                <option value="3">En mantenimiento</option>
                <option value="4">Cerrada</option>
              </select>
            </div>

            {/* Capacidad */}
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Capacidad</label>
              <input type="number" min="1" value={editForm.capacidad}
                onChange={e => setEditForm({...editForm, capacidad: parseInt(e.target.value)})}
                style={inputStyle} />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Descripción</label>
              <textarea value={editForm.descripcion}
                onChange={e => setEditForm({...editForm, descripcion: e.target.value})}
                style={{ ...inputStyle, minHeight:'80px', resize:'vertical' }} />
            </div>

            {/* URL Cámara */}
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>URL Cámara (Google Meet)</label>
              <input value={editForm.url_camara}
                onChange={e => setEditForm({...editForm, url_camara: e.target.value})}
                placeholder="https://meet.google.com/..."
                style={inputStyle} />
            </div>

            {/* Activa */}
            <div style={{ marginBottom:'24px', display:'flex', alignItems:'center', gap:'8px' }}>
              <input type="checkbox" checked={editForm.activa}
                onChange={e => setEditForm({...editForm, activa: e.target.checked})}
                id="activa" />
              <label htmlFor="activa" style={{ fontSize:'14px', color:'#1A1A1A', fontWeight:500 }}>
                Habitación activa
              </label>
            </div>

            {editError && (
              <p style={{ color:'#FF6B6B', fontSize:'13px', marginBottom:'16px' }}>
                ⚠ {editError}
              </p>
            )}

            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <button onClick={() => setShowEditModal(false)}
                style={{
                  background:'#FFFFFF', color:'#1A1A1A',
                  border:'1px solid #DDDDDD', borderRadius:'8px',
                  padding:'10px 20px', cursor:'pointer',
                  fontWeight:600, boxShadow:'0 1px 3px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => { e.target.style.background = '#F8F8F8'; e.target.style.borderColor = '#CCCCCC'; }}
                onMouseLeave={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#DDDDDD'; }}
               >
                Cancelar
              </button>
              <button onClick={handleGuardarEdicion} disabled={editLoading}
                style={{
                  background:'#F5A800', color:'#1A1A1A',
                  border:'none', borderRadius:'8px',
                  padding:'10px 24px', cursor:'pointer',
                  fontWeight:600
                }}>
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
