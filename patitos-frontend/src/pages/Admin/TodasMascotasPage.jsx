import { useState, useEffect } from 'react';
import { getTodasMascotas, getEspecialistasActivos, asignarEspecialista } from '../../api/mascotasApi';

const Toast = ({ message, type }) => {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      padding: '14px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
      background: isSuccess ? '#E8F8F0' : '#FFEBEB',
      color: isSuccess ? '#28C76F' : '#FF6B6B',
      border: `1px solid ${isSuccess ? '#28C76F' : '#FF6B6B'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {message}
    </div>
  );
};

export default function TodasMascotasPage() {
  const [mascotas, setMascotas] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroEspecie, setFiltroEspecie] = useState('Todas');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [selectedEspecialistaId, setSelectedEspecialistaId] = useState('');
  const [modalError, setModalError] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchEspecialistas = async () => {
    try {
      const res = await getEspecialistasActivos();
      setEspecialistas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMascotas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado === 'Aprobadas') params.aprobada = 'true';
      if (filtroEstado === 'Rechazadas') params.aprobada = 'false';
      if (filtroEstado === 'Pendientes') params.aprobada = 'pendiente';
      if (filtroEspecie !== 'Todas') params.especie = filtroEspecie;

      const res = await getTodasMascotas(params);
      setMascotas(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar mascotas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspecialistas();
  }, []);

  useEffect(() => {
    fetchMascotas();
  }, [filtroEstado, filtroEspecie]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const limpiarFiltros = () => {
    setFiltroEstado('Todos');
    setFiltroEspecie('Todas');
  };

  const openModal = (mascota) => {
    setSelectedMascota(mascota);
    setSelectedEspecialistaId('');
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMascota(null);
    setSelectedEspecialistaId('');
    setModalError('');
  };

  const handleGuardarAsignacion = async () => {
    if (!selectedEspecialistaId) {
      setModalError('Por favor selecciona un especialista');
      return;
    }
    setProcessing(true);
    setModalError('');
    try {
      await asignarEspecialista(selectedMascota.mascota_id, {
        especialista_id: selectedEspecialistaId
      });
      await fetchMascotas();
      showToast('✓ Especialista asignado con éxito', 'success');
      closeModal();
    } catch (error) {
      console.error(error);
      setModalError(error.response?.data?.detail || 'Ocurrió un error al asignar');
    } finally {
      setProcessing(false);
    }
  };

  const renderEstadoBadge = (aprobada) => {
    if (aprobada === null) return <span style={{ background: '#F0F0F0', color: '#555555', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Pendiente</span>;
    if (aprobada === true) return <span style={{ background: '#E8F8F0', color: '#28C76F', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Aprobada</span>;
    return <span style={{ background: '#FFEBEB', color: '#FF6B6B', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Rechazada</span>;
  };

  const filterSelectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #DDDDDD',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    color: '#1A1A1A'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      <Toast message={toast?.message} type={toast?.type} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px 0' }}>Gestión de Mascotas</h1>
          <p style={{ color: '#555555', fontSize: '15px', margin: 0 }}>Total mascotas: {mascotas.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', color: '#555555', fontWeight: 600 }}>Estado aprobación</label>
          <select style={filterSelectStyle} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Aprobadas">Aprobadas</option>
            <option value="Rechazadas">Rechazadas</option>
            <option value="Pendientes">Pendientes</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', color: '#555555', fontWeight: 600 }}>Especie</label>
          <select style={filterSelectStyle} value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}>
            <option value="Todas">Todas</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Ave">Ave</option>
            <option value="Conejo">Conejo</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <button
          onClick={limpiarFiltros}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            backgroundColor: '#F0F0F0',
            color: '#555555',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #EEEEEE', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: '#F8F8F8' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Mascota</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Dueño</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Especie</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Nivel asistencia</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Estado</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Especialista</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#1A1A1A', fontSize: '14px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#555555' }}>Cargando datos...</td></tr>
            ) : mascotas.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#555555' }}>No hay mascotas que coincidan con los filtros</td></tr>
            ) : (
              mascotas.map(m => (
                <tr key={m.mascota_id} style={{ borderBottom: '1px solid #F0F0F0', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1A1A1A' }}>{m.nombre}</td>
                  <td style={{ padding: '14px 16px', color: '#555555' }}>{m.dueno_nombre}</td>
                  <td style={{ padding: '14px 16px', color: '#555555' }}>{m.especie || 'N/A'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#E8F0FF', color: '#1E90FF', padding: '3px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                      {m.nivel_asistencia?.nombre || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{renderEstadoBadge(m.aprobada)}</td>
                  <td style={{ padding: '14px 16px', color: '#555555' }}>
                    {m.especialista_nombre ? (
                      m.especialista_nombre
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#999999' }}>Sin asignar</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {m.aprobada === true ? (
                      <button
                        onClick={() => openModal(m)}
                        style={{
                          background: '#F5A800',
                          color: '#1A1A1A',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Asignar especialista
                      </button>
                    ) : (
                      <span style={{ color: '#CCCCCC', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Asignar Especialista */}
      {modalOpen && selectedMascota && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 16px 0', color: '#1A1A1A' }}>
              Asignar especialista a {selectedMascota.nombre}
            </h2>
            
            {modalError && (
              <div style={{ background: '#FFEBEB', color: '#FF6B6B', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #FF6B6B' }}>
                {modalError}
              </div>
            )}

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555555' }}>Seleccione especialista</label>
            <select
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #DDDDDD', marginBottom: '24px', outline: 'none' }}
              value={selectedEspecialistaId}
              onChange={(e) => setSelectedEspecialistaId(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              {especialistas.map(e => (
                <option key={e.especialista_id} value={e.especialista_id}>
                  {e.nombre_completo} - {e.especialidad}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={closeModal}
                style={{ padding: '8px 16px', background: '#F0F0F0', color: '#555555', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                disabled={processing}
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarAsignacion}
                style={{ padding: '8px 16px', background: '#F5A800', color: '#1A1A1A', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer' }}
                disabled={processing}
              >
                {processing ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
