import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNiveles, getTiposCuidado, registrarMascota } from '../../api/mascotasApi';

const RegistrarMascotaPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [niveles, setNiveles] = useState([]);
  const [tiposCuidado, setTiposCuidado] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  // Data State
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    nivel_asistencia_id: '',
    observaciones: '',
  });
  
  const [cuidados, setCuidados] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nivelesRes, tiposRes] = await Promise.all([
          getNiveles(),
          getTiposCuidado()
        ]);
        setNiveles(nivelesRes.data);
        setTiposCuidado(tiposRes.data);
      } catch (err) {
        console.error('Error fetching config:', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleNext = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.nivel_asistencia_id) newErrors.nivel_asistencia_id = 'Por favor selecciona un nivel';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep(2);
  };

  const agregarCuidado = () => {
    setCuidados([...cuidados, { tipo_cuidado_id: '', descripcion: '' }]);
  };

  const removerCuidado = (index) => {
    const newCuidados = [...cuidados];
    newCuidados.splice(index, 1);
    setCuidados(newCuidados);
  };

  const handleCuidadoChange = (index, field, value) => {
    const newCuidados = [...cuidados];
    newCuidados[index][field] = value;
    setCuidados(newCuidados);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    // Filter out invalid cuidados
    const validCuidados = cuidados.filter(c => c.tipo_cuidado_id && c.descripcion.trim());
    
    const payload = {
      ...formData,
      nivel_asistencia_id: parseInt(formData.nivel_asistencia_id, 10),
      cuidados: validCuidados.map(c => ({
        ...c,
        tipo_cuidado_id: parseInt(c.tipo_cuidado_id, 10)
      }))
    };
    
    // Convert empty date to null to avoid API errors
    if (!payload.fecha_nacimiento) {
      delete payload.fecha_nacimiento;
    }

    try {
      await registrarMascota(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/mi-cuenta/mascotas');
      }, 2500);
    } catch (err) {
      console.error(err);
      setSubmitError('Hubo un error al registrar la mascota. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 14px', 
    background: '#FFFFFF',
    border: `1px solid ${hasError ? '#FF6B6B' : '#DDDDDD'}`,
    borderRadius: '8px', fontSize: '14px', color: '#1A1A1A', 
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  });

  const labelStyle = { display: 'block', fontWeight: 500, color: '#1A1A1A', marginBottom: '6px', fontSize: '14px' };

  if (success) {
    return (
      <div style={{ maxWidth: '620px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{
          background: '#E8F8F0', border: '1px solid #28C76F', borderRadius: '16px', 
          padding: '36px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ color: '#28C76F', fontSize: '24px', marginBottom: '12px' }}>✓ ¡Mascota registrada exitosamente!</h2>
          <p style={{ color: '#1A1A1A', fontSize: '16px' }}>Tu solicitud está pendiente de aprobación del equipo veterinario.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '620px', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', 
            background: '#F5A800', border: '1px solid #F5A800',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>1</div>
          <span style={{ fontSize: '12px', marginTop: '6px', color: '#1A1A1A', fontWeight: 500 }}>Datos básicos</span>
        </div>
        
        <div style={{ width: '60px', height: '2px', background: step === 2 ? '#F5A800' : '#DDDDDD', margin: '0 10px', alignSelf: 'flex-start', marginTop: '15px' }}></div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', 
            background: step === 2 ? '#F5A800' : 'transparent',
            border: `1px solid ${step === 2 ? '#F5A800' : '#DDDDDD'}`,
            color: step === 2 ? '#FFFFFF' : '#AAAAAA', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>2</div>
          <span style={{ fontSize: '12px', marginTop: '6px', color: step === 2 ? '#1A1A1A' : '#AAAAAA', fontWeight: step === 2 ? 500 : 400 }}>Cuidados especiales</span>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nombre*</label>
              <input 
                name="nombre" value={formData.nombre} onChange={handleInputChange}
                type="text" style={inputStyle(errors.nombre)}
              />
              {errors.nombre && <div style={{ color: '#FF6B6B', fontSize: '13px', marginTop: '4px' }}>{errors.nombre}</div>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Especie</label>
              <select 
                name="especie" value={formData.especie} onChange={handleInputChange}
                style={inputStyle(false)}
              >
                <option value="">Seleccionar</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Conejo">Conejo</option>
                <option value="Reptil">Reptil</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Raza</label>
              <input 
                name="raza" value={formData.raza} onChange={handleInputChange}
                type="text" style={inputStyle(false)}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Fecha de nacimiento</label>
              <input 
                name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange}
                type="date" style={inputStyle(false)}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nivel de asistencia*</label>
              <select 
                name="nivel_asistencia_id" value={formData.nivel_asistencia_id} onChange={handleInputChange}
                style={inputStyle(errors.nivel_asistencia_id)}
              >
                <option value="">Seleccionar</option>
                {loadingConfig ? (
                  <option disabled>Cargando...</option>
                ) : (
                  niveles.map(n => <option key={n.nivel_id} value={n.nivel_id}>{n.nombre}</option>)
                )}
              </select>
              {errors.nivel_asistencia_id && <div style={{ color: '#FF6B6B', fontSize: '13px', marginTop: '4px' }}>{errors.nivel_asistencia_id}</div>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea 
                name="observaciones" value={formData.observaciones} onChange={handleInputChange}
                rows="3" style={inputStyle(false)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleNext}
                style={{
                  background: '#F5A800', color: '#1A1A1A', border: 'none',
                  padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#1A1A1A' }}>Cuidados especiales</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#555555' }}>Agrega si tu mascota requiere algún cuidado especial</p>

            <button 
              onClick={agregarCuidado}
              style={{
                background: '#F0F0F0', color: '#1A1A1A', border: 'none',
                padding: '10px 16px', borderRadius: '8px', fontWeight: 600,
                cursor: 'pointer', fontSize: '13px', marginBottom: '20px'
              }}
            >
              ＋ Agregar cuidado
            </button>

            {cuidados.map((cuidado, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <select 
                  value={cuidado.tipo_cuidado_id} 
                  onChange={(e) => handleCuidadoChange(index, 'tipo_cuidado_id', e.target.value)}
                  style={{...inputStyle(false), width: '40%'}}
                >
                  <option value="">Tipo de cuidado</option>
                  {tiposCuidado.map(t => <option key={t.tipo_cuidado_id} value={t.tipo_cuidado_id}>{t.nombre}</option>)}
                </select>
                
                <textarea 
                  value={cuidado.descripcion}
                  onChange={(e) => handleCuidadoChange(index, 'descripcion', e.target.value)}
                  placeholder="Descripción"
                  rows="2"
                  style={{...inputStyle(false), width: '55%'}}
                ></textarea>

                <button 
                  onClick={() => removerCuidado(index)}
                  style={{
                    background: 'transparent', color: '#FF6B6B', border: 'none',
                    padding: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'
                  }}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}

            {submitError && (
              <div style={{ color: '#FF6B6B', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{
                  background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A',
                  padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                ← Anterior
              </button>
              <button 
                disabled={isSubmitting}
                onClick={handleSubmit}
                style={{
                  background: '#F5A800', color: '#1A1A1A', border: 'none',
                  padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar mascota'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegistrarMascotaPage;
