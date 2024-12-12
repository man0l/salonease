import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
const TimeSelector = ({ date, duration, onSelect }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!date) return;
      
      setLoading(true);
      try {
        // Generate time slots from 9 AM to 5 PM in 15-minute intervals
        const slots = [];
        const startHour = 9;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
          }
        }
        
        setAvailableSlots(slots);
      } catch (error) {
        setError(t('common:error.no_slots'));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [date]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-rose-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-2 text-lg font-medium">Select a time:</h3>
      <div className="grid grid-cols-3 gap-2">
        {availableSlots.map((time) => (
          <button
            key={time}
            onClick={() => onSelect(time)}
            className="p-2 text-center border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-200 transition-colors duration-200"
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
