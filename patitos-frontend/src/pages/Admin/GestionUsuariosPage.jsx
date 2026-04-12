import { useEffect, useState } from 'react';
import { getUsuarios, crearUsuario, getRoles } from '../../api/usuariosApi';
import { getEspecialistas, crearEspecialista, getTurnos } from '../../api/especialistasApi';

export default function GestionUsuariosPage() {
  const [activeTab, setActiveTab] = useState('usuarios');
  
  // Data states
  const [usuarios, setUsuarios] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [turnos, setTurnos] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Form states
  const [formData, setFormData] = useState({
    nombre: '', apellidos: '', cedula: '', correo: '', telefono: '', password: '', rol_id: ''
  });
  const [especialistaData, setEspecialistaData] = useState({
    turno_id: '', especialidad: '', fecha_ingreso: ''
  });

  useEffect(() => {
    cargarDatosGenerales();
  }, []);

  const cargarDatosGenerales = async () => {
    try {
      setLoading(true);
      const [resUsuarios, resEspecialistas, resRoles, resTurnos] = await Promise.all([
        getUsuarios(),
        getEspecialistas(),
        getRoles(),
        getTurnos(),
      ]);
      setUsuarios(resUsuarios.data);
      setEspecialistas(resEspecialistas.data);
      setRoles(resRoles.data);
      setTurnos(resTurnos.data);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  const handleOpenModal = () => {
    setFormData({ nombre: '', apellidos: '', cedula: '', correo: '', telefono: '', password: '', rol_id: '' });
    setEspecialistaData({ turno_id: '', especialidad: '', fecha_ingreso: '' });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const isEspecialistaRole = roles.find(r => r.rol_id === parseInt(formData.rol_id))?.nombre === 'Especialista';

    try {
      // 1. Crear Usuario
      const resUser = await crearUsuario({
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        cedula: formData.cedula,
        correo: formData.correo,
        telefono: formData.telefono,
        password: formData.password,
        rol_id: parseInt(formData.rol_id)
      });
      
      const nuevoUsuarioId = resUser.data.usuario_id;

      // 2. Crear Especialista si es necesario
      if (isEspecialistaRole) {
        await crearEspecialista({
          usuario_id: nuevoUsuarioId,
          turno_id: parseInt(especialistaData.turno_id),
          especialidad: especialistaData.especialidad,
          fecha_ingreso: especialistaData.fecha_ingreso
        });
      }

      handleCloseModal();
      showToast('Usuario creado exitosamente', 'success');
      cargarDatosGenerales();

    } catch (err) {
      if (err.response?.data) {
        // Collect error strings from object
        const errorMsgs = Object.values(err.response.data).flat().join(', ');
        setModalError(errorMsgs || 'Error al crear usuario');
      } else {
        setModalError('Error de conexión o servidor');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const isEspecialistaSelected = rollers => {
      const selectedRol = rollers.find(r => r.rol_id === parseInt(formData.rol_id));
      return selectedRol?.nombre === 'Especialista';
  };

  const getRolBadgeStyles = (rol) => {
    switch(rol) {
      case 'Administrador': return { bg: '#1A1A1A', text: '#FFFFFF' };
      case 'Especialista': return { bg: '#E8F0FF', text: '#1E90FF' };
      case 'Dueño': return { bg: '#E8F8EF', text: '#28C76F' };
      case 'Personal limpieza': return { bg: '#FFF3E0', text: '#FF9800' };
      default: return { bg: '#EEEEEE', text: '#555555' };
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #DDDDDD',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#E8F8EF' : '#FFE8E8',
          color: toast.type === 'success' ? '#28C76F' : '#FF6B6B',
          padding: '16px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Gestión de Usuarios</h1>
        <button
          onClick={handleOpenModal}
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
          ＋ Nuevo usuario
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', marginBottom: '24px', gap: '32px' }}>
        <button
          onClick={() => setActiveTab('usuarios')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'usuarios' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'usuarios' ? 600 : 400,
            color: activeTab === 'usuarios' ? '#1A1A1A' : '#555555',
            transition: 'all 0.2s'
          }}
        >
          Usuarios ({usuarios.length})
        </button>
        <button
          onClick={() => setActiveTab('especialistas')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'especialistas' ? '2px solid #F5A800' : '2px solid transparent',
            fontWeight: activeTab === 'especialistas' ? 600 : 400,
            color: activeTab === 'especialistas' ? '#1A1A1A' : '#555555',
            transition: 'all 0.2s'
          }}
        >
          Especialistas ({especialistas.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#555555' }}>Cargando datos...</div>
      ) : (
        <>
          {/* TAB 1: USUARIOS */}
          {activeTab === 'usuarios' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE' }}>
                    <th style={{ padding: '16px' }}>Nombre</th>
                    <th style={{ padding: '16px' }}>Cédula</th>
                    <th style={{ padding: '16px' }}>Correo</th>
                    <th style={{ padding: '16px' }}>Teléfono</th>
                    <th style={{ padding: '16px' }}>Rol</th>
                    <th style={{ padding: '16px' }}>Estado</th>
                    <th style={{ padding: '16px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usu, idx) => {
                    const badge = getRolBadgeStyles(usu.rol_nombre);
                    return (
                      <tr key={usu.usuario_id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                        <td style={{ padding: '16px', color: '#1A1A1A', fontWeight: 500 }}>{usu.nombre} {usu.apellidos}</td>
                        <td style={{ padding: '16px', color: '#555555' }}>{usu.cedula}</td>
                        <td style={{ padding: '16px', color: '#555555' }}>{usu.correo}</td>
                        <td style={{ padding: '16px', color: '#555555' }}>{usu.telefono || '—'}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ background: badge.bg, color: badge.text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {usu.rol_nombre}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ color: usu.activo ? '#28C76F' : '#FF6B6B', fontWeight: 600 }}>
                            {usu.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button style={{ background: 'none', border: 'none', color: '#1E90FF', cursor: 'pointer', fontWeight: 500 }}>
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ESPECIALISTAS */}
          {activeTab === 'especialistas' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8', fontWeight: 600, borderBottom: '1px solid #EEEEEE' }}>
                    <th style={{ padding: '16px' }}>Nombre</th>
                    <th style={{ padding: '16px' }}>Correo</th>
                    <th style={{ padding: '16px' }}>Turno</th>
                    <th style={{ padding: '16px' }}>Especialidad</th>
                    <th style={{ padding: '16px' }}>Fecha ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {especialistas.map((esp, idx) => (
                    <tr key={esp.especialista_id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
                      <td style={{ padding: '16px', color: '#1A1A1A', fontWeight: 500 }}>{esp.nombre_completo}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>{esp.correo}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>
                        {esp.turno ? `${esp.turno.nombre} (${esp.turno.hora_inicio} - ${esp.turno.hora_fin})` : 'Sin asignar'}
                      </td>
                      <td style={{ padding: '16px', color: '#555555' }}>{esp.especialidad || 'General'}</td>
                      <td style={{ padding: '16px', color: '#555555' }}>{esp.fecha_ingreso}</td>
                    </tr>
                  ))}
                  {especialistas.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#555555' }}>No hay especialistas registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODAL CREAR USUARIO */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '520px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>Nuevo Usuario</h2>
            
            {modalError && (
              <div style={{ background: '#FFE8E8', color: '#FF6B6B', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
                ⚠ {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <style>{`.us-form-input:focus { border-color: #F5A800 !important; }`}</style>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Nombre *</label>
                  <input type="text" className="us-form-input" style={inputStyle} required 
                    value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Apellidos *</label>
                  <input type="text" className="us-form-input" style={inputStyle} required 
                    value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Cédula *</label>
                  <input type="text" className="us-form-input" style={inputStyle} required 
                    value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Teléfono</label>
                  <input type="text" className="us-form-input" style={inputStyle} 
                    value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Correo electrónico *</label>
                <input type="email" className="us-form-input" style={inputStyle} required 
                  value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Contraseña *</label>
                  <input type="password" className="us-form-input" style={inputStyle} required minLength={8}
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Rol *</label>
                  <select className="us-form-input" style={inputStyle} required
                    value={formData.rol_id} onChange={e => setFormData({...formData, rol_id: e.target.value})}>
                    <option value="">Seleccione rol...</option>
                    {roles.map(r => (
                      <option key={r.rol_id} value={r.rol_id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isEspecialistaSelected(roles) && (
                <div style={{ background: '#FAFAFA', padding: '20px', borderRadius: '12px', border: '1px solid #EEEEEE', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#1A1A1A' }}>Datos de especialista</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Turno *</label>
                    <select className="us-form-input" style={inputStyle} required={isEspecialistaSelected(roles)}
                      value={especialistaData.turno_id} onChange={e => setEspecialistaData({...especialistaData, turno_id: e.target.value})}>
                      <option value="">Seleccione turno...</option>
                      {turnos.map(t => (
                        <option key={t.turno_id} value={t.turno_id}>{t.nombre} ({t.hora_inicio}-{t.hora_fin})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Especialidad</label>
                      <input type="text" className="us-form-input" style={inputStyle} placeholder="Opcional"
                        value={especialistaData.especialidad} onChange={e => setEspecialistaData({...especialistaData, especialidad: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555555', fontWeight: 600 }}>Fecha de ingreso *</label>
                      <input type="date" className="us-form-input" style={inputStyle} required={isEspecialistaSelected(roles)}
                        value={especialistaData.fecha_ingreso} onChange={e => setEspecialistaData({...especialistaData, fecha_ingreso: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  style={{
                    background: 'transparent',
                    border: '1px solid #DDDDDD',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: '#555555',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  style={{
                    background: '#F5A800',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    color: '#1A1A1A',
                    fontWeight: 600,
                    cursor: modalLoading ? 'not-allowed' : 'pointer',
                    opacity: modalLoading ? 0.7 : 1
                  }}
                >
                  {modalLoading ? 'Guardando...' : 'Guardar usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
