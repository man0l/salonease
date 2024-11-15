import React from 'react';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaUser, FaCut } from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';

const BookingSuccess = ({ booking, onClose }) => {
  const appointmentDate = booking?.booking?.appointmentDateTime ? new Date(booking.booking.appointmentDateTime) : null;
  const staffMember = booking?.booking?.staff?.fullName || booking?.booking?.staff?.name;
  const serviceName = booking?.booking?.service?.name;
  const servicePrice = booking?.booking?.service?.price;

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return 'Date to be confirmed';
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return 'Time to be confirmed';
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">{formatDate(appointmentDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaClock className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-gray-600">{formatTime(appointmentDate)}</p>
            </div>
          </div>

          {serviceName && (
            <div className="flex items-center gap-3">
              <FaCut className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Service</p>
                <div className="text-gray-600">
                  <p>{serviceName}</p>
                  {servicePrice && (
                    <p className="text-sm">{formatCurrency(servicePrice)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {staffMember && (
            <div className="flex items-center gap-3">
              <FaUser className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Staff</p>
                <p className="text-gray-600">{staffMember}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-600 mb-6">
          <p>Thank you for choosing our services!</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition duration-300"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
