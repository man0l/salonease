import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSalonContext } from '../contexts/SalonContext';
import { serviceApi, api } from '../utils/api';

const useService = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedSalon } = useSalonContext();

  const fetchServices = useCallback(async () => {
    if (!selectedSalon) return;
    
    try {
      setLoading(true);
      const response = await serviceApi.getServices(selectedSalon.id);
      setServices(response.data);
      setError(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSalon]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      handleApiError(error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);

  const handleApiError = (err) => {
    const errorMessage = err.response?.data?.message || 'An error occurred';
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const addService = async (serviceData) => {
    try {
      await serviceApi.createService(selectedSalon.id, serviceData);
      // Handle successful creation
      toast.success('Service added successfully');
      await fetchServices();
    } catch (error) {
      // Handle error
      handleApiError(error);
    }
  };

  const updateService = async (serviceId, serviceData) => {
    try {
      await serviceApi.updateService(serviceId, serviceData);
      toast.success('Service updated successfully');
      await fetchServices();
    } catch (err) {
      handleApiError(err);
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await serviceApi.deleteService(serviceId);
      toast.success('Service deleted successfully');
      await fetchServices();
    } catch (err) {
      handleApiError(err);
    }
  };

  return {
    services,
    categories,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    fetchServices,
  };
};

export default useService;
