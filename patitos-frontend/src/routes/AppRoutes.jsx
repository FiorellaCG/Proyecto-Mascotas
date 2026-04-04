import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/Login/LoginPage';
import RegistroPage from '../pages/Auth/RegistroPage';
import HomePage from '../pages/Home/HomePage';
import MascotasPendientesPage from '../pages/Admin/MascotasPendientesPage';
import DashboardDuenoPage from '../pages/MiCuenta/DashboardDuenoPage';
import MisMascotasPage from '../pages/MiCuenta/MisMascotasPage';
import RegistrarMascotaPage from '../pages/MiCuenta/RegistrarMascotaPage';
import MascotaDetallePage from '../pages/MiCuenta/MascotaDetallePage';
import HabitacionesListPage from '../pages/Habitaciones/HabitacionesListPage';
import HabitacionDetailPage from '../pages/Habitaciones/HabitacionDetailPage';

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
      'Administrador': '/admin/dashboard',
      'Dueño': '/mi-cuenta/dashboard',
      'Especialista': '/especialista/dashboard',
      'Personal limpieza': '/limpieza/dashboard',
    };
    return <Navigate to={rutas[usuario.rol_nombre] || '/'} replace />;
  }
  return children;
}

// Pŕotection Dashboards Mock Components (Placeholder if none exists)
const AdminDashboard = () => <div style={{color:'white', padding: 20}}>Admin Dashboard</div>;
const DuenoDashboard = () => <div style={{color:'white', padding: 20}}>Dueño Dashboard</div>;
const EspecialistaDashboard = () => <div style={{color:'white', padding: 20}}>Especialista Dashboard</div>;
const LimpiezaDashboard = () => <div style={{color:'white', padding: 20}}>Limpieza Dashboard</div>;

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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="mascotas/pendientes" element={<MascotasPendientesPage />} />
            <Route path="habitaciones" element={<HabitacionesListPage />} />
            <Route path="habitaciones/:id" element={<HabitacionDetailPage />} />
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
          </Routes>
        </PrivateRoute>
      } />

      <Route path="/especialista/*" element={
        <PrivateRoute requiredRol="Especialista">
          <Routes><Route path="dashboard" element={<EspecialistaDashboard />} /></Routes>
        </PrivateRoute>
      } />

      <Route path="/limpieza/*" element={
        <PrivateRoute requiredRol="Personal limpieza">
          <Routes><Route path="dashboard" element={<LimpiezaDashboard />} /></Routes>
        </PrivateRoute>
      } />
      
      {/* Fallback to Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
