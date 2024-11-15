import { useState, useCallback } from 'react';
import { dashboardApi } from '../utils/api';
import { useSalonContext } from '../contexts/SalonContext';
import { toast } from 'react-toastify';

const useDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    staffAvailable: 0,
    weeklyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedSalon } = useSalonContext();

  const fetchDashboardData = useCallback(async () => {
    if (!selectedSalon?.id) return;
    
    try {
      setLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        dashboardApi.getStats(selectedSalon.id),
        dashboardApi.getActivity(selectedSalon.id)
      ]);

      setDashboardStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
      setError(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSalon?.id]);

  const handleApiError = (err) => {
    const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard data';
    setError(errorMessage);
    toast.error(errorMessage);
  };

  return {
    dashboardStats,
    recentActivity,
    loading,
    error,
    fetchDashboardData
  };
};

export default useDashboard; 