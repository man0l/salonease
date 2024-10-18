import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './useAuth';

export const useSalon = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSalons();
    }
  }, [user, currentPage]);

  const handleError = (error) => {
    if (error.response) {
      setError(`Server error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      setError('Network error: Unable to reach the server. Please check your internet connection.');
    } else {
      setError(`Error: ${error.message}`);
    }
  };

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/salons?page=${currentPage}&limit=10`);
      setSalons(response.data.salons);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const addSalon = async (salonData) => {
    try {
      const response = await api.post('/salons', salonData);
      setSalons([...salons, response.data]);
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateSalon = async (salonId, salonData) => {
    try {
      const response = await api.put(`/salons/${salonId}`, salonData);
      setSalons(salons.map(salon => salon.id === salonId ? response.data : salon));
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const deleteSalon = async (salonId) => {
    try {
      await api.delete(`/salons/${salonId}`);
      setSalons(salons.filter(salon => salon.id !== salonId));
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  return { 
    salons, 
    loading, 
    error, 
    addSalon, 
    updateSalon, 
    deleteSalon, 
    fetchSalons,
    currentPage,
    totalPages,
    setCurrentPage
  };
};
