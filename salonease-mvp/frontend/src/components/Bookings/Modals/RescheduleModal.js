import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { bookingApi } from '../../../utils/api';
import { toast } from 'react-toastify';

const RescheduleModal = ({ show, onClose, booking, onReschedule, salonId }) => {
  const [newDateTime, setNewDateTime] = useState(new Date(booking?.appointmentDateTime || Date.now()));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && booking) {
      checkAvailability(newDateTime);
    }
  }, [show, booking, newDateTime]);

  const checkAvailability = async (date) => {
    try {
      setLoading(true);
      const response = await bookingApi.checkAvailability(salonId, booking.staffId, date);
      setAvailableSlots(response.data);
    } catch (error) {
      toast.error('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    onReschedule(booking.id, newDateTime.toISOString());
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reschedule Booking</h2>
        
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="newAppointmentDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Appointment Date
            </label>
            <DatePicker
              id="newAppointmentDate"
              selected={newDateTime}
              onChange={setNewDateTime}
              showTimeSelect
              dateFormat="Pp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              minDate={new Date()}
              filterTime={(time) => {
                return availableSlots.some(slot => 
                  new Date(slot).getTime() === time.getTime()
                );
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            Close
          </button>
          <button
            onClick={handleReschedule}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition duration-300"
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal; 