import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On app load, verify session with MongoDB via cookie
  useEffect(() => {
    api.get('/user/profile')
      .then(({ data }) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Called after login/signup — backend already set the cookie
  const login = (userData) => {
    setUser(userData);
  };

  // Calls backend to clear the httpOnly cookie
  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch {
      // proceed regardless
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
