import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { bookingApi, subscriptionApi } from '../../utils/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import RescheduleModal from './Modals/RescheduleModal';
import CancelBookingModal from './Modals/CancelBookingModal';
import CreateBookingModal from './Modals/CreateBookingModal';
import { FaPlus, FaTrash, FaInfoCircle, FaCalendarAlt, FaUndo, FaChevronDown, FaCheck } from 'react-icons/fa';
import useStaff from '../../hooks/useStaff';
import useService from '../../hooks/useService';
import { BOOKING_STATUSES } from '../../utils/constants';
import ReassignStaffModal from './Modals/ReassignStaffModal';
import ConfirmCompleteModal from './Modals/ConfirmCompleteModal';
import moment from 'moment-timezone';
import useBookings from '../../hooks/useBookings';
import { useDebounce } from '../../hooks/useDebounce';
import { useTranslation } from 'react-i18next';

const BookingsManagement = () => {
  const { salonId } = useParams();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: moment().startOf('day').toDate(),
    endDate: moment().endOf('day').toDate(),
    staffId: '',
    serviceId: '',
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const { staff, loading: staffLoading } = useStaff();
  const { services, loading: servicesLoading } = useService();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { fetchBookings, bookings } = useBookings();
  const { t } = useTranslation('bookings');

  // Define fetchBookingsData first
  const fetchBookingsData = useCallback(async () => {
    try {
      setLoading(true);
      const formattedFilters = {
        ...filters,
        startDate: formatDateForApi(filters.startDate),
        endDate: formatDateForApi(filters.endDate),
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        serviceId: filters.serviceId || undefined
      };
      const response = await fetchBookings(formattedFilters);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      toast.error(t('error.failed_to_fetch_bookings'));
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, fetchBookings]);

  // Then create the debounced version
  const [debouncedFetch] = useDebounce(fetchBookingsData, 300);

  // Finally use it in useEffect
  useEffect(() => {
    debouncedFetch();
  }, [filters, salonId, currentPage]);

  const formatDateForApi = (date) => {
    if (!date) return null;
    
    const momentDate = moment(date);
    const timezone = moment.tz.guess(); // Gets local timezone
    
    // For start date: set time to start of day
    if (date === filters.startDate) {
      return moment.tz(momentDate.startOf('day'), timezone).format('YYYY-MM-DD HH:mm:ss');
    }
    
    // For end date: set time to end of day
    if (date === filters.endDate) {
      return moment.tz(momentDate.endOf('day'), timezone).format('YYYY-MM-DD HH:mm:ss');
    }
    
    return moment.tz(momentDate, timezone).format('YYYY-MM-DD HH:mm:ss');
  };

  const handleReschedule = async (bookingId, newDateTime) => {
    try {
      await bookingApi.updateBooking(salonId, bookingId, { appointmentDateTime: newDateTime });
      toast.success(t('success.booking_rescheduled'));
      fetchBookingsData();
      setShowRescheduleModal(false);
    } catch (error) {
      toast.error(t('error.failed_to_reschedule_booking'));
    }
  };

  const handleCancel = async (bookingId, note) => {
    try {
      await bookingApi.deleteBooking(salonId, bookingId, { notes: note });
      toast.success(t('success.booking_cancelled'));
      fetchBookingsData();
      setShowCancelModal(false);
    } catch (error) {
      toast.error(t('error.failed_to_cancel_booking'));
    }
  };

  const handleAddNewBooking = async (bookingData) => {
    try {
      const result = await bookingApi.createBooking(salonId, bookingData);
      if (result) {
        try {
          await subscriptionApi.addBookingCharge();
        } catch (error) {
          toast.error(t('error.failed_to_update_subscription'));
        }
        toast.success(t('success.booking_created'));
        fetchBookingsData();
        setShowCreateModal(false);
      }
    } catch (error) {
      toast.error(t('error.failed_to_create_booking'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUSES.CONFIRMED:
        return 'text-emerald-600';
      case BOOKING_STATUSES.PENDING:
        return 'text-amber-600';
      case BOOKING_STATUSES.CANCELLED:
        return 'text-rose-600';
      case BOOKING_STATUSES.COMPLETED:
        return 'text-indigo-600';
      case BOOKING_STATUSES.NO_SHOW:
        return 'text-gray-600';
      case BOOKING_STATUSES.RESCHEDULED:
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case BOOKING_STATUSES.CONFIRMED:
        return '✅';
      case BOOKING_STATUSES.PENDING:
        return '⏳';
      case BOOKING_STATUSES.CANCELLED:
        return '❌';
      case BOOKING_STATUSES.COMPLETED:
        return '🎉';
      case BOOKING_STATUSES.NO_SHOW:
        return '⚠️';
      case BOOKING_STATUSES.RESCHEDULED:
        return '🔄';
      default:
        return '❓';
    }
  };

  const handleReassignStaff = async (bookingId, newStaffId) => {
    try {
      await bookingApi.updateBooking(salonId, bookingId, { staffId: newStaffId });
      toast.success(t('success.staff_reassigned'));
      fetchBookingsData();
      setShowReassignModal(false);
    } catch (error) {
      toast.error(t('error.failed_to_reassign_staff'));
    }
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setFilters({
      startDate: getToday(),
      endDate: getToday(),
      staffId: '',
      serviceId: '',
    });
  };

  // Helper function to get today's date
  const getToday = () => {
    return moment().startOf('day').toDate();
  };

  const handleComplete = async (bookingId) => {
    try {
      await bookingApi.updateBooking(salonId, bookingId, { status: BOOKING_STATUSES.COMPLETED });
      toast.success(t('success.booking_completed'));
      fetchBookingsData();
      setShowCompleteModal(false);
    } catch (error) {
      toast.error(t('error.failed_to_complete_booking'));
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{t('title.bookings_management')}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-full transition duration-300 flex items-center whitespace-nowrap"
        >
          <FaPlus className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t('action.add_booking')}</span>
          <span className="sm:hidden">{t('action.add')}</span>
        </button>
      </div>
      
      {/* Filters */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{t('title.filters')}</h2>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors duration-200"
            title={t('action.reset_filters')}
          >
            <FaUndo className="w-4 h-4" />
            <span className="text-sm sm:inline hidden">{t('action.reset')}</span>
          </button>
        </div>
        
        {/* Mobile Filters Toggle */}
        <div className="md:hidden mb-2">
          <button
            onClick={() => setShowMobileFilters(prev => !prev)}
            className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md"
          >
            <span>{t('action.show_filters')}</span>
            <FaChevronDown className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Content */}
        <div className={`grid grid-cols-1 gap-4 ${showMobileFilters ? 'block' : 'hidden'} md:grid md:grid-cols-4 md:gap-4`}>
          {/* Date Range Group */}
          <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-2 md:block md:space-y-4 col-span-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.start_date')}
              </label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                selectsStart
                startDate={filters.startDate}
                endDate={filters.endDate}
                maxDate={filters.endDate}
                placeholderText={t('placeholder.select_start_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                dateFormat="MM/dd/yyyy"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.end_date')}
              </label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                selectsEnd
                startDate={filters.startDate}
                endDate={filters.endDate}
                minDate={filters.startDate}
                placeholderText={t('placeholder.select_end_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                dateFormat="MM/dd/yyyy"
              />
            </div>
          </div>

          {/* Staff and Service Selects */}
          <div className="space-y-4 col-span-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.staff_member')}
              </label>
              <select
                value={filters.staffId}
                onChange={e => setFilters(prev => ({ ...prev, staffId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                disabled={staffLoading}
              >
                <option value="">{t('label.all_staff')}</option>
                {staff?.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.service')}
              </label>
              <select
                value={filters.serviceId}
                onChange={e => setFilters(prev => ({ ...prev, serviceId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                disabled={servicesLoading}
              >
                <option value="">{t('label.all_services')}</option>
                {services?.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
            role="status"
            aria-label={t('loading.bookings')}
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(bookings) && bookings.length > 0 ? (
            bookings.map(booking => (
              <div 
                key={booking.id}
                className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left Side - Client & Service Info */}
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    {/* Client Information */}
                    <div className="space-y-2 pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg">{booking.client?.name}</h3>
                        {booking.notes && (
                          <span 
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full cursor-help"
                            title={booking.notes}
                          >
                            📝 {t('label.notes')}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {booking.client?.phone && (
                          <a 
                            href={`tel:${booking.client.phone}`}
                            className="text-gray-600 text-sm flex items-center gap-2 hover:text-primary-500"
                          >
                            <span>📱</span>
                            {t('label.phone')}: {booking.client.phone}
                          </a>
                        )}
                        {booking.client?.email && (
                          <a 
                            href={`mailto:${booking.client.email}`}
                            className="text-gray-600 text-sm flex items-center gap-2 hover:text-primary-500 break-all"
                          >
                            <span>✉️</span>
                            {t('label.email')}: {booking.client.email}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Service Information */}
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-lg">{booking.service.name}</span>
                      </div>
                      <div 
                        className="text-gray-600 text-sm flex items-center gap-2 cursor-pointer hover:text-primary-500"
                        onClick={() => {
                          if (booking.status !== BOOKING_STATUSES.CANCELLED && 
                              booking.status !== BOOKING_STATUSES.COMPLETED) {
                            setSelectedBooking(booking);
                            setShowReassignModal(true);
                          }
                        }}
                        title={booking.status === BOOKING_STATUSES.CANCELLED || 
                               booking.status === BOOKING_STATUSES.COMPLETED ? 
                               "Cannot reassign staff for cancelled or completed bookings" : 
                               "Click to reassign staff"}
                      >
                        <span>👤</span>
                        {booking?.staff?.fullName || 'Unassigned'}
                      </div>
                      <div className="text-gray-600 text-sm flex items-center gap-2">
                        <span>⏱️</span>
                        {t('label.duration_minutes', { duration: booking.service.duration })}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - DateTime & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-4 min-w-[200px]">
                    {/* DateTime & Status */}
                    <div className="space-y-2">
                      <div className="font-medium flex items-center gap-2">
                        <span>📅</span>
                        {new Date(booking.appointmentDateTime).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600 flex items-center gap-2">
                        <span>🕒</span>
                        {new Date(booking.appointmentDateTime).toLocaleTimeString()}
                      </div>
                      <div className={`flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                        <span>{getStatusIcon(booking.status)}</span>
                        <span className="font-medium">
                          {t(`status.${booking.status.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      
                      {booking.status !== BOOKING_STATUSES.CANCELLED && 
                       booking.status !== BOOKING_STATUSES.COMPLETED && (
                        <>
                          <FaCalendarAlt 
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowRescheduleModal(true);
                            }}
                            className="text-secondary-500 hover:text-secondary-600 cursor-pointer w-5 h-5 transition duration-300"
                            title={t('action.reschedule')}
                            role="button"
                            aria-label={t('action.reschedule')}
                          />
                          <FaCheck
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCompleteModal(true);
                            }}
                            className="text-green-500 hover:text-green-600 cursor-pointer w-5 h-5 transition duration-300"
                            title={t('action.complete')}
                            role="button"
                            aria-label={t('action.complete')}
                          />
                          <FaTrash 
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelModal(true);
                            }}
                            className="text-red-500 hover:text-red-600 cursor-pointer w-5 h-5 transition duration-300"
                            title={t('action.cancel')}
                            role="button"
                            aria-label={t('action.cancel')}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('error.no_bookings')}
            </div>
          )}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 w-full justify-between sm:justify-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="hidden sm:inline">{t('action.previous')}</span>
              <span className="sm:hidden">{t('action.prev')}</span>
            </button>
            <span className="text-sm text-gray-600">
              {t('action.page')} {currentPage} {t('action.of')} {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="hidden sm:inline">{t('action.next')}</span>
              <span className="sm:hidden">{t('action.next')}</span>
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 text-center">
            {t('label.showing_bookings', { 
              start: ((currentPage - 1) * ITEMS_PER_PAGE) + 1, 
              end: Math.min(currentPage * ITEMS_PER_PAGE, totalItems), 
              total: totalItems 
            })}
          </div>
        </div>
      )}

      {/* Modals */}

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
        onSuccess={fetchBookingsData}
        staff={staffLoading ? [] : staff}
        services={servicesLoading ? [] : services}
      />

      <ReassignStaffModal
        show={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        booking={selectedBooking}
        staff={staffLoading ? [] : staff}
        onReassign={handleReassignStaff}
      />

      <ConfirmCompleteModal
        show={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        booking={selectedBooking}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default BookingsManagement; 