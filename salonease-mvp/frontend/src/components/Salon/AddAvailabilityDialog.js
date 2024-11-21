import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import TimePicker from 'react-time-picker';
import { AVAILABILITY_TYPES } from '../../utils/constants';
import { useTranslation } from 'react-i18next';

const AddAvailabilityDialog = ({ isOpen, onClose, onSave, selectedSlot, staffName, allStaff, isWeekView }) => {
  const { t } = useTranslation(['salon']);
  const [type, setType] = useState(AVAILABILITY_TYPES.AVAILABILITY);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    if (selectedSlot) {
      setStartTime(selectedSlot.start.toTimeString().slice(0, 5));
      setEndTime(selectedSlot.end.toTimeString().slice(0, 5));
    }
    if (isWeekView && allStaff.length > 0) {
      setSelectedStaffId(allStaff[0].id);
    }
  }, [selectedSlot, isWeekView, allStaff]);

  const handleSave = () => {
    if (selectedSlot) {
      const newEvent = {
        staffId: isWeekView ? selectedStaffId : selectedSlot.resourceId,
        dayOfWeek: selectedSlot.start.getDay(),
        startTime,
        endTime,
        type,
      };
      onSave(newEvent);
    }
    resetForm();
  };

  const resetForm = () => {
    setType(AVAILABILITY_TYPES.AVAILABILITY);
    setStartTime('09:00');
    setEndTime('17:00');
    if (isWeekView && allStaff.length > 0) {
      setSelectedStaffId(allStaff[0].id);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
              {t('salon:availability.title')}
            </Dialog.Title>
            <div className="mt-2 space-y-4">
              {isWeekView ? (
                <select
                  className="w-full p-2 border rounded"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  {allStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={t('salon:availability.staff.availability_for', { name: staffName })}
                  className="w-full p-2 border rounded bg-gray-100"
                  value={staffName}
                  readOnly
                />
              )}
              <select
                className="w-full p-2 border rounded"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value={AVAILABILITY_TYPES.AVAILABILITY}>
                  {t('salon:availability.type.availability')}
                </option>
                <option value={AVAILABILITY_TYPES.TIME_OFF}>
                  {t('salon:availability.type.time_off')}
                </option>
              </select>
              <div className="flex justify-between items-center">
                <label>{t('salon:availability.time.start')}:</label>
                <TimePicker
                  onChange={setStartTime}
                  value={startTime}
                  disableClock={true}
                  clearIcon={null}
                />
              </div>
              <div className="flex justify-between items-center">
                <label>{t('salon:availability.time.end')}:</label>
                <TimePicker
                  onChange={setEndTime}
                  value={endTime}
                  disableClock={true}
                  clearIcon={null}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
              >
                {t('salon:action.cancel')}
              </button>
              <button
                type="button"
                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={handleSave}
              >
                {t('salon:action.save')}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddAvailabilityDialog;
