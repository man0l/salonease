import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmCompleteModal = ({ show, onClose, booking, onComplete }) => {
  const { t } = useTranslation(['common']);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">{t('bookings:action.confirm_complete')}</h2>
        
        <div className="space-y-4">
          <p className="text-gray-400">
            {t('bookings:modal.complete.message')}
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <p className="font-medium text-gray-100">{booking?.client?.name}</p>
            <p className="text-sm text-gray-400">{booking?.service?.name}</p>
            <p className="text-sm text-gray-400">
              {new Date(booking?.appointmentDateTime).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded transition duration-300"
          >
            {t('common:action.cancel')}
          </button>
          <button
            onClick={() => onComplete(booking.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition duration-300"
          >
            {t('bookings:action.confirm_complete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCompleteModal; 