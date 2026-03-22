import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hotelease_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token: newToken } = res.data.data;
    localStorage.setItem('hotelease_token', newToken);
    localStorage.setItem('hotelease_user', JSON.stringify(user));
    setToken(newToken);
    setUser(user);
    return user;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { user, token: newToken } = res.data.data;
    localStorage.setItem('hotelease_token', newToken);
    localStorage.setItem('hotelease_user', JSON.stringify(user));
    setToken(newToken);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('hotelease_token');
    localStorage.removeItem('hotelease_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
