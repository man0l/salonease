import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useSalon } from '../hooks/useSalon';

const SalonContext = createContext();

export const useSalonContext = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalonContext must be used within a SalonProvider');
  }
  return context;
};

export const SalonProvider = ({ children, navigate, location }) => {
  const { salons, loading, error, fetchSalons, addSalon: hookAddSalon, updateSalon, deleteSalon: hookDeleteSalon, currentPage, totalPages, setCurrentPage } = useSalon();
  const [selectedSalon, setSelectedSalon] = useState(null);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  useEffect(() => {
    if (salons.length > 0 && (!selectedSalon || !salons.find(salon => salon.id === selectedSalon.id))) {
      setSelectedSalon(salons[0]);
    } else if (salons.length === 0) {
      setSelectedSalon(null);
    }
  }, [salons, selectedSalon]);

  const handleSetSelectedSalon = useCallback((salon) => {
    if (salon && salon.id) {
      setSelectedSalon(salon);
      
      // Update URL for all routes containing 'salons'
      if (location && navigate) {
        const currentPath = location.pathname;
        if (currentPath.includes('salons')) {
          const newPath = currentPath.replace(/\/salons\/[^/]*/, `/salons/${salon.id}`);
          navigate(newPath, { replace: true });
        }
      }
    } else {
      console.warn('Attempted to set invalid salon:', salon);
    }
  }, [navigate, location]);

  const handleAddSalon = useCallback(async (salonData) => {
    const newSalon = await hookAddSalon(salonData);
    if (newSalon) {
      await fetchSalons();
      setSelectedSalon(newSalon);
    }
    return newSalon;
  }, [hookAddSalon, fetchSalons]);

  const handleDeleteSalon = useCallback(async (salonId) => {
    const result = await hookDeleteSalon(salonId);
    if (result && selectedSalon && selectedSalon.id === salonId) {
      setSelectedSalon(salons.length > 0 ? salons[0] : null);
    }
    return result;
  }, [hookDeleteSalon, selectedSalon, salons]);

  const value = {
    salons,
    loading,
    error,
    selectedSalon,
    setSelectedSalon: handleSetSelectedSalon,
    addSalon: handleAddSalon,
    updateSalon,
    deleteSalon: handleDeleteSalon,
    fetchSalons,
    currentPage,
    totalPages,
    setCurrentPage,
  };

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>;
};
