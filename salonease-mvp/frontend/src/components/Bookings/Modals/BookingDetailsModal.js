import React from 'react';
import { format } from 'date-fns';

const BookingDetailsModal = ({ show, onClose, booking }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Client</h3>
            <p>{booking.clientName}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Service</h3>
            <p>{booking.serviceName}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Staff</h3>
            <p>{booking.staffName}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Price</h3>
            <p>${booking.price}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Date & Time</h3>
            <p>{format(new Date(booking.appointmentDateTime), 'PPpp')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{booking.status}</p>
          </div>
          
          {booking.notes && (
            <div>
              <h3 className="font-semibold">Notes</h3>
              <p>{booking.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
