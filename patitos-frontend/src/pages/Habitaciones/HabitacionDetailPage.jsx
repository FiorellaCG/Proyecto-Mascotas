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

  const getColorStyles = (estado) => {
    switch (estado) {
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

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>;
  if (!habitacion) return <div className="text-center py-8">Habitación no encontrada</div>;

  const badgeStyle = getColorStyles(habitacion.estado_habitacion_info.nombre);

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Habitación {habitacion.numero}
          </h1>
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
        </div>
        <button
          onClick={() => navigate('/habitaciones')}
          style={{
            border: '1px solid #DDDDDD',
            background: 'transparent',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: 600,
            color: '#555555',
            cursor: 'pointer'
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Información General */}
      <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '24px', border: '1px solid #EEEEEE', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 8px 0' }}><span style={{ color: '#555555' }}>Tipo:</span> <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.tipo_habitacion_info.nombre}</span></p>
            <p style={{ margin: '0 0 8px 0' }}><span style={{ color: '#555555' }}>Descripción:</span> <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.descripcion || 'N/A'}</span></p>
            <p style={{ margin: '0 0 8px 0' }}><span style={{ color: '#555555' }}>Capacidad:</span> <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.capacidad} mascotas</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0' }}><span style={{ color: '#555555' }}>Activa:</span> <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{habitacion.activa ? '✅ Sí' : '❌ No'}</span></p>
            {habitacion.url_camara && (
              <p style={{ margin: '0 0 8px 0' }}><span style={{ color: '#555555' }}>Cámara:</span> <a href={habitacion.url_camara} style={{ color: '#1E90FF', fontWeight: 500, textDecoration: 'none' }}>Ver enlace</a></p>
            )}
          </div>
        </div>

        {/* Cambiar Estado */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #DDDDDD', paddingTop: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>Cambiar estado:</label>
          <select
            onChange={(e) => handleCambiarEstado(parseInt(e.target.value))}
            value={habitacion.estado_habitacion}
            style={{ border: '1px solid #F5A800', borderRadius: '8px', padding: '8px 12px', outline: 'none', backgroundColor: '#FFFFFF', minWidth: '200px' }}
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
      <div style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', marginBottom: '24px', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('detalle')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'detalle' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'detalle' ? 600 : 400,
            color: activeTab === 'detalle' ? '#1A1A1A' : '#555555'
          }}
        >
          Detalle
        </button>
        <button
          onClick={() => setActiveTab('limpiezas')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'limpiezas' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'limpiezas' ? 600 : 400,
            color: activeTab === 'limpiezas' ? '#1A1A1A' : '#555555'
          }}
        >
          Limpiezas ({limpiezas.length})
        </button>
        <button
          onClick={() => setActiveTab('mantenimientos')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'mantenimientos' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'mantenimientos' ? 600 : 400,
            color: activeTab === 'mantenimientos' ? '#1A1A1A' : '#555555'
          }}
        >
          Mantenimientos ({mantenimientos.length})
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'detalle' && (
         <div style={{ color: '#555555' }}>
            Selecciona Limpiezas o Mantenimientos para ver más información operativa.
         </div>
      )}

      {activeTab === 'limpiezas' && (
        <div>
          <button
            onClick={() => setShowLimpiezaForm(!showLimpiezaForm)}
            style={{
              background: showLimpiezaForm ? '#EEEEEE' : '#F5A800',
              color: '#1A1A1A',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px 20px',
              border: 'none',
              marginBottom: '24px',
              cursor: 'pointer'
            }}
          >
            {showLimpiezaForm ? 'Cancelar' : 'Registrar Limpieza'}
          </button>

          {showLimpiezaForm && (
            <form onSubmit={handleGuardarLimpieza} style={{ background: '#F8F8F8', borderRadius: '12px', padding: '20px', border: '1px solid #EEEEEE', marginBottom: '24px' }}>
              <style>
                {`
                  .form-inputs input:focus, .form-inputs textarea:focus {
                    border-color: #F5A800 !important;
                  }
                `}
              </style>
              <div className="form-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="number"
                  name="realizada_por"
                  placeholder="ID persona limpieza"
                  required
                  style={inputStyle}
                />
                <input
                  type="date"
                  name="fecha_limpieza"
                  required
                  style={inputStyle}
                />
                <input
                  type="time"
                  name="hora_inicio"
                  style={inputStyle}
                />
                <input
                  type="time"
                  name="hora_fin"
                  style={inputStyle}
                />
              </div>
              <div className="form-inputs">
                <textarea
                  name="observaciones"
                  placeholder="Observaciones"
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#F5A800',
                  color: '#1A1A1A',
                  fontWeight: 600,
                  borderRadius: '8px',
                  padding: '10px 24px',
                  border: 'none',
                  marginTop: '16px',
                  cursor: 'pointer'
                }}
              >
                Guardar Limpieza
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {limpiezas.length === 0 ? (
              <p style={{ color: '#555555' }}>No hay registros de limpieza</p>
            ) : (
              limpiezas.map((limpieza) => (
                <div key={limpieza.limpieza_id} style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '10px', padding: '16px' }}>
                  <p style={{ margin: '0 0 6px 0', color: '#555555' }}><strong>Fecha:</strong> <span style={{ color: '#1A1A1A' }}>{limpieza.fecha_limpieza}</span></p>
                  <p style={{ margin: '0 0 6px 0', color: '#555555' }}><strong>Realizada por:</strong> <span style={{ color: '#1A1A1A' }}>{limpieza.realizada_por_nombre}</span></p>
                  <p style={{ margin: '0 0 6px 0', color: '#555555' }}><strong>Hora:</strong> <span style={{ color: '#1A1A1A' }}>{limpieza.hora_inicio} - {limpieza.hora_fin}</span></p>
                  {limpieza.observaciones && <p style={{ margin: 0, color: '#555555' }}><strong>Observaciones:</strong> <span style={{ color: '#1A1A1A' }}>{limpieza.observaciones}</span></p>}
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
            style={{
              background: showMantenimientoForm ? '#EEEEEE' : '#F5A800',
              color: '#1A1A1A',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px 20px',
              border: 'none',
              marginBottom: '24px',
              cursor: 'pointer'
            }}
          >
            {showMantenimientoForm ? 'Cancelar' : 'Crear Solicitud'}
          </button>

          {showMantenimientoForm && (
            <form onSubmit={handleGuardarMantenimiento} style={{ background: '#F8F8F8', borderRadius: '12px', padding: '20px', border: '1px solid #EEEEEE', marginBottom: '24px' }}>
              <style>
                {`
                  .form-inputs input:focus, .form-inputs textarea:focus {
                    border-color: #F5A800 !important;
                  }
                `}
              </style>
              <div className="form-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  name="tipo"
                  placeholder="Tipo de mantenimiento"
                  required
                  style={inputStyle}
                />
                <textarea
                  name="descripcion"
                  placeholder="Descripción del problema"
                  required
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                />
                <input
                  type="date"
                  name="fecha_solicitud"
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#F5A800',
                  color: '#1A1A1A',
                  fontWeight: 600,
                  borderRadius: '8px',
                  padding: '10px 24px',
                  border: 'none',
                  marginTop: '16px',
                  cursor: 'pointer'
                }}
              >
                Crear Solicitud
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mantenimientos.length === 0 ? (
              <p style={{ color: '#555555' }}>No hay solicitudes de mantenimiento</p>
            ) : (
              mantenimientos.map((mant) => (
                <div key={mant.mantenimiento_id} style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#1A1A1A', fontSize: '16px' }}>{mant.tipo}</p>
                    <span style={{
                      background: mant.completado ? '#E8F8EF' : '#FFF3E0',
                      color: mant.completado ? '#28C76F' : '#FF9800',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {mant.completado ? '✅ Completado' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#1A1A1A' }}>{mant.descripcion}</p>
                  <p style={{ margin: '0 0 4px 0', color: '#555555', fontSize: '13px' }}><strong>Solicitado:</strong> {mant.fecha_solicitud}</p>
                  {mant.realizado_por_nombre && <p style={{ margin: 0, color: '#555555', fontSize: '13px' }}><strong>Realizado por:</strong> {mant.realizado_por_nombre}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
