import React, { useState } from 'react';

const CancelBookingModal = ({ show, onClose, booking, onCancel }) => {
  const [notificationMessage, setNotificationMessage] = useState('');

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
              htmlFor="notification-message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notification Message (optional)
            </label>
            <textarea
              id="notification-message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Enter a message to send to the client..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onCancel(booking.id, notificationMessage)}
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