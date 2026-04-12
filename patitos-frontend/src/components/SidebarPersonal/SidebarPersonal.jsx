import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SidebarPersonal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!usuario || usuario.rol_nombre !== 'Personal limpieza') {
    return null;
  }

  const menuItems = [
    { label: 'Mis Limpiezas', path: '/personal/limpiezas', icon: '🧹' },
    { label: 'Registrar Limpieza', path: '/personal/limpiezas/nueva', icon: '➕' },
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
          marginBottom: '32px',
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
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                padding: '15px 12px',
                background: isActive ? '#F5A800' : '#2A2A2A',
                color: isActive ? '#1A1A1A' : '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isCollapsed ? '20px' : '14px',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '600' : '400',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.target.style.background = '#3A3A3A';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.target.style.background = '#2A2A2A';
              }}
              title={item.label}
            >
              <span style={{ marginRight: isCollapsed ? '0px' : '10px' }}>{item.icon}</span>
              {!isCollapsed && item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
