import { createContext, useState, useEffect, useContext } from 'react';
import { getMeApi, loginApi, logoutApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMeApi();
        if (response.status === 200) {
          setUsuario(response.data);
        } else {
          setUsuario(null);
        }
      } catch (error) {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (correo, password) => {
    try {
      const response = await loginApi(correo, password);
      if (response.status === 200) {
        setUsuario(response.data);
        return response.data; // Return data to be used by the page components
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUsuario(null);
      window.location.href = '/login'; // Force redirect to login page logic
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
