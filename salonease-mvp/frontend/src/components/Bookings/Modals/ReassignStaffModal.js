import React, { useState, useEffect } from 'react';

const ReassignStaffModal = ({ show, onClose, booking, staff, onReassign }) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Reset selected staff when modal opens with a new booking
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
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reassign Staff</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Current Staff: {booking.staff?.fullName || 'Unassigned'}
          </p>
          
          <div>
            <label 
              htmlFor="staff-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Staff Member
            </label>
            <select
              id="staff-select"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select staff member</option>
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
            onClick={handleReassign}
            className={`px-4 py-2 rounded transition duration-300 ${
              selectedStaffId && selectedStaffId !== booking.staffId
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!selectedStaffId || selectedStaffId === booking.staffId}
          >
            Confirm Reassignment
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignStaffModal; 