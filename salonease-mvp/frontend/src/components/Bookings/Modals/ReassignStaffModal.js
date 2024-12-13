import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ReassignStaffModal = ({ show, onClose, booking, staff, onReassign }) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const { t } = useTranslation(['common', 'bookings']);

  useEffect(() => {
    if (booking) {
      setSelectedStaffId(booking.staffId || '');
    }
  }, [booking]);

  if (!show || !booking) return null;

  const handleReassign = () => {
    if (selectedStaffId && selectedStaffId !== booking.staffId) {
      onReassign(booking.id, selectedStaffId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">
          {t('bookings:modal.reassign.title')}
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-400">
            {t('bookings:modal.reassign.current_staff')}: {booking.staff?.fullName || t('bookings:status.unassigned')}
          </p>
          
          <div>
            <label 
              htmlFor="staff-select"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t('bookings:modal.reassign.select_new_staff')}
            </label>
            <select
              id="staff-select"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('common:form.pleaseSelect', { field: t('bookings:label.staff_member') })}</option>
              {staff.map((member) => (
                <option 
                  key={member.id} 
                  value={member.id}
                  disabled={member.id === booking.staffId}
                >
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded transition duration-300"
          >
            {t('common:action.cancel')}
          </button>
          <button
            onClick={handleReassign}
            className={`px-4 py-2 rounded transition duration-300 ${
              selectedStaffId && selectedStaffId !== booking.staffId
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!selectedStaffId || selectedStaffId === booking.staffId}
          >
            {t('common:action.confirm_reassignment')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignStaffModal; 