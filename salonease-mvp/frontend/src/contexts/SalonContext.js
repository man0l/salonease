import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useSalon } from '../hooks/useSalon';

const SalonContext = createContext();

export const useSalonContext = () => useContext(SalonContext);

export const SalonProvider = ({ children }) => {
  const { salons, loading, error, fetchSalons, addSalon, updateSalon, deleteSalon, currentPage, totalPages, setCurrentPage } = useSalon();
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
  }, [salons]);

  const handleSetSelectedSalon = useCallback((salon) => {
    if (salon && salon.id) {
      setSelectedSalon(salon);
    } else {
      console.warn('Attempted to set invalid salon:', salon);
    }
  }, []);

  const handleAddSalon = useCallback(async (salonData) => {
    const newSalon = await addSalon(salonData);
    if (newSalon) {
      setSelectedSalon(newSalon);
    }
    return newSalon;
  }, [addSalon]);

  const handleDeleteSalon = useCallback(async (salonId) => {
    const result = await deleteSalon(salonId);
    if (result && selectedSalon && selectedSalon.id === salonId) {
      setSelectedSalon(salons.length > 0 ? salons[0] : null);
    }
    return result;
  }, [deleteSalon, selectedSalon, salons]);

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
