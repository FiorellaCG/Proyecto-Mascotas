import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/Login/LoginPage';
import RegistroPage from '../pages/Auth/RegistroPage';
import HomePage from '../pages/Home/HomePage';
import MascotasPendientesPage from '../pages/Admin/MascotasPendientesPage';
import TodasMascotasPage from '../pages/Admin/TodasMascotasPage';
import DashboardDuenoPage from '../pages/MiCuenta/DashboardDuenoPage';
import MisMascotasPage from '../pages/MiCuenta/MisMascotasPage';
import RegistrarMascotaPage from '../pages/MiCuenta/RegistrarMascotaPage';
import MascotaDetallePage from '../pages/MiCuenta/MascotaDetallePage';
import MisReservacionesPage from '../pages/MiCuenta/MisReservacionesPage';
import CrearReservacionPage from '../pages/MiCuenta/CrearReservacionPage';
import DetalleReservacionPage from '../pages/MiCuenta/DetalleReservacionPage';
import HabitacionesListPage from '../pages/Habitaciones/HabitacionesListPage';
import HabitacionDetailPage from '../pages/Habitaciones/HabitacionDetailPage';
import GestionUsuariosPage from '../pages/Admin/GestionUsuariosPage';
import ReservacionesAdminPage from '../pages/Admin/ReservacionesAdminPage';
import EspecialistaDashboardPage from '../pages/Especialista/EspecialistaDashboardPage';

import MisLimpiezasPage from '../pages/Personal/MisLimpiezasPage';
import RegistrarLimpiezaPage from '../pages/Personal/RegistrarLimpiezaPage';

const PrivateRoute = ({ children, requiredRol }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0A0A0A' }}>
        <div style={{ color: '#F5A800', fontSize: '24px' }}>Cargando...</div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRol && usuario.rol_nombre !== requiredRol) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

const NoAutorizado = () => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0A0A0A', color: '#F5A800' }}>
    <h1>Acceso Denegado</h1>
    <p style={{ color: '#FFF' }}>No tienes permisos para ver esta página.</p>
  </div>
);

function PublicOnlyRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return null;
  if (usuario) {
    const rutas = {
      'Administrador': '/admin/mascotas/pendientes',
      'Dueño': '/mi-cuenta/mascotas',
      'Especialista': '/especialista/dashboard',
      'Personal limpieza': '/personal/limpiezas',
    };
    return <Navigate to={rutas[usuario.rol_nombre] || '/'} replace />;
  }
  return children;
}



const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/registro" element={<PublicOnlyRoute><RegistroPage /></PublicOnlyRoute>} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />
      
      {/* Protected Routes */}
      <Route path="/admin/*" element={
        <PrivateRoute requiredRol="Administrador">
          <Routes>
            <Route path="mascotas/pendientes" element={<MascotasPendientesPage />} />
            <Route path="mascotas/todas" element={<TodasMascotasPage />} />
            <Route path="habitaciones" element={<HabitacionesListPage />} />
            <Route path="habitaciones/:id" element={<HabitacionDetailPage />} />
            <Route path="usuarios" element={<GestionUsuariosPage />} />
            <Route path="reservaciones" element={<ReservacionesAdminPage />} />
          </Routes>
        </PrivateRoute>
      } />
      
      <Route path="/mi-cuenta/*" element={
        <PrivateRoute requiredRol="Dueño">
          <Routes>
            <Route path="dashboard" element={<DashboardDuenoPage />} />
            <Route path="mascotas/nueva" element={<RegistrarMascotaPage />} />
            <Route path="mascotas/:id" element={<MascotaDetallePage />} />
            <Route path="mascotas" element={<MisMascotasPage />} />
            <Route path="reservaciones" element={<MisReservacionesPage />} />
            <Route path="reservaciones/:id" element={<DetalleReservacionPage />} />
            <Route path="reservaciones/nueva" element={<CrearReservacionPage />} />
          </Routes>
        </PrivateRoute>
      } />

      <Route path="/especialista/*" element={
        <PrivateRoute requiredRol="Especialista">
          <Routes><Route path="dashboard" element={<EspecialistaDashboardPage />} /></Routes>
        </PrivateRoute>
      } />

      <Route path="/personal/*" element={
        <PrivateRoute requiredRol="Personal limpieza">
          <Routes>
            <Route path="limpiezas" element={<MisLimpiezasPage />} />
            <Route path="limpiezas/nueva" element={<RegistrarLimpiezaPage />} />
          </Routes>
        </PrivateRoute>
      } />
      
      {/* Fallback to Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
