import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CancelBookingModal = ({ show, onClose, booking, onCancel }) => {
  const [bookingNote, setBookingNote] = useState('');
  const { t } = useTranslation(['common', 'bookings']);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('bookings:action.cancel')}</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('common:message.are_you_sure_you_want_to_cancel_this_booking_this_action_cannot_be_undone')}
          </p>
          
          <div>
            <label 
              htmlFor="booking-note"
              className="block text-sm font-medium text-gray-700 mb-1"              
            >
              {t('bookings:booking_note_optional')}
            </label>
            <textarea
              id="booking-note"
              data-testid="booking-note-input"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder={t('common:action.add_a_note_about_why_this_booking_was_cancelled')}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onCancel(booking.id, bookingNote)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
          >
            {t('bookings:action.confirm_cancel')}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            {t('common:action.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal; 