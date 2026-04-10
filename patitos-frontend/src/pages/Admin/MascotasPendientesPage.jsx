import React, { useState, useEffect } from 'react';
import { getMascotasPendientes, aprobarMascota } from '../../api/mascotasApi';

const Toast = ({ message, type }) => {
  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
      background: isSuccess ? '#E8F8F0' : '#FFEBEB',
      color: isSuccess ? '#28C76F' : '#FF6B6B',
      border: `1px solid ${isSuccess ? '#28C76F' : '#FF6B6B'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {message}
    </div>
  );
};

const MascotasPendientesPage = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMascotasPendientes();
        setMascotas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAction = async (id, aprobar) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    try {
      await aprobarMascota(id, aprobar);
      setMascotas(prev => prev.filter(m => m.mascota_id !== id));
      showToast(aprobar ? '✓ Mascota aprobada exitosamente' : '✗ Mascota rechazada', aprobar ? 'success' : 'error');
    } catch (err) {
      console.error(err);
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px' }}>Mascotas pendientes de aprobación</h1>
      <p style={{ color: '#555555', fontSize: '15px', marginBottom: '32px' }}>
        {mascotas.length} mascotas esperando revisión
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
          <div style={{
            width: '40px', height: '40px', border: '4px solid #F0F0F0',
            borderTop: '4px solid #F5A800', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : mascotas.length === 0 ? (
        <div style={{ background: '#E8F8F0', padding: '24px', borderRadius: '12px', color: '#28C76F', fontWeight: 500, border: '1px solid #28C76F', textAlign: 'center' }}>
          ✓ No hay mascotas pendientes de aprobación
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #EEEEEE', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', borderBottom: '2px solid #EEEEEE' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>Mascota</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>Dueño</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>Especie</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>Nivel de asistencia</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>Fecha solicitud</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.map((m) => (
                <tr key={m.mascota_id} style={{ borderBottom: '1px solid #F0F0F0', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FFFBF0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>{m.nombre}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#555555' }}>{m.dueno_nombre}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#555555' }}>{m.especie || 'N/A'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                    <span style={{ background: '#E8F0FF', color: '#1E90FF', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {m.nivel_asistencia ? m.nivel_asistencia.nombre : 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#555555' }}>
                    {m.fecha_ingreso_sys ? new Date(m.fecha_ingreso_sys).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button 
                      disabled={processing[m.mascota_id]}
                      onClick={() => handleAction(m.mascota_id, true)}
                      style={{
                        background: '#28C76F', color: '#FFFFFF', border: 'none',
                        padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                        cursor: processing[m.mascota_id] ? 'not-allowed' : 'pointer', marginRight: '8px',
                        opacity: processing[m.mascota_id] ? 0.6 : 1
                      }}
                    >
                      ✓ Aprobar
                    </button>
                    <button 
                      disabled={processing[m.mascota_id]}
                      onClick={() => handleAction(m.mascota_id, false)}
                      style={{
                        background: '#FF6B6B', color: '#FFFFFF', border: 'none',
                        padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                        cursor: processing[m.mascota_id] ? 'not-allowed' : 'pointer',
                        opacity: processing[m.mascota_id] ? 0.6 : 1
                      }}
                    >
                      ✗ Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MascotasPendientesPage;
