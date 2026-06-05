import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On app load, if a token exists fetch the user from MongoDB
  useEffect(() => {
    const token = localStorage.getItem('trailbliss_token');
    if (!token) { setAuthLoading(false); return; }

    api.get('/user/profile')
      .then(({ data }) => setUser(data.data || data.user || data))
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem('trailbliss_token');
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('trailbliss_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('trailbliss_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
