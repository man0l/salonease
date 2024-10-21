import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddAvailabilityDialog from './AddAvailabilityDialog';
import { AVAILABILITY_TYPES } from '../../utils/constants';
import useStaff from '../../hooks/useStaff';

const localizer = momentLocalizer(moment);

const StaffAvailability = () => {
  const { salonId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

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
    const style = {
      backgroundColor: event.type === AVAILABILITY_TYPES.AVAILABILITY ? '#4CAF50' : '#F44336',
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return { style };
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-primary-600">Staff Availability</h1>
      <div className="flex-grow bg-white rounded-lg shadow-md p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week', 'day']}
          step={15}
          timeslots={1}
          min={moment().set({ hour: 8, minute: 0 }).toDate()}
          max={moment().set({ hour: 20, minute: 0 }).toDate()}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          resources={staff}
          resourceIdAccessor="id"
          resourceTitleAccessor="fullName"
          eventPropGetter={eventStyleGetter}
          className="h-full"
        />
      </div>
      <AddAvailabilityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveAvailability}
        selectedSlot={selectedSlot}
        staffName={selectedStaff?.fullName}
      />
    </div>
  );
};

export default StaffAvailability;
