import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHabitacionesPersonal, registrarLimpieza } from '../../api/habitacionesApi';

export default function RegistrarLimpiezaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'error', text: '' }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const response = await getHabitacionesPersonal();
        setHabitaciones(response.data);
      } catch (error) {
        console.error('Error cargando habitaciones', error);
      }
    };
    fetchHabitaciones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const habitacionIdSeleccionado = parseInt(formData.get('habitacion'));

    const data = {
      habitacion: habitacionIdSeleccionado,
      realizada_por: usuario?.usuario_id || usuario?.id || null, // Del contexto de sesion
      fecha_limpieza: formData.get('fecha_limpieza'),
      hora_inicio: formData.get('hora_inicio') || null,
      hora_fin: formData.get('hora_fin') || null,
      observaciones: formData.get('observaciones') || '',
    };

    try {
      if (!data.realizada_por) throw new Error('No se ha podido identificar el ID del usuario en sesión.');
      await registrarLimpieza(habitacionIdSeleccionado, data);
      setMensaje({ tipo: 'success', text: '✅ Limpieza registrada exitosamente' });
      e.target.reset(); // Limpiar formulario
      // Set default date again after reset
      e.target.elements['fecha_limpieza'].value = new Date().toISOString().split('T')[0];
    } catch (error) {
      setMensaje({ tipo: 'error', text: error.response?.data?.error || error.message || 'Error al registrar limpieza' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #DDDDDD',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const currentDayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ maxWidth: '560px', margin: '32px auto' }}>
        
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', textAlign: 'center', marginBottom: '24px' }}>
          Registrar Limpieza
        </h1>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EEEEEE',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          
          {mensaje && mensaje.tipo === 'success' && (
            <div style={{ background: '#E8F8EF', color: '#28C76F', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 500, textAlign: 'center' }}>
              {mensaje.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <style>
              {`
                .limpieza-form-input:focus {
                  border-color: #F5A800 !important;
                }
              `}
            </style>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>
                Habitación <span style={{ color: '#FF6B6B' }}>*</span>
              </label>
              <select name="habitacion" className="limpieza-form-input" style={inputStyle} required>
                <option value="">Seleccione una habitación...</option>
                {habitaciones.map(hab => (
                  <option key={hab.habitacion_id} value={hab.habitacion_id}>
                    Habitación {hab.numero || hab.habitacion_id} {hab.descripcion ? `- ${hab.descripcion.substring(0,25)}...` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>
                Fecha de limpieza <span style={{ color: '#FF6B6B' }}>*</span>
              </label>
              <input type="date" name="fecha_limpieza" className="limpieza-form-input" style={inputStyle} defaultValue={currentDayStr} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>Hora inicio</label>
                <input type="time" name="hora_inicio" className="limpieza-form-input" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>Hora fin</label>
                <input type="time" name="hora_fin" className="limpieza-form-input" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555555', fontWeight: 600 }}>Observaciones</label>
              <textarea 
                name="observaciones" 
                className="limpieza-form-input" 
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
                placeholder="Detalles sobre la limpieza..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#F5A800',
                color: '#1A1A1A',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#e69d00')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#F5A800')}
            >
              {loading ? 'Registrando...' : 'Registrar limpieza'}
            </button>

            {mensaje && mensaje.tipo === 'error' && (
              <div style={{ color: '#FF6B6B', marginTop: '16px', fontWeight: 500, textAlign: 'center', fontSize: '14px' }}>
                ⚠ {mensaje.text}
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
