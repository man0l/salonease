import { useState, useEffect, useCallback, useRef } from 'react';
import { staffApi, salonApi } from '../utils/api';
import { useAuth } from './useAuth';
import ROLES from '../utils/roles';

export const useSalon = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const currentPageRef = useRef(1);
  const isFetchingRef = useRef(false);

  const fetchSalons = useCallback(async () => {
    if (!user || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      let response;
      if (user.role === ROLES.STAFF) {
        response = await staffApi.getAssociatedSalon();
        setSalons(response.data ? [response.data] : []);
      } else {
        response = await salonApi.getSalons(`?page=${currentPageRef.current}&limit=10`);
        setSalons(response.data.salons);
        setTotalPages(response.data.totalPages);
      }
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

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

  const addSalon = async (formData) => {
    try {
      const response = await salonApi.createSalon(formData);
      await fetchSalons();
      return response.data;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const updateSalon = async (salonId, formData) => {
    try {
      const response = await salonApi.updateSalon(salonId, formData);
      setSalons(salons.map(salon => salon.id === salonId ? response.data : salon));
      return response.data;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const deleteSalon = async (salonId) => {
    try {
      await salonApi.deleteSalon(salonId);
      setSalons(prevSalons => prevSalons.filter(salon => salon.id !== salonId));
      if (salons.length === 1 && currentPageRef.current > 1) {
        currentPageRef.current -= 1;
        fetchSalons();
      } else {
        await fetchSalons();
      }
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  };

  const restoreSalon = async (salonId) => {
    try {
      const response = await salonApi.restoreSalon(salonId);
      await fetchSalons();
      return response.data;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const setCurrentPage = (page) => {
    currentPageRef.current = page;
    fetchSalons();
  };

  return { 
    salons, 
    loading, 
    error, 
    addSalon, 
    updateSalon, 
    deleteSalon, 
    restoreSalon, 
    fetchSalons,
    currentPage: currentPageRef.current,
    totalPages,
    setCurrentPage
  };
};
