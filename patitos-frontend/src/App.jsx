import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import SidebarAdmin from './components/SidebarAdmin/SidebarAdmin';
import SidebarPersonal from './components/SidebarPersonal/SidebarPersonal';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol_nombre === 'Administrador';
  const isPersonal = usuario?.rol_nombre === 'Personal limpieza';
  const hasSidebar = isAdmin || isPersonal;

  return (
    <div className="app-container">
      <Navbar />
      {hasSidebar ? (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {isAdmin && <SidebarAdmin />}
          {isPersonal && <SidebarPersonal />}
          <main style={{ flex: 1, background: '#F8F8F8', padding: '32px 40px', overflowY: 'auto' }}>
            <AppRoutes />
          </main>
        </div>
      ) : (
        <main style={{ minHeight: '100vh', background: '#F8F8F8' }}>
          <AppRoutes />
        </main>
      )}
    </div>
  );
}

export default App;
