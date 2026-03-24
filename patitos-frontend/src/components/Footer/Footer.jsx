import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Column 1: Info */}
        <div className="footer-col">
          <div className="footer-brand">
            <img 
              src="/assets/logo.png" 
              alt="Los Patitos Logo" 
              className="footer-logo" 
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <span className="footer-title">Cuidados Los Patitos</span>
          </div>
          <p className="footer-desc">
            El hogar de tus mascotas cuando no estás. Guardería, monitoreo y más.
          </p>
        </div>

        {/* Column 2: Links Rápidos */}
        <div className="footer-col">
          <h3>Enlaces Rápidos</h3>
          <ul className="footer-links">
            <li><a href="#hero">Inicio</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#paquetes">Paquetes Adicionales</a></li>
            <li><a href="#nosotros">Nosotros</a></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="footer-col">
          <h3>Contacto</h3>
          <ul className="footer-contact">
            <li><span>📧</span> info@lospatitos.cr</li>
            <li><span>📞</span> +506 2222-3333</li>
            <li><span>📍</span> San José, Costa Rica</li>
          </ul>
        </div>

      </div>
      
      <div className="footer-bottom">
        <p>© 2025 Cuidados Los Patitos S.A. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
