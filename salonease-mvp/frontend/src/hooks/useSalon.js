import { useState, useEffect, useCallback } from 'react';
import { api, staffApi } from '../utils/api';
import { useAuth } from './useAuth';
import ROLES from '../utils/roles';

export const useSalon = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const fetchSalons = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let response;
      if (user.role === ROLES.STAFF) {
        response = await staffApi.getAssociatedSalon();
        setSalons(response.data ? [response.data] : []);
      } else {
        response = await api.get(`/salons?page=${currentPage}&limit=10`);
        setSalons(response.data.salons);
        setTotalPages(response.data.totalPages);
      }
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, user]);

  useEffect(() => {
    if (user) {
      fetchSalons();
    }
  }, [user, fetchSalons]);

  const handleError = (error) => {
    if (error.response) {
      setError(`Server error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      setError('Network error: Unable to reach the server. Please check your internet connection.');
    } else {
      setError(`Error: ${error.message}`);
    }
  };

  const addSalon = async (salonData) => {
    try {
      const response = await api.post('/salons', salonData);
      await fetchSalons(); // Refetch salons after adding a new one
      return response.data;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const updateSalon = async (salonId, salonData) => {
    try {
      const response = await api.put(`/salons/${salonId}`, salonData);
      setSalons(salons.map(salon => salon.id === salonId ? response.data : salon));
      return response.data;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const deleteSalon = async (salonId) => {
    try {
      await api.delete(`/salons/${salonId}`);
      setSalons(prevSalons => prevSalons.filter(salon => salon.id !== salonId));
      if (salons.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        await fetchSalons();
      }
      return true;
    } catch (err) {
      handleError(err);
      return false;
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
