import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegistroPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    cedula: '',
    correo: '',
    telefono: '',
    password: '',
    confirmar_password: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Este campo es requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Este campo es requerido';
    if (!formData.cedula.trim()) newErrors.cedula = 'Este campo es requerido';
    if (!formData.correo.trim()) {
      newErrors.correo = 'Este campo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido';
    }
    if (!formData.password) {
      newErrors.password = 'Este campo es requerido';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    if (!formData.confirmar_password) {
      newErrors.confirmar_password = 'Este campo es requerido';
    } else if (formData.password !== formData.confirmar_password) {
      newErrors.confirmar_password = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await register(formData);
      navigate('/mi-cuenta/dashboard');
    } catch (error) {
      if (error.response && error.response.data) {
        // Backend specific field errors or general errors
        const errData = error.response.data;
        if (typeof errData === 'object' && !Array.isArray(errData)) {
            // Map field errors back to the form
            const newErrors = {...errors};
            let generalError = '';
            for (let key in errData) {
                if(formData.hasOwnProperty(key)) {
                    newErrors[key] = Array.isArray(errData[key]) ? errData[key][0] : errData[key];
                } else {
                    generalError += `${errData[key]} `;
                }
            }
            setErrors(newErrors);
            if(generalError) setServerError(generalError);
        } else {
            setServerError('Error al crear la cuenta. Intente nuevamente.');
        }
      } else {
        setServerError('Error de conexión o problema en el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${hasError ? '#FF6B6B' : '#DDDDDD'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1A1A1A',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  });

  const labelStyle = {
    display: 'block',
    fontWeight: 500,
    color: '#1A1A1A',
    marginBottom: '6px',
    fontSize: '14px'
  };

  const errorTextStyle = {
    fontSize: '12px',
    color: '#FF6B6B',
    marginTop: '4px',
    display: 'block'
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EEEEEE',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src="/assets/logo.png" 
              alt="Logo" 
              style={{ width: '80px', height: 'auto', marginBottom: '16px' }} 
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px 0', textAlign: 'center' }}>
              Crear cuenta
            </h1>
            <p style={{ fontSize: '14px', color: '#555555', margin: '0 0 24px 0', textAlign: 'center' }}>
              Únete a Cuidados Los Patitos
            </p>
          </div>

          <style>
            {`
              input::placeholder {
                color: #AAAAAA;
              }
            `}
          </style>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nombre*</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  style={inputStyle(errors.nombre)}
                  onFocus={(e) => !errors.nombre && (e.target.style.borderColor = '#F5A800')}
                  onBlur={(e) => !errors.nombre && (e.target.style.borderColor = '#DDDDDD')}
                />
                {errors.nombre && <span style={errorTextStyle}>{errors.nombre}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Apellidos*</label>
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  style={inputStyle(errors.apellidos)}
                  onFocus={(e) => !errors.apellidos && (e.target.style.borderColor = '#F5A800')}
                  onBlur={(e) => !errors.apellidos && (e.target.style.borderColor = '#DDDDDD')}
                />
                {errors.apellidos && <span style={errorTextStyle}>{errors.apellidos}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Cédula*</label>
              <input
                type="text"
                name="cedula"
                placeholder="Ej: 1-0234-0567"
                value={formData.cedula}
                onChange={handleChange}
                style={inputStyle(errors.cedula)}
                onFocus={(e) => !errors.cedula && (e.target.style.borderColor = '#F5A800')}
                onBlur={(e) => !errors.cedula && (e.target.style.borderColor = '#DDDDDD')}
              />
              {errors.cedula && <span style={errorTextStyle}>{errors.cedula}</span>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Correo electrónico*</label>
              <input
                type="email"
                name="correo"
                placeholder="correo@ejemplo.com"
                value={formData.correo}
                onChange={handleChange}
                style={inputStyle(errors.correo)}
                onFocus={(e) => !errors.correo && (e.target.style.borderColor = '#F5A800')}
                onBlur={(e) => !errors.correo && (e.target.style.borderColor = '#DDDDDD')}
              />
              {errors.correo && <span style={errorTextStyle}>{errors.correo}</span>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                placeholder="Ej: 8888-0000"
                value={formData.telefono}
                onChange={handleChange}
                style={inputStyle(errors.telefono)}
                onFocus={(e) => !errors.telefono && (e.target.style.borderColor = '#F5A800')}
                onBlur={(e) => !errors.telefono && (e.target.style.borderColor = '#DDDDDD')}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Contraseña*</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  style={inputStyle(errors.password)}
                  onFocus={(e) => !errors.password && (e.target.style.borderColor = '#F5A800')}
                  onBlur={(e) => !errors.password && (e.target.style.borderColor = '#DDDDDD')}
                />
                {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Confirmar contraseña*</label>
                <input
                  type="password"
                  name="confirmar_password"
                  placeholder="Repetir contraseña"
                  value={formData.confirmar_password}
                  onChange={handleChange}
                  style={inputStyle(errors.confirmar_password)}
                  onFocus={(e) => !errors.confirmar_password && (e.target.style.borderColor = '#F5A800')}
                  onBlur={(e) => !errors.confirmar_password && (e.target.style.borderColor = '#DDDDDD')}
                />
                {errors.confirmar_password && <span style={errorTextStyle}>{errors.confirmar_password}</span>}
              </div>
            </div>

            {serverError && (
              <div style={{
                background: '#FFEBEB',
                color: '#FF6B6B',
                border: '1px solid #FF6B6B',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                marginTop: '12px',
                marginBottom: '16px'
              }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#CCCCCC' : '#F5A800',
                color: loading ? '#666666' : '#1A1A1A',
                fontWeight: 600,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px'
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#555555' }}>
            ¿Ya tienes cuenta?{' '}
            <span 
              onClick={() => navigate('/login')}
              style={{ color: '#F5A800', fontWeight: 600, cursor: 'pointer' }}
            >
              Iniciar sesión
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegistroPage;
