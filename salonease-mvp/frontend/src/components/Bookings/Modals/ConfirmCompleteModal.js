import React from 'react';

const ConfirmCompleteModal = ({ show, onClose, booking, onComplete }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Complete Booking</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to mark this booking as completed?
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">{booking?.client?.name}</p>
            <p className="text-sm text-gray-600">{booking?.service?.name}</p>
            <p className="text-sm text-gray-600">
              {new Date(booking?.appointmentDateTime).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onComplete(booking.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
          >
            Confirm Complete
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

export default ConfirmCompleteModal; 