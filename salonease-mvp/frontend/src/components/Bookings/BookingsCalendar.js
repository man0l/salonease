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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <button
            className={`px-4 py-2 rounded-l-lg ${
              view === 'day' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => setView('day')}
          >
            {t('staff:availability.calendar.dayView')}
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${
              view === 'week' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => setView('week')}
          >
            {t('staff:availability.calendar.weekView')}
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {staff.map((member, index) => {
          const colorStyle = colorStyles[index % colorStyles.length];
          return (
            <button
              key={member.id}
              onClick={() => handleStaffToggle(member.id)}
              style={{
                backgroundColor: selectedStaffIds.includes(member.id) ? colorStyle.bg : '#1e293b',
                color: selectedStaffIds.includes(member.id) ? '#ffffff' : '#94a3b8',
              }}
              className={`px-3 py-1 rounded-full text-sm hover:opacity-80 transition-all`}
            >
              {member.fullName}
            </button>
          );
        })}
      </div>

      <div className="flex-grow bg-slate-900 rounded-lg shadow-lg p-4 overflow-x-auto border border-slate-700">
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
          step={15}
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
          className="h-full min-w-[800px] text-slate-200 calendar-custom"
          messages={{
            next: t('bookings:action.next'),
            previous: t('bookings:action.prev'),
            today: t('bookings:action.today'),
            noEventsInRange: t('common:status.noData')
          }}
          formats={{
            dayFormat: 'ddd D/M',
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end, event }) => {
              if (!start || !end) return '';
              const timeStr = `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
              if (view === 'week' && event?.resourceId) {
                const staffMember = staff.find(s => s.id === event.resourceId);
                return staffMember ? `${timeStr} - ${staffMember.fullName}` : timeStr;
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
              <div className="text-xs h-full">
                <div className="p-1 h-full flex flex-col justify-between">
                  <div>
                    <div className="font-bold truncate text-white">{props.event.booking.client.name}</div>
                    <div className="text-xs text-slate-300 truncate">{props.event.booking.service.name}</div>
                    {view === 'week' && props.event.resourceId && (
                      <div className="truncate text-xs text-slate-300">
                        {staff.find(s => s.id === props.event.resourceId)?.fullName}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-300">
                    {t('bookings:status.' + props.event.status.toLowerCase())}
                  </div>
                </div>
              </div>
            )
          }}
          style={{
            backgroundColor: 'rgb(17, 24, 39)',
            '& .rbc-time-column': {
              borderRight: '1px solid rgb(30, 41, 59)'
            },
            '& .rbc-timeslot-group': {
              borderBottom: '1px solid rgb(30, 41, 59)'
            }
          }}
        />
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
