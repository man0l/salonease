import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { bookingApi } from '../../utils/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BookingDetailsModal from './Modals/BookingDetailsModal';
import RescheduleModal from './Modals/RescheduleModal';
import CancelBookingModal from './Modals/CancelBookingModal';
import CreateBookingModal from './Modals/CreateBookingModal.js';
import { FaPlus, FaTrash } from 'react-icons/fa';
import useStaff from '../../hooks/useStaff';
import useService from '../../hooks/useService';

const BookingsManagement = () => {
  const { salonId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    staffId: '',
    serviceId: '',
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { staff, loading: staffLoading } = useStaff();
  const { services, loading: servicesLoading } = useService();

  useEffect(() => {
    fetchBookings();
  }, [filters, salonId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookings(salonId, filters);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (bookingId, newDateTime) => {
    try {
      await bookingApi.updateBooking(salonId, bookingId, { appointmentDateTime: newDateTime });
      toast.success('Booking rescheduled successfully');
      fetchBookings();
      setShowRescheduleModal(false);
    } catch (error) {
      toast.error('Failed to reschedule booking');
    }
  };

  const handleCancel = async (bookingId, notificationMessage) => {
    try {
      await bookingApi.deleteBooking(salonId, bookingId, { notificationMessage });
      toast.success('Booking cancelled successfully');
      fetchBookings();
      setShowCancelModal(false);
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleAddNewBooking = () => {
    setSelectedBooking(null);
    setShowCreateModal(true);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <button
          onClick={showCreateModal ? () => setShowCreateModal(false) : handleAddNewBooking}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Booking
        </button>
      </div>
      
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <DatePicker
          selected={filters.startDate}
          onChange={date => setFilters(prev => ({ ...prev, startDate: date }))}
          placeholderText="Start Date"
          className="form-input rounded-md w-full"
        />
        <DatePicker
          selected={filters.endDate}
          onChange={date => setFilters(prev => ({ ...prev, endDate: date }))}
          placeholderText="End Date"
          className="form-input rounded-md w-full"
        />
        <select
          value={filters.staffId}
          onChange={e => setFilters(prev => ({ ...prev, staffId: e.target.value }))}
          className="form-input rounded-md w-full"
          disabled={staffLoading}
        >
          <option value="">All Staff</option>
          {staff && staff.map(member => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>
        <select
          value={filters.serviceId}
          onChange={e => setFilters(prev => ({ ...prev, serviceId: e.target.value }))}
          className="form-input rounded-md w-full"
          disabled={servicesLoading}
        >
          <option value="">All Services</option>
          {services && services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(bookings) && bookings.length > 0 ? (
            bookings.map(booking => (
              <div 
                key={booking.id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{booking.clientName}</h3>
                  <p>{booking.serviceName}</p>
                  <p>{booking.appointmentDateTime}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailsModal(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRescheduleModal(true);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <FaTrash className="text-sm" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No bookings found</div>
          )}
        </div>
      )}

      {/* Modals */}
      <BookingDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
      />

      <RescheduleModal
        show={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        booking={selectedBooking}
        onReschedule={handleReschedule}
        salonId={salonId}
      />

      <CancelBookingModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={selectedBooking}
        onCancel={handleCancel}
      />

      <CreateBookingModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        salonId={salonId}
        onSuccess={fetchBookings}
        staff={staffLoading ? [] : staff}
        services={servicesLoading ? [] : services}
      />
    </div>
  );
};

export default BookingsManagement; 