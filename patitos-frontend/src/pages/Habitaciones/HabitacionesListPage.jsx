import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodasHabitaciones, getEstadosHabitacion, crearHabitacion } from '../../api/habitacionesApi';

export default function HabitacionesListPage() {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [estados, setEstados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    numero: '',
    tipo_habitacion_id: '',
    estado_habitacion_id: '1',
    capacidad: 1,
    descripcion: '',
    url_camara: '',
    activa: true
  });

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

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await crearHabitacion({
        ...formData,
        tipo_habitacion_id: parseInt(formData.tipo_habitacion_id),
        estado_habitacion_id: parseInt(formData.estado_habitacion_id),
        capacidad: parseInt(formData.capacidad)
      });
      setIsModalOpen(false);
      setSuccessMsg('✅ Habitación creada');
      setTimeout(() => setSuccessMsg(''), 4000);
      cargarDatos();
      setFormData({
        numero: '',
        tipo_habitacion_id: '',
        estado_habitacion_id: '1',
        capacidad: 1,
        descripcion: '',
        url_camara: '',
        activa: true
      });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.numero) {
        setFormError(errorData.numero[0]);
      } else {
        setFormError('Error al crear habitación. Por favor verifica los datos.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && habitaciones.length === 0) return <div className="text-center py-8">Cargando...</div>;
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

  const inputStyle = {
    border: '1px solid #DDDDDD',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1A1A1A',
    background: '#FFFFFF',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Header layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          Gestión de Habitaciones
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#F5A800', color: '#1A1A1A', fontWeight: 600, border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}
          >
            ＋ Nueva habitación
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ color: '#28C76F', fontWeight: 600, marginBottom: '16px', background: '#E8F8EF', padding: '12px 16px', borderRadius: '8px' }}>
          {successMsg}
        </div>
      )}

      {/* Tabla */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #EEEEEE', overflow: 'hidden' }}>
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

      {/* Modal Crear Habitación */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', 
          justifyContent: 'center', alignItems: 'center' 
        }}>
          <div style={{ 
            background: '#FFFFFF', borderRadius: '16px', padding: '32px', 
            maxWidth: '520px', width: '100%', margin: 'auto',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#1A1A1A' }}>Crear nueva habitación</h2>

            {formError && (
              <div style={{ background: '#FFE8E8', color: '#FF6B6B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 500 }}>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>Número *</label>
                <input 
                  type="text" 
                  placeholder="H-07" 
                  value={formData.numero}
                  onChange={e => setFormData({...formData, numero: e.target.value})}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A800'}
                  onBlur={e => e.target.style.borderColor = '#DDDDDD'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>Tipo de habitación *</label>
                <select 
                  required
                  value={formData.tipo_habitacion_id}
                  onChange={e => setFormData({...formData, tipo_habitacion_id: e.target.value})}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A800'}
                  onBlur={e => e.target.style.borderColor = '#DDDDDD'}
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="1">Habitación individual (sin cámara)</option>
                  <option value="2">Habitación individual con cámara</option>
                  <option value="3">Habitación de cuidados especiales</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>Estado inicial *</label>
                <select 
                  required
                  value={formData.estado_habitacion_id}
                  onChange={e => setFormData({...formData, estado_habitacion_id: e.target.value})}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A800'}
                  onBlur={e => e.target.style.borderColor = '#DDDDDD'}
                >
                  <option value="1">Disponible</option>
                  <option value="2">Reservada</option>
                  <option value="3">En mantenimiento</option>
                  <option value="4">Cerrada</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>Capacidad *</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.capacidad}
                  onChange={e => setFormData({...formData, capacidad: e.target.value})}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A800'}
                  onBlur={e => e.target.style.borderColor = '#DDDDDD'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>Descripción</label>
                <textarea 
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                  onFocus={e => e.target.style.borderColor = '#F5A800'}
                  onBlur={e => e.target.style.borderColor = '#DDDDDD'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>URL cámara</label>
                <input 
                  type="text" 
                  value={formData.url_camara}
                  onChange={e => setFormData({...formData, url_camara: e.target.value})}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A800'}
                  onBlur={e => e.target.style.borderColor = '#DDDDDD'}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: '#1A1A1A' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.activa}
                    onChange={e => setFormData({...formData, activa: e.target.checked})}
                    style={{ transform: 'scale(1.2)', accentColor: '#F5A800' }}
                  />
                  Activa
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                  style={{ background: 'transparent', border: '1px solid #DDDDDD', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, color: '#1A1A1A', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.target.style.background = '#F8F8F8'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  style={{ background: '#F5A800', color: '#1A1A1A', fontWeight: 600, border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: formLoading ? 'default' : 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if(!formLoading) e.target.style.background = '#e69d00' }}
                  onMouseLeave={e => { if(!formLoading) e.target.style.background = '#F5A800' }}
                >
                  {formLoading ? 'Guardando...' : 'Crear habitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
