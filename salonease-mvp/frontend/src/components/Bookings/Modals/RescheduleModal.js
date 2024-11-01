import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import * as yup from 'yup';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  appointmentDateTime: yup
    .date()
    .required('Appointment date and time are required')
    .min(new Date(), 'Appointment date and time must be in the future'),
});

const RescheduleModal = ({ show, onClose, booking, onReschedule, salonId }) => {
  const [newDateTime, setNewDateTime] = useState(new Date(booking?.appointmentDateTime || Date.now()));
  const [error, setError] = useState(null);

  if (!show) return null;

  const handleDateChange = (date) => {
    setError(null);
    try {
      schema.validateSync({ appointmentDateTime: date });
      setNewDateTime(date);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReschedule = () => {
    try {
      schema.validateSync({ appointmentDateTime: newDateTime });
      onReschedule(booking.id, newDateTime.toISOString());
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

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
              onChange={handleDateChange}
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              className={`w-full px-3 py-2 border rounded-md ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
              minDate={new Date()}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
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
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition duration-300"
            disabled={!!error}
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal; 