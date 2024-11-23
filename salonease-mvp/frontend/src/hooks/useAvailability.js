import { useState, useEffect } from 'react';
import { publicApi } from '../utils/api';
import moment from 'moment';

export const useAvailability = (salonId, staffId, date, enabled = true) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!staffId || !date || !enabled) return;
      
      try {
        setLoading(true);
        const formattedDate = moment(date).format('YYYY-MM-DD');
        
        const response = await publicApi.checkSalonAvailability(
          salonId, 
          staffId,
          formattedDate
        );
        
        const slots = (response.data.availableSlots || []).map(timeStr => {
          const [hours, minutes] = timeStr.split(':');
          return moment(formattedDate)
            .hours(parseInt(hours, 10))
            .minutes(parseInt(minutes, 10))
            .seconds(0)
            .milliseconds(0)
            .toDate();
        });

        setAvailableSlots(slots);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        setAvailableSlots([]);
        setError('Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [salonId, staffId, date, enabled]);

  return {
    availableSlots,
    loading,
    error
  };
};