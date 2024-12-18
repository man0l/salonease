import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingApi } from '../../utils/api';
import useStaff from '../../hooks/useStaff';
import useService from '../../hooks/useService';
import RescheduleModal from './Modals/RescheduleModal';
import CreateBookingModal from './Modals/CreateBookingModal';
import { BOOKING_STATUSES } from '../../utils/constants';
import useBookings from '../../hooks/useBookings';
import { useTranslation } from 'react-i18next';
import './BookingsCalendar.css';
import i18next from 'i18next';

const localizer = momentLocalizer(moment);

// Update color styles to match dark theme UI
const colorStyles = [
  { bgClass: 'blue-600', textClass: 'white', bg: '#2563eb', border: '#1d4ed8' },
  { bgClass: 'purple-600', textClass: 'white', bg: '#9333ea', border: '#7e22ce' },
  { bgClass: 'emerald-600', textClass: 'white', bg: '#059669', border: '#047857' },
  { bgClass: 'orange-600', textClass: 'white', bg: '#ea580c', border: '#c2410c' },
  { bgClass: 'rose-600', textClass: 'white', bg: '#e11d48', border: '#be123c' },
];

const BookingsCalendar = () => {
  const { t } = useTranslation(['common', 'bookings', 'staff']);
  const { salonId } = useParams();
  const [view, setView] = useState('week');
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const calendarRef = useRef(null);
  
  const { staff, loading: staffLoading } = useStaff();
  const { services, loading: servicesLoading } = useService();

  // Add new state for date range
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('week').toDate(),
    end: moment().endOf('week').toDate()
  });

  const { bookings, loading: bookingsLoading, fetchBookings, updateBooking, deleteBooking } = useBookings();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (staff.length > 0) {
      setSelectedStaffIds(staff.map(s => s.id));
    }
  }, [staff]);

  const fetchCalendarBookings = async () => {
    const filters = {
      startDate: moment(dateRange.start).format('YYYY-MM-DD'),
      endDate: moment(dateRange.end).format('YYYY-MM-DD'),
      staffId: selectedStaffIds.length === 1 ? selectedStaffIds[0] : undefined
    };
    await fetchBookings(filters);
  };

  useEffect(() => {
    fetchCalendarBookings();
  }, [salonId, dateRange, selectedStaffIds]);

  // Add handler for calendar range change
  const handleRangeChange = (range) => {
    if (Array.isArray(range)) {
      setDateRange({
        start: moment(range[0]).startOf('day').toDate(),
        end: moment(range[range.length - 1]).endOf('day').toDate()
      });
    } else {
      setDateRange({
        start: moment(range.start).startOf('day').toDate(),
        end: moment(range.end).endOf('day').toDate()
      });
    }
  };

  const handleSelectSlot = (slotInfo) => {
    setShowCreateModal(true);
    setSelectedDate(slotInfo.start);
  };

  const handleSelectEvent = (event) => {
    setSelectedBooking(event);
    setShowRescheduleModal(true);
  };

  const handleReschedule = async (bookingId, newDateTime) => {
    const success = await updateBooking(bookingId, { appointmentDateTime: newDateTime });
    if (success) {
      setShowRescheduleModal(false);
    }
  };

  // Modify eventStyleGetter to handle booking statuses
  const eventStyleGetter = (event) => {
    if (!event || !event.resourceId) return {};

    const staffIndex = staff.findIndex(s => s.id === event.resourceId);
    const opacity = selectedStaffIds.includes(event.resourceId) ? 1 : 0.3;
    const colorStyle = colorStyles[staffIndex % colorStyles.length];

    const statusStyles = {
      [BOOKING_STATUSES.CONFIRMED]: { borderStyle: 'solid' },
      [BOOKING_STATUSES.PENDING]: { borderStyle: 'dashed' },
      [BOOKING_STATUSES.CANCELLED]: { opacity: 0.5 },
      [BOOKING_STATUSES.COMPLETED]: { borderStyle: 'double' },
    };

    return {
      style: {
        backgroundColor: colorStyle.bg,
        borderColor: colorStyle.border,
        borderWidth: '2px',
        color: colorStyle.textClass === 'white' ? 'white' : 'black',
        borderRadius: '4px',
        opacity: opacity,
        ...statusStyles[event.status]
      }
    };
  };

  const handleStaffToggle = (staffId) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
  };

  const filteredEvents = bookings.filter(booking => 
    selectedStaffIds.includes(booking.staffId)
  ).map(booking => ({
    id: booking.id,
    title: `${booking.client.name} - ${booking.service.name}`,
    start: new Date(booking.appointmentDateTime),
    end: new Date(booking.endTime),
    resourceId: booking.staffId,
    status: booking.status,
    booking: booking,
  }));

  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Add a function to determine step size based on screen width
  const getStepSize = () => {
    return window.innerWidth < 640 ? 60 : 15;
  };

  // Add state for step size
  const [stepSize, setStepSize] = useState(getStepSize());

  // Add effect to update step size on window resize
  useEffect(() => {
    const handleResize = () => {
      setStepSize(getStepSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-full gap-2 p-2 sm:gap-4 sm:p-4">
      {/* Staff Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 sm:items-center">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {staff.map((member, index) => {
            const colorStyle = colorStyles[index % colorStyles.length];
            return (
              <button
                key={member.id}
                onClick={() => handleStaffToggle(member.id)}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm transition-all ${
                  selectedStaffIds.includes(member.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {member.fullName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex-grow bg-card rounded-lg shadow-lg border border-accent/10 overflow-hidden">
        <div className="h-[calc(100vh-12rem)]">
          <Calendar
            ref={calendarRef}
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.WEEK}
            view={view}
            onView={handleViewChange}
            views={[Views.DAY, Views.WEEK]}
            step={stepSize}
            timeslots={1}
            min={moment().set({ hour: 8, minute: 0 }).toDate()}
            max={moment().set({ hour: 20, minute: 0 }).toDate()}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onRangeChange={handleRangeChange}
            selectable={true}
            resources={view === 'day' ? staff : null}
            resourceIdAccessor="id"
            resourceTitleAccessor="fullName"
            eventPropGetter={eventStyleGetter}
            className="h-full calendar-custom"
            messages={{
              next: "→",
              previous: "←",
              today: t('bookings:action.today'),
              noEventsInRange: t('common:status.noData')
            }}
            formats={{
              dayFormat: (date) => moment(date).format('dd D'), // Shorter day format for mobile
              timeGutterFormat: (date) => moment(date).format('HH:mm'), // 24h format
              eventTimeRangeFormat: ({ start, end, event }) => {
                if (!start || !end) return '';
                const timeStr = `${moment(start).format('HH:mm')}`;
                if (view === 'week' && event?.resourceId) {
                  const staffMember = staff.find(s => s.id === event.resourceId);
                  return staffMember ? `${timeStr} - ${staffMember.fullName.split(' ')[0]}` : timeStr;
                }
                return timeStr;
              },
              monthHeaderFormat: (date) => t('common:date.monthYear', { date: moment(date) }),
              dayRangeHeaderFormat: ({ start, end }) => {
                moment.locale(i18next.language);
                
                const startStr = moment(start).format('MMMM DD');
                const endStr = moment(end).format('DD');
                const year = moment(start).format('YYYY');
                return `${startStr} – ${endStr}, ${year}`;
              }
            }}
            components={{
              event: (props) => (
                <div className="text-[10px] sm:text-xs h-full">
                  <div className="p-0.5 sm:p-1 h-full flex flex-col justify-between">
                    <div>
                      <div className="font-bold truncate text-white">
                        {props.event.booking.client.name}
                      </div>
                      <div className="truncate text-slate-300">
                        {props.event.booking.service.name}
                      </div>
                      {view === 'week' && props.event.resourceId && (
                        <div className="truncate text-slate-300 hidden sm:block">
                          {staff.find(s => s.id === props.event.resourceId)?.fullName}
                        </div>
                      )}
                    </div>
                    <div className="text-slate-300 hidden sm:block">
                      {t('bookings:status.' + props.event.status.toLowerCase())}
                    </div>
                  </div>
                </div>
              )
            }}
            style={{
              height: '100%',
              backgroundColor: 'var(--card-background)'
            }}
          />
        </div>
      </div>

      <RescheduleModal
        show={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        booking={selectedBooking?.booking}
        onReschedule={handleReschedule}
        salonId={salonId}
      />

      <CreateBookingModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        salonId={salonId}
        onSuccess={fetchCalendarBookings}
        staff={staffLoading ? [] : staff}
        services={servicesLoading ? [] : services}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default BookingsCalendar;
