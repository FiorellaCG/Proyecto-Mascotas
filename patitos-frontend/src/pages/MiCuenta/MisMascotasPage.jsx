import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisMascotas } from '../../api/mascotasApi';

const MisMascotasPage = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const response = await getMisMascotas();
        setMascotas(response.data);
      } catch (err) {
        console.error('Error fetching mascotas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMascotas();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#1A1A1A', margin: 0 }}>Mis Mascotas</h1>
        <button 
          onClick={() => navigate('/mi-cuenta/mascotas/nueva')}
          style={{
            background: '#F5A800', color: '#1A1A1A', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
            cursor: 'pointer', fontSize: '14px'
          }}
        >
          ＋ Registrar mascota
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
          <div style={{
            width: '40px', height: '40px', border: '4px solid #F0F0F0',
            borderTop: '4px solid #F5A800', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : mascotas.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '80px 0' }}>
          <h2 style={{ color: '#1A1A1A', fontSize: '22px', marginBottom: '8px' }}>🐾 Aún no tienes mascotas registradas</h2>
          <p style={{ color: '#555555', fontSize: '15px', marginBottom: '24px' }}>Registra tu primera mascota para comenzar</p>
          <button 
            onClick={() => navigate('/mi-cuenta/mascotas/nueva')}
            style={{
              background: '#F5A800', color: '#1A1A1A', border: 'none',
              padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
              cursor: 'pointer', fontSize: '15px'
            }}
          >
            Registrar mi primera mascota
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'
        }}>
          {mascotas.map((mascota) => (
            <div 
              key={mascota.mascota_id}
              onClick={() => navigate(`/mi-cuenta/mascotas/${mascota.mascota_id}`)}
              style={{
                background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px',
                padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer',
                display: 'flex', flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F5A800';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,168,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#EEEEEE';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px 0' }}>{mascota.nombre}</h3>
              <p style={{ fontSize: '13px', color: '#555555', margin: '0 0 12px 0' }}>
                {mascota.especie || 'Sin especie'} {mascota.raza ? `- ${mascota.raza}` : ''}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', flex: 1 }}>
                <span style={{
                  background: '#E8F0FF', color: '#1E90FF', padding: '3px 10px',
                  borderRadius: '20px', fontSize: '12px', fontWeight: '600', height: 'fit-content'
                }}>
                  {mascota.nivel_asistencia ? mascota.nivel_asistencia.nombre : 'Sin nivel'}
                </span>
                
                {mascota.aprobada === null && (
                  <span style={{ background: '#F0F0F0', color: '#888888', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    ⏳ Pendiente
                  </span>
                )}
                {mascota.aprobada === true && (
                  <span style={{ background: '#E8F8F0', color: '#28C76F', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    ✓ Aprobada
                  </span>
                )}
                {mascota.aprobada === false && (
                  <span style={{ background: '#FFEBEB', color: '#FF6B6B', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    ✗ Rechazada
                  </span>
                )}
              </div>

              <button style={{
                color: '#F5A800', background: 'transparent', border: 'none',
                cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 0 0',
                textAlign: 'left', marginTop: 'auto'
              }}>
                Ver detalle →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisMascotasPage;
