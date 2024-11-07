import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../utils/api';

const usePublicSalon = (salonId) => {
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalonData = useCallback(async () => {
    if (!salonId) return;
    
    try {
      setLoading(true);
      const [salonRes, servicesRes, categoriesRes, staffRes] = await Promise.all([
        publicApi.getSalon(salonId),
        publicApi.getSalonServices(salonId),
        publicApi.getSalonServiceCategories(salonId),
        publicApi.getSalonStaff(salonId)
      ]);
      
      setSalon(salonRes.data);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
    } catch (err) {
      setError('Failed to load salon data');
      console.error('Error fetching salon data:', err);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchSalonData();
  }, [fetchSalonData]);

  return { salon, services, categories, staff, loading, error };
};

export default usePublicSalon;
