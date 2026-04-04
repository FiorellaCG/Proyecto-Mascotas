import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { usuario, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    if (usuario) {
      const rol = usuario.rol_nombre;
      if (rol === 'Administrador') navigate('/admin/dashboard');
      else if (rol === 'Especialista') navigate('/especialista/dashboard');
      else if (rol === 'Dueño') navigate('/mi-cuenta/dashboard');
      else if (rol === 'Personal limpieza') navigate('/limpieza/dashboard');
      else navigate('/');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleLinkClick = (e, sectionId) => {
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/' && sectionId !== '#hero') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      if (sectionId === '#hero') {
        scrollToTop();
      } else {
        const element = document.querySelector(sectionId);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (!usuario || !usuario.nombre) return '';
    const firstName = usuario.nombre.charAt(0).toUpperCase();
    const lastName = usuario.apellidos ? usuario.apellidos.charAt(0).toUpperCase() : '';
    return `${firstName}${lastName}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Logo + Nombre */}
        <div className="navbar-brand" onClick={scrollToTop}>
          <img 
            src="/assets/logo.png" 
            alt="Logo Los Patitos" 
            className="navbar-logo" 
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="navbar-title">Cuidados Los Patitos</span>
        </div>

        {/* Hamburger Icon */}
        <div className="menu-toggle" onClick={toggleMenu}>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        </div>

        {/* Nav Links */}
        <div className={`navbar-mid ${isOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <a href="#hero" onClick={(e) => handleLinkClick(e, '#hero')}>Inicio</a>
            <a href="#servicios" onClick={(e) => handleLinkClick(e, '#servicios')}>Servicios</a>
            <a href="#paquetes" onClick={(e) => handleLinkClick(e, '#paquetes')}>Paquetes</a>
            <a href="#nosotros" onClick={(e) => handleLinkClick(e, '#nosotros')}>Nosotros</a>
            <a href="#contacto" onClick={(e) => handleLinkClick(e, '#contacto')}>Contacto</a>
          </div>

          <div className="divider"></div>

          {/* User Session Area */}
          <div className="session-area">
            {!loading && usuario === null && (
              <>
                <button 
                  onClick={() => navigate('/registro')}
                  style={{
                    background: 'transparent',
                    color: '#1A1A1A',
                    border: '1px solid #DDDDDD',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginRight: '8px',
                  }}
                  onMouseOver={(e) => e.target.style.background = '#F8F8F8'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  Registrarse
                </button>
                <button 
                  onClick={handleLoginRedirect}
                  style={{
                    background: '#F5A800',
                    color: '#1A1A1A',
                    fontWeight: 600,
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Ingresar
                </button>
              </>
            )}

            {!loading && usuario !== null && (
              <div className="user-profile">
                <div 
                  className="avatar-circle"
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: '#F5A800', color: '#1A1A1A', 
                    fontWeight: 700, fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {getUserInitials()}
                </div>
                <span style={{ fontSize: '14px', color: '#333333', fontWeight: 500 }}>
                  {usuario.nombre}
                </span>
                <button 
                  onClick={handleDashboardRedirect}
                  style={{
                    background: '#1A1A1A', color: '#FFFFFF',
                    padding: '8px 18px', borderRadius: '8px', 
                    fontSize: '13px', fontWeight: 600, border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Mi panel
                </button>
                <button 
                  onClick={handleLogout} 
                  style={{ background:'transparent', border:'1px solid #FF6B6B', color:'#FF6B6B', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontWeight:600, marginLeft: 12 }}
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
