import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMascota } from '../../api/mascotasApi';

const MascotaDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const res = await getMascota(id);
        setMascota(res.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información de la mascota.');
      } finally {
        setLoading(false);
      }
    };
    fetchMascota();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: '40px', height: '40px', border: '4px solid #F0F0F0',
          borderTop: '4px solid #F5A800', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error || !mascota) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#FF6B6B' }}>{error || 'Mascota no encontrada'}</h2>
        <button onClick={() => navigate('/mi-cuenta/mascotas')} style={{ background: '#F5A800', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Volver a mis mascotas
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Breadcrumb */}
      <div style={{ fontSize: '14px', marginBottom: '24px', color: '#555555' }}>
        <span 
          onClick={() => navigate('/mi-cuenta/mascotas')}
          style={{ color: '#F5A800', cursor: 'pointer', fontWeight: 500 }}
        >
          Mis mascotas
        </span>
        {' > '}
        <span>{mascota.nombre}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <h1 style={{ color: '#1A1A1A', margin: 0, fontSize: '32px' }}>{mascota.nombre}</h1>
        
        {mascota.aprobada === null && (
          <span style={{ background: '#F0F0F0', color: '#888888', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            ⏳ Pendiente
          </span>
        )}
        {mascota.aprobada === true && (
          <span style={{ background: '#E8F8F0', color: '#28C76F', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            ✓ Aprobada
          </span>
        )}
        {mascota.aprobada === false && (
          <span style={{ background: '#FFEBEB', color: '#FF6B6B', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            ✗ Rechazada
          </span>
        )}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          
          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Especie</div>
            <div style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>{mascota.especie || 'N/A'}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Raza</div>
            <div style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>{mascota.raza || 'N/A'}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Fecha de nacimiento</div>
            <div style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>
              {mascota.fecha_nacimiento ? new Date(mascota.fecha_nacimiento).toLocaleDateString() : 'No registrada'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Fecha de ingreso al sistema</div>
            <div style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>
              {mascota.fecha_ingreso_sys ? new Date(mascota.fecha_ingreso_sys).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Nivel de asistencia</div>
            <div style={{ fontSize: '15px', color: '#1E90FF', fontWeight: 600 }}>
              {mascota.nivel_asistencia ? mascota.nivel_asistencia.nombre : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Especialista asignado</div>
            <div style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}>
              {mascota.especialista_nombre || 'Sin especialista'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#888888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Estado Activa</div>
            <div style={{ fontSize: '15px', color: mascota.activa ? '#28C76F' : '#FF6B6B', fontWeight: 600 }}>
              {mascota.activa ? 'Activa' : 'Inactiva'}
            </div>
          </div>

        </div>
      </div>

      {/* Cuidados Especiales */}
      <h2 style={{ fontSize: '20px', color: '#1A1A1A', marginBottom: '16px' }}>Cuidados especiales</h2>
      
      {(!mascota.cuidados_especiales || mascota.cuidados_especiales.length === 0) ? (
        <p style={{ color: '#888888', fontSize: '15px', fontStyle: 'italic' }}>No se registraron cuidados especiales</p>
      ) : (
        <div style={{ 
          background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px', 
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EEEEEE' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#1A1A1A', width: '30%' }}>Tipo</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#1A1A1A' }}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {mascota.cuidados_especiales.map((cuidado, idx) => (
                <tr key={cuidado.cuidado_mascota_id || idx} style={{ borderBottom: '1px solid #EEEEEE', background: idx % 2 === 0 ? '#FFFFFF' : '#F8F8F8' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>
                    {cuidado.tipo_cuidado ? cuidado.tipo_cuidado.nombre : 'Desconocido'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#555555' }}>
                    {cuidado.descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button 
        onClick={() => navigate('/mi-cuenta/mascotas')}
        style={{
          color: '#F5A800', background: 'transparent', border: 'none',
          cursor: 'pointer', fontWeight: 600, marginTop: '24px', fontSize: '14px',
          padding: 0
        }}
      >
        ← Volver a mis mascotas
      </button>

    </div>
  );
};

export default MascotaDetallePage;
