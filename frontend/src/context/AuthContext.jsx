import { createContext, useContext, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const authenticate = async (path, credentials) => {
    const { data } = await api.post(`/auth/${path}`, credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login: (data) => authenticate('login', data), register: (data) => authenticate('register', data), logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
