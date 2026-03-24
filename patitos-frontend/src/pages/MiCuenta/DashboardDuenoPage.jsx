import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';

const DashboardDuenoPage = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', color: '#1A1A1A', marginBottom: '8px' }}>
        Bienvenido, {usuario?.nombre}
      </h1>
      <p style={{ color: '#555555', fontSize: '16px', marginBottom: '32px' }}>
        ¿Qué deseas hacer hoy?
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        <div 
          onClick={() => navigate('/mi-cuenta/mascotas')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #EEEEEE',
            borderRadius: '12px',
            padding: '28px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F5A800';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,168,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#EEEEEE';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          <h2 style={{ fontSize: '20px', color: '#1A1A1A', marginBottom: '8px' }}>🐾 Mis Mascotas</h2>
          <p style={{ color: '#555555', fontSize: '14px' }}>Gestiona y registra tus mascotas</p>
        </div>

        <div 
          onClick={() => navigate('/mi-cuenta/reservaciones')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #EEEEEE',
            borderRadius: '12px',
            padding: '28px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F5A800';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,168,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#EEEEEE';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          <h2 style={{ fontSize: '20px', color: '#1A1A1A', marginBottom: '8px' }}>📋 Mis Reservaciones</h2>
          <p style={{ color: '#555555', fontSize: '14px' }}>Ve el historial de tus reservas</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default DashboardDuenoPage;
