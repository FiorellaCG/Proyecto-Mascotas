import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisMascotas } from '../../api/mascotasApi';
import { 
  getHabitacionesDisponibles, 
  getTiposEstancia, 
  getPaquetes, 
  crearReservacion 
} from '../../api/reservacionesApi';

export default function CrearReservacionPage() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [loadingInit, setLoadingInit] = useState(true);
  
  const [mascotas, setMascotas] = useState([]);
  const [tiposEstancia, setTiposEstancia] = useState([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);

  // Form state
  const [mascotaId, setMascotaId] = useState('');
  const [tipoHabitacionId, setTipoHabitacionId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [tipoEstanciaId, setTipoEstanciaId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [esIndefinida, setEsIndefinida] = useState(false);
  const [fechaFin, setFechaFin] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (tipoHabitacionId) {
      cargarHabitacionesDisponibles(tipoHabitacionId);
    } else {
      setHabitacionesDisponibles([]);
      setHabitacionId('');
    }
  }, [tipoHabitacionId]);

  const cargarDatosIniciales = async () => {
    try {
      const [resMascotas, resEstancias, resPaquetes] = await Promise.all([
        getMisMascotas(),
        getTiposEstancia(),
        getPaquetes()
      ]);
      setMascotas(resMascotas.data.filter(m => m.aprobada === true || m.aprobada === 1));
      setTiposEstancia(resEstancias.data);
      setPaquetesDisponibles(resPaquetes.data);
    } catch {
      setErrorMsg('Error al cargar datos iniciales. Refresca la página.');
    } finally {
      setLoadingInit(false);
    }
  };

  const cargarHabitacionesDisponibles = async (tipoId) => {
    try {
      const res = await getHabitacionesDisponibles({ tipo_habitacion_id: tipoId });
      setHabitacionesDisponibles(res.data);
      // Auto-select si hay solo una
      if (res.data.length === 1) setHabitacionId(res.data[0].habitacion_id);
      else setHabitacionId('');
    } catch {
      setErrorMsg('Error al cargar habitaciones disponibles.');
    }
  };

  const togglePaquete = (id) => {
    setPaquetesSeleccionados(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!mascotaId || !habitacionId || !tipoEstanciaId || !fechaInicio) {
      setErrorMsg('Por favor, completa los campos requeridos.');
      return;
    }
    if (!esIndefinida && !fechaFin) {
      setErrorMsg('Selecciona una fecha de fin o marca estancia indefinida.');
      return;
    }
    if (!esIndefinida && fechaFin < fechaInicio) {
      setErrorMsg('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    setPaso(2);
  };

  const handleConfirmar = async () => {
    setErrorMsg('');
    try {
      await crearReservacion({
        mascota_id: mascotaId,
        habitacion_id: habitacionId,
        tipo_estancia_id: tipoEstanciaId,
        fecha_inicio: fechaInicio,
        fecha_fin: esIndefinida ? null : fechaFin,
        es_indefinida: esIndefinida,
        observaciones,
        paquetes_ids: paquetesSeleccionados
      });
      setSuccessMsg('✅ Reservación creada. Está pendiente de confirmación.');
      setTimeout(() => navigate('/mi-cuenta/reservaciones'), 2000);
    } catch (err) {
      setErrorMsg(JSON.stringify(err.response?.data) || 'Error al crear la reservación');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #DDDDDD',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1A1A1A',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (loadingInit) return <div style={{ textAlign: 'center', padding: '40px', color: '#F5A800' }}>Cargando formulario...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Stepper Visual */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: '#F5A800', 
          color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
        }}>1</div>
        <div style={{ height: '2px', flex: 1, background: paso === 2 ? '#F5A800' : '#EEEEEE', margin: '0 10px' }} />
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: paso === 2 ? '#F5A800' : '#EEEEEE', 
          color: paso === 2 ? '#1A1A1A' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
        }}>2</div>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #EEEEEE', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        
        {paso === 1 && (
          <form onSubmit={handleSiguiente}>
            <h2 style={{ fontSize: '24px', color: '#1A1A1A', marginBottom: '24px', marginTop: 0 }}>Datos de la reservación</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Mascota *</label>
              <select style={inputStyle} value={mascotaId} onChange={e => setMascotaId(e.target.value)} required onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'}>
                <option value="">Selecciona una mascota aprobada</option>
                {mascotas.map(m => <option key={m.mascota_id} value={m.mascota_id}>{m.nombre}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Tipo de habitación</label>
                <select style={inputStyle} value={tipoHabitacionId} onChange={e => setTipoHabitacionId(e.target.value)} onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'}>
                  <option value="">Selecciona tipo para ver disp.</option>
                  <option value="1">Individual</option>
                  <option value="2">Individual con cámara</option>
                  <option value="3">De cuidados especiales</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Habitación disponible *</label>
                <select style={inputStyle} value={habitacionId} onChange={e => setHabitacionId(e.target.value)} required disabled={!tipoHabitacionId} onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'}>
                  <option value="">Selecciona una habitación</option>
                  {habitacionesDisponibles.map(h => (
                    <option key={h.habitacion_id} value={h.habitacion_id}>H-{h.numero} ({h.descripcion})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Tipo de estancia *</label>
              <select style={inputStyle} value={tipoEstanciaId} onChange={e => setTipoEstanciaId(e.target.value)} required onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'}>
                <option value="">Selecciona un tipo de estancia</option>
                {tiposEstancia.map(t => (
                  <option key={t.tipo_estancia_id} value={t.tipo_estancia_id}>
                    {t.nombre} {t.hora_inicio && `- ${t.hora_inicio} a ${t.hora_fin}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Fecha inicio *</label>
                <input type="date" style={inputStyle} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 600, color: '#333', cursor: 'pointer', marginBottom: '8px' }}>
                  <input type="checkbox" style={{ marginRight: '8px', transform: 'scale(1.2)', accentColor: '#F5A800' }} checked={esIndefinida} onChange={e => setEsIndefinida(e.target.checked)} />
                  ¿Estancia indefinida?
                </label>
                {!esIndefinida && (
                  <input type="date" style={inputStyle} value={fechaFin} onChange={e => setFechaFin(e.target.value)} required={!esIndefinida} onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'} />
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Observaciones</label>
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Agrega cualquier observación adicional..." onFocus={(e) => e.target.style.borderColor = '#F5A800'} onBlur={(e) => e.target.style.borderColor = '#DDDDDD'} />
            </div>

            {errorMsg && <p style={{ color: '#FF6B6B', fontSize: '14px', marginBottom: '16px' }}>{errorMsg}</p>}

            <button type="submit" style={{ width: '100%', background: '#F5A800', color: '#1A1A1A', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#e69d00'} onMouseLeave={e => e.target.style.background = '#F5A800'}>
              Siguiente →
            </button>
          </form>
        )}

        {paso === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', color: '#1A1A1A', marginBottom: '24px', marginTop: 0 }}>Paquetes adicionales (opcional)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {paquetesDisponibles.map(p => {
                const isSelected = paquetesSeleccionados.includes(p.paquete_id);
                return (
                  <div
                    key={p.paquete_id}
                    onClick={() => togglePaquete(p.paquete_id)}
                    style={{
                      border: `2px solid ${isSelected ? '#F5A800' : '#EEEEEE'}`,
                      background: isSelected ? '#FFFBF0' : '#FFFFFF',
                      borderRadius: '12px', padding: '20px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>{p.nombre}</h3>
                      {isSelected && <span style={{ color: '#F5A800', fontSize: '20px' }}>✓</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{p.descripcion}</p>
                  </div>
                )
              })}
            </div>

            {errorMsg && <p style={{ color: '#FF6B6B', fontSize: '14px', marginBottom: '16px' }}>{errorMsg}</p>}
            {successMsg && <p style={{ color: '#28C76F', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{successMsg}</p>}

            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setPaso(1)} style={{ flex: 1, background: '#FFFFFF', border: '1px solid #DDDDDD', color: '#1A1A1A', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                ← Anterior
              </button>
              <button 
                onClick={handleConfirmar} 
                disabled={!!successMsg}
                style={{ flex: 2, background: '#F5A800', border: 'none', color: '#1A1A1A', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: successMsg ? 'default' : 'pointer' }}
              >
                Confirmar reservación
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
