import React, { useState } from 'react';

const CancelBookingModal = ({ show, onClose, booking, onCancel }) => {
  const [bookingNote, setBookingNote] = useState('');

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Cancel Booking</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          
          <div>
            <label 
              htmlFor="booking-note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Booking Note (optional)
            </label>
            <textarea
              id="booking-note"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Add a note about why this booking was cancelled..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onCancel(booking.id, bookingNote)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
          >
            Confirm Cancellation
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal; 