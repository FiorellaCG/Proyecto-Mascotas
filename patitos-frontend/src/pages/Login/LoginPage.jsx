import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import './LoginPage.css';

const LoginPage = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const userData = await login(correo, password);
      const rol = userData.rol_nombre;
      
      if (rol === 'Administrador') {
        navigate('/admin/dashboard');
      } else if (rol === 'Especialista') {
        navigate('/especialista/dashboard');
      } else if (rol === 'Dueño') {
        navigate('/mi-cuenta/dashboard');
      } else if (rol === 'Personal limpieza') {
        navigate('/limpieza/dashboard');
      } else {
        navigate('/'); // Fallback
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else {
        setError('Credenciales incorrectas o usuario inactivo');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page-container">
        <div className="login-card">
          <img src="/assets/logo.png" alt="Logo Los Patitos" className="login-logo" />
          <h1 className="login-title">Cuidados Los Patitos</h1>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
            
            {error && <div className="login-error">{error}</div>}
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
