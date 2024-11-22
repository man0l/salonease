import React, { useState, useEffect } from 'react';
import { publicApi } from '../../utils/api';

const DateSelector = ({ onSelect, salonId, staffId, shouldClear, actions }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      
      try {
        setLoading(true);
        const response = await publicApi.checkSalonAvailability(salonId, staffId, selectedDate);
        setAvailableSlots(response.data.availableSlots || []);
      } catch (error) {
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, salonId, staffId]);

  useEffect(() => {
    if (shouldClear) {
      setSelectedDate('');
      setAvailableSlots([]);
      setError(null);
      onSelect('', actions);
    }
  }, [shouldClear, onSelect, actions]);

  const handleDateChange = (event) => {
    setError(null);
    setSelectedDate(event.target.value);
    onSelect(event.target.value);
  };

  return (
    <div className="p-4">
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        min={new Date().toISOString().split('T')[0]}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:ring-primary-500`}
        disabled={loading}
      />
      
      {loading && (
        <div className="mt-2 text-sm text-gray-600">
          {t('common:loading.available_time_slots')}
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default DateSelector;
