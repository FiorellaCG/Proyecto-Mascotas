import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import SidebarAdmin from './components/SidebarAdmin/SidebarAdmin';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol_nombre === 'Administrador';

  return (
    <div className="app-container">
      <Navbar />
      {isAdmin && <SidebarAdmin />}
      <main style={{ marginLeft: isAdmin ? '250px' : '0px', transition: 'margin-left 0.3s ease' }}>
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
