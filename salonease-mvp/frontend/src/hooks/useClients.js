import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { clientApi } from '../utils/api';
import { useSalonContext } from '../contexts/SalonContext';

const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedSalon } = useSalonContext();

  const fetchClients = useCallback(async () => {
    if (!selectedSalon) return;
    
    try {
      setLoading(true);
      const response = await clientApi.getClients(selectedSalon.id);
      setClients(response.data);
      setError(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSalon]);

  const addClient = async (clientData) => {
    try {
      await clientApi.addClient(selectedSalon.id, clientData);
      toast.success('Client added successfully');
      await fetchClients();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      await clientApi.updateClient(selectedSalon.id, clientId, clientData);
      toast.success('Client updated successfully');
      await fetchClients();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const exportClients = async (selectedFields) => {
    try {
      const response = await clientApi.exportClients(selectedSalon.id, selectedFields);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'clients.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const deleteClient = async (salonId, clientId) => {
    try {
      await clientApi.deleteClient(salonId, clientId);
      toast.success('Client deleted successfully');
      await fetchClients();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const handleApiError = (err) => {
    const errorMessage = err.response?.data?.message || 'An error occurred';
    setError(errorMessage);
    toast.error(errorMessage);
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    updateClient,
    exportClients,
    deleteClient
  };
};

export default useClients;
