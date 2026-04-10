import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SidebarAdmin() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!usuario || usuario.rol_nombre !== 'Administrador') {
    return null;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Mascotas Pendientes', path: '/admin/mascotas/pendientes', icon: '📋' },
    { label: 'Todas las Mascotas', path: '/admin/mascotas/todas', icon: '🐾' },
    { label: 'Habitaciones', path: '/admin/habitaciones', icon: '🏠' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 80, // Debajo del navbar
        height: 'calc(100vh - 80px)',
        width: isCollapsed ? '80px' : '250px',
        background: '#1A1A1A',
        color: '#FFFFFF',
        transition: 'width 0.3s ease',
        zIndex: 100,
        overflowY: 'auto',
        padding: isCollapsed ? '10px' : '20px',
      }}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          background: '#F5A800',
          color: '#1A1A1A',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {isCollapsed ? '▶' : '◀'}
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              width: '100%',
              padding: '15px 12px',
              background: '#2A2A2A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: isCollapsed ? '20px' : '14px',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.background = '#3A3A3A')}
            onMouseOut={(e) => (e.target.style.background = '#2A2A2A')}
            title={item.label}
          >
            <span style={{ marginRight: isCollapsed ? '0px' : '10px' }}>{item.icon}</span>
            {!isCollapsed && item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
