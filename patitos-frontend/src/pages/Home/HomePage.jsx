import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* SECCIÓN 1: HERO */}
      <section id="hero" className="hero-section">
        <div className="section-container hero-container">
          <img 
            src="/assets/logo.png" 
            alt="Los Patitos" 
            className="hero-logo" 
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1 className="hero-title">El hogar de tus mascotas cuando no estás</h1>
          <p className="hero-subtitle">
            Guardería profesional, cuidados especiales y monitoreo en tiempo real
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Reservar ahora
            </button>
            <button className="btn-secondary" onClick={() => handleScroll('servicios')}>
              Ver servicios
            </button>
          </div>
        </div>
        <div className="scroll-indicator" onClick={() => handleScroll('servicios')}>
          <span>↓</span>
        </div>
      </section>

      {/* SECCIÓN 2: SERVICIOS */}
      <section id="servicios" className="services-section">
        <div className="section-container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="icon-wrapper"><span className="icon">⏱️</span></div>
              <h3>Guardería diurna</h3>
              <p>Cuidado profesional de 8am a 5pm</p>
            </div>
            <div className="service-card">
              <div className="icon-wrapper"><span className="icon">🏠</span></div>
              <h3>Estancia completa</h3>
              <p>Tu mascota con nosotros las 24 horas</p>
            </div>
            <div className="service-card">
              <div className="icon-wrapper"><span className="icon">❤️</span></div>
              <h3>Cuidados especiales</h3>
              <p>Atención médica y cuidados personalizados</p>
            </div>
            <div className="service-card">
              <div className="icon-wrapper"><span className="icon">📷</span></div>
              <h3>Monitoreo por cámara</h3>
              <p>Observa a tu mascota en tiempo real</p>
            </div>
            <div className="service-card">
              <div className="icon-wrapper"><span className="icon">🐾</span></div>
              <h3>Paseos y actividades</h3>
              <p>Ejercicio y diversión supervisada</p>
            </div>
            <div className="service-card">
              <div className="icon-wrapper"><span className="icon">💧</span></div>
              <h3>Terapias en piscina</h3>
              <p>Rehabilitación y recreación acuática</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: NIVELES DE ASISTENCIA */}
      <section id="asistencia" className="assistance-section">
        <div className="section-container">
          <h2 className="section-title">Niveles de Asistencia</h2>
          <div className="assistance-cards">
            <div className="asist-card">
              <div className="asist-info">
                <h3>Asistencia básica</h3>
                <p>Cuidados generales</p>
              </div>
              <span className="badge badge-green">Nivel 1</span>
            </div>
            <div className="asist-card">
              <div className="asist-info">
                <h3>Asistencia para movilidad</h3>
                <p>Soporte para desplazamiento</p>
              </div>
              <span className="badge badge-blue">Nivel 2</span>
            </div>
            <div className="asist-card">
              <div className="asist-info">
                <h3>Asistencia para alimentación</h3>
                <p>Apoyo durante comidas</p>
              </div>
              <span className="badge badge-blue">Nivel 3</span>
            </div>
            <div className="asist-card">
              <div className="asist-info">
                <h3>Asistencia para baño</h3>
                <p>Higiene y limpieza profunda</p>
              </div>
              <span className="badge badge-blue">Nivel 4</span>
            </div>
            <div className="asist-card">
              <div className="asist-info">
                <h3>Asistencia completa</h3>
                <p>Atención total 24/7</p>
              </div>
              <span className="badge badge-yellow">Premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: PAQUETES ADICIONALES */}
      <section id="paquetes" className="packages-section">
        <div className="section-container">
          <h2 className="section-title">Paquetes Adicionales</h2>
          <div className="packages-grid">
            <div className="package-card">
              <h3>Disfrute de juegos</h3>
              <p>Sesión de juegos y entretenimiento supervisado</p>
              <span className="price">Consultar precio</span>
              <button className="btn-add" onClick={() => navigate('/login')}>Agregar al reservar</button>
            </div>
            <div className="package-card">
              <h3>Paseos con acompañamiento</h3>
              <p>Paseo a sitios externos con especialista</p>
              <span className="price">Consultar precio</span>
              <button className="btn-add" onClick={() => navigate('/login')}>Agregar al reservar</button>
            </div>
            <div className="package-card">
              <h3>Paseo a espacio con piscina</h3>
              <p>Visita a área recreativa con piscina</p>
              <span className="price">Consultar precio</span>
              <button className="btn-add" onClick={() => navigate('/login')}>Agregar al reservar</button>
            </div>
            <div className="package-card">
              <h3>Terapias en piscina</h3>
              <p>Sesiones terapéuticas supervisadas</p>
              <span className="price">Consultar precio</span>
              <button className="btn-add" onClick={() => navigate('/login')}>Agregar al reservar</button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: NOSOTROS */}
      <section id="nosotros" className="about-section">
        <div className="section-container">
          <h2 className="section-title">¿Por qué elegirnos?</h2>
          <div className="about-grid">
            <div className="about-item">
              <div className="icon-circle circle-green">
                <span className="icon">🛡️</span>
              </div>
              <h4>Personal certificado</h4>
            </div>
            <div className="about-item">
              <div className="icon-circle circle-blue">
                <span className="icon">📷</span>
              </div>
              <h4>Monitoreo 24/7</h4>
            </div>
            <div className="about-item">
              <div className="icon-circle circle-green">
                <span className="icon">✅</span>
              </div>
              <h4>Instalaciones seguras</h4>
            </div>
            <div className="about-item">
              <div className="icon-circle circle-yellow">
                <span className="icon">❤️</span>
              </div>
              <h4>Atención personalizada</h4>
            </div>
          </div>
          <p className="about-desc">
            En Cuidados Los Patitos S.A. nos apasiona brindar el mejor servicio para tu mascota, garantizando 
            su bienestar, seguridad y diversión en todo momento. Somos más que una guardería, somos su segundo hogar.
          </p>
        </div>
      </section>

      {/* SECCIÓN 6: INFORMACIÓN */}
      <section id="contacto" className="contact-section">
        <div className="section-container">
          <h2 className="section-title">Información</h2>
          <div className="contact-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="contact-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <p style={{ justifyContent: 'center' }}><span>📍</span> Dirección: San José, Costa Rica</p>
              <p style={{ justifyContent: 'center' }}><span>📞</span> Teléfono: +506 2222-3333</p>
              <p style={{ justifyContent: 'center' }}><span>📧</span> Correo: info@lospatitos.cr</p>
              <p style={{ justifyContent: 'center' }}><span>🕒</span> Horario: Lunes a Domingo, 24 horas</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
