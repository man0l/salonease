import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../utils/api';
import { toast } from 'react-toastify';
import { useSalonContext } from '../contexts/SalonContext';
import moment from 'moment';

const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedSalon } = useSalonContext();

  const fetchBookings = useCallback(async (filters = {}) => {
    if (!selectedSalon) return;
    
    try {
      setLoading(true);
      const response = await bookingApi.getBookings(selectedSalon.id, filters);
      setBookings(response.data.bookings || []);
      return response.data;
    } catch (err) {
      handleApiError(err);
      setBookings([]);
      return { bookings: [] };
    } finally {
      setLoading(false);
    }
  }, [selectedSalon]);

  const createBooking = async (bookingData) => {
    try {
      await bookingApi.createBooking(selectedSalon.id, bookingData);
      toast.success('Booking created successfully');
      await fetchBookings();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const updateBooking = async (bookingId, bookingData) => {
    try {
      await bookingApi.updateBooking(selectedSalon.id, bookingId, bookingData);
      toast.success('Booking updated successfully');
      await fetchBookings();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const deleteBooking = async (bookingId, note) => {
    try {
      await bookingApi.deleteBooking(selectedSalon.id, bookingId, { notes: note });
      toast.success('Booking cancelled successfully');
      await fetchBookings();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const handleApiError = (err) => {
    const message = err.response?.data?.message || 'An error occurred';
    toast.error(message);
    setError(message);
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking
  };
};

export default useBookings; 