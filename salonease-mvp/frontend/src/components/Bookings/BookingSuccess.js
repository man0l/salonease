import React from 'react';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaUser, FaCut } from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const BookingSuccess = ({ booking, onClose }) => {
  const { t } = useTranslation(['common', 'bookings']);
  const appointmentDate = booking?.booking?.appointmentDateTime ? new Date(booking.booking.appointmentDateTime) : null;
  const staffMember = booking?.booking?.staff?.fullName || booking?.booking?.staff?.name;
  const serviceName = booking?.booking?.service?.name;
  const servicePrice = booking?.booking?.service?.price;

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return t('common:date_to_be_confirmed');
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return t('common:time_to_be_confirmed');
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
        <div className="text-center">
          <FaCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            {t('bookings:success.booking_confirmed')}
          </h2>
          <p className="text-gray-400 mb-6">
            {t('bookings:success.appointment_scheduled')}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="w-5 h-5 text-primary-500" />
            <div>
              <p className="font-medium text-gray-200">{t('common:label.date')}</p>
              <p className="text-gray-400">{formatDate(appointmentDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaClock className="w-5 h-5 text-primary-500" />
            <div>
              <p className="font-medium text-gray-200">{t('common:label.time')}</p>
              <p className="text-gray-400">{formatTime(appointmentDate)}</p>
            </div>
          </div>

          {serviceName && (
            <div className="flex items-center gap-3">
              <FaCut className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-200">{t('common:service')}</p>
                <div className="text-gray-400">
                  <p data-testid="service-name">{serviceName}</p>
                  {servicePrice && (
                    <p className="text-sm">{formatCurrency(servicePrice)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {staffMember && (
            <div className="flex items-center gap-3">
              <FaUser className="w-5 h-5 text-primary-500" />
              <div>
                <p className="font-medium text-gray-200">{t('common:staff_member')}</p>
                <p className="text-gray-400" data-testid="staff-member-name">{staffMember}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md transition duration-300"
        >
          {t('common:action.done')}
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
