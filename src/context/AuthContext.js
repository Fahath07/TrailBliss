import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trailbliss_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData, token) => {
    localStorage.setItem('trailbliss_token', token);
    localStorage.setItem('trailbliss_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('trailbliss_token');
    localStorage.removeItem('trailbliss_user');
    setUser(null);
  };

  // Keep user state in sync across tabs
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem('trailbliss_user');
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
