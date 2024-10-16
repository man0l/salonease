import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api, authApi } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Error loading user', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      await loadUser();
      return true;
    } catch (error) {
      console.error('Login error', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken);
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      await loadUser();
      return true;
    } catch (error) {
      console.error('Registration error', error);
      return false;
    }
  };

  const updateUser = async (userData) => {
    const response = await api.put('/auth/update', userData);
    setUser(response.data);
    return response.data;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
