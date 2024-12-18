import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmCompleteModal = ({ show, onClose, booking, onComplete }) => {
  const { t } = useTranslation(['common']);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-accent/10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {t('bookings:action.confirm_complete')}
        </h2>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t('bookings:modal.complete.message')}
          </p>
          
          <div className="bg-muted p-4 rounded-md border border-accent/10">
            <p className="font-medium text-foreground">{booking?.client?.name}</p>
            <p className="text-sm text-muted-foreground">{booking?.service?.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(booking?.appointmentDateTime).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-md transition-colors duration-200"
          >
            {t('common:action.cancel')}
          </button>
          <button
            onClick={() => onComplete(booking.id)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            {t('bookings:action.confirm_complete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCompleteModal; 