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

const localizer = momentLocalizer(moment);

// Reuse the color styles from StaffAvailability
const colorStyles = [
  { bgClass: 'blue-500', textClass: 'white', bg: '#3B82F6', border: '#2563EB' },
  { bgClass: 'green-500', textClass: 'white', bg: '#22C55E', border: '#16A34A' },
  { bgClass: 'yellow-500', textClass: 'black', bg: '#EAB308', border: '#CA8A04' },
  { bgClass: 'red-500', textClass: 'white', bg: '#EF4444', border: '#DC2626' },
  { bgClass: 'purple-500', textClass: 'white', bg: '#A855F7', border: '#9333EA' },
];

const BookingsCalendar = () => {
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <button
            className={`px-4 py-2 rounded-l-lg ${view === 'day' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${view === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('week')}
          >
            Week
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
                backgroundColor: selectedStaffIds.includes(member.id) ? colorStyle.bg : '#e5e7eb',
                color: selectedStaffIds.includes(member.id) ? (colorStyle.textClass === 'white' ? 'white' : 'black') : '#374151',
              }}
              className={`px-3 py-1 rounded-full text-sm`}
            >
              {member.fullName}
            </button>
          );
        })}
      </div>

      <div className="flex-grow bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <Calendar
          ref={calendarRef}
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          view={view}
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
          className="h-full min-w-[800px]"
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
            }
          }}
          components={{
            event: (props) => (
              <div className="text-xs">
                <div className="font-bold">{props.event.title}</div>
                {view === 'week' && props.event.resourceId && (
                  <div>{staff.find(s => s.id === props.event.resourceId)?.fullName}</div>
                )}
                <div>{BOOKING_STATUSES[props.event.status]}</div>
              </div>
            )
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
      />
    </div>
  );
};

export default BookingsCalendar;
