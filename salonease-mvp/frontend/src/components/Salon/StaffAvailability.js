import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddAvailabilityDialog from './AddAvailabilityDialog';
import { AVAILABILITY_TYPES } from '../../utils/constants';
import useStaff from '../../hooks/useStaff';

const localizer = momentLocalizer(moment);

const colorStyles = [
    { bgClass: 'blue-500', textClass: 'white', bg: '#3B82F6', border: '#2563EB' },
    { bgClass: 'green-500', textClass: 'white', bg: '#22C55E', border: '#16A34A' },
    { bgClass: 'yellow-500', textClass: 'black', bg: '#EAB308', border: '#CA8A04' },
    { bgClass: 'red-500', textClass: 'white', bg: '#EF4444', border: '#DC2626' },
    { bgClass: 'purple-500', textClass: 'white', bg: '#A855F7', border: '#9333EA' },
    { bgClass: 'pink-500', textClass: 'white', bg: '#EC4899', border: '#DB2777' },
    { bgClass: 'indigo-500', textClass: 'white', bg: '#6366F1', border: '#4F46E5' },
    { bgClass: 'teal-500', textClass: 'white', bg: '#14B8A6', border: '#0D9488' },
  ];

const StaffAvailability = () => {
  const { salonId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [view, setView] = useState('week');
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const calendarRef = useRef(null);

  const {
    staff,
    events,
    loading,
    error,
    fetchStaffAndAvailability,
    createStaffAvailability,
    deleteStaffAvailability,
  } = useStaff();

  useEffect(() => {
    fetchStaffAndAvailability();
  }, [fetchStaffAndAvailability]);

  useEffect(() => {
    if (staff.length > 0) {
      setSelectedStaffIds(staff.map(s => s.id));
    }
  }, [staff]);

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setIsDialogOpen(true);
    setSelectedStaff(staff.find(s => s.id === slotInfo.resourceId));
  };

  const handleSaveAvailability = async (newEvent) => {
    try {
      await createStaffAvailability(newEvent);
      await fetchStaffAndAvailability();
      setIsDialogOpen(false);
      toast.success('Availability saved successfully.');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability. Please try again.');
    }
  };

  const handleSelectEvent = (event) => {
    const action = window.confirm('Do you want to delete this availability?');
    if (action) {
      deleteAvailability(event.id);
    }
  };

  const deleteAvailability = async (availabilityId) => {
    try {
      await deleteStaffAvailability(availabilityId);
      await fetchStaffAndAvailability();
      toast.success('Availability deleted successfully.');
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability. Please try again.');
    }
  };

  const eventStyleGetter = (event) => {
    if (!event || !event.resourceId) return {}; // Return empty object if event is invalid

    const isAvailability = event.type === AVAILABILITY_TYPES.AVAILABILITY;
    const staffIndex = staff.findIndex(s => s.id === event.resourceId);
    const opacity = selectedStaffIds.includes(event.resourceId) ? 1 : 0.3;

    const colorStyle = colorStyles[staffIndex % colorStyles.length];
    const borderStyle = isAvailability ? 'solid' : 'dashed';

    return {
      style: {
        backgroundColor: colorStyle.bg,
        borderColor: colorStyle.border,
        borderWidth: '2px',
        borderStyle: borderStyle,
        color: colorStyle.textClass === 'white' ? 'white' : 'black',
        borderRadius: '4px',
        opacity: opacity,
      }
    };
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleStaffToggle = (staffId) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
  };

  const filteredEvents = events.filter(event => selectedStaffIds.includes(event.resourceId));

  const dayPropGetter = (date) => {
    const style = {};
    if (date.getDay() === 0 || date.getDay() === 6) {
      style.backgroundColor = '#f0f0f0';
    }
    return { style };
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-primary-600">Staff Availability</h1>
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
        <div className="text-sm text-gray-600">
          {view === 'day' ? 'Scroll vertically to see all time slots' : 'Scroll horizontally to see all days'}
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
          events={filteredEvents.map((event, index) => ({
            ...event,
            staffIndex: staff.findIndex(s => s.id === event.resourceId),
          }))}
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
          selectable={true}
          resources={view === 'day' ? staff : null}
          resourceIdAccessor="id"
          resourceTitleAccessor="fullName"
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          className="h-full min-w-[800px]"
          formats={{
            dayFormat: 'ddd D/M',
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ event, start, end }) => {
              if (view === 'week' && event && event.resourceId) {
                const staffMember = staff.find(s => s.id === event.resourceId);
                return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}${staffMember ? ` ${staffMember.fullName}` : ''}`;
              }
              return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
            },
          }}
          components={{
            event: (props) => (
              <div>
                <strong>{props.event.title}</strong>
                {view === 'week' && (
                  <div className="text-xs">{staff.find(s => s.id === props.event.resourceId)?.fullName}</div>
                )}
              </div>
            )
          }}
        />
      </div>
      <AddAvailabilityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveAvailability}
        selectedSlot={selectedSlot}
        staffName={selectedStaff?.fullName}
        allStaff={staff}
        isWeekView={view === 'week'}
      />
    </div>
  );
};

export default StaffAvailability;
