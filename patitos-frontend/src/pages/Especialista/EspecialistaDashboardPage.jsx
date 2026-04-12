import { useAuth } from '../../context/AuthContext'

export default function EspecialistaDashboardPage() {
  const { usuario } = useAuth()
  return (
    <div style={{ padding:'40px', maxWidth:'600px', margin:'0 auto', fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize:'26px', fontWeight:700, color:'#1A1A1A' }}>
        Bienvenido, {usuario?.nombre}
      </h1>
      <p style={{ color:'#555555', marginTop:'8px' }}>
        Panel del especialista — próximamente disponible.
      </p>
    </div>
  )
}
