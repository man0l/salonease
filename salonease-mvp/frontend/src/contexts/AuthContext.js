import React, { createContext, useState, useCallback } from 'react';
import { api, authApi } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  const fetchUser = useCallback(async () => {
    if (loading) return;
    console.log('fetching user');
    try {
      setLoading(true);
      const response = await authApi.me();
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user); // Set the user state with the response data
      return true;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken);
    } catch (error) {
      console.error('Logout error', error.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      await fetchUser();
      return true;
    } catch (error) {
      console.error('Registration error', error.message);
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
