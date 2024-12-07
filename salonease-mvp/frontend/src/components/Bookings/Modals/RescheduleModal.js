import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import { publicApi } from '../../../utils/api';
import { useTranslation } from 'react-i18next';
import { useAvailability } from '../../../hooks/useAvailability';

const RescheduleModal = ({ show, onClose, booking, onReschedule, salonId }) => {
  const { t } = useTranslation(['common', 'bookings', 'api']);
  
  const schema = yup.object().shape({
    appointmentDateTime: yup
      .date()
      .required(t('bookings:validation.appointment_date_and_time'))
      .min(new Date(), t('bookings:validation.appointment_date_and_time_future')),
  });

  const [newDateTime, setNewDateTime] = useState(
    new Date(booking?.appointmentDateTime || Date.now())
  );
  const [error, setError] = useState(null);

  const { availableSlots, loading } = useAvailability(
    salonId,
    booking?.staffId,
    newDateTime,
    show
  );

  const handleDateChange = (date) => {
    setError(null);
    try {
      const updatedDateTime = new Date(date);
      updatedDateTime.setHours(newDateTime.getHours());
      updatedDateTime.setMinutes(newDateTime.getMinutes());
      
      schema.validateSync({ appointmentDateTime: updatedDateTime });
      setNewDateTime(updatedDateTime);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTimeChange = (date) => {
    setError(null);
    try {
      const updatedDateTime = new Date(newDateTime);
      updatedDateTime.setHours(date.getHours());
      updatedDateTime.setMinutes(date.getMinutes());
      
      schema.validateSync({ appointmentDateTime: updatedDateTime });
      setNewDateTime(updatedDateTime);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReschedule = () => {
    try {
      schema.validateSync({ appointmentDateTime: newDateTime });
      const isTimeAvailable = availableSlots.some(slot => 
        slot.getHours() === newDateTime.getHours() && 
        slot.getMinutes() === newDateTime.getMinutes()
      );

      if (!isTimeAvailable) {
        toast.error(t('bookings:validation.appointment_date_time.not_available'));
        return;
      }

      onReschedule(booking.id, newDateTime.toISOString());
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('bookings:modal.reschedule.title')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('bookings:modal.reschedule.new_date_time')}
            </label>
            
            <div className="sm:flex sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <DatePicker
                  selected={newDateTime}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  placeholderText={t('bookings:modal.reschedule.select_date')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  calendarClassName="mobile-friendly-calendar"
                  withPortal
                />
              </div>

              <div className="flex-1">
                <DatePicker
                  data-testid="time-picker"
                  selected={newDateTime}
                  onChange={handleTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className={`w-full px-3 py-2 border rounded-md ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  withPortal
                  includeTimes={availableSlots}
                  placeholderText={loading ? t('common.status.loading') : t('bookings:modal.reschedule.select_time')}
                  disabled={loading || availableSlots.length === 0}
                />
              </div>
            </div>

            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            
            {availableSlots.length === 0 && !loading && (
              <p className="mt-1 text-sm text-amber-600">
                {t('bookings:modal.reschedule.no_slots')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            {t('common:action.close')}
          </button>
          <button
            onClick={handleReschedule}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition duration-300"
            disabled={!!error || loading || availableSlots.length === 0}
          >
            {t('common:action.confirm_reschedule')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal; 